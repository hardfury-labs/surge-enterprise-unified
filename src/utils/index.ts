import { lowerFirst, upperFirst } from "lodash";
import { z } from "zod";

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatZodErrors = (errors: z.ZodError) => {
  // TODO add [] for index
  return errors.issues.map((issue) => `${issue.path.join(".")} ${issue.message.toLowerCase()}`);
};

export const humpToDesc = (str: string) => {
  const words = str.split("");

  words.forEach((word, index) => {
    // if word is upper case AND not first word AND not ( or space before
    if (/^[A-Z]+$/.test(word) && index !== 0 && !/^[\(\s+]$/.test(words[index - 1])) words[index] = ` ${word}`;
  });

  return upperFirst(words.join(""));
};

export const toEnvKey = (str: string) => {
  const words = str.split("");

  words.forEach((word, index) => {
    if (/^[A-Z]+$/.test(word)) words[index] = `_${word}`;
  });

  return `SB_${words.join("").toUpperCase()}`;
};

export const descToHump = (str: string) => lowerFirst(str.replace(/\s+/g, ""));

export const objectToMap = <T>(obj: Record<string, T>) => new Map(Object.entries(obj));

export const mapToObject = <T>(map: Map<string, T>) => Object.fromEntries(map.entries());
