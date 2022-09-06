import { Interaction, TextChannel } from "discord.js";
import { adminChannel, client } from "./commands/client";

import commands from "./commands/slashCommands";
import config from "./config/config.json";
import { debug } from "./offline.json";
import { readFileSync } from "fs";
import { start } from "./commands/slashCommands/webserver/express";
import { toolbarModalRecievers } from "./commands/slashCommands/helpers/toolbars/index";

// Finally, WriterBot Begins
client.on("ready", async () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user?.setPresence({ activities: [{ name: "Drawing/Writing" }] });
  client.channels.fetch(adminChannel).then((channel) => {
    (channel as TextChannel).send(`Bot has been started`);
  });
  console.log("starting servers");
  start();
  console.log("fin started servers");
});

client.on("messageCreate", async (message) => {});
const runCommands = async (interaction: Interaction): Promise<void> => {
  return await new Promise(async (resolve, reject) => {
    const patreonInfo = JSON.parse(
      readFileSync("./patreonConfig.json", "utf-8")
    );
    const guildLeader =
      interaction.guild?.ownerId ??
      (await client.guilds
        .fetch(interaction.guildId)
        .then((guild) => guild.ownerId));
    if (
      !(
        (patreonInfo["438605535323881486"] &&
          patreonInfo["438605535323881486"].patreons &&
          patreonInfo["438605535323881486"].patreons
            .map((p) => p.social_connections.discord.user_id)
            .includes(interaction.user.id)) ||
        guildLeader === "438605535323881486" ||
        guildLeader === "188122780678488065"
      )
    ) {
      console.log(
        `User ${interaction.user.username} tried to use a command, but the guild
        owner of ${await client.guilds
          .fetch(interaction.guildId)
          .then(
            async (guild) =>
              guild.name + " : " + (await guild.fetchOwner()).displayName
          )} 
        is not a patreon`
      );
      if (interaction.channel.isText()) {
        interaction.isRepliable() &&
          (await interaction.reply({
            content: `The guild owner is not a patreon subscriber, so this command cannot be used here`,
          }));
        return;
      }
    }
    if (!debug == (interaction.channelId == adminChannel)) {
      console.log("not interacting");
      return;
    }

    // debug = false; adminChannel = true; output: true
    // debug = true; adminChannel = false; output: true

    if (interaction.isMessageContextMenu() || interaction.isUserContextMenu()) {
      const c = Object.values(commands).find(
        (c) => c.commandSchema.name == interaction.commandName
      );
      if (c) {
        await c.contextCommand(client, interaction).catch((e) => {
          console.log("error: level: commands", e);
          reject(e);
        });
      }
    }
    if (interaction.isCommand()) {
      const c = Object.values(commands).find(
        (c) => c.commandSchema.name == interaction.commandName
      );

      if (c) {
        if (!c.skipDeferReply) {
          await interaction.deferReply({});
        }
        await c.slashCommand(client, interaction).catch((e) => {
          console.log("error: level: commands", e);
          reject(e);
        });
      }
    }
    if (interaction.isModalSubmit()) {
      await interaction.deferReply();

      await Promise.all(
        Object.values(commands)
          .filter((c) => c.commandSchema.name == interaction.customId)
          .map((c) => c.modalSubmit(client, interaction))
      ).catch((e) => {
        console.log("error: level: commands", e);
        reject(e);
      });
      await Promise.all(
        toolbarModalRecievers
          .filter((c) => c.id == interaction.customId)
          .map((c) => c.reciever(interaction))
      );
    }

    resolve();
  });
};
client.on("interactionCreate", async (interaction) => {
  await runCommands(interaction).catch((e) => {
    console.log("Error: level index.ts", e);

    if (
      interaction.isMessageContextMenu() ||
      interaction.isUserContextMenu() ||
      interaction.isCommand()
    ) {
      if (interaction.replied || interaction.deferred) {
        interaction.followUp({
          content: "Error:" + JSON.stringify(e),
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: "Error:" + JSON.stringify(e),
          ephemeral: true,
        });
      }
    }
  });
});

client.on("guildCreate", (guild) => {
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
  );
  client.user?.setActivity("exposition fairy");
});

client.on("guildDelete", (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user?.setActivity("exposition fairy");
});

client.login(config.token);
