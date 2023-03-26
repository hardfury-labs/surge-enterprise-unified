import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { Config } from "@/configuration";
import { ApiSuccess, authorize, ncOptions } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncOptions)
  .use(authorize)
  .get(async (req, res) => {
    const config = await Config.load();

    return ApiSuccess(res, { data: config.toJSON() });
  });

export default handler;
