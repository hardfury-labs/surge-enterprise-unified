import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { cloneDeep, get, pick } from "lodash";
import { Artifact } from "surgio/build/generator/artifact";
import { getEngine } from "surgio/build/generator/template";
import { z } from "zod";

import { Config } from "@/configuration";
import { fetchSEApi, SEApiUsersData } from "@/fetchers/surge";
import { ApiUserDTO } from "@/types/api";
import { ApiError, ApiSuccess, authorize, ncProfileOptions, validate } from "@/utils/api";

const handler = nc<NextApiRequest, NextApiResponse>(ncProfileOptions).get(async (req, res) => {
  // validate(req, res, ApiUserDTO.UNIVERSAL);

  const templateEngine = getEngine("");

  const artifactInstance = new Artifact(
    {},
    {
      name: "Surge",
      provider: "surge",
      templateString: "[]",
    },
    {
      templateEngine,
    },
  );

  await artifactInstance.init();

  res.status(200).send("1");
});

export default handler;
