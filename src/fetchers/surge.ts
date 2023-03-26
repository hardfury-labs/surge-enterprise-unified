import Axios, { AxiosError } from "axios";

/*
 * Surge Enterprise API
 */
export const fetchSEApi = Axios.create({ baseURL: "https://enterprise.nssurge.com/api/admin" });

export interface SEApiErrorResponse {
  error: string;
}

fetchSEApi.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<SEApiErrorResponse>) => {
    if (error.response)
      return Promise.reject({ statusCode: error.response.status, message: error.response.data.error || error.message });

    return Promise.reject({ statusCode: 400, message: error.message });
  },
);

export interface SEApiUserData {
  id: string;
  user: string;
  passcode: string;

  quota: number | null;
  deviceCount: number;
}

// GET /users
export type SEApiUsersData = SEApiUserData[];
