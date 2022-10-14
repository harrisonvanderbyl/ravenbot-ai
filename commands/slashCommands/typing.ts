import {
  ContextMenuInteraction,
  MessageInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export type SlashCommand = {
  slashCommand: (client, interaction: MessageInteraction) => Promise<void>;
  contextCommand: (
    client,
    interaction: ContextMenuInteraction
  ) => Promise<void>;
  modalSubmit: (client, interaction: ModalSubmitInteraction) => Promise<void>;
  commandSchema: any;
  skipDeferReply?: boolean;
};
