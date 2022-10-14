import {
  CommandInteraction,
  MessageActionRow,
  MessageAttachment,
  Modal,
  TextInputComponent,
} from "discord.js";
import { SlashCommand } from "./typing";
import { serverUrl } from "../../config.json";
import { storeLoginDetails, retrieveLoginDetails } from "./horde/storage";

export const hordelogin: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (client, interaction: CommandInteraction) => {
    const hordemodal = new Modal({
      customId: "hordelogin",
      title: "Horde Login",
      components: [
        new MessageActionRow<TextInputComponent>({
          components: [
            new TextInputComponent({
              customId: "apikey",
              value: retrieveLoginDetails(interaction.user.id).apiKey,
              label: "API Key",
              style: "SHORT",
            }),
          ],
        }),
      ],
    });
    await interaction.showModal(hordemodal);
  },
  commandSchema: {
    name: "hordelogin",
    description: "login to stablehorde",
    type: 1,
  },
  contextCommand: async (client, interaction) => {
    return;
  },
  modalSubmit: async (client, interaction) => {
    const apiKey = interaction.components[0].components[0].value;
    storeLoginDetails(interaction.user.id, apiKey);
    await interaction.reply({ content: "apikey saved", ephemeral: true });
  },
};
