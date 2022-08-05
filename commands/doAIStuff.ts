import { Message, NewsChannel, TextChannel } from "discord.js";
import { adminChannel, client, getAdminChannel } from "./client";

import fs from "fs";
import { getAIResponse } from "../gpt3/parseCommand";
import { getWebhook } from "./common";
import { gptj } from "../gpt3/gpt3";

export const doAIStuff = async (
  message: Message,
  channel: TextChannel,
  args: string[]
) => {
  const allowedChannels = JSON.parse(
    fs.readFileSync("./gpt3/allowedChannels.json", { encoding: "utf8" })
  ).channels;
  const user = message.member?.user;
  if (!user) return;
  if (!allowedChannels.includes(channel.id)) {
  } else {
    const webhook = await getWebhook(channel);
    const messages = await getAIResponse(
      args[0],
      args.slice(1).join(" "),
      channel.id,
      user.tag.split("#")[0]
    );
    messages.map((newmessage) =>
      webhook.send({
        content: newmessage.content,
        avatarURL: newmessage.avatar_url,
        username: newmessage.username,
        embeds: newmessage.embeds,
      })
    );
  }
};
