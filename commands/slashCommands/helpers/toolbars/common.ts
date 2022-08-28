import {
  MessageActionRowOptions,
  MessageComponentInteraction,
} from "discord.js";

export type ToolBarItem = {
  name: string;
  id: string;
  filter: (buffers: Buffer[]) => boolean;
  createToolbars: (buffers: Buffer[]) => MessageActionRowOptions[];
  process: (buffers: Buffer[], i: MessageComponentInteraction) => Promise<void>;
};
