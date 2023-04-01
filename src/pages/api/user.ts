import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { cloneDeep, get, pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { fetchSEApi, SEApiUsersData } from "@/fetchers/surge";
import { ApiUserDTO } from "@/types/api";
import { User, UserSchema } from "@/types/user";
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

          const tempUsers = cloneDeep(users);
          let add = 0,
            update = 0;

          seUsers.forEach(({ user: seUsername, passcode: sePasscode }) => {
            // find user info by username
            const oldInfo = get(tempUsers, seUsername);

            if (!oldInfo) {
              tempUsers[seUsername] = { passcode: sePasscode };
              add++;
            } else if (oldInfo.passcode !== sePasscode) {
              tempUsers[seUsername] = { ...oldInfo, passcode: sePasscode };
              update++;
            }
          });

          await config.set("users", tempUsers);

          return ApiSuccess(res, { message: `Added ${add} users, updated ${update} users` });
        } catch (error) {
          return ApiError(502, (error as Error).message);
        }
      }

      case "editUsers": {
        validate(req, res, ApiUserDTO.editUsers);

        const config = await Config.load();
        const { users: postUsers } = (req as z.infer<typeof ApiUserDTO.editUsers>).body;

        const tempUsers = cloneDeep(config.users);

        Object.entries(postUsers).forEach(([username, newInfo]) => {
          // find user info by username
          const oldInfo = get(tempUsers, username);

          // if user doesn't exist
          if (!oldInfo) {
            // and newInfo is not null, create new user
            // !only pick specific fields to prevent data injection
            if (newInfo) tempUsers[username] = pick(newInfo, Object.keys(UserSchema.strict().shape)) as User;
            else ApiError(403, `User ${username} doesn't exist`);
          }

          // if user exists
          else {
            // and newInfo is null, delete user
            if (!newInfo) delete tempUsers[username];
            // and newInfo is not null, update user
            // !only pick specific fields to prevent data injection
            else tempUsers[username] = { ...oldInfo, ...pick(newInfo, Object.keys(UserSchema.strict().shape)) };
          }
        });

        await config.set("users", tempUsers);

        return ApiSuccess(res);
      }

      case "enableAll": {
        const config = await Config.load();
        const { users } = config;

        const tempUsers = cloneDeep(users);

        Object.keys(tempUsers).forEach((user) => (tempUsers[user].enabled = true));

        await config.set("users", tempUsers);

        return ApiSuccess(res);
      }

      case "disableAll": {
        const config = await Config.load();
        const { users } = config;

        const tempUsers = cloneDeep(users);

        Object.keys(tempUsers).forEach((user) => (tempUsers[user].enabled = false));

        await config.set("users", tempUsers);

        return ApiSuccess(res);
      }

      default:
        return ApiError(400, "Invalid method");
    }
  });

export default handler;
