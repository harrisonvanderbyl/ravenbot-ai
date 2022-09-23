import { TextChannel, Webhook } from "discord.js";

export const parseRGBNumber = (num: [number, number, number]) =>
  parseInt(
    num
      .map((n) => n.toString(16))
      .map((n) => (n.length == 1 ? "0" + n : n))
      .join(""),
    16
  );

export const getWebhook = async (channel: TextChannel): Promise<Webhook> => {
  var webhook = (await channel.fetchWebhooks()).values().next().value;
  if (!webhook) {
    webhook = await channel.createWebhook("WebHook");
  }
  return webhook;
};

export const getWebhookFromGuild = async (
  client,
  guildId: string,
  channelID: string
) => {
  const guild = await client.guilds.fetch(guildId);

  var webhook = await getWebhook(
    (await guild.channels.fetch(channelID)) as TextChannel
  );
  if (!webhook) {
    webhook = (await guild.fetchWebhooks()).values().next().value;
  }
  return webhook;
};

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
