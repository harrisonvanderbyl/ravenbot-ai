import axios from "axios";
import {
  CommandInteraction,
  ContextMenuInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageContextMenuInteraction,
  MessageSelectMenu,
  UserContextMenuInteraction,
} from "discord.js";
import { retrieveLoginDetails } from "./horde/storage";
import { SlashCommand } from "./typing";

const giveKudos = async (id: string, interaction: ContextMenuInteraction) => {
  const me = retrieveLoginDetails(interaction.user.id);
  const them = retrieveLoginDetails(id);

  await interaction.deferReply({ ephemeral: true });
  const message = (await interaction.followUp({
    ephemeral: true,
    content: "Please select amount",
    components: [
      new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .addOptions(
            ["10", "100", "500", "1000", "50000", "10000", "50000"].map(
              (m) => ({
                label: m,
                value: m,
              })
            )
          )
          .setCustomId("kudosamount")
          .setPlaceholder("Select amount")
      ),
    ],
  })) as Message;
  const collector = message.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    time: 1000 * 60 * 5,
    dispose: true,
    filter: (i) =>
      i.user.id == interaction.user.id && i.customId == "kudosamount",
  });
  collector.on("collect", async (i) => {
    axios.request({
      method: "POST",
      headers: {
        apikey: me.apiKey,
      },
      url: "https://stablehorde.net/api/v2/kudos/transfer",
      data: {
        username: them.id,
        amount: Number(i.values[0]),
      },
    });
  });
};

export const giveMessageKudos: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (client, interaction: CommandInteraction) => {},
  commandSchema: {
    name: "givemessagekudos",
    type: 3,
  },
  contextCommand: async (
    client,
    interaction: MessageContextMenuInteraction
  ) => {
    const { id } = interaction.targetMessage.author;
    giveKudos(id, interaction);
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
};

export const giveUserKudoa: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (client, interaction: CommandInteraction) => {},
  commandSchema: {
    name: "giveuserkudos",
    type: 2,
  },
  contextCommand: async (client, interaction: UserContextMenuInteraction) => {
    const { id } = interaction.targetUser;
    giveKudos(id, interaction);
  },
  modalSubmit: async (client, interaction) => {
    return;
  },
};
