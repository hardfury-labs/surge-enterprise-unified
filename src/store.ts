import { createStandaloneToast, CreateToastFnReturn } from "@chakra-ui/react";
import { setWith } from "lodash";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { fetchApi } from "@/fetchers/api";
import { ApiResponse } from "@/types/api";
import { Configuration } from "@/types/configuration";
import { descToHump } from "@/utils";

export interface PostDataOptions {
  description: string;
  loadingKey?: string;
  loadingKeyPrefix?: string;
  successCallback?: () => void;
  showSuccessMsg?: boolean;
  showErrorMsg?: boolean;
  data?: object;
}

export type State = {
  // global loading states
  loadings: object;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;

  config: Configuration;
  getConfig: () => Promise<void>;

  toast: CreateToastFnReturn;

  postData: (url: string, method: string, options: PostDataOptions) => Promise<void>;
};

export const useStore = create<State>()(
  devtools(
    immer((set, get) => ({
      loadings: {},
      startLoading: (key: string) =>
        set(
          (state) => {
            state.loadings = setWith(state.loadings, key, true);
          },
          false,
          "startLoading",
        ),
      stopLoading: (key: string) =>
        set(
          (state) => {
            state.loadings = setWith(state.loadings, key, false);
          },
          false,
          "stopLoading",
        ),

      // handled by Layout, no need to check
      // @ts-ignore
      config: null,
      getConfig: () =>
        fetchApi<Configuration>("/api/config").then(({ data }) => {
          set(
            (state) => {
              state.config = data;
            },
            false,
            "setConfig",
          );
        }),

      // https://github.com/chakra-ui/chakra-ui/issues/1693
      toast: createStandaloneToast().toast,

      postData: async (
        url: string,
        method: string,
        {
          description,
          loadingKey,
          loadingKeyPrefix,
          successCallback,
          showSuccessMsg = true,
          showErrorMsg = true,
          data = {},
        }: PostDataOptions,
      ) => {
        let key = loadingKey ?? description;
        key = descToHump(key);
        if (loadingKeyPrefix) key = `${loadingKeyPrefix}.${key}`;

        get().startLoading(key);

        await fetchApi
          .post<any, ApiResponse>(url, { method, ...data })
          .then(({ message }) => {
            if (showSuccessMsg)
              get().toast({
                title: `${description} Successful`,
                description: message,
                status: "success",
                position: "top",
                duration: 2000,
              });

            if (successCallback) successCallback();

            get().getConfig();
          })
          .catch((error) => {
            if (showErrorMsg)
              get().toast({
                title: `Failed to ${description}`,
                description: error.message,
                status: "error",
                position: "top",
                duration: 2000,
              });
          })
          .finally(() => get().stopLoading(key));
      },
    })),
  ),
);
