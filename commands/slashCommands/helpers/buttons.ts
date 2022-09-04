import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageActionRowComponent,
  MessageActionRowOptions,
  MessageAttachment,
} from "discord.js";

import { toolbars } from "./toolbars/index";

const toolbar = (buffers: Buffer[]): MessageActionRowOptions[] => {
  return [
    {
      components: toolbars
        .filter((t) => t.filter(buffers))
        .map((toolbar) => {
          return {
            type: "BUTTON",
            custom_id: toolbar.id,
            style: "SECONDARY",
            label: toolbar.name,
          };
        }),
      type: "ACTION_ROW",
    },
  ].filter((row) => row.components.length > 0) as MessageActionRowOptions[];
};

export const addToolbar = async (
  message: Message<boolean>,
  buffers: Buffer[],
  addons: MessageActionRowOptions[] = []
) => {
  await message.edit({
    components: [...toolbar(buffers), ...addons].map(
      (m) => new MessageActionRow<MessageActionRowComponent>(m)
    ),
  });
  const collector = message.createMessageComponentCollector({
    time: 120000,
  });
  collector.on("end", async (m) => {
    message.edit({
      components: [...addons].map(
        (m) => new MessageActionRow<MessageActionRowComponent>(m)
      ),
    });
  });
  collector.on("collect", async (i) => {
    const number = i.customId;
    console.log(number);
    if (number === "home") {
      await i.deferUpdate();
      await i.editReply({
        components: [...toolbar(buffers), ...addons].map(
          (m) => new MessageActionRow<MessageActionRowComponent>(m)
        ),
      });
    }
    toolbars.forEach(async (t) => {
      if (t.id === number) {
        
        const newtoolbar = await t.createToolbars(buffers, i);
        if (!i.deferred && !i.replied) {
          await i.deferUpdate();
        }
        try {
          await i.editReply({
            components: [
              ...(newtoolbar.length > 0 ? newtoolbar : toolbar(buffers)),
              ...addons,
            ].map((m) => new MessageActionRow<MessageActionRowComponent>(m)),
          });
        } catch (e) {
          console.log(e);
        }
      }
      await t.process(buffers, i, addons);
    });
  });
};
