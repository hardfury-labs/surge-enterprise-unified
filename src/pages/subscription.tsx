import { useCallback } from "react";
import { useController, UseControllerProps, useForm } from "react-hook-form";
import {
  ButtonGroup, Card, CardBody, FormControl, FormErrorMessage, FormLabel, Input, SimpleGrid, Switch, Th, Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Props as SelectProps, Select } from "chakra-react-select";
import { get, omit } from "lodash";

import { Breadcrumb, Container, PssswordInput, WritableButton, WritableSwitch, WritableTip } from "@/components/chakra";
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
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<Required<SubscriptionInfo>>({
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
          <FormControl isInvalid={isDefined(errors.name)}>
            <FormLabel m={0}>Name</FormLabel>
            <Input
              type="text"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && <FormErrorMessage mt="1px">{errors.name.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={isDefined(errors.url)}>
            <FormLabel m={0}>URL</FormLabel>
            <Input
              type="text"
              {...register("url", {
                required: "URL is required",
              })}
            />
            {errors.url && <FormErrorMessage mt="1px">{errors.url.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={isDefined(errors.type)}>
            <FormLabel m={0}>Link Type</FormLabel>
            <Select
              options={config.subscriptionTypes.map((type) => ({ label: type, value: type }))}
              {...register("type", {
                required: "Type is required",
              })}
            />
            {errors.type && <FormErrorMessage mt="1px">{errors.type.message}</FormErrorMessage>}
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel m={0}>UDP Relay</FormLabel>
            <Switch ml={2} mt="1px" size="sm" {...register("udpRelay")} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel m={0}>Enabled</FormLabel>
            <Switch ml={2} mt="1px" size="sm" {...register("enabled")} />
          </FormControl>
        </SimpleGrid>
      </CreateModal>

      <Container>
        <ButtonGroup mb={4}>
          <WritableTip description="Add Subscription">
            <WritableButton variant="black-ghost" onClick={openModal}>
              Add Subscription
            </WritableButton>
          </WritableTip>
        </ButtonGroup>
      </Container>
    </>
  );
};

export default Subscription;
