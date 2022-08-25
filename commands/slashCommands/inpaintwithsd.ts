import {
  MessageActionRow,
  MessageAttachment,
  Modal,
  TextInputComponent,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { Dalle } from "../../charaterBuilders/imageGenerators/dalle";
import { SlashCommand } from "./typing";
import axios from "axios";
import sharp from "sharp";
import { stable } from "./sdhelpers/sdhelpers";

export const inpaintwithsd: SlashCommand = {
  contextCommand: async (client, interaction) => {
    const attachmentUrls: string[] = [];
    for (const attachment of interaction.targetMessage.attachments.values()) {
      attachmentUrls.push(attachment?.url ?? "");
    }
    for (const embed of interaction.targetMessage.embeds.values()) {
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
    const content = interaction.targetMessage.content?.length
      ? interaction.targetMessage.content
      : interaction.channel.messages
          .fetch(interaction.targetMessage.id)
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
      .setCustomId("inpaintwithsd")
      .setTitle("Inpaint with SD");

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
    name: "inpaintwithsd",
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
    const original = sharpImage.clone();
    // const width = (await sharpImage.metadata()).width ?? 512;

    const mask = await sharp({
      create: {
        background: { alpha: 0, r: 0, g: 0, b: 0 },
        channels: 4,
        height: 512,
        width: 512,
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              channels: 3,
              height: 512 * (parseInt(percent) / 100),
              width: 512 * (parseInt(percent) / 100),
              background: { r: 255, g: 255, b: 255 },
            },
          })
            .jpeg()
            .toBuffer(),
          blend: "over",
        },
      ])
      .jpeg()
      .toBuffer();

    original.resize(512, 512, { fit: "fill" });
    // combine images
    const combined = await sharp({
      create: {
        background: { alpha: 0, r: 0, g: 0, b: 0 },
        channels: 4,
        height: 512,
        width: 512,
        noise: {
          mean: 255 / 2,
          sigma: 255 / 2,
          type: "gaussian",
        },
      },
    })
      .composite([
        {
          input: await original
            .clone()
            .jpeg()
            .resize(
              512 * (parseInt(percent) / 100),
              512 * (parseInt(percent) / 100),
              { fit: "fill" }
            )
            .toBuffer(),
          blend: "over",
        },
      ])
      .jpeg()
      .toBuffer();

    const buffers = await stable(
      interaction as any,
      prompt,
      "12345",
      combined.toString("base64"),
      "0.75",
      true,
      "512",
      "512",
      "1",
      mask.toString("base64")
    ).catch(async (e) => {
      console.log(e);
      await interaction.followUp({ content: "error: " + e, ephemeral: true });
      return null;
    });
    if (!buffers) {
      await interaction.editReply({
        content: "error: something went wrong",
      });
      return;
    }
    await interaction.editReply({
      content: prompt,
      files: [buffers].map(
        (buffer, index) =>
          new MessageAttachment(buffer, `generation${index}.jpeg`)
      ),
    });
  },
  slashCommand: async (client, interaction) => {
    return;
  },
};
