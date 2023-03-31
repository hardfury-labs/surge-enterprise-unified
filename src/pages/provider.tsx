import { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  ButtonGroup,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Switch,
  Th,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { get } from "lodash";
import { nanoid } from "nanoid";

import { Breadcrumb, Container, PssswordInput, WritableButton, WritableSwitch, WritableTip } from "@/components/chakra";
import { CreateModal } from "@/components/modal";
import { DataTable, TableMeta } from "@/components/table";
import { fetchApi } from "@/fetchers/api";
import { useStore } from "@/store";
import { ApiResponse } from "@/types/api";
import { Provider } from "@/types/provider";
import { desc2Hump, isDefined } from "@/utils";

const Provider = () => {
  const config = useStore((state) => state.config);
  const getConfig = useStore((state) => state.getConfig);

  const loadings = useStore((state) => state.loadings);
  const startLoading = useStore((state) => (name: string) => state.startLoading(`provider.${desc2Hump(name)}`));
  const stopLoading = useStore((state) => (name: string) => state.stopLoading(`provider.${desc2Hump(name)}`));
  const isLoading = useCallback((name: string) => get(loadings, `provider.${desc2Hump(name)}`, false), [loadings]);

  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<Required<Provider>>({
    defaultValues: {
      name: "",
      url: "",
      type: "",
      udpRelay: false,
      enabled: true,
    },
    shouldFocusError: false,
  });

  const toast = useToast();

  return (
    <>
      <Breadcrumb title="Provider" />
    </>
  );
};

export default Provider;
