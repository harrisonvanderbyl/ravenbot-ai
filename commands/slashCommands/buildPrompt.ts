import {
  CommandInteraction,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
} from "discord.js";

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
    const seed =
      (interaction.options.get("seed")?.value as string) ||
      Math.random().toPrecision(5);
    const data = await stable(
      interaction,
      interaction.options.get("prompt").value as string,
      seed,
      undefined,
      undefined,
      interaction.options.get("colab").value == "true"
    ).catch(async (e) => {
      console.log(e);
      await interaction.followUp({ content: "error: " + e, ephemeral: true });
      return null;
    });
    if (data == null) {
      return;
    }
    await interaction.editReply({
      content: null,

      files: [new MessageAttachment(data, `generation.jpeg`)],
      embeds: [
        {
          title:
            (interaction.options.get("prompt").value as string).slice(0, 200) +
            "...",
          fields: [
            {
              name: "Seed",
              value: seed,
              inline: true,
            },
          ],
          image: {
            url: `attachment://generation.jpeg`,
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Patreon")
            .setStyle("LINK")
            .setURL("https://patreon.com/unexplored_horizons"),
          new MessageButton()
            .setLabel("Local(Nsfw) Node")
            .setStyle("LINK")
            .setURL("https://github.com/harrisonvanderbyl/SD"),
          new MessageButton()
            .setLabel("Colab(Fast,Free,Anyone) Node")
            .setStyle("LINK")
            .setURL(
              "https://colab.research.google.com/drive/1xxypspWywNT6IOnXdSQz9phL0MRPhPCp?usp=sharing"
            )
        ),
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
        name: "colab",
        required: true,
        type: 3,
        choices: [
          { name: "Yes", value: "true" },
          { name: "No", value: "false" },
        ],

        description: "prefer colab completions",
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
