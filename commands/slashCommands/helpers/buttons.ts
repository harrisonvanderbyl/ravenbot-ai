import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageActionRowComponent,
  MessageActionRowOptions,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";

import axios from "axios";
import { createStatusSheet } from "./quicktools/createStatusSheet";
import sharp from "sharp";
import { split } from "./imagesplit";
import { toolbars } from "./toolbars/index";

const toolbar = (buffers: Buffer[]): MessageActionRowOptions[] => {
  return [
    {
      components: toolbars
        .filter((t) => t.filter(buffers))
        .map((toolbar) => {
          return {
            type: "BUTTON",
            custom_id: toolbar.id,
            style: "SECONDARY",
            label: toolbar.name,
          };
        }),
      type: "ACTION_ROW",
    },
  ].filter((row) => row.components.length > 0) as MessageActionRowOptions[];
};

export const addToolbar = async (
  messaged: Message<boolean>,
  buffers: Buffer[],
  addons: MessageActionRowOptions[] = []
) => {
  const message = await messaged.fetch();

  await message.edit({
    components: [...toolbar(buffers), ...addons].map(
      (m) => new MessageActionRow<MessageActionRowComponent>(m)
    ),
    embeds: [
      {
        title: message.embeds[0].title,
        description: message.embeds[0].description,
        image: {
          url: message.attachments.first()
            ? `attachment://` + message.attachments.first().name
            : message.embeds[0].image?.url,
        },
      },
      createStatusSheet("Metadata", {
        Images: buffers.length.toFixed(0),
        Size: await sharp(buffers[0])
          .metadata()
          .then((m) => m.width.toFixed(0) + "x" + m.height.toFixed(0)),
      }),
    ],
  });
};

export const handleButtons = async (i: ButtonInteraction) => {
  const number = i.customId;
  console.log(number);
  const addons: MessageActionRowOptions[] = [
    {
      components: i.message.components.flatMap((row) =>
        row.components.filter((c: MessageButton) => c.url)
      ) as any,
    },
  ];
  const metadata = (i.message.embeds as MessageEmbed[]).find(
    (e) => e.title === "Metadata"
  );
  const buffersize = metadata.fields.find((f) => f.name === "Images").value;
  const url = (i.message.embeds as MessageEmbed[]).find((e) => e.image.url)
    .image.url;
  const buffers = await axios
    .get(url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then((r) => r.data)
    .then((b) => split(b, Number(buffersize) as any));

  if (number === "home") {
    await i.deferUpdate();
    await i.editReply({
      components: [...toolbar(buffers), ...addons].map(
        (m) => new MessageActionRow<MessageActionRowComponent>(m)
      ),
    });
  }
  toolbars.forEach(async (t) => {
    if (t.id === number) {
      const newtoolbar = await t.createToolbars(buffers, i).catch((e) => null);
      if (newtoolbar == null) return;
      try {
        if (!i.deferred && !i.replied) {
          await i.deferUpdate();
        }
        await i.editReply({
          components: [
            ...(newtoolbar.length > 0 ? newtoolbar : toolbar(buffers)),
            ...addons,
          ].map((m) => new MessageActionRow<MessageActionRowComponent>(m)),
        });
      } catch (e) {
        console.log(e);
      }
    }
    await t.process(buffers, i, addons);
  });
};
