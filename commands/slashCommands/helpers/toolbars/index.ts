import { tweetModalReciever, tweetToolBar } from "./tweet";

import {
  Message,
  MessageActionRow,
  MessageButton,
  ModalSubmitInteraction,
} from "discord.js";
import { cutToolBar } from "./cut";
import { remixToolBar } from "./remix";
import { sendToolBar } from "./send";
import { upscaleToolBar } from "./upscale";
import { setApiKey } from "../horde/login";

export const toolbars = [
  cutToolBar,
  remixToolBar,
  upscaleToolBar,
  sendToolBar,
  tweetToolBar,
];

const hordemodal = async (interaction) => {
  const apikey = interaction.fields.getTextInputValue("apikey");
  setApiKey(interaction.user.id, apikey);
  const message = (await interaction.editReply({
    content: interaction.user.username + " logged in to horde",
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("X")
          .setStyle("DANGER")
          .setCustomId("remove")
      ),
    ],
  })) as Message;
  message
    .awaitMessageComponent({
      filter: (i) => i.customId === "remove",
      time: 60000,
      dispose: true,
      componentType: "BUTTON",
    })
    .then(async (i) => {
      message.delete();
    })
    .catch((i) => message.delete());
};
export const toolbarModalRecievers: {
  id: string;
  reciever: (i: ModalSubmitInteraction) => Promise<void>;
}[] = [tweetModalReciever, { id: "hordeloginmodal", reciever: hordemodal }];
