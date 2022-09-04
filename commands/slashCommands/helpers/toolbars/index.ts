import { tweetModalReciever, tweetToolBar } from "./tweet";

import { ModalSubmitInteraction } from "discord.js";
import { cutToolBar } from "./cut";
import { remixToolBar } from "./remix";
import { sendToolBar } from "./send";
import { upscaleToolBar } from "./upscale";

export const toolbars = [
  cutToolBar,
  remixToolBar,
  upscaleToolBar,
  sendToolBar,
  tweetToolBar,
];
export const toolbarModalRecievers: {
  id: string;
  reciever: (i: ModalSubmitInteraction) => Promise<void>;
}[] = [tweetModalReciever];
