import { Dalle, dalle } from "../../charaterBuilders/imageGenerators/dalle";
import {
  MessageActionRow,
  MessageAttachment,
  Modal,
  TextInputComponent,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { SlashCommand } from "./typing";
import axios from "axios";
import sharp from "sharp";

export const inpaintwithdalle: SlashCommand = {
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
      .setCustomId("inpaintwithdalle")
      .setTitle("Inpaint with Dalle");

    const shrink = new TextInputComponent()
      .setCustomId("percent")
      .setLabel("What percent do you want to scale image by?")
      .setStyle("SHORT")
      .setValue("50");

    const top = new TextInputComponent()
      .setCustomId("top")
      .setLabel("how far down is the top of the image?")
      .setStyle("SHORT")
      .setValue("25");

    const left = new TextInputComponent()
      .setCustomId("left")
      .setLabel("how far to the right is the image?")
      .setStyle("SHORT")
      .setValue("25");

    const informationValueRow: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        shrink
      ) as any as MessageActionRow<TextInputComponent>;

    const informationValueRow2: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        top
      ) as any as MessageActionRow<TextInputComponent>;

    const informationValueRow3: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        left
      ) as any as MessageActionRow<TextInputComponent>;

    modal.addComponents(
      informationValueRow,
      informationValueRow2,
      informationValueRow3,
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
    const top = interaction.fields.getTextInputValue("top");
    const left = interaction.fields.getTextInputValue("left");
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
    const width = (await sharpImage.metadata()).width ?? 512;
    const resize = sharpImage.extend({
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      top: parseInt(
        (
          width *
          (1.0 / (parseInt(percent) / 100)) *
          (parseInt(top) / 100)
        ).toFixed(0)
      ),
      left: parseInt(
        (
          width *
          (1.0 / (parseInt(percent) / 100)) *
          (parseInt(left) / 100)
        ).toFixed(0)
      ),
      right: parseInt(
        (
          width *
            (1.0 / (parseInt(percent) / 100)) *
            (1 - parseInt(left) / 100) -
          width * (0.5 / (parseInt(percent) / 100))
        ).toFixed(0)
      ),
      bottom: parseInt(
        (
          width *
            (1.0 / (parseInt(percent) / 100)) *
            (1 - parseInt(top) / 100) -
          width * (0.5 / (parseInt(percent) / 100))
        ).toFixed(0)
      ),
    });
    const buffer = await resize.toBuffer();

    if (!existsSync("./dalleconfig.json")) {
      writeFileSync("./dalleconfig.json", JSON.stringify({}));
    }

    // read dalle key from config file
    const dalleKey = JSON.parse(readFileSync("./dalleconfig.json").toString())[interaction.user.id];

    if(!dalleKey) {
      await interaction.editReply({
        content: "You need to set your dalle key. You can use /dalleusage to set your key, or ask someone to share their key with you using /dalleusage config:true",
      });
      return
    }

    const buffers = await dalle(
      interaction,
      prompt,
      new Dalle(dalleKey),
      await sharp(buffer).png().resize(1024, 1024, { fit: "fill" }).toBuffer()
    );
    await interaction.editReply({
      content: prompt,
      files: buffers.map(
        (buffer, index) =>
          new MessageAttachment(buffer, `generation${index}.jpeg`)
      ),
    });
  },
  slashCommand: async (client, interaction) => {
    return
  }
};
