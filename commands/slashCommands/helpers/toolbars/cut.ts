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
  createToolbars: async (buffers: Buffer[], i, r: number = 0) => {
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
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9, "🏠"],
        ].map((n) => ({
          components: n.map((ni) => ({
            type: "BUTTON",

            custom_id: typeof ni == "number" ? `${ni + r}` : "home",
            style: "SECONDARY",
            label: typeof ni == "number" ? "✂️" + (ni + r) : ni,
          })),
          type: "ACTION_ROW",
        }));
      case 81:
        return [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9, "🏠"],
        ].map((n) => ({
          components: n.map((ni) => ({
            type: "BUTTON",

            custom_id: typeof ni == "number" ? `cut|${ni}` : "home",
            style: "SECONDARY",
            label: typeof ni == "number" ? `✂️${ni * 9 - 9}-${ni * 9}` : ni,
          })),
          type: "ACTION_ROW",
        }));
      default:
        return [];
    }
  },
  process: async (buffers, i, addons) => {
    const number = i.customId;
    if (
      [
        "cut|1",
        "cut|2",
        "cut|3",
        "cut|4",
        "cut|5",
        "cut|6",
        "cut|7",
        "cut|8",
        "cut|9",
      ].includes(number)
    ) {
      var n = Number(number.split("|")[1]);
      n = n * 9;
      n = n - 9;
      await i.update({
        components: [
          ...(await cutToolBar.createToolbars(buffers.slice(n, n + 9), i, n)),
          ...addons,
        ] as any,
      });
    }
    if (
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .flatMap((n) =>
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => `${m * 9 - 9 + n}`)
        )
        .includes(number)
    ) {
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
