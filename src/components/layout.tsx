import { useCallback, useEffect } from "react";
import NavLink from "next/link";
import { useRouter } from "next/router";
import { FiActivity, FiFileText, FiServer, FiSettings, FiUsers } from "react-icons/fi";
import {
  Box, Center, Flex, FlexProps, Heading, Icon, Link, LinkProps, SimpleGrid, SimpleGridProps, Spinner, Text,
} from "@chakra-ui/react";
import { get } from "lodash";

import { Footer } from "@/components/footer";
import { useStore } from "@/store";

const Title = (props: FlexProps) => (
  <Flex as="header" h={16} px={6} alignItems="center" {...props}>
    <Heading size="md">Surge Balancer</Heading>
  </Flex>
);

export const SingleLayout = (props: FlexProps) => (
  <Flex h="100vh" flexDirection="column">
    <Title borderBottom="1px solid var(--chakra-colors-gray-200)" />

    <Center as="main" p={6} flexDirection="column" flex="1" {...props} />

    <Footer />
  </Flex>
);

// TODO: change to @chakra-ui/next-js?
// https://dev.to/tungdt90/how-to-use-activelink-in-chakra-ui-with-nextjs-4l9a
const MenuItem = ({ isActive, ...props }: LinkProps & { isActive?: boolean }) => (
  <Box pr={3} borderRight={isActive ? "4px solid" : "4px solid transparent"} transition="all 0.2s">
    <Link
      as={NavLink}
      p={2}
      display="flex"
      alignItems="center"
      rounded="md"
      _hover={{ bgColor: "gray.200" }}
      transition="all 0.2s"
      {...(isActive && { bgColor: "gray.200", fontWeight: "bold" })}
      {...props}
    />
  </Box>
);

export const Nav = (props: SimpleGridProps) => {
  const routes = [
    { name: "Summary", path: "/", icon: <Icon as={FiActivity} /> },
    { name: "User", path: "/user", icon: <Icon as={FiUsers} /> },
    { name: "Provider", path: "/provider", icon: <Icon as={FiServer} /> },
    { name: "Template", path: "/template", icon: <Icon as={FiFileText} /> },
    { name: "Settings", path: "/settings", icon: <Icon as={FiSettings} /> },
  ];

  const route = useRouter();

  return (
    <SimpleGrid pl={4} column={1} spacing={2} {...props}>
      {routes.map(({ name, path, icon }) => (
        <MenuItem key={name} href={path} isActive={route.asPath === path}>
          {icon}
          <Text ml={2}>{name}</Text>
        </MenuItem>
      ))}
    </SimpleGrid>
  );
};

export const DashboardLayout = (props: FlexProps) => (
  <Flex>
    <Flex
      as="nav"
      h="100vh"
      flexDirection="column"
      bgColor="gray.50"
      borderRight="1px solid var(--chakra-colors-gray-200)"
    >
      <Title />

      <Nav />
    </Flex>

    <Flex as="main" flexDirection="column" flex="auto">
      <Flex flexDirection="column" flex="1" {...props} />

      <Footer />
    </Flex>
  </Flex>
);

export const Layout = (props: FlexProps) => {
  const loadings = useStore((state) => state.loadings);
  const startLoading = useStore((state) => state.startLoading);
  const stopLoading = useStore((state) => state.stopLoading);
  const isLoading = useCallback((key: string) => get(loadings, key, true), [loadings]);

  const config = useStore((state) => state.config);
  const getConfig = useStore((state) => state.getConfig);

  useEffect(() => {
    startLoading("layout");

    getConfig().finally(() => stopLoading("layout"));
  }, []);

  if (config === null)
    if (isLoading("layout"))
      return (
        <Center h="100vh">
          <Spinner />
        </Center>
      );
    else return <SingleLayout {...props} />;

  return <DashboardLayout {...props} />;
};
