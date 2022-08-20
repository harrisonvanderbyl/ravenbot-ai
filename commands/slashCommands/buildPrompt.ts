import { CommandInteraction, MessageAttachment } from "discord.js";

import { SlashCommand } from "./typing";
import { stable } from "./sdhelpers/sdhelpers";

export const stablediffusion: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    await interaction.reply("Command should finish within 2 minutes");
    const data = await stable(
      interaction,
      interaction.options.get("prompt").value as string
    );
    await interaction.editReply({
      files: [new MessageAttachment(data, `generation.jpeg`)],
    });
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
  commandSchema: {
    name: "stablediffusion",
    description: "use stable diffusion",
    options: [
      {
        name: "prompt",

        required: true,
        type: 3,
        description: "What to ask stable diffusion",
      },
    ],
  },
};
