import IORedis, { Redis } from "ioredis";
import { get, merge } from "lodash";
import type { SetRequired } from "type-fest";
import { z } from "zod";

import { DEFAULT_PASSWORD } from "@/constants";
import { Configuration, DataStorageType, DataStorageUri, Env } from "@/types/configuration";
import { ProviderRecord, ProviderRecordSchema } from "@/types/provider";
import { UserRecord, UserRecordSchema } from "@/types/user";
import { formatZodErrors } from "@/utils";

const jsonParse = <T extends z.ZodSchema>(env: Env, key: string, schema: T) => {
  const errors: string[] = [];
  let data;
  // The upper level function has judged
  const value = get(env, key) as string;

  try {
    const json = JSON.parse(value);
    const result = schema.safeParse(json);

    if (!result.success) errors.push(`[${key}] ${formatZodErrors(result.error).join(", ")}`);
    else data = result.data as z.infer<T>;
  } catch (error) {
    errors.push(`[${key}] Invalid JSON string`);
  }

  return { errors, data };
};

let redis: Redis | null = null;

export class Config implements Configuration {
  // from env and cannot be changed
  public dataStorageType: DataStorageType;
  public dataStorageUri: DataStorageUri;
  public features: { writable: boolean };
  public warnings: string[];
  public password: string;

  // from data storage
  public users: UserRecord;
  public providers: ProviderRecord;
  public template: string;
  public seApiToken?: string;

  constructor({
    dataStorageType,
    dataStorageUri,
    features,
    warnings,
    password,
    users,
    providers,
    template,
    seApiToken,
  }: Configuration) {
    this.dataStorageType = dataStorageType;
    this.dataStorageUri = dataStorageUri;
    this.features = features;
    this.warnings = warnings;
    this.password = password;

    this.users = users;
    this.providers = providers;
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
      providers: this.providers,
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
        const keys = ["SB_USERS", "SB_PROVIDERS", "SB_TEMPLATE", "SB_SE_API_TOKEN"];
        const values = await redis.mget(keys);
        if (keys.length !== values.length) throw new Error("Invalid data length");

        env = {};
        keys.forEach((key, index) => (env[key] = values[index]));

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

    if (env.SB_PROVIDERS) {
      const { errors, data } = jsonParse(env, "SB_PROVIDERS", ProviderRecordSchema);

      if (data) configuration.providers = data;
      if (errors.length > 0) configuration.warnings.push(...errors);
    }

    if (env.SB_TEMPLATE) configuration.template = env.SB_TEMPLATE;

    if (env.SB_SE_API_TOKEN) configuration.seApiToken = env.SB_SE_API_TOKEN;

    const config: Configuration = merge(
      {
        dataStorageType: "env",
        password: DEFAULT_PASSWORD,
        users: {},
        providers: {},
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

      // const pipeline = redis.pipeline();
      // pipeline.set("SB_USERS", JSON.stringify(users));
      // pipeline.set("SB_PROVIDERS", JSON.stringify(providers));
      // pipeline.set("SB_TEMPLATE", template);
      // pipeline.set("SB_SE_API_TOKEN", seApiToken);
      // pipeline.exec();
    }

    // unknown
    else throw new Error("Data storage only supports env and redis");
  }
}