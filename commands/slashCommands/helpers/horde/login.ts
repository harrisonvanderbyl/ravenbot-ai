import { existsSync, writeFileSync, readFileSync } from "fs";

export const getApiKey = (discordID: string) => {
  if (!existsSync("./hordeapikeys.json")) {
    writeFileSync("./hordeapikeys.json", "{}");
  }
  const keys = JSON.parse(readFileSync("./hordeapikeys.json", "utf-8"));
  if (!keys[discordID]) {
    return null;
  }
  return keys[discordID];
};

export const setApiKey = (discordID: string, key: string) => {
  if (!existsSync("./hordeapikeys.json")) {
    writeFileSync("./hordeapikeys.json", "{}");
  }
  const keys = JSON.parse(readFileSync("./hordeapikeys.json", "utf-8"));
  keys[discordID] = key;
  writeFileSync("./hordeapikeys.json", JSON.stringify(keys));
};
