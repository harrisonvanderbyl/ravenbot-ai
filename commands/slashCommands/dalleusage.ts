import { MessageActionRow, Modal, TextInputComponent } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { Dalle } from "../../charaterBuilders/imageGenerators/dalle";
import { SlashCommand } from "./typing";

export const dalleusage: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (client, interaction) => {
    // if no dalle config file exists create one
    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    // read dalle key from config file
    const dalleKey = JSON.parse(readFileSync("./dalleconfig.json").toString())[
      interaction.user.id
    ];

    if (!dalleKey || interaction.options.get("config")?.value) {
      // if no dalle key exists, prompt user to create one
      const modal = new Modal()
        .setCustomId("dalleusage")
        .setTitle("Set your dalle configuration");

      const key = new TextInputComponent()
        .setCustomId("key")
        .setLabel("Whats your dalle key?")
        .setStyle("SHORT")
        .setValue(dalleKey || "");

      const informationValueRow: MessageActionRow<TextInputComponent> =
        new MessageActionRow<TextInputComponent>().addComponents(
          key
        ) as any as MessageActionRow<TextInputComponent>;

  
      modal.addComponents(informationValueRow);
     
      await interaction.showModal(modal);

      return;
    }

    await interaction.deferReply()

    const dallec = new Dalle(dalleKey);

    const data = await dallec.getUsage().catch(async (e) => {
      console.log(e);
      const rep = await interaction.fetchReply();
      if (rep) {
        interaction.editReply(
          typeof e == "string" ? e : "Error, Somethings gone wrong"
        );
      } else {
        interaction.channel.send(
          typeof e == "string" ? e : "Error, Somethings gone wrong"
        );
      }
    });

    if (data) {
      const rep = await interaction.fetchReply();

      if (rep) {
        interaction.editReply({
          embeds: [
            {
              title: "Dalle Usage",

              fields: [
                {
                  name: "Remaining:",
                  value: `${data.aggregate_credits}`,
                  inline: true,
                },
                {
                  name: "Next:",
                  value: "<t:" + data.next_grant_ts + ":R>",
                  inline: true,
                },
              ],
            },
            {
              title: "Want more credits?",
              description: `
                  You can become a supporter and increase the monthly credits [here! (patreon)](https://www.patreon.com/unexplored_Horizons/)
                  (15$ = +50 credits per month)
                  `,
            },
          ],
        });
      } else {
        interaction.channel.send(data);
      }
    }
  },
  commandSchema: {
    name: "dalleusage",
    description: "display the dalle stats and remaining credit",
    options: [
      {
        name: "config",
        type: 5,
        description: "If true, will prompt for dalle key",
        required: false,
      },
    ],
  },
  contextCommand: async (client, interaction) => {
    return;
  },
  modalSubmit: async (client, interaction) => {
    const key = interaction.fields.getTextInputValue("key");

    if (key) {
      // if no dalle config file exists create one
      if (!existsSync("./dalleconfig.json")) {
        writeFileSync("./dalleconfig.json", JSON.stringify({}));
      }

      // read dalle key from config file
      const dalleKeys = JSON.parse(
        readFileSync("./dalleconfig.json").toString()
      );
      
      // add dalle key to config file
      dalleKeys[interaction.user.id] = key;

      // write dalle key to config file
      writeFileSync("./dalleconfig.json", JSON.stringify(dalleKeys));
      
    }
  },
};
