import { lowerFirst, upperFirst } from "lodash";
import { z } from "zod";

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isDefined = (value: unknown) => {
  if (value === null || value === undefined) return false;

  return true;
};

export const formatZodErrors = (errors: z.ZodError) => {
  // TODO add [] for index
  return errors.issues.map((issue) => `${issue.path.join(".")} ${issue.message.toLowerCase()}`);
};

export const humpToDesc = (str: string) => {
  const words = str.split("");
  const regex = /^[A-Z]+$/;

  words.forEach((word, index) => {
    if (regex.test(word)) words[index] = ` ${word}`;
  });

  return upperFirst(words.join(""));
};

export const toEnvKey = (str: string) => {
  const words = str.split("");
  const regex = /^[A-Z]+$/;

  words.forEach((word, index) => {
    if (regex.test(word)) words[index] = `_${word}`;
  });

  return `SB_${words.join("").toUpperCase()}`;
};

export const descToHump = (str: string) => lowerFirst(str.replace(/\s+/g, ""));
