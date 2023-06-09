import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler, Options } from "next-connect";
import { deleteCookie } from "cookies-next";
import SHA256 from "crypto-js/sha256";
import { get } from "lodash";
import { z } from "zod";

import { AUTH_COOKIE_NAME, getPassword } from "@/constants";
import { ApiResponse } from "@/types/api";
import { formatZodErrors } from "@/utils";

export const ApiSuccess = <TData = any>(
  res: NextApiResponse,
  { message, data }: { message?: string; data?: TData } = {},
) => {
  return res.status(200).json({ success: true, message, data });
};

export const ApiError = (statusCode: number, message: string) => {
  const error = new Error(message);
  // @ts-ignore
  error.statusCode = statusCode;

  throw error;
};

export const ncApiOptions: Options<NextApiRequest, NextApiResponse<ApiResponse>> = {
  onError: (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") console.log(err);

    return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
  },
  onNoMatch: (req, res) => {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  },
};

export const ncProfileOptions: Options<NextApiRequest, NextApiResponse<string>> = {
  onError: (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") console.log(err);

    return res.status(err.statusCode || 500).send(err.message || "Internal server error");
  },
  onNoMatch: (req, res) => {
    return res.status(405).send("Method not allowed");
  },
};

export const validate = <TSchema extends z.ZodSchema>(req: NextApiRequest, res: NextApiResponse, schema: TSchema) => {
  const result = schema.safeParse(req);

  if (!result.success) return ApiError(400, formatZodErrors(result.error).join(", "));
};

export const authorize = async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
  const authCookie = get(req.cookies, AUTH_COOKIE_NAME);

  if (!authCookie) return ApiError(401, "Login first");

  const password = getPassword();
  const hash = SHA256(password).toString();

  if (authCookie !== hash) {
    deleteCookie(AUTH_COOKIE_NAME, { req, res });

    return ApiError(401, "Login first");
  }

  next();
};
