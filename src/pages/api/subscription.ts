import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { cloneDeep, get, pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { ApiSubscriptionDTO } from "@/types/api";
import { Subscription, SubscriptionSchema } from "@/types/subscription";
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
        const { subscriptions } = (req as z.infer<typeof ApiSubscriptionDTO.editSubscriptions>).body;

        const tempSubscriptions = cloneDeep(config.subscriptions);

        Object.entries(subscriptions).forEach(([name, newInfo]) => {
          // find subscription info by name
          const oldInfo = get(tempSubscriptions, name);

          // if subscription doesn't exist
          if (!oldInfo) {
            // and newInfo is not null, create new subscription
            // !only pick specific fields to prevent data injection
            if (newInfo)
              tempSubscriptions[name] = pick(newInfo, Object.keys(SubscriptionSchema.strict().shape)) as Subscription;
            else ApiError(403, `Subscription ${name} doesn't exist`);
          }

          // if subscription exists
          else {
            // and newInfo is null, delete subscription
            if (!newInfo) delete tempSubscriptions[name];
            // and newInfo is not null, update subscription
            // !only pick specific fields to prevent data injection
            else
              tempSubscriptions[name] = {
                ...oldInfo,
                ...pick(newInfo, Object.keys(SubscriptionSchema.strict().shape)),
              };
          }
        });

        await config.set("SB_SUBSCRIPTIONS", tempSubscriptions);

        return ApiSuccess(res);
      }
    }
  });

export default handler;
