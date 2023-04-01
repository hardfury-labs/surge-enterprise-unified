import { z } from "zod";

/*
 * User
 */
export const UserSchema = z.object({
  passcode: z.string(),
  enabled: z.boolean().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const UserRecordSchema = z.record(z.string({ description: "username" }), UserSchema);
export type UserRecord = z.infer<typeof UserRecordSchema>;

// For form model
export interface UserInfo extends User {
  username: string;
}
export type UserArray = UserInfo[];
