import {
  Message,
  MessageActionRowComponentResolvable,
  MessageActionRowOptions,
  MessageAttachment,
} from "discord.js";

import { ToolBarItem } from "./common";
import { addToolbar } from "../buttons";
import { client } from "../../../client";
import sharp from "sharp";
import { upscale } from "../../sdhelpers/upscale";

export const upscaleToolBar: ToolBarItem = {
  name: "🔍",
  id: "upscale",
  filter: (buffers: Buffer[]) => buffers.length == 1,
  createToolbars: async (buffers: Buffer[]) => {
    const { width, height } = await sharp(buffers[0]).metadata();
    const maxsize = Math.max(width, height);
    // Different behaviors for different number of buffers
    switch (buffers.length) {
      case 1:
        return [
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "upscale2x",
                style: "SECONDARY",
                label: "2x",
                max: 2048,
              },
              {
                type: "BUTTON",

                custom_id: "upscale4x",
                style: "SECONDARY",
                label: "4x",
                max: 1024,
              },
              {
                type: "BUTTON",

                custom_id: "upscale8x",
                style: "SECONDARY",
                label: "8x",
                max: 512,
              },
              {
                type: "BUTTON",
                customId: "home",
                style: "SECONDARY",
                label: "🏠",
                max: 100000,
              },
            ]
              .filter((m) => maxsize <= m.max)
              .map((m) => {
                delete m.max;
                return m;
              }) as any[],
            type: "ACTION_ROW",
          },
        ];
      default:
        return [];
    }
  },
  process: async (buffers, i, addons) => {
    const number = i.customId;
    if (number == "upscale2x") {
      await i.deferUpdate();
      const message = await upscale(client, i, "2");
    }
    if (number == "upscale4x") {
      await i.deferUpdate();
      const message = await upscale(client, i, "4");
    }
    if (number == "upscale8x") {
      await i.deferUpdate();
      const message = await upscale(client, i, "8");
    }
  },
};
