import { MessageAttachment } from "discord.js";
import { SlashCommand } from "./typing";
import { dallemini } from "../../charaterBuilders/imageGenerators/dallemini";

export const dalle_mini: SlashCommand = {
  slashCommand: async (client, interaction) => {
    console.log(JSON.stringify(interaction.options.data));

    const buffers = await dallemini(
      interaction,
      interaction.options.get("prompt").value as string
    );
    await interaction.editReply({
      embeds: [
        {
          title:
            (("" + interaction.options.get("prompt").value) as string) + "",
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
