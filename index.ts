import { Interaction, TextChannel } from "discord.js";
import { client, getStatusChannel } from "./commands/client";

import commands from "./commands/slashCommands";
import config from "./config.json";
import { debug } from "./offline.json";
import { start } from "./commands/slashCommands/webserver/express";
import { getGuildCommands } from "./commands/common";

// Finally, WriterBot Begins
client.on("ready", async () => {
  // Every 5 seconds

  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user?.setPresence({ activities: [{ name: "Drawing/Writing" }] });

  getStatusChannel().then((c: TextChannel) =>
    c.send({
      content: "Bot started with version 1.0.0",
    })
  );

  console.log("starting servers");
  // Start webserver capabilities
  start();
  console.log("fin started servers");
});

client.on("messageCreate", async (message) => {
  if (message.content == "!help") {
    getGuildCommands(undefined).then((commands) => {
      message.channel.send({
        content: `Commands available globally, either slash or context menu commands:\n${commands
          .map(
            (c) =>
              `**${c.name}** - *${
                c.description?.length ? c.description : "Context Command"
              }*`
          )
          .join("\n")}`,
      });
    });
    getGuildCommands(message.guildId).then((commands) => {
      message.channel.send({
        content: `Commands available only in this server, either slash or context menu commands:\n${commands
          .map(
            (c) =>
              `**${c.name}** - *${
                c.description?.length ? c.description : "Context Command"
              }*`
          )
          .join("\n")}`,
      });
    });
  }
  for (var c of Object.values(commands)) {
    if (message.content.startsWith("!help " + c.commandSchema.name)) {
      message.channel.send({
        content: `Help for command\n**${c.commandSchema.name}**: *${
          c.commandSchema.description?.length
            ? c.commandSchema.description
            : "Context Command"
        }*\n${
          c.commandSchema?.options
            ?.map((o) => `\t**${o.name}** - *${o.description}*`)
            .join("\n") ?? ""
        }`,
      });
    }
  }
});
const runCommands = async (interaction: Interaction): Promise<void> => {
  return await new Promise(async (resolve, reject) => {
    if (!debug == (interaction.channelId == config.adminChannel)) {
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
      await Promise.all(
        Object.values(commands)
          .filter((c) => c.commandSchema.name == interaction.customId)
          .map((c) =>
            (async () => {
              await interaction.deferReply();

              await c.modalSubmit(client, interaction);
            })()
          )
      ).catch((e) => {
        console.log("error: level: commands", e);
        reject(e);
      });
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

client.login(config.discord);

process.on("uncaughtException", async (e) => {
  console.log(e);

  await getStatusChannel().then((c: TextChannel) =>
    c.send({
      content: "Bot Crashed, attempting automatic restart, and git pull",
    })
  );
  // Exit to outside loop
  process.exit();
});
