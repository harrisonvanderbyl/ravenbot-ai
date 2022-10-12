import { NonThreadGuildBasedChannel, TextChannel } from "discord.js";
import { client } from "./commands/client";

import config from "./config/config.json";
console.log(config.token);

// Finally, WriterBot Begins
client.on("ready", async () => {
  // Every 5 seconds
  console.log("ready");
  //startWebUi();
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user?.setPresence({ activities: [{ name: "Drawing/Writing" }] });

  const status = "1011284410345205820";
  const guild = "989166996153323591";
  client.guilds.fetch(guild).then((g) =>
    g.channels.fetch(status).then(
      async (c: NonThreadGuildBasedChannel | null) =>
        c &&
        c.isText() &&
        !!(await c.send({
          content: "test login",
        }))
    )
  );
  console.log("starting servers");
  console.log("fin started servers");
});

client.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
});

console.log("attempting logon");

const login = async () => {
  console.log("logging in");
  await client
    .login(config.token)
    .catch(console.log)
    .then(() => console.log("logged in"));
};
login();

console.log("wtf is happening");
