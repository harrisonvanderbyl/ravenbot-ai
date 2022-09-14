import { SlashCommand } from "./typing";
import { rwky } from "./sdhelpers/sdhelpers";

export const rwkyCommand: SlashCommand = {
  slashCommand: async (client, interaction) => {
    const clean = (str: string) => {
      console.log(str);
      if (!isNaN(Number(str))) {
        return str;
      } else {
        return "0.9";
      }
    };
    rwky(
      interaction,
      (interaction.options.get("prompt").value as string).split("\\n").join("\n"),
      clean((interaction.options.get("temperature")?.value as string) ?? "1.3"),
      clean((interaction.options.get("top_p")?.value as string) ?? "0.8"),
      await interaction.editReply({
        content: "Generating...",
      })
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
        type: 3,
        required: false,
        description: "Temperature",
      },
      {
        name: "top_p",
        type: 3,
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
