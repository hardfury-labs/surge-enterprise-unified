import { useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import BeatLoader from "react-spinners/BeatLoader";
import {
  Box, BoxProps, Button, ButtonProps, Card, CardBody, CardProps, Center, Flex, Heading, Icon, Input, InputGroup,
  InputGroupProps, InputProps, InputRightElement, Switch, SwitchProps, Tooltip as ChakraTooltip, TooltipProps,
} from "@chakra-ui/react";

import { useStore } from "@/store";

export const PssswordInput = ({
  inputGroupProps,
  inputProps,
}: {
  inputGroupProps?: InputGroupProps;
  inputProps?: InputProps;
}) => {
  const [isShowing, setShowing] = useState(false);

  return (
    <InputGroup {...inputGroupProps}>
      <Input type={isShowing ? "text" : "password"} {...inputProps} />
      <InputRightElement>
        <Center cursor="pointer" color="gray.400" onClick={() => setShowing(!isShowing)}>
          {isShowing ? <Icon as={FiEye} /> : <Icon as={FiEyeOff} />}
        </Center>
      </InputRightElement>
    </InputGroup>
  );
};

export const Breadcrumb = ({ title }: { title: string }) => (
  <Flex as="header" h={16} px={6} alignItems="center" borderBottom="1px solid var(--chakra-colors-gray-200)">
    <Heading size="sm">{title}</Heading>
  </Flex>
);

export const Container = (props: BoxProps) => (
  <Box h="calc(100vh - var(--chakra-sizes-16) - var(--chakra-sizes-8))" p={6} overflowY="auto" {...props} />
);

export const Warning = ({ children, ...props }: CardProps) => (
  <Card size="sm" fontSize="sm" fontWeight="bold" borderColor="yellow.400" bgColor="yellow.100" {...props}>
    <CardBody>
      <Flex alignItems="center">
        <Icon as={FiAlertCircle} mr={2} color="yellow.500" boxSize={6} />
        <Box>{children}</Box>
      </Flex>
    </CardBody>
  </Card>
);

export const WritableTip = ({ description, label, ...props }: TooltipProps & { description: string }) => {
  const config = useStore((state) => state.config);

  return !config.features.writable ? (
    <ChakraTooltip
      label={label ?? `The ${description} cannot be used in ${config.dataStorageType} datastore`}
      {...props}
    />
  ) : (
    <>{props.children}</>
  );
};

export const WritableButton = ({ isDisabled, ...props }: ButtonProps) => {
  const config = useStore((state) => state.config);

  return (
    <Button
      isDisabled={!config.features.writable || isDisabled}
      spinner={<BeatLoader size={6} color="#9ca3af" />}
      {...props}
    />
  );
};

export const WritableSwitch = ({ isDisabled, ...props }: SwitchProps) => {
  const config = useStore((state) => state.config);

  return <Switch isDisabled={!config.features.writable || isDisabled} {...props} />;
};
