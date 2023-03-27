import { FiExternalLink } from "react-icons/fi";
import { Flex, FlexProps, Icon, Link, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";

import pkg from "#/package.json";

const Info = styled(Flex)`
  p:not(:last-child):after,
  a:not(:last-child):after {
    content: "•";
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }
`;

export const Footer = (props: FlexProps) => (
  <Info as="footer" h={8} justifyContent="center" alignItems="center" color="gray.400" fontSize="sm" {...props}>
    <Text>{pkg.version}</Text>
    <Link href={pkg.homepage} display="flex" alignItems="center" textDecoration="underline" isExternal>
      GitHub
      <Icon as={FiExternalLink} />
    </Link>
  </Info>
);
