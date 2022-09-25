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
import { app } from "../webserver/express";
import { downloadToBuffer } from "../../../charaterBuilders/imageGenerators/wombo";
import { redirectUrl } from "../../../config/config.json";
import sharp from "sharp";
import { stable } from "./sdhelpers";
import { readFileSync } from "fs";

const buffers: { [key: string]: Buffer } = {};

app.get("/files/error/:id/file.png", (req, res) => {
  res.setHeader("content-type", "image/png");
  res.send(
    buffers[req.params.id] ??
      readFileSync(__dirname + "/placeholder/placeholder.png")
  );
});

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
    return await interaction.followUp({
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
  const message = (await interaction.followUp({
    content: "starting upscale",
  })) as Message;
  const buff = await stable(
    interaction as any,
    "Upscale",
    "12345",
    await image
      .clone()
      .png()
      .toBuffer()
      .then((b) => b.toString("base64")),
    "1",
    true,
    (await image.metadata()).width.toFixed(0),
    (await image.metadata()).height.toFixed(0),
    "1",
    undefined,
    "20",
    upscale,
    message
  ).catch(async (e) => {
    console.log(e);
    await interaction.followUp({ content: "error: " + e, ephemeral: true });
    return null;
  });
  if (buff == null) return;
  const newsize = sharp(buff).metadata();
  try {
    await message.edit({
      content: null,

      files: [new MessageAttachment(buff, `generation.png`)],
      embeds: [
        {
          title: ((await content) ?? "").slice(0, 200) + "...",
          fields: [
            {
              name: "Seed",
              value: "Upscale",

              inline: true,
            },
            {
              name: "Resolution",
              value: `
            ${(await newsize).width}x${(await newsize).height.toFixed(0)}`,
            },
          ],
          image: {
            url: `attachment://generation.png`,
          },
        },
      ],
    });
  } catch (e) {
    buffers[message.id] = buff;
    await message.edit({
      content: "Could not upload, image only valid for 10 mins",
      embeds: [
        {
          title: ((await content) ?? "").slice(0, 200) + "...",
          fields: [
            {
              name: "Seed",
              value: "Upscale",

              inline: true,
            },
            {
              name: "Resolution",
              value: `
              ${(await newsize).width}x${(await newsize).height.toFixed(0)}`,
            },
          ],
          image: {
            url:
              "https://" +
              redirectUrl +
              "/files/error/" +
              message.id +
              "/file.png",
          },
        },
      ],
    });

    // timeout to delete the file
    setTimeout(() => {
      delete buffers[message.id];
    }, 600000);
  }
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
            "https://colab.research.google.com/github/harrisonvanderbyl/ravenbot-ai/blob/master/WriterBot_node.ipynb"
          )
      ),
    ]
  );
};
