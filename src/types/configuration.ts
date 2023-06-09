import { z } from "zod";

import { SubscriptionCacheRecord, SubscriptionRecord } from "./subscription";
import { UserRecord } from "./user";

export type EnvValue = string | null | undefined;

export type Env = Record<string, EnvValue>;

export type DataStorageType = "env" | "redis";
export type DataStorageUri = "env" | string;

export const SeApiTokenSchema = z.string().uuid().trim();
export type SeApiToken = z.infer<typeof SeApiTokenSchema>;

export interface Configuration {
  // from env and cannot be changed
  dataStorageType: DataStorageType;
  dataStorageUri: DataStorageUri;
  features: { writable: boolean };
  warnings: string[];
  password: string;

  // from data storage
  users: UserRecord;
  subscriptions: SubscriptionRecord;
  subscriptionCaches: SubscriptionCacheRecord;
  subscriptionTypes: string[];
  template: string;
  seApiToken?: SeApiToken;
}
