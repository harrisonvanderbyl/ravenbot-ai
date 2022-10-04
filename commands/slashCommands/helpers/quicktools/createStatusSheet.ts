import { MessageEmbedOptions } from "discord.js";

export const createStatusSheet = (
  title: string,
  details: {
    [key: string]: string;
  }
): MessageEmbedOptions => ({
  title,
  fields: Object.entries(details).map(([name, value]) => ({
    name,
    value,
    inline: true,
  })),
});
