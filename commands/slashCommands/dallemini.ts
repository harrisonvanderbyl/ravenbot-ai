import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
} from "discord.js";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import { dallemini } from "../../charaterBuilders/imageGenerators/dallemini";
import { imageJoin } from "./helpers/imageJoin";
import joinImages from "join-images";

export const dalle_mini: SlashCommand = {
  slashCommand: async (client, interaction: CommandInteraction) => {
    console.log(JSON.stringify(interaction.options.data));

    const buffers = await dallemini(
      interaction,
      interaction.options.get("prompt").value as string
    );

    const buffer = await imageJoin(buffers);
    const message = await interaction.editReply({
      files: [new MessageAttachment(buffer, `generation.png`)],

      embeds: [
        {
          title:
            (("" + interaction.options.get("prompt").value) as string) + "",

          image: {
            url: "attachment://generation.png",
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
    name: "dallemini",
    description: "Use dallemini",
    type: 1,
    options: [
      {
        name: "prompt",

        required: true,
        type: 3,
        description: "What to ask dallemini",
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
