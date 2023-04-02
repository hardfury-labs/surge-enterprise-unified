import { z } from "zod";

/*
 * Subscription
 */
export const SubscriptionSchema = z
  .object({
    url: z.string().url(),
    type: z.string(),
    udpRelay: z.boolean().optional(),
    enabled: z.boolean().optional(),
  })
  .strict();
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const SubscriptionRecordSchema = z.record(z.string({ description: "name" }), SubscriptionSchema);
export type SubscriptionRecord = z.infer<typeof SubscriptionRecordSchema>;

// For form model
export interface SubscriptionInfo extends Subscription {
  name: string;
}
export type SubscriptionArray = SubscriptionInfo[];

/*
 * Subscription Cache
 */
export const SubscriptionCacheSchema = z
  .object({
    body: z.string(),
    updatedAt: z.number(),
    nodeCount: z.number(),
  })
  .strict();
export type SubscriptionCache = z.infer<typeof SubscriptionCacheSchema>;

export const SubscriptionCacheRecordSchema = z.record(z.string({ description: "name" }), SubscriptionCacheSchema);
export type SubscriptionCacheRecord = z.infer<typeof SubscriptionCacheRecordSchema>;

// https://manual.nssurge.com/policy/proxy.html
