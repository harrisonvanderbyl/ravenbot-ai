import { SlashCommand } from "./typing";
import { gpt3 } from "../../gpt3/gpt3";

export const scsquote: SlashCommand = {
  slashCommand: async (client, interaction) => {
    gpt3(
      "Chapter 9483 : \n\n",
      undefined,
      interaction.user.username,
      "davinci:ft-writerhelper-2022-07-02-03-57-02"
    )
      .then((out) => {
        const quotePieces = out?.data?.choices?.[0]?.text?.split("\n") ?? ["error"];
        const quoteend = quotePieces.slice(
          0,
          quotePieces.findIndex((q) => q.includes("--")) + 1 ?? -1
        );
        interaction.editReply('"' + quoteend.join("\n"));
      })
      .catch((err) => {
        interaction.editReply("Problem Occured, Please try again soon");
      });
  },
  commandSchema: {
    name: "scsquote",
    description: "Get a random quote from SCS",
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
