import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { ApiSubscriptionDTO } from "@/types/api";
import { Subscription, SubscriptionSchema } from "@/types/subscription";
import { mapToObject, objectToMap } from "@/utils";
import { ApiError, ApiSuccess, authorize, ncApiOptions, validate } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncApiOptions)
  .use(authorize)
  .post(async (req, res) => {
    validate(req, res, ApiSubscriptionDTO.UNIVERSAL);

    const { method } = req.body;

    switch (method) {
      case "editSubscriptions": {
        validate(req, res, ApiSubscriptionDTO.editSubscriptions);

        const config = await Config.load();
        const { subscriptions: postSubscriptions } = (req as z.infer<typeof ApiSubscriptionDTO.editSubscriptions>).body;

        const dbSubscriptions = objectToMap(config.subscriptions);

        Object.entries(postSubscriptions).forEach(([name, newInfo]) => {
          // find subscription info by name
          const oldInfo = dbSubscriptions.get(name);

          // if subscription doesn't exist
          if (!oldInfo) {
            // and newInfo is not null, create new subscription
            // !only pick specific fields to prevent data injection
            if (newInfo)
              dbSubscriptions.set(name, pick(newInfo, Object.keys(SubscriptionSchema.strict().shape)) as Subscription);
            else ApiError(403, `Subscription ${name} doesn't exist`);
          }

          // if subscription exists
          else {
            // and newInfo is null, delete subscription
            if (!newInfo) dbSubscriptions.delete(name);
            // and newInfo is not null, update subscription
            // !only pick specific fields to prevent data injection
            else
              dbSubscriptions.set(name, {
                ...oldInfo,
                ...pick(newInfo, Object.keys(SubscriptionSchema.strict().shape)),
              });
          }
        });

        await config.set("subscriptions", mapToObject(dbSubscriptions));

        return ApiSuccess(res);
      }

      default:
        return ApiError(400, "Invalid method");
    }
  });

export default handler;
