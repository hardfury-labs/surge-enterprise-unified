import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { Config } from "@/configuration";
import { ApiSuccess, authorize, ncApiOptions } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncApiOptions)
  .use(authorize)
  .get(async (req, res) => {
    const config = await Config.load();

    return ApiSuccess(res, { data: config.toJSON() });
  });

export default handler;
