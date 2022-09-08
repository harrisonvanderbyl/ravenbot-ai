import {
  BaseCommandInteraction,
  CommandInteraction,
  Message,
} from "discord.js";
import { gpt3, gptj } from "../../gpt3/gpt3";

import { SlashCommand } from "./typing";
import { characters } from "../../gpt3/characters.json";
import { getAIResponse } from "../../gpt3/parseCommand";
import { getWebhookFromGuild } from "../common";

export const createSubmission: SlashCommand = {
  slashCommand: async (client, interaction: BaseCommandInteraction) => {
    const name = interaction.options.get("name").value as string;
    const icon = interaction.options.get("icon").value as string;
    const banner = interaction.options.get("banner").value as string;
    await interaction.deferReply({ ephemeral: true });
    const message = (await interaction.followUp({
      ephemeral: true,
      embeds: [
        {
          author: {
            name: name,
            icon_url: icon,
          },
          image: {
            url: banner,
          },
        },
      ],
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
        await i.reply({ content: "Thanks for submitting!", ephemeral: true });
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
