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

const styles = {
  raw: (p) => p,
  fantasy: (p) =>
    `${p} fantasy artwork epic detailed and intricate digital painting trending on artstation by wlop octane render`,
  rutkowski: (p) =>
    `${p} fantasy artwork epic detailed and intricate digital painting trending on artstation concept art by greg rutkowski`,
  anime: (p) =>
    `${p} digital 2d anime illustration, by Makoto Shinkai, by Hayao Miyazaki, detailed award-winning still frame`,
  spooky: (p) =>
    `${p} creepy hyperrealistic detailed horror fantasy concept art, by Wayne Barlowe, by Zdzislaw Beksinski, by Seb McKinnon`,
  painting: (p) =>
    `${p} digitized painting, highly detailed, sharp focus, impasto brush strokes, acclaimed artwork by gaston bussiere, by j. c. leyendecker`,
  flat: (p) =>
    `${p} ui art icon by victo ngai, kilian eng, lois van baarle, flat`,
  butter: (p) =>
    `${p} award-winning butter sculpture at the Minnesota State Fair, made of butter, dairy creation`,
};

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

      var width = (interaction.options.get("width")?.value as string) ?? "512";
      var height =
        (interaction.options.get("height")?.value as string) ?? "512";
      var iterations =
        (interaction.options.get("iterations")?.value as string) ?? "1";
      var steps = (interaction?.options?.get("steps")?.value as string) ?? "20";
      // remove anything non numeric
      steps = steps.replace(/\D/g, "");
      iterations = iterations.replace(/\D/g, "");
      width = width.replace(/\D/g, "");
      height = height.replace(/\D/g, "");

      const prompt = styles[
        (interaction.options.get("style")?.value as string) ?? "raw"
      ](interaction.options.get("prompt").value as string);
      const data = await stable(
        interaction,
        prompt,
        seed,
        undefined,
        undefined,
        true,
        width as string,
        height as string,
        iterations as string,
        undefined,
        steps
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
            title: prompt.slice(0, 200) + "...",
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
        name: "style",
        required: true,
        type: 3,
        description: "What style to use",
        choices: Object.keys(styles).map((style) => ({
          name: style,
          value: style,
        })),
      },
      {
        name: "seed",
        required: false,
        type: 3,
        description: "The seed to use",
      },
      {
        name: "steps",
        required: false,
        type: 3,
        description: "The number of steps to use",
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
        choices: [...Array(9).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
      },
      {
        name: "height",
        required: false,
        type: 3,
        description: "The height of the image",
        choices: [...Array(9).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
      },
    ],
  },
};
