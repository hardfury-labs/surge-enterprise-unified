import { z } from "zod";

export const SubscriptionSchema = z.object({
  url: z.string().url(),
  type: z.string(),
  udpRelay: z.boolean().optional(),
  enabled: z.boolean().optional(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const SubscriptionRecordSchema = z.record(z.string({ description: "name" }), SubscriptionSchema);
export type SubscriptionRecord = z.infer<typeof SubscriptionRecordSchema>;

export interface SubscriptionInfo extends Subscription {
  name: string;
}
export type SubscriptionArray = SubscriptionInfo[];

export interface SubscriptionCache {
  status?: number;
  data?: string;
}
export type SubscriptionCacheRecord = Record<string, SubscriptionCache>;

// https://manual.nssurge.com/policy/proxy.html
