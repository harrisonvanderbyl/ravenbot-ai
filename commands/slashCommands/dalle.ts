import * as WomboDreamApi from "wombo-dream-api";

import {
  Dalle,
  DallePostPaid,
} from "../../charaterBuilders/imageGenerators/dalle";
import {
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import axios from "axios";
import { dallemini } from "../../charaterBuilders/imageGenerators/dallemini";
import { imageJoin } from "./helpers/imageJoin";
import styles from "../styles.json";
import { wombo } from "../../charaterBuilders/imageGenerators/wombo";

export const picture: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // if no dalle config file exists create one
    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    const dallec = new DallePostPaid();

    console.log(JSON.stringify(interaction.options.data));

    const buffers = await dallec
      .generate(interaction.options.get("prompt").value as string)
      .catch((e) => {
        console.log("Error", JSON.stringify(e));
        throw e;
      });

    const message = await interaction.editReply({
      files: [
        new MessageAttachment(
          await imageJoin(buffers, true),
          `generation.jpeg`
        ),
      ],
      embeds: [
        {
          title:
            (("" + interaction.options.get("prompt").value) as string) + "",
          // fields: [
          //   {
          //     name: "Remaining:",
          //     value: `${(await dallec.getUsage()).aggregate_credits}`,
          //   },
          // ],
          image: {
            url: "attachment://generation.jpeg",
          },
        },
      ],
    });
    addToolbar(message as Message, buffers, [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Patreon")
          .setStyle("LINK")
          .setURL("https://patreon.com/unexplored_horizons"),
        new MessageButton()
          .setLabel("Writerbot home discord")
          .setStyle("LINK")
          .setURL("https://discord.gg/eZqw6gMhf6")
      ),
    ]);
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
