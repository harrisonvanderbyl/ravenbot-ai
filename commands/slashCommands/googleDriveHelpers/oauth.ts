import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  Modal,
  ModalSubmitInteraction,
  TextInputComponent,
} from "discord.js";
import fs, { existsSync, readFileSync, writeFile, writeFileSync } from "fs";

import { GoogleAuth } from "google-auth-library";
import { TextInputStyles } from "discord.js/typings/enums";
import { app } from "../webserver/express";
import config from "../../../config/config.json";
import { google } from "googleapis";
import readline from "readline";

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
  if (funcBuffer[state]) {
    await funcBuffer[state](code);
    res.send("all logged in! return to discord");
  } else {
    res.send("no pending found, error");
  }
});
// Load client secrets from a local file.
// Authorize a client with credentials, then call the Google Drive API.
// authorize(config, listFiles);

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
//   );

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token.toString()));
//     callback(oAuth2Client);
//   });
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback for the authorized client.
//  */
// function getAccessToken(oAuth2Client, callback) {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter the code from that page here: ", (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error("Error retrieving access token", err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log("Token stored to", TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
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
    components: null,
  });
};

// /**
//  * Lists the names and IDs of up to 10 files.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// function listFiles(auth) {
//   const drive = google.drive({ version: "v3", auth });
//   drive.files.list(
//     {
//       pageSize: 10,
//       fields: "nextPageToken, files(id, name)",
//     },
//     (err, res) => {
//       if (err) return console.log("The API returned an error: " + err);
//       const files = res.data.files;
//       if (files.length) {
//         console.log("Files:");
//         files.map((file) => {
//           console.log(`${file.name} (${file.id})`);
//         });
//       } else {
//         console.log("No files found.");
//       }
//     }
//   );
// }

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

  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
    credentials,
  });
  const service = google.drive({ version: "v3", auth });

  const files = await service.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });

  await interaction.editReply(JSON.stringify(files.data.files));
};

export const generateLoginButton = async (interaction: CommandInteraction) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    redirect_uri:
      "https://" +
      config.redirectUrl +
      "/googleoauth/?state=" +
      interaction.user.id,
    scope: SCOPES,
  });

  const buttons = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("Login To Google")
      .setURL(authUrl)
      .setStyle("LINK")
  );
  await interaction.reply({
    content: "Login to Google Drive",
    components: [buttons],
  });

  funcBuffer[interaction.user.id] = async (code) => {
    await storeToken(interaction, code);
  };
};
