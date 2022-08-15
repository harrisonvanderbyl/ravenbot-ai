import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { GoogleAuth } from "google-auth-library";
import { app } from "../webserver/express";
import config from "../../../config/config.json";
import { google } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const funcBuffer: {
  [key: string]: (code: string) => Promise<void>;
} = {};

const { client_secret, client_id, redirect_uris } = config.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

app.get("/googleoauth/", async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.send("error loading patreon bot");
  }
  if (funcBuffer[state as any]) {
    await funcBuffer[state as any](code as string);
    res.send("all logged in! return to discord");
  } else {
    res.send("no pending found, error");
  }
});
// Load client secrets from a local file.

// }

export const storeToken = async (
  interaction: CommandInteraction,
  code: string
) => {
  if (!code) {
    throw new Error("No code provided");
  }

  await oAuth2Client.getToken(code).then((token) => {
    const googleinfo = JSON.parse(
      readFileSync("./googleconfig.json").toString()
    );
    googleinfo[interaction.user.id] = token.tokens;
    // Store the token to disk for later program executions
    writeFileSync("./googleconfig.json", JSON.stringify(googleinfo));
  });

  await interaction.editReply({
    content: "Successfully logged in!",
    components: [],
  });
};

export const listFolders = async (interaction: CommandInteraction) => {
  if (!existsSync("./googleconfig.json")) {
    writeFileSync("./googleconfig.json", JSON.stringify({}));
  }

  const credentials = JSON.parse(
    readFileSync("./googleconfig.json").toString()
  )[interaction.user.id];

  if (!credentials) {
    return await generateLoginButton(interaction);
  }

  const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  auth.setCredentials(credentials);
  const service = google.drive({ version: "v3", auth });

  const files = await service.files.list({
    pageSize: 10,

    fields: "nextPageToken, files(id, name)",
  });

  await interaction.editReply(JSON.stringify(files.data.files));
};

export const generateLoginButton = async (interaction: CommandInteraction) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    redirect_uri: "https://" + config.redirectUrl + "/googleoauth/",
    scope: SCOPES,
    state: interaction.user.id,
  });

  const buttons = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("Login To Google")
      .setURL(authUrl)
      .setStyle("LINK")
  );
  await interaction.reply({
    ephemeral: true,
    content: "Login to Google Drive!",
    components: [buttons],
  });

  funcBuffer[interaction.user.id] = async (code) => {
    await storeToken(interaction, code);
  };
};
