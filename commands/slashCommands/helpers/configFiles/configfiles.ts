import { existsSync, readFileSync, writeFileSync } from "fs";

export const readConfigFile = (path: string) => {
  if (!existsSync("./" + path + ".json")) {
    writeFileSync("./" + path + ".json", JSON.stringify({}));
  }
  return JSON.parse(readFileSync("./" + path + ".json", "utf8"));
};

export const writeConfigFile = (path: string, data: any) => {
  writeFileSync("./" + path + ".json", JSON.stringify(data));
};
