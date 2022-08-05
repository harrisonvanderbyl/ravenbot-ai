import * as WomboDreamApi from "wombo-dream-api";

import { existsSync, readFileSync, writeFileSync } from "fs";

import { Dalle } from "../../charaterBuilders/imageGenerators/dalle";
import { MessageAttachment } from "discord.js";
import { SlashCommand } from "./typing";
import axios from "axios";
import { dallemini } from "../../charaterBuilders/imageGenerators/dallemini";
import styles from "../styles.json";
import { wombo } from "../../charaterBuilders/imageGenerators/wombo";

export const picture: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // if no dalle config file exists create one
    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    // read dalle key from config file
    const dalleKey = JSON.parse(readFileSync("./dalleconfig.json").toString())[
      interaction.user.id
    ];

    if (!dalleKey) {
      await interaction.editReply({
        content:
          "You need to set your dalle key. You can use /dalleusage to set your key, or ask someone to share their key with you by using the context menu.",
      });
      return;
    }

    const dallec = new Dalle(dalleKey);

    console.log(JSON.stringify(interaction.options.data));

    const buffers = await dallec
      .generate(interaction.options.get("prompt").value as string)
      .then(
        async (generations) =>
          await Promise.all(
            generations.map((gen, i) =>
              axios.get(gen.generation.image_path, {
                responseType: "arraybuffer",
                responseEncoding: "binary",
              })
            )
          ).then((buffers) => buffers.map((buff) => buff.data as Buffer))
      )
      .catch((e) => {
        console.log("Error", JSON.stringify(e));
        throw e;
      });
    await interaction.editReply({
      embeds: [
        {
          title:
            (("" + interaction.options.get("prompt").value) as string) + "",
          fields: [
            {
              name: "Remaining:",
              value: `${(await dallec.getUsage()).aggregate_credits}`,
            },
          ],
        },
      ],
    });
    for (const buffer of buffers) {
      await interaction.webhook.send({
        files: [new MessageAttachment(buffer, `generation.jpeg`)],

        embeds: [
          {
            image: {
              url: "attachment://generation.jpeg",
            },
          },
        ],
      });
    }
  },
  commandSchema: {
    name: "dalle",
    description: "Use dalle",
    type: 1,

    options: [
      {
        name: "prompt",
        type: 3,

        required: true,
        description: "What to ask dalle",
      },
    ],
  },
  contextCommand: async (client, interaction) => {
    return;
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
};
