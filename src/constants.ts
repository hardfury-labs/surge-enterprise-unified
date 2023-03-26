export const DEFAULT_PASSWORD = "pass";

export const getPassword = () => {
  // TODO Error: The edge runtime does not support Node.js 'stream' module.
  // So can't use ioRedis for now

  return process.env.SB_PASSWORD || DEFAULT_PASSWORD;
};

export const AUTH_COOKIE_NAME = "authentication";
