import { SlashCommand } from "./typing";
import { gpt3 } from "../../gpt3/gpt3";
import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageSelectMenu,
} from "discord.js";
import {
  readConfigFile,
  writeConfigFile,
} from "./helpers/configFiles/configfiles";

export const serversettings: SlashCommand = {
  slashCommand: async (client, interaction: CommandInteraction) => {
    if (interaction.guild.ownerId !== interaction.user.id) {
      interaction.reply({
        content: "You are not the owner of this server",
        ephemeral: true,
      });
      return;
    }
    const settings =
      readConfigFile("serversettings")[interaction.guild.id] ?? {};
    await interaction.deferReply({ ephemeral: true });
    const message = (await interaction.editReply({
      content: "Server setting: filter nsfw prompts on stablehorde",
      components: [
        new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .addOptions(
              { label: "True", value: "true" },
              { label: "False", value: "false" }
            )
            .setCustomId("setsfw")

            .setPlaceholder(settings?.filternsfw ? "True" : "False")
        ),
      ],
    })) as Message;
    const filter = (i: any) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: "SELECT_MENU",
      time: 30000,
      filter,
      dispose: true,
    });
    collector.on("collect", async (i) => {
      if (i.customId === "setsfw") {
        await i.deferUpdate();
        settings.filternsfw = i.values.join("") === "true";
        writeConfigFile("serversettings", {
          ...readConfigFile("serversettings"),
          [interaction.guild.id]: settings,
        });
        await interaction.editReply({
          content: `Set filternsfw to ${settings.filternsfw}`,
          components: [],
        });
      }
    });

    collector.on("end", async (i) => {
      await interaction.editReply({
        content: "Timed out",
        components: [],
      });
    });
  },
  commandSchema: {
    name: "serversettings",
    description: "Set serside settings",
  },
  skipDeferReply: true,
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
