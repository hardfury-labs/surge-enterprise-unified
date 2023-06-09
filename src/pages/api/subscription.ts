import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import Bluebird from "bluebird";
import dayjs from "dayjs";
import { get, pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { fetchSubscription } from "@/fetchers/subscription";
import { ApiSubscriptionDTO } from "@/types/api";
import { Subscription, SubscriptionSchema } from "@/types/subscription";
import { mapToObject, objectToMap } from "@/utils";
import { ApiError, ApiSuccess, authorize, ncApiOptions, validate } from "@/utils/api";
import { subscriptionParsers } from "@/utils/surgio";

const handler = nc<NextApiRequest, NextApiResponse>(ncApiOptions)
  .use(authorize)
  .post(async (req, res) => {
    validate(req, res, ApiSubscriptionDTO.UNIVERSAL);

    const { method } = req.body;

    switch (method) {
      case "editSubscriptions": {
        // ! Schema use .strict() to check and throw an error if any unknown fields exists
        // ! DTO use .strip() to reset and stripping unrecognized keys
        validate(req, res, ApiSubscriptionDTO.editSubscriptions);

        const config = await Config.load();
        const { subscriptions: postSubscriptions } = (req as z.infer<typeof ApiSubscriptionDTO.editSubscriptions>).body;

        const dbSubscriptions = objectToMap(config.subscriptions);
        const dbSubscriptionCaches = objectToMap(config.subscriptionCaches);

        Object.entries(postSubscriptions).forEach(([name, newInfo]) => {
          // find subscription info by name
          const oldInfo = dbSubscriptions.get(name);

          // if subscription doesn't exist
          if (!oldInfo) {
            // and newInfo is not null, create new subscription
            if (newInfo)
              dbSubscriptions.set(name, {
                ...(pick(newInfo, ...Object.keys(SubscriptionSchema.shape)) as Subscription),
                updatedAt: dayjs().valueOf(),
              });
            else ApiError(403, `Subscription ${name} doesn't exist`);
          }
          // if subscription exists
          else {
            // and newInfo is null, delete subscription
            if (!newInfo) {
              dbSubscriptions.delete(name);
              dbSubscriptionCaches.delete(name);
            }
            // and newInfo is not null, update subscription
            // ! only pick specific fields to prevent data injection
            else
              dbSubscriptions.set(name, {
                ...oldInfo,
                ...(pick(newInfo, ...Object.keys(SubscriptionSchema.shape)) as Subscription),
                updatedAt: dayjs().valueOf(),
              });
          }
        });

        // collate indexs
        const dbSubscriptionsSorted = [...dbSubscriptions.entries()].sort(([aName, aInfo], [bName, bInfo]) => {
          let a = aInfo.index || dbSubscriptions.size - 1;
          let b = bInfo.index || dbSubscriptions.size - 1;

          if (aInfo.updatedAt) a -= a * aInfo.updatedAt;
          if (bInfo.updatedAt) b -= b * bInfo.updatedAt;

          return a - b;
        });
        dbSubscriptionsSorted.forEach(([name, info], index) => {
          dbSubscriptions.set(name, { ...info, index });
        });

        await config.set("subscriptions", mapToObject(dbSubscriptions));
        await config.set("subscriptionCaches", mapToObject(dbSubscriptionCaches));

        return ApiSuccess(res);
      }

      case "checkSubscriptions": {
        validate(req, res, ApiSubscriptionDTO.checkSubscriptions);

        const config = await Config.load();
        const { subscriptions: postSubscriptions } = (req as z.infer<typeof ApiSubscriptionDTO.checkSubscriptions>)
          .body;

        const dbSubscriptions = objectToMap(config.subscriptions);
        const dbSubscriptionCaches = objectToMap(config.subscriptionCaches);

        await Bluebird.map(
          postSubscriptions,
          async (name) => {
            const info = dbSubscriptions.get(name);

            if (!info) return ApiError(403, `Subscription ${name} doesn't exist`);

            const response = await fetchSubscription(info.url);
            const parser = get(subscriptionParsers, info.type);
            const { nodeList } = parser(response, info);

            dbSubscriptionCaches.set(name, {
              body: response.data,
              updatedAt: dayjs().valueOf(),
              nodeCount: nodeList.length,
            });
          },
          {
            concurrency: 5,
          },
        );

        await config.set("subscriptionCaches", mapToObject(dbSubscriptionCaches));

        return ApiSuccess(res);
      }

      default:
        return ApiError(400, "Invalid method");
    }
  });

export default handler;
