import { Center, Divider, Flex, Heading, Text } from "@chakra-ui/react";

const NotFound = () => (
  <Center h="100%" w="100%">
    <Flex flexDirection="column" textAlign="center">
      <Heading size="lg">404</Heading>
      <Divider my={2} />
      <Text size="xl">This page could not be found</Text>
    </Flex>
  </Center>
);

export default NotFound;
