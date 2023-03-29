import { SupportProviderEnum } from "surgio/build/types";
import { z } from "zod";

export const ProviderSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  udpRelay: z.boolean().optional(),
  enabled: z.boolean().optional(),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const ProviderRecordSchema = z.record(z.string({ description: "uuid" }), ProviderSchema);
export type ProviderRecord = z.infer<typeof ProviderRecordSchema>;

export interface ProviderInfo extends Provider {
  uuid: string;
}
export type ProviderArray = ProviderInfo[];

// https://manual.nssurge.com/policy/proxy.html
export type ProviderType =
  | SupportProviderEnum.Clash
  | SupportProviderEnum.ShadowsocksSubscribe
  | SupportProviderEnum.ShadowsocksJsonSubscribe
  | SupportProviderEnum.V2rayNSubscribe
  | SupportProviderEnum.Trojan;
