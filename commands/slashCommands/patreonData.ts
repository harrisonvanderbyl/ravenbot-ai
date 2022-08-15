import {
  ButtonInteraction,
  CommandInteraction,
  Interaction,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { generateLoginButton, getPatreonData } from "./patreonHelpers/oauth";
import { oauth, patreon } from "patreon";

import { SlashCommand } from "./typing";
import config from "../../config/config.json";
import express from "express";
import url from "url";

const generateUserStats = async (data) => {};

export const patreonCommand: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    if (!existsSync("./patreonConfig.json")) {
      writeFileSync("./patreonConfig.json", JSON.stringify({}));
    }
    const patreonInfo = JSON.parse(
      readFileSync("./patreonConfig.json").toString()
    )[interaction.user.id];
    if (!patreonInfo) {
      return await generateLoginButton(interaction);
    } else {
      await interaction.deferReply();

      const data = await getPatreonData(
        patreonInfo.token,
        "/current_user/campaigns"
      );

      await interaction.editReply({
        embeds: [
          ...(data.rawJson.data[0]
            ? [
                {
                  title: "Patreon Stats",
                  description: `${data.rawJson.data[0].attributes.name}`,
                  fields: [
                    {
                      name: "Subscribers",
                      value: `${data.rawJson.data[0].attributes.patron_count}`,
                    },
                    {
                      name: "Total Donations",
                      value: `${
                        data.rawJson.data[0].attributes.pledge_sum / 100
                      } ${
                        data.rawJson.data[0].attributes.pledge_sum_currency
                      } (${data.rawJson.data[0].attributes.pay_per_name} `,
                    },
                  ],
                },
              ]
            : []),
        ],
      });
    }
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
  commandSchema: {
    name: "patreondata",
    description: "get your patreon data",
  },
};
