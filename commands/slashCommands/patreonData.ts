import {
  CommandInteraction,
  Interaction,
  InteractionReplyOptions,
  MessageOptions,
} from "discord.js";
import { oauth, patreon } from "patreon";

import { SlashCommand } from "./typing";
import config from "../../config/config.json";
import express from "express";
import url from "url";

const app = express();
var redirectURL = "http://writerbot.selkiemyth.com:5000/";

const database: {
  [key: string]: (m?: InteractionReplyOptions) => Promise<string>;
} = {};
app.get("/", (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.send("error loading patreon bot");
  }
  let token;

  return oauth(config.CLIENT_ID, config.CLIENT_SECRET)
    .getTokens(code, redirectURL)
    .then(({ access_token }) => {
      token = access_token; // eslint-disable-line camelcase
      const apiClient = patreon(token);
      return Promise.all([apiClient("/current_user")]);
    })
    .then(async ([{ store, rawJson }]) => {
      const { id } = rawJson.data;

      //   database[id] = { ...rawJson.data, token };
      console.log(
        `Saved user ${store.find("user", id).full_name} to the database`
      );
      return res.redirect(
        await database[state]({ content: JSON.stringify(rawJson.data) })
      );
    })
    .catch((err) => {
      console.log(err);
    });
});
const server = app.listen(config.port, () => {
  const { port } = server.address();
  console.log(`Listening on http:/localhost:${port}`);
});

export const patreonCommand: SlashCommand = {
  skipDeferReply: true,

  slashCommand: async (client, interaction: CommandInteraction) => {
    const loginUrl = url.format({
      protocol: "https",
      host: "patreon.com",
      pathname: "/oauth2/authorize",
      query: {
        response_type: "code",
        client_id: config.CLIENT_ID,
        redirect_uri: redirectURL,
        state: interaction.user.id,
      },
    });
    database[interaction.user.id] = async (m) => {
      const message = await interaction.editReply(`You are now logged in.`);
      if (m) {
        await interaction.followUp(m);
      }
      return `discord://discordapp.com/channels/${interaction.guild.id}/${interaction.channel.id}/${message.id}`;
    };
    await interaction.reply({
      ephemeral: true,
      content: loginUrl,
    });
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
  commandSchema: {
    name: "patreondata",
    description: "get your patreon data",
  },
};
