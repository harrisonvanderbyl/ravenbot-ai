import { SlashCommand } from "./typing";
import { rwky } from "./sdhelpers/sdhelpers";

export const rwkyCommand: SlashCommand = {
  slashCommand: async (client, interaction) => {
    rwky(
      interaction,
      interaction.options.get("prompt").value as string,
      ((interaction.options.get("temperature") as number) ?? 1.3).toFixed(3),
      ((interaction.options.get("top") as number) ?? 0.8).toFixed(3)
    );
  },
  commandSchema: {
    name: "rwkv",
    description: "Completion using rwkv",
    options: [
      {
        name: "prompt",
        type: 3,
        required: true,
        description: "Prompt",
      },
      {
        name: "temperature",
        type: 4,
        required: false,
        description: "Temperature",
      },
      {
        name: "top_p",
        type: 4,
        required: false,
        description: "Top_p",
      },
    ],
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
