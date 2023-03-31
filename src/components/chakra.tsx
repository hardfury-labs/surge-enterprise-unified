import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import BeatLoader from "react-spinners/BeatLoader";
import {
  Box, BoxProps, Button, ButtonProps, Card, CardBody, CardProps, Center, Flex, Heading, Icon, Input, InputGroup,
  InputGroupProps, InputProps, InputRightElement, Switch, SwitchProps, Tooltip as ChakraTooltip, TooltipProps,
  useBoolean,
} from "@chakra-ui/react";

import { useStore } from "@/store";

export const PssswordInput = ({
  inputGroupProps,
  ...props
}: {
  inputGroupProps?: InputGroupProps;
} & InputProps) => {
  const [isShowing, { toggle }] = useBoolean(false);

  return (
    <InputGroup {...inputGroupProps}>
      <Input type={isShowing ? "text" : "password"} {...props} />
      <InputRightElement>
        <Center cursor="pointer" color="gray.400" onClick={toggle}>
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

type WritableTipProps = Omit<TooltipProps, "children"> & { description?: string; actionName: string };

const WritableTip = ({
  description,
  actionName,
  ...props
}: TooltipProps & { description?: string; actionName: string }) => {
  const config = useStore((state) => state.config);

  return !config.features.writable ? (
    <ChakraTooltip
      label={description ? description : `The ${actionName} cannot be used in ${config.dataStorageType} datastore`}
      {...props}
    />
  ) : (
    <>{props.children}</>
  );
};

export const WritableButton = ({
  tooltipProps,
  isDisabled,
  ...props
}: {
  tooltipProps: WritableTipProps;
} & ButtonProps) => {
  const config = useStore((state) => state.config);

  return (
    <WritableTip {...tooltipProps}>
      <Button
        isDisabled={!config.features.writable || isDisabled}
        spinner={<BeatLoader size={6} color="#9ca3af" />}
        {...props}
      />
    </WritableTip>
  );
};

export const WritableSwitch = ({
  tooltipProps,
  isDisabled,
  ...props
}: { tooltipProps: WritableTipProps } & SwitchProps) => {
  const config = useStore((state) => state.config);

  return (
    <WritableTip {...tooltipProps}>
      <Switch isDisabled={!config.features.writable || isDisabled} {...props} />
    </WritableTip>
  );
};
