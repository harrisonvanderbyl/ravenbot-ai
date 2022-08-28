import { MessageActionRowOptions, MessageAttachment } from "discord.js";

import { ToolBarItem } from "./common";
import { inpaintwithdalle } from "../../inpaintwithdalle";
import { remixwithsd } from "../../remixwithsd";
import { remixwithwombo } from "../../remixwithwombo";

export const remixToolBar: ToolBarItem = {
  name: "🎨",
  id: "remix",
  filter: (buffers: Buffer[]) => buffers.length == 1,
  createToolbars: (buffers: Buffer[]): MessageActionRowOptions[] => {
    return [
      {
        components: [
          {
            type: "BUTTON",
            custom_id: "remixsd",
            style: "SECONDARY",
            label: "🎨SD",
          },
          {
            type: "BUTTON",
            custom_id: "remixwombo",
            style: "SECONDARY",
            label: "🎨Wombo",
          },
          {
            type: "BUTTON",
            custom_id: "⤢inpaintdalle",
            style: "SECONDARY",
            label: "",
          },
          {
            type: "BUTTON",
            custom_id: "home",
            style: "SECONDARY",
            label: "🏠",
          },
        ],
        type: "ACTION_ROW",
      },
    ];
  },
  process: async (buffers, i, addons) => {
    if (i.customId == "remixsd") {
      await remixwithsd.contextCommand(undefined, i);
    }
    if (i.customId == "remixwombo") {
      await remixwithwombo.contextCommand(undefined, i);
    }
    if (i.customId == "inpaintdalle") {
      await inpaintwithdalle.contextCommand(undefined, i);
    }
  },
};
