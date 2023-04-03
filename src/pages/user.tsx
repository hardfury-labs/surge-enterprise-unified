import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, Card, CardBody, SimpleGrid, Th, Tr, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get } from "lodash";

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

  const defaultUserInfo = {
    username: "",
    passcode: "",
    enabled: true,
  };
  const [modalTitle, setModalTitle] = useState("Add New User");
  const { control, handleSubmit, reset } = useForm<Required<UserInfo>>({
    defaultValues: defaultUserInfo,
    shouldFocusError: false,
  });
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure({
    onClose: () => {
      reset(defaultUserInfo);
      setModalTitle("Add New User");
    },
  });

  const columnHelper = createColumnHelper<UserInfo>();
  const columns = [
    columnHelper.accessor("username", {
      meta: {
        sortable: true,
        tdProps: { whiteSpace: "nowrap" },
      } as TableMeta,
    }),
    columnHelper.accessor("passcode", {
      meta: { tdProps: { whiteSpace: "nowrap" } } as TableMeta,
    }),
    columnHelper.accessor("enabled", {
      meta: {
        isNumeric: true,
        tdProps: { whiteSpace: "nowrap" },
      } as TableMeta,
      cell: (cellInfo) => {
        const enabled = cellInfo.getValue();

        const username = cellInfo.row.getValue<string>("username");
        const info = cellInfo.row.original;

        const description = enabled ? `Disable User ${username}` : `Enable User ${username}`;

        return (
          <WritableSwitch
            tooltipProps={{ actionName: "Switch User" }}
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
    }),
    columnHelper.accessor(() => {}, {
      header: "actions",
      meta: {
        isNumeric: true,
        tdProps: { whiteSpace: "nowrap" },
      } as TableMeta,
      cell: (cellInfo) => {
        const username = cellInfo.row.getValue<string>("username");

        const info = cellInfo.row.original;

        return (
          <ButtonGroup>
            <WritableButton
              tooltipProps={{ actionName: "Edit User" }}
              size="xs"
              variant="black-ghost"
              onClick={() => {
                reset(info);
                setModalTitle("Edit User");
                openModal();
              }}
            >
              Edit
            </WritableButton>
            <WritableButton
              tooltipProps={{ actionName: "Delete User" }}
              size="xs"
              colorScheme="red"
              isLoading={isLoading(`Delete User ${username}`)}
              isDisabled={isLoading(`Delete User ${username}`)}
              onClick={() =>
                postData("editUsers", { description: `Delete User ${username}`, data: { users: { [username]: null } } })
              }
            >
              Delete
            </WritableButton>
          </ButtonGroup>
        );
      },
    }),
  ];
  const extraHeaders = (
    <Tr>
      {Array.from({ length: 2 }, (_, index) => (
        <Th key={index} />
      ))}
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
        title={modalTitle}
        isOpen={isModalOpen}
        onClose={closeModal}
        isLoading={isLoading(modalTitle)}
        onSubmit={handleSubmit((info) =>
          postData("editUsers", {
            description: `${modalTitle} ${info.username}`,
            loadingKey: modalTitle,
            data: { users: { [info.username]: info } },
            successCallback: closeModal,
          }),
        )}
      >
        <SimpleGrid column={1} spacing={1}>
          <FormInput<Required<UserInfo>> label="Username" id="username" required control={control} />
          <FormPasswordInput<Required<UserInfo>>
            label="Passcode"
            id="passcode"
            required
            showPassword
            control={control}
          />
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
              isShow: !config.seApiToken,
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
              data={Object.entries(config.users).map(([username, info]) => ({ username, ...info }))}
            />
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default User;
