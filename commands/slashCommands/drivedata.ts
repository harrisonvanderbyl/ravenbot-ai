import { existsSync, readFileSync, writeFileSync } from "fs";
import { generateLoginButton, getPatreonData } from "./patreonHelpers/oauth";
import { listFolders, storeToken } from "./googleDriveHelpers/oauth";

import { CommandInteraction } from "discord.js";
import { SlashCommand } from "./typing";

const generateUserStats = async (data) => {};

export const drivedata: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    await listFolders(interaction);
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
  commandSchema: {
    name: "sharedrive",
    description: "share a gdrive folder with some patreons!",
  },
};
