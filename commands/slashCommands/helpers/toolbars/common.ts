import {
  MessageActionRowOptions,
  MessageComponentInteraction,
  MessageInteraction,
} from "discord.js";

export type ToolBarItem = {
  name: string;
  id: string;
  skipDefer?: boolean;
  filter: (buffers: Buffer[]) => boolean;
  createToolbars: (
    buffers: Buffer[],
    i: MessageComponentInteraction,
    offset?: number
  ) => Promise<MessageActionRowOptions[]>;
  process: (
    buffers: Buffer[],
    i: MessageComponentInteraction,
    addons: MessageActionRowOptions[]
  ) => Promise<void>;
};
