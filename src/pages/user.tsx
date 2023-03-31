import { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  ButtonGroup,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Switch,
  Th,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get } from "lodash";

import { Breadcrumb, Container, PssswordInput, WritableButton, WritableSwitch, WritableTip } from "@/components/chakra";
import { CreateModal } from "@/components/modal";
import { DataTable, TableMeta } from "@/components/table";
import { fetchApi } from "@/fetchers/api";
import { PostDataOptions, useStore } from "@/store";
import { ApiResponse } from "@/types/api";
import { UserInfo } from "@/types/user";
import { desc2Hump, isDefined } from "@/utils";

const User = () => {
  const config = useStore((state) => state.config);
  const postData = useStore(
    (state) => (method: string, options: PostDataOptions) =>
      state.postData("/api/user", method, { loadingKeyPrefix: "user", ...options }),
  );

  const loadings = useStore((state) => state.loadings);
  const isLoading = useCallback((name: string) => get(loadings, `user.${desc2Hump(name)}`, false), [loadings]);

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<Required<UserInfo>>({
    defaultValues: {
      username: "",
      passcode: "",
      enabled: true,
    },
    shouldFocusError: false,
  });

  const toast = useToast();

  const columnHelper = createColumnHelper<UserInfo>();
  const columns = [
    columnHelper.accessor("username", {
      meta: {
        sortable: true,
      } as TableMeta,
    }),
    columnHelper.accessor("passcode", {}),
    columnHelper.accessor("enabled", {
      cell: (info) => {
        const enabled = info.getValue();

        const username: string = info.row.getValue("username");
        const userinfo = info.row._valuesCache;

        const description = enabled ? `Disable User ${username}` : `Enable User ${username}`;

        return (
          <WritableTip description="Switch User">
            <WritableSwitch
              size="sm"
              isChecked={enabled}
              isDisabled={isLoading(description)}
              onChange={() =>
                postData("editUsers", {
                  description,
                  data: { users: { [username]: { ...userinfo, enabled: !enabled } } },
                })
              }
            />
          </WritableTip>
        );
      },
      meta: {
        isNumeric: true,
      } as TableMeta,
    }),
    columnHelper.accessor(() => {}, {
      header: "actions",
      cell: (info) => {
        const username: string = info.row.getValue("username");

        const description = `Delete User ${username}`;

        return (
          <ButtonGroup>
            <WritableTip description="Delete User">
              <WritableButton
                size="xs"
                colorScheme="red"
                isLoading={isLoading(description)}
                isDisabled={isLoading(description)}
                onClick={() => postData("editUsers", { description, data: { users: { [username]: null } } })}
              >
                Delete
              </WritableButton>
            </WritableTip>
          </ButtonGroup>
        );
      },
      meta: {
        isNumeric: true,
      } as TableMeta,
    }),
  ];
  const extraHeaders = (
    <Tr>
      <Th></Th>
      <Th></Th>
      <Th isNumeric>
        <ButtonGroup>
          <WritableTip description="Enable All Users">
            <WritableButton
              size="xs"
              variant="black-ghost"
              isLoading={isLoading("Enable All Users")}
              isDisabled={isLoading("Enable All Users")}
              onClick={() => postData("enableAll", { description: "Enable All Users" })}
            >
              Enable All
            </WritableButton>
          </WritableTip>
          <WritableTip description="Disable All Users">
            <WritableButton
              size="xs"
              variant="black-ghost"
              isLoading={isLoading("Disable All Users")}
              isDisabled={isLoading("Disable All Users")}
              onClick={() => postData("disableAll", { description: "Disable All Users" })}
            >
              Disable All
            </WritableButton>
          </WritableTip>
        </ButtonGroup>
      </Th>
      <Th isNumeric></Th>
    </Tr>
  );

  return (
    <>
      <Breadcrumb title="User" />

      <CreateModal
        title="Add New User"
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          reset();
        }}
        isLoading={isLoading("Add New User")}
        onSubmit={handleSubmit(({ username, passcode, enabled }) =>
          postData("editUsers", {
            description: `Add New User ${username}`,
            loadingKey: "Add New User",
            data: { users: { [username]: { passcode, enabled } } },
            successCallback: () => {
              reset();
              closeModal();
            },
          }),
        )}
      >
        <SimpleGrid column={1} spacing={1}>
          <FormControl isInvalid={isDefined(errors.username)}>
            <FormLabel m={0}>Username</FormLabel>
            <Input
              type="text"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && <FormErrorMessage mt="1px">{errors.username.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={isDefined(errors.passcode)}>
            <FormLabel m={0}>Passcode</FormLabel>
            <PssswordInput
              inputProps={{
                ...register("passcode", {
                  required: "Passcode is required",
                }),
              }}
            />
            {errors.passcode && <FormErrorMessage mt="1px">{errors.passcode.message}</FormErrorMessage>}
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel m={0}>Enabled</FormLabel>
            <Switch ml={2} mt="1px" size="sm" {...register("enabled")} />
          </FormControl>
        </SimpleGrid>
      </CreateModal>

      <Container>
        <ButtonGroup mb={4}>
          <WritableTip description="Add User">
            <WritableButton variant="black-ghost" onClick={openModal}>
              Add User
            </WritableButton>
          </WritableTip>
          <WritableTip
            label={!config.seApiToken ? "Surge Enterprise Api Token not set" : null}
            description="Sync Users"
          >
            <WritableButton
              variant="black-ghost"
              isLoading={isLoading("Sync Users")}
              isDisabled={!config.seApiToken || isLoading("Sync Users")}
              onClick={() => postData("syncUsers", { description: "Sync Users" })}
            >
              Sync from Surge Enterprise
            </WritableButton>
          </WritableTip>
        </ButtonGroup>

        <Card size="sm">
          <CardBody>
            <DataTable
              columns={columns}
              extraHeaders={extraHeaders}
              data={Object.entries(config.users || {}).map(([username, userinfo]) => ({ username, ...userinfo })) || []}
            />
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default User;
