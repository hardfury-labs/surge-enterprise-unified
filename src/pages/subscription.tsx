import { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  ButtonGroup, Card, CardBody, Input, SimpleGrid, Switch, Th, Tr, useBoolean, useDisclosure,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get, omit } from "lodash";

import { Breadcrumb, Container, WritableButton, WritableSwitch } from "@/components/chakra";
import { FormInput, FormSelect, FormSwitch } from "@/components/form";
import { CreateModal } from "@/components/modal";
import { DataTable, TableMeta } from "@/components/table";
import { PostDataOptions, useStore } from "@/store";
import { ApiSubscriptionMethod } from "@/types/api";
import { SubscriptionInfo } from "@/types/subscription";
import { descToHump } from "@/utils";

const Subscription = () => {
  const config = useStore((state) => state.config);
  const postData = useStore(
    (state) => (method: ApiSubscriptionMethod, options: PostDataOptions) =>
      state.postData("/api/subscription", method, { loadingKeyPrefix: "subscription", ...options }),
  );

  const loadings = useStore((state) => state.loadings);
  const isLoading = useCallback((name: string) => get(loadings, `subscription.${descToHump(name)}`, false), [loadings]);

  const [isModalOpen, { on: openModal, off: closeModal }] = useBoolean();
  const { control, handleSubmit, reset } = useForm<Required<SubscriptionInfo>>({
    defaultValues: {
      name: "",
      url: "",
      type: "",
      udpRelay: false,
      enabled: true,
    },
    shouldFocusError: false,
  });

  const columnHelper = createColumnHelper<SubscriptionInfo>();
  const columns = [
    columnHelper.accessor("name", {
      meta: {
        sortable: true,
      } as TableMeta,
    }),
    columnHelper.accessor("url", {}),
    columnHelper.accessor("type", {}),
    columnHelper.accessor("udpRelay", {
      header: "UDP Relay",
      cell: (cellInfo) => {
        const udpRelay = cellInfo.getValue();

        const name: string = cellInfo.row.getValue("name");
        const info = cellInfo.row._valuesCache;

        const description = udpRelay
          ? `Disable Subscription ${name} UDP Relay`
          : `Enable Subscription ${name} UDP Relay`;

        return (
          <WritableSwitch
            tooltipProps={{ actionName: "Switch Subscription" }}
            size="sm"
            isChecked={udpRelay}
            isDisabled={isLoading(description)}
            onChange={() =>
              postData("editSubscriptions", {
                description,
                data: { subscriptions: { [name]: { ...info, udpRelay: !udpRelay } } },
              })
            }
          />
        );
      },
      meta: {
        isNumeric: true,
      } as TableMeta,
    }),
    columnHelper.accessor("enabled", {
      cell: (cellInfo) => {
        const enabled = cellInfo.getValue();

        const name: string = cellInfo.row.getValue("name");
        const info = cellInfo.row._valuesCache;

        const description = enabled ? `Disable Subscription ${name}` : `Enable Subscription ${name}`;

        return (
          <WritableSwitch
            tooltipProps={{ actionName: "Switch Subscription" }}
            size="sm"
            isChecked={enabled}
            isDisabled={isLoading(description)}
            onChange={() =>
              postData("editSubscriptions", {
                description,
                data: { subscriptions: { [name]: { ...info, enabled: !enabled } } },
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
        const name: string = info.row.getValue("name");

        const description = `Delete Subscription ${name}`;

        return (
          <ButtonGroup>
            <WritableButton
              tooltipProps={{ actionName: "Delete Subscription" }}
              size="xs"
              colorScheme="red"
              isLoading={isLoading(description)}
              isDisabled={isLoading(description)}
              onClick={() => postData("editSubscriptions", { description, data: { subscriptions: { [name]: null } } })}
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
      <Th></Th>
      <Th></Th>
      <Th isNumeric>
        <ButtonGroup>
          <WritableButton
            tooltipProps={{ actionName: "Enable All Subscriptions" }}
            size="xs"
            variant="black-ghost"
            isLoading={isLoading("Enable All Subscriptions")}
            isDisabled={isLoading("Enable All Subscriptions")}
            onClick={() => postData("enableAll", { description: "Enable All Subscriptions" })}
          >
            Enable All
          </WritableButton>
          <WritableButton
            tooltipProps={{ actionName: "Disable All Subscriptions" }}
            size="xs"
            variant="black-ghost"
            isLoading={isLoading("Disable All Subscriptions")}
            isDisabled={isLoading("Disable All Subscriptions")}
            onClick={() => postData("disableAll", { description: "Disable All Subscriptions" })}
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
      <Breadcrumb title="Subscription" />

      <CreateModal
        title="Add New Subscription"
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          reset();
        }}
        isLoading={isLoading("Add New Subscription")}
        onSubmit={handleSubmit((info) =>
          postData("editSubscriptions", {
            description: `Add New Subscription ${info.name}`,
            loadingKey: "Add New Subscription",
            data: { subscriptions: { [info.name]: omit(info, "name") } },
            successCallback: () => {
              reset();
              closeModal();
            },
          }),
        )}
      >
        <SimpleGrid column={1} spacing={1}>
          <FormInput<Required<SubscriptionInfo>> label="Name" id="name" required control={control} />
          <FormInput<Required<SubscriptionInfo>> label="URL" id="url" required control={control} />
          <FormSelect<Required<SubscriptionInfo>, String>
            label="Subscription Link Type"
            id="type"
            required
            control={control}
            options={config.subscriptionTypes.map((type) => new String(type))}
          />
          <FormSwitch<Required<SubscriptionInfo>> label="UDP Relay" id="udpRelay" control={control} />
          <FormSwitch<Required<SubscriptionInfo>> label="Enabled" id="enabled" control={control} />
        </SimpleGrid>
      </CreateModal>

      <Container>
        <ButtonGroup mb={4}>
          <WritableButton tooltipProps={{ actionName: "Add Subscription" }} variant="black-ghost" onClick={openModal}>
            Add Subscription
          </WritableButton>
        </ButtonGroup>

        <Card size="sm">
          <CardBody>
            <DataTable
              columns={columns}
              extraHeaders={extraHeaders}
              data={Object.entries(config.subscriptions || {}).map(([name, info]) => ({ name, ...info })) || []}
            />
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default Subscription;
