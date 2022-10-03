import { TextChannel, Webhook } from "discord.js";

import axios from "axios";
import commands from "./slashCommands";
import config from "../config/config.json";
const headers = {
  Authorization: "Bot " + config.token,
};
export const url = (guildID?: string) =>
  `https://discord.com/api/v10/applications/774799595570069534/${
    guildID ? `guilds/${guildID}/` : ""
  }commands`;

export const getGuildCommands = async (
  guildID
): Promise<
  {
    name: string;
    description: string;
    options: { name: string; description: string }[];
  }[]
> =>
  axios.get(url(guildID), { headers }).then(({ data }) =>
    data.map((d) => ({
      name: d.name,
      description: d.description,
      options:
        Object.values(commands).find((e) => e.commandSchema.name == d.name)
          ?.commandSchema?.options ?? [],
    }))
  );
