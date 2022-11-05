import {
  Dalle,
  DallePostPaid,
} from "../../charaterBuilders/imageGenerators/dalle";
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
import { existsSync, readFileSync, writeFileSync } from "fs";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import axios from "axios";
import { imageJoin } from "./helpers/imageJoin";
import joinImages from "join-images";
import sharp from "sharp";

export const inpaintwithdalle: SlashCommand = {
  contextCommand: async (
    client,
    interaction: MessageContextMenuInteraction | MessageComponentInteraction
  ) => {
    const attachmentUrls: string[] = [];
    const targetmessage = interaction.isContextMenu()
      ? interaction.targetMessage
      : interaction.message;
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

    const imageUrl = new TextInputComponent()
      .setCustomId("imageUrl")
      .setLabel("What is the image url?")
      .setStyle("SHORT")
      .setValue(attachmentUrls[0]);

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

    const prompt = new TextInputComponent()
      .setCustomId("prompt")
      .setLabel("What is the prompt for the image?")
      .setStyle("SHORT")
      .setValue(await content);

    const informationValueRow5: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        imageUrl
      ) as any as MessageActionRow<TextInputComponent>;

    const informationValueRow4: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        prompt
      ) as any as MessageActionRow<TextInputComponent>;
    const modal = new Modal()
      .setCustomId("inpaintwithdalle")
      .setTitle("Inpaint with Dalle");

    const shrink = new TextInputComponent()
      .setCustomId("percent")
      .setLabel("What percent do you want to scale image by?")
      .setStyle("SHORT")
      .setValue("50");

    const informationValueRow: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        shrink
      ) as any as MessageActionRow<TextInputComponent>;

    modal.addComponents(
      informationValueRow,
      informationValueRow4,
      informationValueRow5
    );

    await interaction.showModal(modal);
  },
  commandSchema: {
    name: "inpaintwithdalle",
    type: 3,
  },
  modalSubmit: async (client, interaction) => {
    const percent = interaction.fields.getTextInputValue("percent");
    const imageUrl = interaction.fields.getTextInputValue("imageUrl");
    const prompt = interaction.fields.getTextInputValue("prompt");

    // download image to buffer
    const imageBuffer = (
      await axios.get(imageUrl, {
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
    ).data;

    // shrink image
    const sharpImage = sharp(imageBuffer).png();
    const combined = sharp({
      create: {
        channels: 4,
        height: 1024,
        width: 1024,
        background: { alpha: 0, r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        {
          input: await sharpImage
            .clone()
            .png()
            .resize(
              1024 * (parseInt(percent) / 100),
              1024 * (parseInt(percent) / 100),
              { fit: "inside" }
            )
            .toBuffer(),
          blend: "over",
        },
      ])

      .png()
      .toBuffer();
    const buffer = await combined;

    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    // read dalle key from config file
    const dalleKey = JSON.parse(readFileSync("./dalleconfig.json").toString())[
      interaction.user.id
    ];

    const buffers = [
      ...(await new DallePostPaid().generate(prompt, buffer).catch((e) => {
        console.log(e);
        throw e;
      })),
    ];

    const message = await interaction.editReply({
      content: null,

      files: [
        new MessageAttachment(
          await imageJoin(buffers, true),
          `generation.jpeg`
        ),
      ],
      embeds: [
        {
          title: (prompt as string).slice(0, 200) + "...",

          image: {
            url: `attachment://generation.jpeg`,
          },
        },
      ],
    });
    await addToolbar(message as Message, buffers, [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Patreon")
          .setStyle("LINK")
          .setURL("https://patreon.com/unexplored_horizons"),
        new MessageButton()
          .setLabel("Writerbot home discord")
          .setStyle("LINK")
          .setURL("https://discord.gg/eZqw6gMhf6")
      ),
    ]);
  },
  slashCommand: async (client, interaction) => {
    return;
  },
};
