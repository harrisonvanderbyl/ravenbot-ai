import * as WomboDreamApi from "wombo-dream-api";

import { SlashCommand } from "./typing";

export const updateServer: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // get styles
    await interaction.reply("attempting update...");
    process.exit();
  },
  commandSchema: {
    name: "styles",
    description: "list wombo styles",
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
