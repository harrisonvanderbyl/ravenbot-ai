import {
  BaseCommandInteraction,
  CommandInteraction,
  Message,
  TextChannel,
} from "discord.js";
import { gpt3, gptj } from "../../gpt3/gpt3";

import { SlashCommand } from "./typing";
import { characters } from "../../gpt3/characters.json";
import { client } from "../client";
import { getAIResponse } from "../../gpt3/parseCommand";
import { getWebhookFromGuild } from "../common";

export const createSubmission: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (clien, interaction: BaseCommandInteraction) => {
    const name = interaction.options.get("name").value as string;
    const icon = interaction.options.get("icon").value as string;
    const banner = interaction.options.get("banner").value as string;
    await interaction.deferReply({ ephemeral: true });
    const embed = {
      author: {
        name: name,
        icon_url: icon,
      },
      image: {
        url: banner,
      },
    };
    const message = (await interaction.followUp({
      ephemeral: true,
      embeds: [embed],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "Submit",
              customId: "submit",
              style: "PRIMARY",
            },
          ],
        },
      ],
    })) as Message;

    // listen for button
    message
      .awaitMessageComponent({
        componentType: "BUTTON",
        filter: (i) => i.customId === "submit",
        time: 15000,
        dispose: true,
      })
      .then(async (i) => {
        const guild = "989166996153323591";
        const channel = "1017295761366581288";
        const webhook = await getWebhookFromGuild(client, guild, channel);
        await i.reply({ content: "Thanks for submitting!", ephemeral: true });
        await webhook.send({
          embeds: [embed],
          username: interaction.user.username,
          avatarURL: interaction.user.avatarURL(),
        });
      });
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
  commandSchema: {
    name: "competitionsubmission",
    description: "Submit an entry into the competition",
    options: [
      {
        name: "name",
        type: 3,
        required: true,
        description: "The suggested server name",
      },
      {
        name: "icon",
        type: 3,
        required: true,
        description: "The suggested server icon(image url)",
      },
      {
        name: "banner",
        type: 3,
        required: true,
        description: "The suggested server banner(image url)",
      },
    ],
  },
};
