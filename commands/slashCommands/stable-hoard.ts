import {
  Client,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  Modal,
  ModalSubmitInteraction,
  TextChannel,
  TextInputComponent,
} from "discord.js";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import * as hoard from "./sdhelpers/myApi";
import { hoard as h } from "../../config/config.json";
import axios from "axios";
import { imageJoin } from "./helpers/imageJoin";
import { createStatusSheet } from "./helpers/quicktools/createStatusSheet";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { getApiKey } from "./helpers/horde/login";
import { readConfigFile } from "./helpers/configFiles/configfiles";
import { hordeGenerate } from "./helpers/horde/async";
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

export const stablehoard: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client: Client, interaction: CommandInteraction) => {
    try {
      const optionsString = interaction.options.data
        .map((option) => `${option.name}: ${option.value}`)
        .join(", ");
      if (!interaction.replied) {
        await interaction.reply(
          `Generating image with stablehoard with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
        );
      } else {
        await interaction.editReply(
          `Generating image with stablehoard with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
        );
      }

      const iseed = interaction.options.get("seed")?.value as string;

      const createSeed =
        iseed && !iseed.includes("[")
          ? Number(iseed)
          : Math.round(Math.random() * 10000);

      const newSeed = createSeed;

      const bannedWords = [
        "child",
        "children",
        "kid",
        "kids",
        "baby",
        "babies",
        "infant",
        "infants",
        "toddler",
        "toddlers",
        "teen",
        "teens",
        "teenager",
        "teenagers",
        "preteen",
        "preteens",
        "preteenager",
        "preteenagers",
        "schoolgirl",
        "schoolgirls",
        "schoolboy",
        "schoolboys",
      ];

      if (
        bannedWords.some((word) =>
          (interaction.options.get("prompt")?.value as string)
            .toLowerCase()
            .includes(word)
        )
      ) {
        await interaction.editReply(
          "Banned word detected. Please try again with a different prompt."
        );
        return;
      }

      const seed = newSeed;

      var width = (interaction.options.get("width")?.value as string) ?? "512";
      var cfg = (interaction.options.get("cfg")?.value as string) ?? "7.5";
      var iterations =
        (interaction.options.get("iterations")?.value as string) ?? "1";
      // Make sure cfg is a number
      try {
        if (isNaN(Number(cfg))) {
          cfg = "7.5";
        }
      } catch (e) {
        cfg = "7.5";
      }

      var height =
        (interaction.options.get("height")?.value as string) ?? "512";
      if (Math.min(Number(width), Number(height)) > 512) {
        throw "Image size too large. Maximum size for small side is 512";
      }
      var steps = (interaction?.options?.get("steps")?.value as string) ?? "50";
      // remove anything non numeric
      steps = steps.replace(/\D/g, "");
      width = width.replace(/\D/g, "");
      height = height.replace(/\D/g, "");

      console.log(width, height);

      const prompt = styles[
        (interaction.options.get("style")?.value as string) ?? "raw"
      ](interaction.options.get("prompt").value as string);
      const hordekey = getApiKey(interaction.user.id);
      const hordeApi = new hoard.Api(hordekey ?? "0000000000");
      const isfw =
        readConfigFile("serversettings")[interaction.guildId]?.filternsfw ??
        false;
      const params = {
        prompt: prompt,
        censor_nsfw: isfw,
        nsfw: !isfw,
        params: {
          seed: `${seed}`,
          width: Number(width),
          height: Number(height),
          cfg_scale: Number(cfg),
          steps: Number(steps),
          n: Number(iterations),
          variant_amount: 1,
        },
      };
      const data = await hordeGenerate(hordeApi, params, interaction);

      if (data == null) {
        return;
      }

      const buff: Buffer[] = data.map((d) => Buffer.from(d, "base64"));
      const messageData = {
        content: null,

        files: [new MessageAttachment(await imageJoin(buff), `generation.png`)],
        embeds: [
          {
            title: prompt.slice(0, 200) + "...",
            fields: [
              {
                name: "Seed",
                value: `${seed}`,
                inline: true,
              },
            ],
            image: {
              url: `attachment://generation.png`,
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
        buff,
        [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel("Adopt this bot")
              .setStyle("LINK")
              .setURL("https://patreon.com/unexplored_horizons"),
            new MessageButton()
              .setLabel("Writerbot home")
              .setStyle("LINK")
              .setURL("http://harrisonvanderbyl.github.io/WriterBot"),
            new MessageButton()
              .setLabel("Join The Horde!")
              .setStyle("LINK")
              .setURL("https://discord.gg/uwqEGZ9Sph"),
            new MessageButton()
              .setLabel("Run Horde Node")
              .setStyle("LINK")
              .setURL("https://stablehorde.net/"),
            ...(hordekey
              ? []
              : [
                  new MessageButton()
                    .setLabel("Login")
                    .setStyle("PRIMARY")
                    .setCustomId("logintohorde"),
                ])
          ),
        ],
        {
          logintohorde: async (interaction) => {
            // create a modal
            const modal = new Modal()
              .setCustomId("hordeloginmodal")
              .setTitle("login to Horde");

            const apibox = new TextInputComponent()
              .setCustomId("apikey")
              .setLabel("What is your apikey?")
              .setStyle("SHORT")
              .setValue(hordekey ?? "0000000000");

            const informationValueRow: MessageActionRow<TextInputComponent> =
              new MessageActionRow<TextInputComponent>().addComponents(
                apibox
              ) as any as MessageActionRow<TextInputComponent>;

            modal.addComponents(informationValueRow);

            await interaction.showModal(modal);
          },
        }
      );
    } catch (e) {
      console.log(JSON.stringify(e));
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "error: " + e, ephemeral: true });
      } else {
        await interaction.followUp({
          content: "error: " + JSON.stringify(e.data?.data ?? e),
          ephemeral: true,
        });
      }
    }
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction: ModalSubmitInteraction) => {},
  commandSchema: {
    name: "stablehorde",
    description: "use stable hoard",
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
        name: "width",
        required: false,
        type: 3,
        description: "The width of the image",
        choices: [...Array(17).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
      },

      {
        name: "height",
        required: false,
        type: 3,
        description: "The height of the image",
        choices: [...Array(17).keys()].slice(1).map((i) => ({
          name: (i * 64).toString(),
          value: (i * 64).toString(),
        })),
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
        name: "cfg",
        required: false,
        type: 3,
        description: "The cfg to use",
      },
    ],
  },
};
