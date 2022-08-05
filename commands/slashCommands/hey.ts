import { gpt3, gptj } from "../../gpt3/gpt3";

import { SlashCommand } from "./typing";
import { characters } from "../../gpt3/characters.json";
import { getAIResponse } from "../../gpt3/parseCommand";
import { getWebhookFromGuild } from "../common";

export const heyCommand: SlashCommand = {
  slashCommand: async (client, interaction) => {
    if (interaction.commandName === "hey") {
      const webhook = await getWebhookFromGuild(
        client,
        interaction.guildId,
        interaction.channelId
      );
      webhook.send({
        content: interaction.options.get("text").value as string,
        avatarURL: interaction.user.avatarURL(),
        username: interaction.user.username,
      });
      const messages = await getAIResponse(
        interaction.options.get("character").value as string,
        interaction.options.get("text").value as string,
        interaction.channel.id,
        interaction.user.tag.split("#")[0],
        interaction.options.get("model")?.value == "gptj" ? gptj : gpt3
      );
      messages.map((newmessage) =>
        webhook.send({
          content: newmessage.content,
          avatarURL: newmessage.avatar_url,
          username: newmessage.username,
          embeds: newmessage.embeds,
        })
      );
      interaction.deleteReply();
    }
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
  commandSchema: {
    name: "hey",
    description: "interact with a character",
    options: [
      {
        name: "character",

        type: 3,
        required: true,
        description: "The character to interact with",
        choices: characters.map((character) => {
          return {
            name: character.name,
            value: character.name,
          };
        }),
      },
      {
        name: "text",
        type: 3,
        required: true,
        description: "The message to send",
      },
      {
        name: "model",
        type: 3,
        description: "The model to use, beta, ignore for now",
        choices: [
          {
            name: "gpt3",
            value: "gpt3",
          },
          {
            name: "gptj",
            value: "gptj",
          },
        ],
      },
    ],
  },
};
