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
import {
  downloadToBuffer,
  wombo,
} from "../../charaterBuilders/imageGenerators/wombo";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
import sharp from "sharp";

export const remixwithwombo: SlashCommand = {
  slashCommand: async (client, interaction) => {
    return;
  },
  commandSchema: {
    name: "remixwithwombo",
    type: 3,
  },

  contextCommand: async (
    client,
    interaction: MessageContextMenuInteraction | MessageComponentInteraction
  ) => {
    const targetmessage = interaction.isContextMenu()
      ? interaction.targetMessage
      : interaction.message;
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
      .setCustomId("remixwithwombo")
      .setTitle("remix with wombo");

    const style = new TextInputComponent()
      .setCustomId("style")
      .setLabel("What style? use /styles to view options")
      .setStyle("SHORT")
      .setValue("32");

    const level = new TextInputComponent()
      .setCustomId("level")
      .setLabel("HIGH|MEDIUM|LOW, What level?")
      .setStyle("SHORT")
      .setValue("MEDIUM");

    const informationValueRow: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        style
      ) as any as MessageActionRow<TextInputComponent>;

    const informationValueRow2: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        level
      ) as any as MessageActionRow<TextInputComponent>;

    modal.addComponents(
      informationValueRow,
      informationValueRow2,
      informationValueRow4,
      informationValueRow5
    );

    await interaction.showModal(modal);
  },
  modalSubmit: async (client, interaction) => {
    const imageUrl = interaction.fields.getTextInputValue("imageUrl");
    const prompt = interaction.fields.getTextInputValue("prompt");
    const style = interaction.fields.getTextInputValue("style");
    const level = interaction.fields.getTextInputValue("level");
    if (!["HIGH", "MEDIUM", "LOW"].includes(level)) {
      await interaction.editReply("level must be one of HIGH, MEDIUM, LOW");
      return;
    }
    if (
      await WomboDreamApi.buildDefaultInstance()
        .fetchStyles()
        .then((styles) => !styles.map((s: any) => `${s.id}`).includes(style))
    ) {
      await interaction.editReply("style must be one of the valid styles");
      return;
    }

    const buffers = await wombo(
      interaction,
      prompt,
      level as "HIGH" | "MEDIUM" | "LOW",
      parseInt(style),
      await sharp(await downloadToBuffer(imageUrl))
        .png()
        .toBuffer()
    );
    const message = await interaction.editReply({
      content: null,

      files: [new MessageAttachment(buffers[0], `generation.png`)],
      embeds: [
        {
          title: prompt.slice(0, 200) + "...",
          fields: [
            {
              name: "Seed",
              value: "remix",
              inline: true,
            },
          ],
          image: {
            url: `attachment://generation.png`,
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
          .setLabel("Host Node")
          .setStyle("LINK")
          .setURL(
            "https://colab.research.google.com/drive/1xxypspWywNT6IOnXdSQz9phL0MRPhPCp?usp=sharing"
          ),
        new MessageButton()
          .setLabel("Original Image")
          .setStyle("LINK")
          .setURL(imageUrl)
      ),
    ]);
  },
};
