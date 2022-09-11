import * as WomboDreamApi from "wombo-dream-api";

import { SlashCommand } from "./typing";

export const updateServer: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // get styles
    await interaction.reply("attempting update...");
    process.exit();
  },
  commandSchema: {
    name: "update",
    description: "update the server",
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
