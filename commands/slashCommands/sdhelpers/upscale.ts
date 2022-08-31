import * as WomboDreamApi from "wombo-dream-api";

import {
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageContextMenuInteraction,
  Modal,
  TextInputComponent,
} from "discord.js";

import { SlashCommand } from "../typing";
import { addToolbar } from "../helpers/buttons";
import { downloadToBuffer } from "../../../charaterBuilders/imageGenerators/wombo";
import sharp from "sharp";
import { stable } from "./sdhelpers";

export const upscale = async (
  client,
  interaction: MessageComponentInteraction,
  upscale: "2" | "4" | "8"
) => {
  const targetmessage = interaction.message;
  const attachmentUrls: string[] = [];
  for (const attachment of targetmessage.attachments.values()) {
    attachmentUrls.push(attachment?.url ?? "");
  }
  for (const embed of targetmessage.embeds.values()) {
    attachmentUrls.push(embed.image?.url ?? "");
  }

  if (attachmentUrls.length == 0 || attachmentUrls[0] == "") {
    return await interaction.reply({
      content: "No image found!",
      ephemeral: true,
    });
  }

  //get value of prompt
  const content = targetmessage.content?.length
    ? targetmessage.content
    : interaction.channel.messages
        .fetch(targetmessage.id)
        .then(async (message) => {
          console.log(message.content);
          return message.content.length
            ? message.content
            : message.embeds?.[0]?.title?.length
            ? message.embeds[0].title
            : message.reference?.messageId
            ? await interaction.channel.messages
                .fetch(message.reference?.messageId)
                .then((m) => {
                  return m.content.length
                    ? m.content
                    : m.embeds?.[0]?.title?.length
                    ? m.embeds[0].title
                    : m.reference?.messageId
                    ? interaction.channel.messages
                        .fetch(m.reference?.messageId)
                        .then((m) => {
                          return m.content ?? "";
                        })
                    : "";
                })
            : "";
        });

  const image = sharp(await downloadToBuffer(attachmentUrls[0]));

  const buff = await stable(
    interaction as any,
    "Upscale",
    "12345",
    await image
      .clone()
      .jpeg()
      .toBuffer()
      .then((b) => b.toString("base64")),
    "1",
    true,
    (await image.metadata()).width.toFixed(0),
    (await image.metadata()).height.toFixed(0),
    "1",
    undefined,
    "20",
    upscale
  ).catch(async (e) => {
    console.log(e);
    await interaction.followUp({ content: "error: " + e, ephemeral: true });
    return null;
  });
  const message = await interaction.editReply({
    content: null,

    files: [new MessageAttachment(buff, `generation.jpeg`)],
    embeds: [
      {
        title: ((await content) ?? "").slice(0, 200) + "...",
        fields: [
          {
            name: "Seed",
            value: "remix",
            inline: true,
          },
        ],
        image: {
          url: `attachment://generation.jpeg`,
        },
      },
    ],
  });
  await addToolbar(
    message as Message,
    [buff],
    [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Patreon")
          .setStyle("LINK")
          .setURL("https://patreon.com/unexplored_horizons"),
        new MessageButton()
          .setLabel("Host Node")
          .setStyle("LINK")
          .setURL(
            "https://colab.research.google.com/drive/1xxypspWywNT6IOnXdSQz9phL0MRPhPCp?usp=sharing"
          )
      ),
    ]
  );
};
