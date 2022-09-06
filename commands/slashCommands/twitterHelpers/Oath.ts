import {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { redirectUrl, twitter } from "../../../config/config.json";

import { TwitterApi } from "twitter-api-v2";
import { app } from "../webserver/express";

if (!existsSync("./twittercodes.json")) {
  writeFileSync("./twittercodes.json", JSON.stringify({}));
}

const verifiers: {
  [key: string]: any;
} = {};

export const createOathLink = async (id: string) => {
  const client = new TwitterApi({
    appKey: twitter.key,
    appSecret: twitter.secret,
  });
  const authLink = await client.generateAuthLink(
    "https://" + redirectUrl + "/twitter/",
    {
      authAccessType: "write",
      linkMode: "authorize",
    }
  );
  verifiers[id] = authLink;
  return authLink;
};

app.get("/twitter/", async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  const authLink = Object.entries(verifiers).find(
    ([a, m]) => m.oauth_token == oauth_token
  );
  if (!authLink) {
    return res.send("Invalid state");
  }

  const client = new TwitterApi({
    appKey: twitter.key,
    appSecret: twitter.secret,
    accessToken: authLink[1].oauth_token,
    accessSecret: authLink[1].oauth_token_secret,
  });
  client
    .login(oauth_verifier)
    .then(async ({ client: loggedClient, accessToken, accessSecret }) => {
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

      // Example request
      const codes = JSON.parse(readFileSync("./twittercodes.json", "utf8"));
      codes[authLink[0]] = {
        accessToken,
        accessSecret,
      };
      writeFileSync("./twittercodes.json", JSON.stringify(codes));
      res.send("Logged in, you can return to discord now");
      return;
    })
    .catch(() => {
      console.log("error");
    });
});

export const tweetPic = async (
  i: ModalSubmitInteraction,
  text: string,
  pic: Buffer
) => {
  const code = JSON.parse(readFileSync("./twittercodes.json", "utf8"))[
    i.user.id
  ];
  if (!code) {
    if (!i.deferred && !i.replied) {
      i.deferUpdate();
    }
    i.followUp({
      content: "You need to login first",
      ephemeral: true,
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              style: "LINK",
              label: "Login",
              url: (await createOathLink(i.user.id)).url,
            },
          ],
        },
      ],
    });
    return;
  }
  try {
    const client = new TwitterApi({
      appKey: twitter.key,
      appSecret: twitter.secret,
      accessToken: code.accessToken,
      accessSecret: code.accessSecret,
    });
    // First, post all your images to Twitter
    const mediaIds = await Promise.all([
      // from a buffer, for example obtained with an image modifier package
      client.v1.uploadMedia(pic, { mimeType: "image/png" }),
    ]);

    // mediaIds is a string[], can be given to .tweet
    await client.v1.tweet(text, {
      media_ids: mediaIds,
    });

    if (!i.deferred && !i.replied) {
      await i.deferReply({ ephemeral: true });
    }
    await i.followUp({
      content: "Successfully tweeted",
      ephemeral: true,
    });
    return;
  } catch (e) {
    console.log(e);
    if (!i.deferred && !i.replied) {
      await i.deferReply({ ephemeral: true });
    }
    await i.followUp({
      content: "Error tweeting(perhaps too big?)",
      ephemeral: true,
    });
    return;
  }
};
