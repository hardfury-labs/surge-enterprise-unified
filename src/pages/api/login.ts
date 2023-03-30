import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { setCookie } from "cookies-next";
import SHA256 from "crypto-js/sha256";
import { z } from "zod";

import { AUTH_COOKIE_NAME, getPassword } from "@/constants";
import { ApiLoginDTO } from "@/types/api";
import { ApiError, ApiSuccess, ncApiOptions, validate } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncApiOptions).post(async (req, res) => {
  validate(req, res, ApiLoginDTO);

  const password = getPassword();
  const hash = SHA256(password).toString();

  if ((req as z.infer<typeof ApiLoginDTO>).body.password === hash) {
    setCookie(AUTH_COOKIE_NAME, hash, { req, res });

    return ApiSuccess(res);
  }

  return ApiError(403, "Invalid password");
});

export default handler;
