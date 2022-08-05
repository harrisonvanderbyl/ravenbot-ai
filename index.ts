import { adminChannel, client } from "./commands/client";

import { TextChannel } from "discord.js";
import commands from "./commands/slashCommands";
import config from "./config/config.json";
import { debug } from "./offline.json";

// Finally, WriterBot Begins
client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user?.setPresence({ activities: [{ name: "Drawing/Writing" }] });
  client.channels.fetch(adminChannel).then((channel) => {
    (channel as TextChannel).send(`Bot has been started`);
  });
});



client.on("messageCreate", async (message) => {
  
});

client.on("interactionCreate", async (interaction) => {
  if (!debug == (interaction.channelId == adminChannel)) {
    console.log("not interacting");
    return;
  }

  // debug = false; adminChannel = true; output: true
  // debug = true; adminChannel = false; output: true

  if (interaction.isMessageContextMenu() || interaction.isUserContextMenu()) {
    Object.values(commands)
      .filter((c) => c.commandSchema.name == interaction.commandName)
      .forEach(async (c) => {
        await c.contextCommand(client, interaction);
      });
  }
  if (interaction.isCommand()) {
    Object.values(commands)
      .filter((c) => c.commandSchema.name == interaction.commandName)
      .forEach(async (c) => {
        if (!c.skipDeferReply) {
          await interaction.deferReply({});
        }
        await c.slashCommand(client, interaction);
      });
  }
  if (interaction.isModalSubmit()) {
    await interaction.deferReply();

    Object.values(commands)
      .filter((c) => c.commandSchema.name == interaction.customId)
      .forEach(async (c) => {
        await c.modalSubmit(client, interaction);
      });
  }
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
