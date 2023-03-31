import IORedis, { Redis } from "ioredis";
import { get, merge } from "lodash";
import type { SetRequired } from "type-fest";
import { z } from "zod";

import { DEFAULT_PASSWORD } from "@/constants";
import { Configuration, DataStorageType, DataStorageUri, Env } from "@/types/configuration";
import { SubscriptionRecord, SubscriptionRecordSchema } from "@/types/subscription";
import { UserRecord, UserRecordSchema } from "@/types/user";
import { formatZodErrors } from "@/utils";

const jsonParse = <TSchema extends z.ZodSchema>(env: Env, key: string, schema: TSchema) => {
  const errors: string[] = [];
  let data;
  // The upper level function has judged
  const value = get(env, key) as string;

  try {
    const json = JSON.parse(value);
    const result = schema.safeParse(json);

    if (!result.success) errors.push(`[${key}] ${formatZodErrors(result.error).join(", ")}`);
    else data = result.data as z.infer<TSchema>;
  } catch (error) {
    errors.push(`[${key}] Invalid JSON string`);
  }

  return { errors, data };
};

let redis: Redis | null = null;
const dbKeys = ["SB_USERS", "SB_SUBSCRIPTIONS", "SB_TEMPLATE", "SB_SE_API_TOKEN"];

export class Config implements Configuration {
  // from env and cannot be changed
  public dataStorageType: DataStorageType;
  public dataStorageUri: DataStorageUri;
  public features: { writable: boolean };
  public warnings: string[];
  public password: string;
  // from data storage
  public users: UserRecord;
  public subscriptions: SubscriptionRecord;
  public subscriptionTypes: string[];
  public template: string;
  public seApiToken?: string;

  constructor({
    dataStorageType,
    dataStorageUri,
    features,
    warnings,
    password,
    users,
    subscriptions,
    subscriptionTypes,
    template,
    seApiToken,
  }: Configuration) {
    this.dataStorageType = dataStorageType;
    this.dataStorageUri = dataStorageUri;
    this.features = features;
    this.warnings = warnings;
    this.password = password;

    this.users = users;

    this.subscriptions = subscriptions;
    this.subscriptionTypes = subscriptionTypes;

    this.template = template;

    this.seApiToken = seApiToken;
  }

  toJSON() {
    return {
      dataStorageType: this.dataStorageType,
      dataStorageUri: this.dataStorageUri,
      features: this.features,
      warnings: this.warnings,
      password: this.password,
      users: this.users,
      subscriptions: this.subscriptions,
      subscriptionTypes: this.subscriptionTypes,
      template: this.template,
      seApiToken: this.seApiToken,
    };
  }

  static getRedisInstance(uri?: string) {
    if (uri && !redis) {
      redis = new IORedis(uri, {
        retryStrategy: () => null,
        autoResubscribe: false,
        autoResendUnfulfilledCommands: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        tls: {
          rejectUnauthorized: false,
        },
      });

      console.log("Redis instance created");
    }

    return redis;
  }

  static async load() {
    let env: Env = {};

    const configuration: SetRequired<Partial<Configuration>, "dataStorageUri" | "features" | "warnings"> = {
      dataStorageUri: process.env.SB_DATASTORAGE || "env",
      features: { writable: false },
      warnings: [],
    };
    const { dataStorageUri } = configuration;

    if (env.SB_PASSWORD) configuration.password = process.env.SB_PASSWORD;
    else configuration.warnings.push("[SB_PASSWORD] Not set");

    // get configuration from environment variables
    if (dataStorageUri === "env") {
      env = process.env;
      configuration.dataStorageType = "env";
    }

    // get configuration from redis
    else if (dataStorageUri.startsWith("redis://") || dataStorageUri.startsWith("rediss://")) {
      try {
        redis = this.getRedisInstance(dataStorageUri) as Redis;
        if (!["connecting", "connect", "ready"].includes(redis.status)) await redis.connect();

        // mget or hmget
        // mget allows data to be displayed more clearly in the browser
        const values = await redis.mget(dbKeys);
        if (values.length !== dbKeys.length) throw new Error("Invalid data length");

        env = {};
        dbKeys.forEach((key, index) => (env[key] = values[index]));

        configuration.dataStorageType = "redis";
        configuration.features.writable = true;
      } catch (error) {
        configuration.warnings.push(`[SB_DATASTORAGE] Failed to connect to Redis: ${(error as Error).message}`);
      }
    }

    // unknown data storage
    else configuration.warnings.push(`[SB_DATASTORAGE] Invalid value: ${dataStorageUri}`);

    if (env.SB_USERS) {
      const { errors, data } = jsonParse(env, "SB_USERS", UserRecordSchema);

      if (data) configuration.users = data;
      if (errors.length > 0) configuration.warnings.push(...errors);
    }

    if (env.SB_SUBSCRIPTIONS) {
      const { errors, data } = jsonParse(env, "SB_SUBSCRIPTIONS", SubscriptionRecordSchema);

      if (data) configuration.subscriptions = data;
      if (errors.length > 0) configuration.warnings.push(...errors);
    }

    if (env.SB_TEMPLATE) configuration.template = env.SB_TEMPLATE;

    if (env.SB_SE_API_TOKEN) configuration.seApiToken = env.SB_SE_API_TOKEN;

    const config: Configuration = merge(
      {
        dataStorageType: "env",
        password: DEFAULT_PASSWORD,
        users: {},
        subscriptions: {},
        subscriptionTypes: ["shadowsocks_subscribe", "shadowsocks_json_subscribe", "surge", "clash"],
        template: "",
      }, // default
      configuration, // custom
    );

    if (config.password === DEFAULT_PASSWORD) config.warnings.push("[SB_PASSWORD] Default password risk");

    return new Config(config);
  }

  async set(key: string, value: any) {
    // env
    if (this.dataStorageType === "env") throw new Error("Cannot set configuration in env data storage");
    // redis
    else if (this.dataStorageType === "redis") {
      if (!redis) throw new Error("Redis instance not found");

      let data = value;
      if (typeof value !== "string") data = JSON.stringify(value);

      const result = await redis.set(key, data);
      if (result !== "OK") throw new Error(`Failed to set ${key}`);
    }

    // unknown
    else throw new Error("Data storage only supports env and redis");
  }
}
