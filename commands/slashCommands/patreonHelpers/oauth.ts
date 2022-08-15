import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { oauth, patreon } from "patreon";
import { readFileSync, writeFileSync } from "fs";

import config from "../../../config/config.json";
import express from "express";
import url from "url";

const app = express();
var redirectURL = "http://writerbot.selkiemyth.com:5000/";

export const getPatreonData = async (token: string, url = "/current_user") => {
  const apiClient = patreon(token);
  return apiClient(url);
};

const funcBuffer: {
  [key: string]: () => Promise<void>;
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

      const patreonInfo = JSON.parse(
        readFileSync("./patreonConfig.json").toString()
      );

      patreonInfo[state] = {
        token,
      };

      writeFileSync("./patreonConfig.json", JSON.stringify(patreonInfo));

      console.log(
        `Saved user ${store.find("user", id).full_name} to the funcBuffer`
      );
      await funcBuffer[state]();

      funcBuffer[state] = null;
      return res.send(
        "you are logged in, thanks!, you can close this tab, and return to discord"
      );
    })
    .catch((err) => {
      console.log(err);
      return res.send("error loading patreon bot");
    });
});
const server = app.listen(config.port, () => {
  const { port } = server.address();
  console.log(`Listening on http:/localhost:${port}`);
});

const generateUserStats = async (data) => {};

export const generateLoginButton = async (interaction: CommandInteraction) => {
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
  funcBuffer[interaction.user.id] = async () => {
    await interaction.editReply(`You are now logged in!`);
  };
  const row = new MessageActionRow().addComponents(
    new MessageButton().setLabel("Login").setURL(loginUrl).setStyle("LINK")
  );
  await interaction.reply({
    ephemeral: true,
    content: `Please login to patreon by clicking the button below.`,
    components: [row],
  });
};
