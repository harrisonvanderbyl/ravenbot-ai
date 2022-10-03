import { Interaction, TextChannel } from "discord.js";
import { adminChannel, client } from "./commands/client";

import commands from "./commands/slashCommands";
import config from "./config/config.json";
import { debug } from "./offline.json";
import { readFileSync } from "fs";
import { start } from "./commands/slashCommands/webserver/express";
import { toolbarModalRecievers } from "./commands/slashCommands/helpers/toolbars/index";
import { updateNetworkStats } from "./commands/slashCommands/sdhelpers/sdhelpers";
import { startWebUi } from "./commands/slashCommands/sdhelpers/webui/webui";
import { getGuildCommands } from "./commands/common";

// Finally, WriterBot Begins
client.on("ready", async () => {
  // Every 5 seconds
  startWebUi();
  setInterval(() => {
    console.log("starting loop");
    updateNetworkStats().catch((e) => console.log(e));
  }, 5 * 1000);
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user?.setPresence({ activities: [{ name: "Drawing/Writing" }] });

  const status = "1011284410345205820";
  const guild = "989166996153323591";
  client.guilds.fetch(guild).then((g) =>
    g.channels.fetch(status).then((c: TextChannel) =>
      c.send({
        content: "Bot started with version 2.1.0",
      })
    )
  );
  console.log("starting servers");
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
            .map((p) => p.social_connections.discord?.user_id ?? "")
            .includes(guildLeader)) ||
        guildLeader === "438605535323881486" ||
        guildLeader === "188122780678488065" ||
        guildLeader === "437694417676140577" ||
        guildLeader === "870137517020688415" ||
        guildLeader === "690421291517214722" ||
        guildLeader === "128643751689060352" ||
        guildLeader === "244212157242277888" ||
        guildLeader === "66237642349477888"
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
      await Promise.all(
        toolbarModalRecievers
          .filter((c) => c.id == interaction.customId)
          .map((c) =>
            (async () => {
              await interaction.deferReply({ ephemeral: true });
              await c.reciever(interaction);
            })()
          )
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

process.on("uncaughtException", async (e) => {
  console.log(e);
  const status = "1011284410345205820";
  const guild = "989166996153323591";
  await client.guilds.fetch(guild).then((g) =>
    g.channels.fetch(status).then((c: TextChannel) =>
      c.send({
        content: "Bot Crashed, attempting automatic restart",
      })
    )
  );
});
