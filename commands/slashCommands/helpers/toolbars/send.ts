import {
  Message,
  MessageActionRowOptions,
  MessageAttachment,
} from "discord.js";

import { ToolBarItem } from "./common";
import { addToolbar } from "../buttons";
import { client } from "../../../client";

export const sendToolBar: ToolBarItem = {
  name: "📩",
  id: "mail",
  filter: (buffers: Buffer[]) => true,
  createToolbars: (buffers: Buffer[], i): MessageActionRowOptions[] => {
    // Different behaviors for different number of buffers
    switch (buffers.length) {
      case 1:
        i.user.createDM().then((dm) => {
          dm.send({
            files: [new MessageAttachment(buffers[0], "image.png")],
          });
        });
        return [];
      case 4:
        return [
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "mail1",
                style: "SECONDARY",
                label: "📩1",
              },
              {
                type: "BUTTON",

                custom_id: "mail2",
                style: "SECONDARY",
                label: "📩2",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "mail3",
                style: "SECONDARY",
                label: "📩3",
              },
              {
                type: "BUTTON",

                custom_id: "mail4",
                style: "SECONDARY",
                label: "📩4",
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

                custom_id: "mail1",
                style: "SECONDARY",
                label: "📩1",
              },
              {
                type: "BUTTON",

                custom_id: "mail2",
                style: "SECONDARY",
                label: "📩2",
              },
              {
                type: "BUTTON",

                custom_id: "mail3",
                style: "SECONDARY",
                label: "📩3",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "mail4",
                style: "SECONDARY",
                label: "📩4",
              },
              {
                type: "BUTTON",

                custom_id: "mail5",
                style: "SECONDARY",
                label: "📩5",
              },
              {
                type: "BUTTON",

                custom_id: "mail6",
                style: "SECONDARY",
                label: "📩6",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "mail7",
                style: "SECONDARY",
                label: "📩7",
              },
              {
                type: "BUTTON",

                custom_id: "mail8",
                style: "SECONDARY",
                label: "📩8",
              },
              {
                type: "BUTTON",

                custom_id: "mail9",
                style: "SECONDARY",
                label: "📩9",
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
    if (
      [
        "mail1",
        "mail2",
        "mail3",
        "mail4",
        "mail5",
        "mail6",
        "mail7",
        "mail8",
        "mail9",
      ].includes(number)
    ) {
      await i.deferUpdate();
      const message = await i.user.createDM().then((t) =>
        t.send({
          files: [
            new MessageAttachment(
              buffers[Number(number.split("mail")[1]) - 1],
              "buffer.png"
            ),
          ],
          embeds: [
            {
              image: {
                url: "attachment://buffer.png",
              },
            },
          ],
        })
      );
    }
  },
};
