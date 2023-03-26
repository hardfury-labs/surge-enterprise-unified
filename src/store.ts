import { setWith } from "lodash";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { fetchApi } from "@/fetchers/api";
import { Configuration } from "@/types/configuration";

export type State = {
  // global loading states
  loadings: object;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;

  config: Configuration;
  getConfig: () => Promise<void>;
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
    })),
  ),
);
