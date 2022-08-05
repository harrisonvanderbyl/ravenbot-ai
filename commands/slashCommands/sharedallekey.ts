import * as WomboDreamApi from "wombo-dream-api";

import {
  MessageActionRow,
  MessageAttachment,
  MessageContextMenuInteraction,
  Modal,
  TextInputComponent,
  UserContextMenuInteraction,
} from "discord.js";
import {
  downloadToBuffer,
  wombo,
} from "../../charaterBuilders/imageGenerators/wombo";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { SlashCommand } from "./typing";
import sharp from "sharp";

export const sharedallekey: SlashCommand = {
  slashCommand: async (client, interaction) => {
    return;
  },
  commandSchema: {
    name: "sharedallekey",
    type: 2,
  },

  contextCommand: async (client, interaction: UserContextMenuInteraction) => {
    const user = interaction.user.id;
    const targetUser = interaction.targetUser.id;
    const channel = interaction.channel;
    // if no dalle config file exists create one
    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    // read dalle key from config file
    const dalleKeys = JSON.parse(readFileSync("./dalleconfig.json").toString());
    if (dalleKeys[user]) {
      // add dalle key to config file
      dalleKeys[targetUser] = dalleKeys[user];

      // write dalle key to config file
      writeFileSync("./dalleconfig.json", JSON.stringify(dalleKeys));
      await interaction.reply(
        {
          content: "You have successfully shared your dalle key with someone",
          ephemeral: true,
        }
      )
    } else {
      await interaction.reply(
        {
          content: "You need to set your dalle key before you can share it. Use /dalleusage config:true to set your key.",
          ephemeral: true,
        }
      )
    }
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
};
