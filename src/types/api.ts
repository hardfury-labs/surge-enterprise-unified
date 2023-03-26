import { z } from "zod";

import { UserSchema } from "./user";

export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

/*
 * /api/login
 */
export const ApiLoginDTO = z.object({
  body: z.object({
    password: z.string(),
  }),
});

/*
 * /api/user
 */
export const ApiUserDTO = {
  UNIVERSAL: z.object({
    body: z.object({
      method: z.union([
        z.literal("syncUsers"),
        z.literal("editUsers"),
        z.literal("enableAll"),
        z.literal("disableAll"),
        z.literal("deleteUsers"),
      ]),
    }),
  }),

  editUsers: z.object({
    body: z.object({
      method: z.literal("editUsers"),
      users: z.record(z.string({ description: "username" }), UserSchema.nullable()),
    }),
  }),
};
