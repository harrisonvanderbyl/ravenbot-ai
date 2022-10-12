import { existsSync, readFileSync, writeFileSync } from "fs";
import {
  generateLoginButton,
  getPatreonData,
  getPatreonDiscordIDs,
} from "./patreonHelpers/oauth";

import { CommandInteraction } from "discord.js";
import { SlashCommand } from "./typing";
import { client } from "../client";

const generateUserStats = async (data) => {};

const giveRole = async (userid) => {
  const g = await client.guilds.fetch("989166996153323591");
  const member = await g.members.fetch(userid).catch((e) => null);
  if (!member) {
    console.log("Member not found");
    return;
  }
  await member.roles.add("1022485145627934771");
};

export const updatePatreonData = async () => {
  try {
    const rawPatreonConfig = JSON.parse(
      readFileSync("./patreonConfig.json").toString()
    );
    const patreonInfo = rawPatreonConfig["438605535323881486"];

    const data = await getPatreonData(
      patreonInfo.token,
      "/current_user/campaigns"
    );
    const camp = data.rawJson.data[0].id;

    const mypatreons = await getPatreonDiscordIDs(patreonInfo.token, camp);
    rawPatreonConfig["438605535323881486"].patreons = mypatreons;
    await Promise.all(
      mypatreons.map((p) => giveRole(p.social_connections.discord.user_id))
    );
    writeFileSync("./patreonConfig.json", JSON.stringify(rawPatreonConfig));
  } catch (e) {
    console.log(e);
  }
};

// update every 2 minutes
//setInterval(updatePatreonData, 1000 * 60 * 2);

export const patreonCommand: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    if (!existsSync("./patreonConfig.json")) {
      writeFileSync("./patreonConfig.json", JSON.stringify({}));
    }
    const rawPatreonConfig = JSON.parse(
      readFileSync("./patreonConfig.json").toString()
    );
    const patreonInfo = rawPatreonConfig[interaction.user.id];
    if (!patreonInfo) {
      return await generateLoginButton(interaction);
    } else {
      await interaction.deferReply();

      const data = await getPatreonData(
        patreonInfo.token,
        "/current_user/campaigns"
      );
      const camp = data.rawJson.data[0].id;

      const mypatreons = await getPatreonDiscordIDs(patreonInfo.token, camp);
      rawPatreonConfig[interaction.user.id].patreons = mypatreons;

      writeFileSync("./patreonConfig.json", JSON.stringify(rawPatreonConfig));

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
                      } per ${data.rawJson.data[0].attributes.pay_per_name} `,
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
