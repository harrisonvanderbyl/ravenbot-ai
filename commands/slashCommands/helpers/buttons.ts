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
  ];
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
    await i.deferUpdate();
    const number = i.customId;
    console.log(number);
    if (number === "home") {
      await i.editReply({
        components: [...toolbar(buffers), ...addons].map(
          (m) => new MessageActionRow<MessageActionRowComponent>(m)
        ),
      });
    }
    toolbars.forEach(async (t) => {
      if (t.id === number) {
        await i.editReply({
          components: [...t.createToolbars(buffers), ...addons].map(
            (m) => new MessageActionRow<MessageActionRowComponent>(m)
          ),
        });
      }
      await t.process(buffers, i);
    });
  });
};
