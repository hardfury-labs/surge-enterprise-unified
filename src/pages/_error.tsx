import { NextPageContext } from "next";
import { ErrorProps } from "next/error";
import { Center, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { get } from "lodash";

const Error50x = ({ statusCode, title }: ErrorProps) => (
  <Center h="100%" w="100%">
    <Flex flexDirection="column" textAlign="center">
      <Heading size="lg">{statusCode}</Heading>
      {title && (
        <>
          <Divider my={2} />
          <Text size="xl">{title}</Text>
        </>
      )}
    </Flex>
  </Center>
);

const errorMsgs = {
  500: "An unexpected error has occurred",
};

Error50x.getInitialProps = ({ res, err }: NextPageContext) => {
  let statusCode = 500;
  if (res) statusCode = res.statusCode;

  let title = get(errorMsgs, statusCode);

  if (err) {
    if (err.statusCode) statusCode = err.statusCode;
    if (err.message) title = err.message;
  }

  return { statusCode, title };
};

export default Error50x;
