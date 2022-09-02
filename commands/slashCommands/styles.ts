import * as WomboDreamApi from "wombo-dream-api";

import { SlashCommand } from "./typing";

export const styles: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // get styles

    const styles =
      (await WomboDreamApi.buildDefaultInstance().fetchStyles()) as any;

    console.log(styles);

    const outMessage = await interaction.editReply({
      content:
        "Available Styles ```json\n" + JSON.stringify(styles.map()) + "```",
    });
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
