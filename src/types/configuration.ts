import { ProviderRecord } from "./provider";
import { UserRecord } from "./user";

export type EnvValue = string | null | undefined;

export type Env = Record<string, EnvValue>;

export type DataStorageType = "env" | "redis";
export type DataStorageUri = "env" | string;

// const ConfigurationSchema = z.object({
//   password: z.string(),
//   users: z.array(UserSchema).optional(),
//   providers: z.array(ProviderSchema).optional(),
//   template: z.string().optional(),
//   seApiToken: z.string().optional(),
// });

export interface Configuration {
  // from env and cannot be changed
  dataStorageType: DataStorageType;
  dataStorageUri: DataStorageUri;
  features: { writable: boolean };
  warnings: string[];
  password: string;

  // from data storage
  users: UserRecord;
  providers: ProviderRecord;
  template: string;
  seApiToken?: string;
}
