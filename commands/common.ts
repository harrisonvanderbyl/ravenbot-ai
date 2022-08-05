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

export const getWebhookFromGuild = async (client ,guildId: string, channelID: string) => {
  const guild = await client.guilds.fetch(guildId);

  var webhook = await getWebhook(
    (await guild.channels.fetch(channelID)) as TextChannel
  );
  if (!webhook) {
    webhook = (await guild.fetchWebhooks()).values().next().value;
  }
  return webhook;
};