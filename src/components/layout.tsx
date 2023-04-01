import { useCallback, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FiChevronDown, FiFileText, FiHome, FiServer, FiSettings, FiUsers } from "react-icons/fi";
import {
  Box, BoxProps, Center, Collapse, Flex, FlexProps, Heading, Icon, Link, LinkProps, SimpleGrid, SimpleGridProps,
  Spinner, Text,
} from "@chakra-ui/react";
import { get } from "lodash";

import { Footer } from "@/components/footer";
import { useStore } from "@/store";

const Title = (props: FlexProps) => (
  <Flex as="header" h={16} px={6} alignItems="center" {...props}>
    <Heading size="md" whiteSpace="nowrap">
      Surge Balancer
    </Heading>
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
// https://github.com/chakra-ui/chakra-ui/discussions/4777
const NavLink = ({ info: { name, path, icon }, ...props }: LinkProps & { info: RouteInfo }) => {
  const route = useRouter();

  return (
    <Box
      pr={3}
      borderRight={route.asPath === path ? "0.25rem solid" : "0.25rem solid transparent"}
      transition="all 0.2s"
    >
      <Link
        as={NextLink}
        href={path}
        p={2}
        display="flex"
        alignItems="center"
        rounded="md"
        _hover={{ bgColor: "gray.200" }}
        transition="all 0.2s"
        {...(route.asPath === path && { bgColor: "gray.200", fontWeight: "bold" })}
        {...props}
      >
        {icon}
        <Text ml={2}>{name}</Text>
      </Link>
    </Box>
  );
};

const Menu = ({ info: { name, subRoutes, icon }, ...props }: BoxProps & { info: RouteInfo }) => {
  return (
    <>
      <Flex mr={4} p={2} justifyContent="space-between" alignItems="center" rounded="md" {...props}>
        <Flex alignItems="center">
          {icon}
          <Text ml={2}>{name}</Text>
        </Flex>
        <Icon ml={2} mt="1px" as={FiChevronDown} />
      </Flex>
      <Collapse in={true} animateOpacity>
        <SimpleGrid column={1} spacing={2}>
          {subRoutes?.map((info) => (
            <NavLink key={info.name} ml={4} info={info} />
          ))}
        </SimpleGrid>
      </Collapse>
    </>
  );
};

interface RouteInfo {
  name: string;
  path?: string;
  subRoutes?: RouteInfo[];
  icon?: React.ReactNode;
}

export const Nav = (props: SimpleGridProps) => {
  const routes: RouteInfo[] = [
    { name: "Summary", path: "/", icon: <Icon as={FiHome} boxSize={4} /> },
    { name: "User", path: "/user", icon: <Icon as={FiUsers} boxSize={4} /> },
    { name: "Subscription", path: "/subscription", icon: <Icon as={FiServer} boxSize={4} /> },
    { name: "Template", path: "/template", icon: <Icon as={FiFileText} boxSize={4} /> },
    { name: "Settings", path: "/settings", icon: <Icon as={FiSettings} boxSize={4} /> },
  ];

  return (
    <SimpleGrid pl={4} column={1} spacing={2} {...props}>
      {routes.map((info) => {
        if (info.subRoutes) return <Menu key={info.name} info={info} />;

        return <NavLink key={info.name} info={info} />;
      })}
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
