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
    options: [
      {
        name: "message",

        type: 3,
        required: false,
        description: "(default:'')The message to send with the link",
      },
      {
        name: "role",
        type: 3,
        required: false,
        description: "(default:reader)The role to give people",
        choices: [
          {
            name: "Writer",
            value: "writer",
          },
          {
            name: "Reader",
            value: "reader",
          },
          {
            name: "Commenter",
            value: "commenter",
          },
        ],
      },
      {
        name: "expire",
        description: "(default:true) expire access at end of month",
        type: 5,
        required: false,
      },
    ],
  },
};
