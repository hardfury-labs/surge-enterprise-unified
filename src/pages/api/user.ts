import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { fetchSEApi, SEApiUsersData } from "@/fetchers/surge";
import { ApiUserDTO } from "@/types/api";
import { User, UserSchema } from "@/types/user";
import { mapToObject, objectToMap } from "@/utils";
import { ApiError, ApiSuccess, authorize, ncApiOptions, validate } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncApiOptions)
  .use(authorize)
  .post(async (req, res) => {
    validate(req, res, ApiUserDTO.UNIVERSAL);

    const { method } = req.body;

    switch (method) {
      case "syncUsers": {
        const config = await Config.load();
        const { users, seApiToken } = config;

        if (!seApiToken) return ApiError(403, "No Surge Enterprise API token set");

        try {
          const seUsers: SEApiUsersData = await fetchSEApi.get("/users", { headers: { "x-api-token": seApiToken } });

          const dbUsers = objectToMap(users);
          let add = 0,
            update = 0;

          seUsers.forEach(({ user: seUsername, passcode: sePasscode }) => {
            // find user info by username
            const oldInfo = dbUsers.get(seUsername);

            if (!oldInfo) {
              dbUsers.set(seUsername, { passcode: sePasscode });
              add++;
            } else if (oldInfo.passcode !== sePasscode) {
              dbUsers.set(seUsername, { ...oldInfo, passcode: sePasscode });
              update++;
            }
          });

          await config.set("users", mapToObject(dbUsers));

          return ApiSuccess(res, { message: `Added ${add} users, updated ${update} users` });
        } catch (error) {
          return ApiError(502, (error as Error).message);
        }
      }

      case "editUsers": {
        // ! Schema use .strict() to check and throw an error if any unknown fields exists
        // ! DTO use .strip() to reset and stripping unrecognized keys
        validate(req, res, ApiUserDTO.editUsers);

        const config = await Config.load();
        const { users: postUsers } = (req as z.infer<typeof ApiUserDTO.editUsers>).body;

        const dbUsers = objectToMap(config.users);

        Object.entries(postUsers).forEach(([username, newInfo]) => {
          // find user info by username
          const oldInfo = dbUsers.get(username);

          // if user doesn't exist
          if (!oldInfo) {
            // and newInfo is not null, create new user
            // ! only pick specific fields to prevent data injection
            if (newInfo) dbUsers.set(username, pick(newInfo, ...Object.keys(UserSchema.shape)) as User);
            else ApiError(403, `User ${username} doesn't exist`);
          }
          // if user exists
          else {
            // and newInfo is null, delete user
            if (!newInfo) dbUsers.delete(username);
            // and newInfo is not null, update user
            // ! only pick specific fields to prevent data injection
            else dbUsers.set(username, { ...oldInfo, ...(pick(newInfo, ...Object.keys(UserSchema.shape)) as User) });
          }
        });

        await config.set("users", mapToObject(dbUsers));

        return ApiSuccess(res);
      }

      case "enableAll": {
        const config = await Config.load();
        const { users } = config;

        const dbUsers = objectToMap(users);

        dbUsers.forEach((info, username) => dbUsers.set(username, { ...info, enabled: true }));

        await config.set("users", mapToObject(dbUsers));

        return ApiSuccess(res);
      }

      case "disableAll": {
        const config = await Config.load();
        const { users } = config;

        const dbUsers = objectToMap(users);

        dbUsers.forEach((info, username) => dbUsers.set(username, { ...info, enabled: false }));

        await config.set("users", mapToObject(dbUsers));

        return ApiSuccess(res);
      }

      default:
        return ApiError(400, "Invalid method");
    }
  });

export default handler;
