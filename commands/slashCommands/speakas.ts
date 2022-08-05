import { SlashCommand } from "./typing";
import { TextChannel } from "discord.js";
import chars from "../../gpt3/characters.json";
import { getWebhookFromGuild } from "../common";

export const speakas: SlashCommand = {
  slashCommand: async (client, interaction) => {
    const channelID = interaction.options.get("channel");
    const character = interaction.options.get("character");
    const message = interaction.options.get("text");
    const image = interaction.options.get("image");

    if (channelID) {
      const channel = (await client.channels.fetch(
        (channelID.value as string) ?? "error"
      )) as TextChannel;
      if (channel) {
        const char = chars.characters.find(
          (c) => c.name == (character.value as string)
        );
        if (char) {
          const webhook = await getWebhookFromGuild(
            client,
            interaction.guildId,
            interaction.channelId
          );
          if (webhook) {
            webhook.send({
              avatarURL: char.avatar,
              username: char.name,
              content: message.value as string,
              embeds: [
                ...(image?.value
                  ? [
                      {
                        image: {
                          url: image.value as string,
                        },
                      },
                    ]
                  : []),
              ],
            });
          }
        }
      }
    }

    interaction.editReply("Finished");
  },
  commandSchema: {
    name: "speakas",
    description: "Post a message as a character",
    options: [
      {
        name: "channel",
        type: 3,
        required: true,
        description: "What channel to post in",
      },
      {
        name: "character",

        type: 3,
        required: true,
        description: "The character to post as",
        choices: chars.characters.map((character) => {
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
        description: "What to post",
      },
      {
        name: "image",
        type: 3,
        description: "The image url to post",
      },
    ],
  },
  contextCommand: async (client, interaction) => {
    return;
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
};
