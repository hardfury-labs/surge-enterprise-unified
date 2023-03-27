import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { Button, FormControl, FormErrorMessage, Heading, SimpleGrid, useToast } from "@chakra-ui/react";
import SHA256 from "crypto-js/sha256";
import { get } from "lodash";

import { PssswordInput } from "@/components/chakra";
import { fetchApi } from "@/fetchers/api";
import { useStore } from "@/store";
import { sleep } from "@/utils";

const Login = () => {
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const ID = {
    LOGIN_BTN: "login.loginBtn",
  };
  const loadings = useStore((state) => state.loadings);
  const startLoading = useStore((state) => state.startLoading);
  const stopLoading = useStore((state) => state.stopLoading);
  const isLoading = useCallback((key: string) => get(loadings, key, false), [loadings]);

  const getConfig = useStore((state) => state.getConfig);

  const router = useRouter();
  const toast = useToast();

  const onInput = useCallback(
    (value: string) => {
      if (error) setError(null);

      setPassword(value);
    },
    [error],
  );

  const login = async (password: string) => {
    setError(null);
    startLoading(ID.LOGIN_BTN);

    const hash = SHA256(password).toString();

    await fetchApi
      .post("/api/login", { password: hash })
      .then(async () => {
        stopLoading(ID.LOGIN_BTN);

        toast({
          title: "Login Successful",
          description: "Redirecting to the management portal",
          status: "success",
          position: "top",
          duration: 500,
        });

        await sleep(500);

        startLoading("layout");
        await router.replace("/");

        // stop loading snipper after redirecting and got config, to prevent the layout from flashing
        await getConfig();
        stopLoading("layout");
      })
      .catch((error) => {
        stopLoading(ID.LOGIN_BTN);

        setError(error.message);
      });
  };

  return (
    <>
      <Heading mb={4}>Log in</Heading>

      <SimpleGrid w="100%" maxW="320px" mb={32} columns={1} spacing={3}>
        <FormControl isInvalid={error !== null && password !== ""}>
          <PssswordInput
            inputGroupProps={{ size: "lg" }}
            inputProps={{
              placeholder: "Enter password",
              value: password,
              autoFocus: true,
              onChange: (event) => onInput(event.target.value),
            }}
          />
          {error !== null && password !== "" ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>

        <Button size="lg" isDisabled={!password} isLoading={isLoading(ID.LOGIN_BTN)} onClick={() => login(password)}>
          Continue
        </Button>
      </SimpleGrid>
    </>
  );
};

export default Login;
