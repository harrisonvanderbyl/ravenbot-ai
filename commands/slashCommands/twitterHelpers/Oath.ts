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

export const createOathLink = (id: string) => {
  const client = new TwitterApi({
    clientId: twitter.oathkey,
    clientSecret: twitter.oathsecret,
  });
  const authLink = client.generateOAuth2AuthLink(
    "https://" + redirectUrl + "/twitter/",
    {
      scope: ["tweet.write"],
      state: id,
    }
  );
  verifiers[id] = authLink;
  return authLink.url;
};

app.get("/twitter/", async (req, res) => {
  const { code, state } = req.query;

  const authLink = verifiers[state];
  if (!authLink) {
    return res.send("Invalid state");
  }
  if (!code) {
    return res.send("Not logged in :(");
  }
  const client = new TwitterApi({
    clientId: twitter.oathkey,
    clientSecret: twitter.oathsecret,
  });
  client
    .loginWithOAuth2({
      code,
      codeVerifier: authLink.codeVerifier,
      redirectUri: "https://" + redirectUrl + "/twitter/",
    })
    .then(
      async ({
        client: loggedClient,
        accessToken,
        refreshToken,
        expiresIn,
      }) => {
        // {loggedClient} is an authenticated client in behalf of some user
        // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
        // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

        // Example request
        const codes = JSON.parse(readFileSync("./twittercodes.json", "utf8"));
        codes[state] = {
          accessToken,
          expiresIn: Date.now() + expiresIn * 1000,
        };
        writeFileSync("./twittercodes.json", JSON.stringify(codes));
        res.send("Logged in, you can return to discord now");
        return;
      }
    )
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
  console.log(code?.expiresIn);
  if (!code || code.expiresIn < Date.now()) {
    if (!i.deferred || !i.replied) {
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
              url: createOathLink(i.user.id),
            },
          ],
        },
      ],
    });
    return;
  }
  const client = new TwitterApi(code.accessToken);
  // First, post all your images to Twitter
  const mediaIds = await Promise.all([
    // from a buffer, for example obtained with an image modifier package
    client.v1.uploadMedia(pic, { mimeType: "image/png" }),
  ]);

  // mediaIds is a string[], can be given to .tweet
  await client.v1.tweet(text, {
    media_ids: mediaIds,
  });
};
