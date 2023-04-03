import { z } from "zod";

/*
 * User
 */
export const UserSchema = z
  .object({
    passcode: z.string().trim(),
    enabled: z.boolean().optional(),
  })
  .strict();
export type User = z.infer<typeof UserSchema>;

export const UserRecordSchema = z.record(z.string({ description: "username" }).trim(), UserSchema);
export type UserRecord = z.infer<typeof UserRecordSchema>;

// For form model
export interface UserInfo extends User {
  username: string;
}
export type UserArray = UserInfo[];
