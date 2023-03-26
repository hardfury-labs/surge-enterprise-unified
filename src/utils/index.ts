import { lowerFirst, upperFirst } from "lodash";
import { z } from "zod";

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatZodErrors = (errors: z.ZodError) => {
  // TODO add [] for index
  return errors.issues.map((issue) => `${issue.path.join(".")} ${issue.message.toLowerCase()}`);
};

export const hump2Desc = (str: string) => {
  const words = str.split("");
  const regex = /^[A-Z]+$/;

  words.forEach((word, index) => {
    if (regex.test(word)) words[index] = ` ${word}`;
  });

  return upperFirst(words.join(""));
};

export const desc2Hump = (str: string) => lowerFirst(str.replace(/\s+/g, ""));
