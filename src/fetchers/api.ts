import Axios, { AxiosError } from "axios";

import { ApiErrorResponse } from "@/types/api";

/*
 * API
 */
export const fetchApi = Axios.create();

fetchApi.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response)
      return Promise.reject({
        statusCode: error.response.status,
        message: error.response.data.message || error.message,
      });

    return Promise.reject({ statusCode: 400, message: error.message });
  },
);

export const apiFetcher = (url: string) => fetchApi.get(url).then((res) => res.data);
