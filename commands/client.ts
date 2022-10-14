import {
  AnyChannel,
  Client,
  ClientOptions,
  Intents,
  TextChannel,
} from "discord.js";

// Client options with intents for new Discord API v9
const clientOptions: ClientOptions = {
  intents: [
    Intents.FLAGS.GUILDS, // Channels joined
    Intents.FLAGS.GUILD_MESSAGES, // Messages in a server
    Intents.FLAGS.DIRECT_MESSAGES, // Direct messages sent to bot
  ],
  partials: [
    "CHANNEL", // Need to enable to see DMs
  ],
};
export const client = new Client(clientOptions);

export const channelTypeGuard = (channel: AnyChannel): channel is TextChannel =>
  channel.type === "GUILD_TEXT";
