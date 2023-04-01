import Axios, { AxiosError } from "axios";

import { ApiErrorResponse } from "@/types/api";

/*
 * Fetch Subscription
 */
export const fetchSubscription = Axios.create();

fetchSubscription.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response)
      return Promise.reject({
        statusCode: error.response.status,
        response: error.response.data,
      });

    return Promise.reject({ statusCode: 502 });
  },
);
