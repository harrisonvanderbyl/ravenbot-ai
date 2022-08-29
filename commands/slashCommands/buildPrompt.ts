import {
  Client,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  TextChannel,
} from "discord.js";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import { split } from "./helpers/imagesplit";
import { stable } from "./sdhelpers/sdhelpers";

export const stablediffusion: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client: Client, interaction: CommandInteraction) => {
    try {
      const optionsString = interaction.options.data
        .map((option) => `${option.name}: ${option.value}`)
        .join(", ");
      await interaction.reply(
        `Generating image with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
      );
      const seed =
        (interaction.options.get("seed")?.value as string) ||
        Math.random().toPrecision(5);

      const width = interaction.options.get("width")?.value ?? "512";
      const height = interaction.options.get("height")?.value ?? "512";
      const iterations = interaction.options.get("iterations")?.value ?? "1";
      const data = await stable(
        interaction,
        interaction.options.get("prompt").value as string,
        seed,
        undefined,
        undefined,
        (interaction.options.get("colab")?.value ?? "true") == "true",
        width as string,
        height as string,
        iterations as string,
        undefined,
        (interaction?.options?.get("samples")?.value as string) ?? "20"
      ).catch(async (e) => {
        console.log(e);
        await interaction.followUp({ content: "error: " + e, ephemeral: true });
        return null;
      });
      if (data == null) {
        return;
      }
      const messageData = {
        content: null,

        files: [new MessageAttachment(data, `generation.jpeg`)],
        embeds: [
          {
            title:
              (interaction.options.get("prompt").value as string).slice(
                0,
                200
              ) + "...",
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
      };
      // ten minutes

      const message = await (interaction.createdAt.getTime() >
      Date.now() - 600000
        ? interaction.editReply(messageData)
        : await client.channels
            .fetch(interaction.channelId)
            .then(async (channel: TextChannel) => channel.send(messageData)));

      await addToolbar(
        message as Message,
        await split(data, Number(iterations) as 1 | 4 | 9),
        [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel("Patreon")
              .setStyle("LINK")
              .setURL("https://patreon.com/unexplored_horizons"),
            new MessageButton()
              .setLabel("Writerbot home discord")
              .setStyle("LINK")
              .setURL("https://discord.gg/gKcREKcf"),
            new MessageButton()
              .setLabel("Run Colab Node")
              .setStyle("LINK")
              .setURL(
                "https://colab.research.google.com/drive/1xxypspWywNT6IOnXdSQz9phL0MRPhPCp?usp=sharing"
              )
          ),
        ]
      );
    } catch (e) {
      console.log(e);
      await interaction.followUp({ content: "error: " + e, ephemeral: true });
    }
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
        required: false,
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
      {
        name: "iterations",
        required: false,
        type: 3,
        description: "The number of images to generate(colab only)",
        choices: [
          { name: "single", value: "1" },
          { name: "4 panel", value: "4" },
          { name: "9 panel", value: "9" },
        ],
      },
      {
        name: "width",
        required: false,
        type: 3,
        description: "The width of the image",
        choices: [...Array(8).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
      },
      {
        name: "height",
        required: false,
        type: 3,
        description: "The height of the image",
        choices: [...Array(8).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
      },
    ],
  },
};
