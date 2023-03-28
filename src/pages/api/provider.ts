import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { cloneDeep, get, pick } from "lodash";
import { z } from "zod";

import { Config } from "@/configuration";
import { fetchSEApi, SEApiUsersData } from "@/fetchers/surge";
import { ApiUserDTO } from "@/types/api";
import { ApiError, ApiSuccess, authorize, ncOptions, validate } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncOptions)
  .use(authorize)
  .post(async (req, res) => {
    // validate(req, res, ApiUserDTO.UNIVERSAL);
  });

export default handler;
