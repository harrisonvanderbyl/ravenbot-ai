import {
  Message,
  MessageActionRowOptions,
  MessageAttachment,
} from "discord.js";

import { ToolBarItem } from "./common";
import { addToolbar } from "../buttons";

export const cutToolBar: ToolBarItem = {
  name: "✂️",
  id: "cut",
  filter: (buffers: Buffer[]) => buffers.length > 1,
  createToolbars: async (buffers: Buffer[]) => {
    // Different behaviors for different number of buffers
    switch (buffers.length) {
      case 1:
        return [];
      case 4:
        return [
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "1",
                style: "SECONDARY",
                label: "✂️1",
              },
              {
                type: "BUTTON",

                custom_id: "2",
                style: "SECONDARY",
                label: "✂️2",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "3",
                style: "SECONDARY",
                label: "✂️3",
              },
              {
                type: "BUTTON",

                custom_id: "4",
                style: "SECONDARY",
                label: "✂️4",
              },
              {
                type: "BUTTON",
                customId: "home",
                style: "SECONDARY",
                label: "🏠",
              },
            ],
            type: "ACTION_ROW",
          },
        ];
      case 9:
        return [
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "1",
                style: "SECONDARY",
                label: "✂️1",
              },
              {
                type: "BUTTON",

                custom_id: "2",
                style: "SECONDARY",
                label: "✂️2",
              },
              {
                type: "BUTTON",

                custom_id: "3",
                style: "SECONDARY",
                label: "✂️3",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "4",
                style: "SECONDARY",
                label: "✂️4",
              },
              {
                type: "BUTTON",

                custom_id: "5",
                style: "SECONDARY",
                label: "✂️5",
              },
              {
                type: "BUTTON",

                custom_id: "6",
                style: "SECONDARY",
                label: "✂️6",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "7",
                style: "SECONDARY",
                label: "✂️7",
              },
              {
                type: "BUTTON",

                custom_id: "8",
                style: "SECONDARY",
                label: "✂️8",
              },
              {
                type: "BUTTON",

                custom_id: "9",
                style: "SECONDARY",
                label: "✂️9",
              },
              {
                type: "BUTTON",
                customId: "home",
                style: "SECONDARY",
                label: "🏠",
              },
            ],
            type: "ACTION_ROW",
          },
        ];
      default:
        return [];
    }
  },
  process: async (buffers, i, addons) => {
    const number = i.customId;
    if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(number)) {
      await i.deferUpdate();
      const message = await i.followUp({
        files: [
          new MessageAttachment(buffers[Number(number) - 1], "buffer.png"),
        ],
        embeds: [
          {
            image: {
              url: "attachment://buffer.png",
            },
          },
        ],
      });
      await addToolbar(
        message as Message,
        [buffers[Number(number) - 1]],
        addons
      );
    }
  },
};
