import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, Card, CardBody, Input, SimpleGrid, Switch, Th, Tr, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get, omit } from "lodash";

import { Breadcrumb, Container, WritableButton, WritableSwitch } from "@/components/chakra";
import { FormInput, FormSelect, FormSwitch } from "@/components/form";
import { CreateModal } from "@/components/modal";
import { DataTable, TableMeta } from "@/components/table";
import { PostDataOptions, useStore } from "@/store";
import { SubscriptionInfo } from "@/types/subscription";
import { desc2Hump, isDefined } from "@/utils";

const Subscription = () => {
  const config = useStore((state) => state.config);
  const postData = useStore(
    (state) => (method: string, options: PostDataOptions) =>
      state.postData("/api/subscription", method, { loadingKeyPrefix: "subscription", ...options }),
  );

  const loadings = useStore((state) => state.loadings);
  const isLoading = useCallback((name: string) => get(loadings, `subscription.${desc2Hump(name)}`, false), [loadings]);

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
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
      </Container>
    </>
  );
};

export default Subscription;
