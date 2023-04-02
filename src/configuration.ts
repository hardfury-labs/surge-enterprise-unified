import IORedis, { Redis } from "ioredis";
import { get, merge, set } from "lodash";
import type { SetRequired, StringKeyOf } from "type-fest";
import { z } from "zod";

import { DEFAULT_PASSWORD } from "@/constants";
import { Configuration, DataStorageType, DataStorageUri, Env, SeApiTokenSchema } from "@/types/configuration";
import {
  SubscriptionCacheRecord, SubscriptionCacheRecordSchema, SubscriptionRecord, SubscriptionRecordSchema,
} from "@/types/subscription";
import { UserRecord, UserRecordSchema } from "@/types/user";
import { formatZodErrors, toEnvKey } from "@/utils";

type Parser<TSchema extends z.ZodSchema> = (
  key: string,
  value: string,
  schema: TSchema,
) => { errors: string[]; data?: z.infer<TSchema> };

const parsers = {
  json: <TSchema extends z.ZodSchema>(key: string, value: string, schema: TSchema) => {
    const errors: string[] = [];
    let data;

    try {
      const json = JSON.parse(value);
      const result = schema.safeParse(json);

      if (!result.success) errors.push(`[${key}] ${formatZodErrors(result.error).join(", ")}`);
      else data = result.data as z.infer<TSchema>;
    } catch (error) {
      errors.push(`[${key}] Invalid JSON string`);
    }

    return { errors, data };
  },

  string: <TSchema extends z.ZodSchema>(key: string, value: string, schema: TSchema) => {
    const errors: string[] = [];
    let data;

    const result = schema.safeParse(value);

    if (!result.success) errors.push(`[${key}] ${formatZodErrors(result.error).join(", ")}`);
    else data = result.data as z.infer<TSchema>;

    return { errors, data };
  },
};

let redis: Redis | null = null;

const dbSchemas = {
  users: { schema: UserRecordSchema, type: "json" },
  subscriptions: { schema: SubscriptionRecordSchema, type: "json" },
  subscriptionCaches: { schema: SubscriptionCacheRecordSchema, type: "json" },
  // template: { schema: z.string(), type: "string" },
  seApiToken: { schema: SeApiTokenSchema, type: "string" },
};

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
  public subscriptionCaches: SubscriptionCacheRecord;
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
    subscriptionCaches,
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
    this.subscriptionCaches = subscriptionCaches;
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
      subscriptionCaches: this.subscriptionCaches,
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

        const dbEnvKeys = Object.keys(dbSchemas).map((key) => toEnvKey(key));

        // mget or hmget
        // mget allows data to be displayed more clearly in the browser
        const values = await redis.mget(dbEnvKeys);
        if (values.length !== dbEnvKeys.length) throw new Error("Invalid data length");

        env = {};
        dbEnvKeys.forEach((key, index) => (env[key] = values[index]));

        configuration.dataStorageType = "redis";
        configuration.features.writable = true;
      } catch (error) {
        configuration.warnings.push(`[SB_DATASTORAGE] Failed to connect to Redis: ${(error as Error).message}`);
      }
    }
    // unknown data storage
    else configuration.warnings.push(`[SB_DATASTORAGE] Invalid value: ${dataStorageUri}`);

    Object.entries(dbSchemas).forEach(([key, { schema, type }]) => {
      const envKey = toEnvKey(key);
      const value = get(env, envKey);

      if (value) {
        const parser: Parser<typeof schema> = get(parsers, type);
        const { errors, data } = parser(envKey, value, schema);

        if (data) set(configuration, key, data);
        if (errors.length > 0) configuration.warnings.push(...errors);
      }
    });

    const config: Configuration = merge(
      {
        dataStorageType: "env",
        password: DEFAULT_PASSWORD,
        users: {},
        subscriptions: {},
        subscriptionCaches: {},
        subscriptionTypes: ["shadowsocks_subscribe", "shadowsocks_json_subscribe", "surge", "clash"],
        template: "",
      }, // default
      configuration, // custom
    );

    if (config.password === DEFAULT_PASSWORD) config.warnings.push("[SB_PASSWORD] Default password risk");

    return new Config(config);
  }

  async set(key: StringKeyOf<typeof dbSchemas>, value: any) {
    // env
    if (this.dataStorageType === "env") throw new Error("Cannot set configuration in env data storage");
    // redis
    else if (this.dataStorageType === "redis") {
      if (!redis) throw new Error("Redis instance not found");

      let data = value;
      if (typeof value !== "string") data = JSON.stringify(value);

      const result = await redis.set(toEnvKey(key), data);
      if (result !== "OK") throw new Error(`Failed to set ${key}`);
    }

    // unknown
    else throw new Error("Data storage only supports env and redis");
  }
}
