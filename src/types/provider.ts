import { z } from "zod";

export const ProviderSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  enabled: z.boolean().optional(),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const ProviderRecordSchema = z.record(z.string({ description: "name" }), ProviderSchema);
export type ProviderRecord = z.infer<typeof ProviderRecordSchema>;

export interface ProviderInfo extends Provider {
  name: string;
}
export type ProviderArray = ProviderInfo[];
