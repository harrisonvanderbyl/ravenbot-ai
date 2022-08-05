import { MessageAttachment } from "discord.js";
import { SlashCommand } from "./typing";
import styles from "../styles.json";
import { wombo } from "../../charaterBuilders/imageGenerators/wombo";

export const womocommand: SlashCommand = {
  slashCommand: async (client, interaction) => {
    console.log(JSON.stringify(interaction.options.data));

    const buffers = await wombo(
      interaction,
      interaction.options.get("prompt").value as string,
      "MEDIUM",
      (interaction.options.get("style").value as number) ?? 3
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
    name: "wombo",
    description: "Use wombo.dream",
    type: 1,

    options: [
      {
        name: "style",

        description: "Style to use",
        type: 4,

        required: true,
        choices: [
          ...styles.map((s) => {
            return { name: s.name, value: s.id };
          }),
        ],
      },
      {
        name: "prompt",
        type: 3,

        required: true,
        description: "What to ask Wombo",
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
