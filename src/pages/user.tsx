import { useCallback } from "react";
import { Box, ButtonGroup, Card, CardBody, Th, Tr, useToast } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get } from "lodash";

import { Breadcrumb, WritableButton, WritableSwitch, WritableTip } from "@/components/chakra";
import { DataTable, TableMeta } from "@/components/table";
import { fetchApi } from "@/fetchers/api";
import { useStore } from "@/store";
import { ApiResponse } from "@/types/api";
import { UserInfo } from "@/types/user";
import { desc2Hump } from "@/utils";

const User = () => {
  const config = useStore((state) => state.config);
  const getConfig = useStore((state) => state.getConfig);

  const loadings = useStore((state) => state.loadings);
  const startLoading = useStore((state) => (name: string) => state.startLoading(`user.${desc2Hump(name)}`));
  const stopLoading = useStore((state) => (name: string) => state.stopLoading(`user.${desc2Hump(name)}`));
  const isLoading = useCallback((name: string) => get(loadings, `user.${desc2Hump(name)}`, false), [loadings]);

  const toast = useToast();

  const action = async (
    method: string,
    description: string,
    {
      showSuccessMsg = true,
      showErrorMsg = true,
      data = {},
    }: { showSuccessMsg?: boolean; showErrorMsg?: boolean; data?: object } = {},
  ) => {
    const key = desc2Hump(description);
    startLoading(key);

    await fetchApi
      .post<any, ApiResponse>("/api/user", { method, ...data })
      .then(({ message }) => {
        if (showSuccessMsg)
          toast({
            title: `${description} Successful`,
            description: message,
            status: "success",
            position: "top",
            duration: 2000,
          });

        getConfig();
      })
      .catch((error) => {
        if (showErrorMsg)
          toast({
            title: `Failed to ${description}`,
            description: error.message,
            status: "error",
            position: "top",
            duration: 2000,
          });
      })
      .finally(() => {
        stopLoading(key);
      });
  };

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
                action("editUsers", description, {
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
                isDisabled={isLoading(description)}
                isLoading={isLoading(description)}
                onClick={() => action("editUsers", description, { data: { users: { [username]: null } } })}
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
              isDisabled={isLoading("Enable All Users")}
              isLoading={isLoading("Enable All Users")}
              onClick={() => action("enableAll", "Enable All Users")}
            >
              Enable All
            </WritableButton>
          </WritableTip>
          <WritableTip description="Disable All Users">
            <WritableButton
              size="xs"
              variant="black-ghost"
              isDisabled={isLoading("Disable All Users")}
              isLoading={isLoading("Disable All Users")}
              onClick={() => action("disableAll", "Disable All Users")}
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

      <Box p={6}>
        <ButtonGroup mb={4}>
          <WritableTip description="Add User">
            <WritableButton variant="black-ghost">Add User</WritableButton>
          </WritableTip>
          <WritableTip
            label={!config.seApiToken ? "Surge Enterprise Api Token not set" : null}
            description="Sync Users"
          >
            <WritableButton
              variant="black-ghost"
              isDisabled={!config.seApiToken || isLoading("Sync Users")}
              isLoading={isLoading("Sync Users")}
              onClick={() => action("syncUsers", "Sync Users")}
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
      </Box>
    </>
  );
};

export default User;
