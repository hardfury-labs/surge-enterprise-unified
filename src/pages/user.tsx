import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, Card, CardBody, SimpleGrid, Th, Tr, useBoolean } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get, omit } from "lodash";

import { Breadcrumb, Container, WritableButton, WritableSwitch } from "@/components/chakra";
import { FormInput, FormPasswordInput, FormSwitch } from "@/components/form";
import { CreateModal } from "@/components/modal";
import { DataTable, TableMeta } from "@/components/table";
import { PostDataOptions, useStore } from "@/store";
import { ApiUserMethod } from "@/types/api";
import { UserInfo } from "@/types/user";
import { descToHump } from "@/utils";

const User = () => {
  const config = useStore((state) => state.config);
  const postData = useStore(
    (state) => (method: ApiUserMethod, options: PostDataOptions) =>
      state.postData("/api/user", method, { loadingKeyPrefix: "user", ...options }),
  );

  const loadings = useStore((state) => state.loadings);
  const isLoading = useCallback((name: string) => get(loadings, `user.${descToHump(name)}`, false), [loadings]);

  const [isModalOpen, { on: openModal, off: closeModal }] = useBoolean();
  const { control, handleSubmit, reset } = useForm<Required<UserInfo>>({
    defaultValues: {
      username: "",
      passcode: "",
      enabled: true,
    },
    shouldFocusError: false,
  });

  const columnHelper = createColumnHelper<UserInfo>();
  const columns = [
    columnHelper.accessor("username", {
      meta: {
        sortable: true,
      } as TableMeta,
    }),
    columnHelper.accessor("passcode", {}),
    columnHelper.accessor("enabled", {
      cell: (cellInfo) => {
        const enabled = cellInfo.getValue();

        const username: string = cellInfo.row.getValue("username");
        const info = cellInfo.row._valuesCache;

        const description = enabled ? `Disable User ${username}` : `Enable User ${username}`;

        return (
          <WritableSwitch
            tooltipProps={{ actionName: "Switch User" }}
            size="sm"
            isChecked={enabled}
            isDisabled={isLoading("Enable All Users") || isLoading("Disable All Users") || isLoading(description)}
            onChange={() =>
              postData("editUsers", {
                description,
                data: { users: { [username]: { ...info, enabled: !enabled } } },
              })
            }
          />
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
            <WritableButton
              tooltipProps={{ actionName: "Delete User" }}
              size="xs"
              colorScheme="red"
              isLoading={isLoading(description)}
              isDisabled={isLoading(description)}
              onClick={() => postData("editUsers", { description, data: { users: { [username]: null } } })}
            >
              Delete
            </WritableButton>
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
          <WritableButton
            tooltipProps={{ actionName: "Enable All Users" }}
            size="xs"
            variant="black-ghost"
            isLoading={isLoading("Enable All Users")}
            isDisabled={isLoading("Enable All Users")}
            onClick={() => postData("enableAll", { description: "Enable All Users" })}
          >
            Enable All
          </WritableButton>
          <WritableButton
            tooltipProps={{ actionName: "Disable All Users" }}
            size="xs"
            variant="black-ghost"
            isLoading={isLoading("Disable All Users")}
            isDisabled={isLoading("Disable All Users")}
            onClick={() => postData("disableAll", { description: "Disable All Users" })}
          >
            Disable All
          </WritableButton>
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
        onSubmit={handleSubmit((info) =>
          postData("editUsers", {
            description: `Add New User ${info.username}`,
            loadingKey: "Add New User",
            data: { users: { [info.username]: omit(info, "username") } },
            successCallback: () => {
              reset();
              closeModal();
            },
          }),
        )}
      >
        <SimpleGrid column={1} spacing={1}>
          <FormInput<Required<UserInfo>> label="Username" id="username" required control={control} />
          <FormPasswordInput<Required<UserInfo>> label="Passcode" id="passcode" required control={control} />
          <FormSwitch<Required<UserInfo>> label="Enabled" id="enabled" control={control} />
        </SimpleGrid>
      </CreateModal>

      <Container>
        <ButtonGroup mb={4}>
          <WritableButton tooltipProps={{ actionName: "Add User" }} variant="black-ghost" onClick={openModal}>
            Add User
          </WritableButton>

          <WritableButton
            tooltipProps={{
              actionName: "Sync Users",
              description: !config.seApiToken ? "Surge Enterprise Api Token not set" : "",
            }}
            variant="black-ghost"
            isLoading={isLoading("Sync Users")}
            isDisabled={!config.seApiToken || isLoading("Sync Users")}
            onClick={() => postData("syncUsers", { description: "Sync Users" })}
          >
            Sync from Surge Enterprise
          </WritableButton>
        </ButtonGroup>

        <Card size="sm">
          <CardBody>
            <DataTable
              columns={columns}
              extraHeaders={extraHeaders}
              data={Object.entries(config.users || {}).map(([username, info]) => ({ username, ...info })) || []}
            />
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default User;
