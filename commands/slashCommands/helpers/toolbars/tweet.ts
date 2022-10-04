import {
  Message,
  MessageActionRow,
  MessageActionRowOptions,
  MessageAttachment,
  MessageComponentInteraction,
  Modal,
  ModalSubmitInteraction,
  TextInputComponent,
} from "discord.js";
import { createOathLink, tweetPic } from "../../twitterHelpers/Oath";

import { ToolBarItem } from "./common";
import { addToolbar } from "../buttons";
import { client } from "../../../client";
import { readFileSync } from "fs";

const tweetBuffers = {};

export const createTweetModal = async (
  i: MessageComponentInteraction,
  bufferBuffer
) => {
  tweetBuffers[i.user.id] = bufferBuffer;
  const code = JSON.parse(readFileSync("./twittercodes.json", "utf8"))[
    i.user.id
  ];
  console.log(code?.expires_in);
  if (!code || code.expiresIn < Date.now()) {
    if (!i.deferred && !i.replied) {
      await i.deferReply({ ephemeral: true });
    }
    await i.followUp({
      content: "You need to login first",
      ephemeral: true,
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              style: "LINK",
              label: "Login",
              url: (await createOathLink(i.user.id)).url,
            },
          ],
        },
      ],
    });
    throw "You need to login first";
  }
  const modal = new Modal({
    title: "Tweet",
    customId: "tweetmodal",
    components: [],
  });
  const shrink = new TextInputComponent()
    .setCustomId("text")
    .setLabel("The tweet body")
    .setStyle("PARAGRAPH")
    .setValue(
      "Artwork: Created using Stable Diffusion and Writerbot AI shorturl.at/gMPSX\n\n#StableDiffusion #Art #AI #Artwork #ArtBot #WriterBot"
    );

  const informationValueRow: MessageActionRow<TextInputComponent> =
    new MessageActionRow<TextInputComponent>().addComponents(
      shrink
    ) as any as MessageActionRow<TextInputComponent>;

  modal.addComponents(informationValueRow);

  await i.showModal(modal);
};

export const tweetToolBar: ToolBarItem = {
  name: "🐦",
  id: "tweet",
  skipDefer: true,
  filter: (buffers: Buffer[]) => true,
  createToolbars: async (
    buffers: Buffer[],
    i
  ): Promise<MessageActionRowOptions[]> => {
    // Different behaviors for different number of buffers
    switch (buffers.length) {
      case 1:
        await createTweetModal(i, buffers[0]).catch((e) => {
          throw e;
        });

        return [];
      case 4:
        return [
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "tweet1",
                style: "SECONDARY",
                label: "🐦1",
              },
              {
                type: "BUTTON",

                custom_id: "tweet2",
                style: "SECONDARY",
                label: "🐦2",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "tweet3",
                style: "SECONDARY",
                label: "🐦3",
              },
              {
                type: "BUTTON",

                custom_id: "tweet4",
                style: "SECONDARY",
                label: "🐦4",
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

                custom_id: "tweet1",
                style: "SECONDARY",
                label: "🐦1",
              },
              {
                type: "BUTTON",

                custom_id: "tweet2",
                style: "SECONDARY",
                label: "🐦2",
              },
              {
                type: "BUTTON",

                custom_id: "tweet3",
                style: "SECONDARY",
                label: "🐦3",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "tweet4",
                style: "SECONDARY",
                label: "🐦4",
              },
              {
                type: "BUTTON",

                custom_id: "tweet5",
                style: "SECONDARY",
                label: "🐦5",
              },
              {
                type: "BUTTON",

                custom_id: "tweet6",
                style: "SECONDARY",
                label: "🐦6",
              },
            ],
            type: "ACTION_ROW",
          },
          {
            components: [
              {
                type: "BUTTON",

                custom_id: "tweet7",
                style: "SECONDARY",
                label: "🐦7",
              },
              {
                type: "BUTTON",

                custom_id: "tweet8",
                style: "SECONDARY",
                label: "🐦8",
              },
              {
                type: "BUTTON",

                custom_id: "tweet9",
                style: "SECONDARY",
                label: "🐦9",
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
        "tweet1",
        "tweet2",
        "tweet3",
        "tweet4",
        "tweet5",
        "tweet6",
        "tweet7",
        "tweet8",
        "tweet9",
      ].includes(number)
    ) {
      const buffer = buffers[Number(number.split("tweet")[1]) - 1];
      await createTweetModal(i, buffer);
    }
  },
};
export const tweetModalReciever = {
  id: "tweetmodal",
  reciever: async (i: ModalSubmitInteraction) => {
    const buffer = tweetBuffers[i.user.id];
    await tweetPic(i, i.fields.getTextInputValue("text") ?? "raw", buffer);
  },
};
