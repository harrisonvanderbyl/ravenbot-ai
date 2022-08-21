import { CommandInteraction, MessageAttachment } from "discord.js";

import { SlashCommand } from "./typing";
import { stable } from "./sdhelpers/sdhelpers";

export const stablediffusion: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    const optionsString = interaction.options.data
      .map((option) => `${option.name}: ${option.value}`)
      .join(", ");
    await interaction.reply(
      `Generating image with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
    );
    const data = await stable(
      interaction,
      interaction.options.get("prompt").value as string
    );
    await interaction.editReply({
      content: null,
      
      files: [new MessageAttachment(data, `generation.jpeg`)],
      embeds : [
        {
          title: (interaction.options.get("prompt").value as string),
          image: {
            url: `attachment://generation.jpeg`,
          },
        },
      ],
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
      {
        name: "seed",
        required: false,
        type: 3,
        description: "The seed to use",
      },
      {
        name: "samples",
        required: false,
        type: 3,
        description: "The number of samples to use",
      },
    ],
  },
};
