import { z } from "zod";

import { SubscriptionSchema } from "./subscription";
import { UserSchema } from "./user";

export interface ApiResponse<TData = null> {
  success: boolean;
  message?: string;
  data?: TData;
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
export const ApiUserMethodSchema = z.union([
  z.literal("syncUsers"),
  z.literal("editUsers"),
  z.literal("enableAll"),
  z.literal("disableAll"),
]);
export type ApiUserMethod = z.infer<typeof ApiUserMethodSchema>;

export const ApiUserDTO = {
  UNIVERSAL: z.object({
    body: z.object({
      method: ApiUserMethodSchema,
    }),
  }),

  editUsers: z.object({
    body: z.object({
      method: z.literal("editUsers"),
      users: z.record(z.string({ description: "username" }), UserSchema.strip().nullable()),
    }),
  }),
};

/*
 * /api/subscription
 */
export const ApiSubscriptionMethodSchema = z.union([
  z.literal("editSubscriptions"),
  z.literal("checkSubscriptions"),
  z.literal("enableAll"),
  z.literal("disableAll"),
]);
export type ApiSubscriptionMethod = z.infer<typeof ApiSubscriptionMethodSchema>;

export const ApiSubscriptionDTO = {
  UNIVERSAL: z.object({
    body: z.object({
      method: ApiSubscriptionMethodSchema,
    }),
  }),

  editSubscriptions: z.object({
    body: z.object({
      method: z.literal("editSubscriptions"),
      subscriptions: z.record(z.string({ description: "name" }), SubscriptionSchema.strip().nullable()),
    }),
  }),

  checkSubscriptions: z.object({
    body: z.object({
      method: z.literal("checkSubscriptions"),
      subscriptions: z.array(z.string({ description: "name" })),
    }),
  }),
};
