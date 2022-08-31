import {
  Message,
  MessageActionRowOptions,
  MessageAttachment,
} from "discord.js";

import { ToolBarItem } from "./common";
import { addToolbar } from "../buttons";
import { client } from "../../../client";
import { upscale } from "../../sdhelpers/upscale";

export const upscaleToolBar: ToolBarItem = {
  name: "🔍",
  id: "upscale",
  filter: (buffers: Buffer[]) => buffers.length == 1,
  createToolbars: (buffers: Buffer[]): MessageActionRowOptions[] => {
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
    if (number == "upscale2x") {
      await i.deferUpdate();
      const message = await upscale(client, i, "2");
    }
  },
};
