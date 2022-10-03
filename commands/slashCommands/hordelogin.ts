import { CommandInteraction, MessageAttachment } from "discord.js";
import { SlashCommand } from "./typing";
import { serverUrl } from "../../config.json";
import { app } from "./webserver/express";
import { storeLoginDetails } from "./horde/storage";

const stateStorage: {
  [key: string]: {
    discordID: string;
    callback: () => Promise<string>;
  };
} = {};

app.get("/connectDiscord", async (req, res) => {
  const link = await stateStorage[req.params.state].callback();
  // Something like dis
  storeLoginDetails(
    stateStorage[req.params.state].discordID,
    req.headers.apikey,
    {
      username: req.headers.username,
      id: req.headers.id,
    }
  );
  res.redirect(link);
});

export const hordelogin: SlashCommand = {
  skipDeferReply: true,
  slashCommand: async (client, interaction: CommandInteraction) => {
    stateStorage[interaction.id] = {
      discordID: interaction.user.id,
      callback: async () => {
        const message = await interaction.editReply({
          content: "You are now connected to your Horde account",
        });
        // Send back to login message
        return `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${message.id}`;
      },
    };
    await interaction.reply({
      ephemeral: true,
      content: "Please login to Horde",
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              style: "LINK",
              label: "Login",
              url: serverUrl + "/connectDiscord?state=" + interaction.id,
            },
          ],
        },
      ],
    });
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
    return;
  },
};
