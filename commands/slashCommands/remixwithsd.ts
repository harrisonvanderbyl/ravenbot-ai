import * as WomboDreamApi from "wombo-dream-api";

import {
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageContextMenuInteraction,
  Modal,
  TextInputComponent,
} from "discord.js";
import {
  downloadToBuffer,
  wombo,
} from "../../charaterBuilders/imageGenerators/wombo";

import { SlashCommand } from "./typing";
import sharp from "sharp";
import { stable } from "./sdhelpers/sdhelpers";

export const remixwithsd: SlashCommand = {
  slashCommand: async (client, interaction) => {
    return;
  },
  commandSchema: {
    name: "remixwithsd",
    type: 3,
  },

  contextCommand: async (
    client,
    interaction: MessageContextMenuInteraction
  ) => {
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
      .setCustomId("remixwithsd")
      .setTitle("remix with stable diffusion");

    const level = new TextInputComponent()
      .setCustomId("level")
      .setLabel("Influence level (0.0-1.0)")
      .setStyle("SHORT")
      .setValue("0.8");

    const informationValueRow2: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        level
      ) as any as MessageActionRow<TextInputComponent>;

    modal.addComponents(
      informationValueRow2,
      informationValueRow4,
      informationValueRow5
    );

    await interaction.showModal(modal);
  },
  modalSubmit: async (client, interaction) => {
    const imageUrl = interaction.fields.getTextInputValue("imageUrl");
    const prompt = interaction.fields.getTextInputValue("prompt");
    const level = interaction.fields.getTextInputValue("level");
    if (Number(level) < 0.0 || Number(level) > 1.0) {
      await interaction.editReply("level must be between 0.0 and 1.0");
      return;
    }

    const buff = await stable(
      interaction,
      prompt,
      "12345",
      await sharp(await downloadToBuffer(imageUrl))
        .jpeg()
        .toBuffer()
        .then((b) => b.toString("base64")),
      level,
      true
    ).catch(async (e) => {
      console.log(e);
      await interaction.followUp({ content: "error: " + e, ephemeral: true });
      return null;
    });
    if (buff == null) {
      return;
    }
    await interaction.editReply({
      content: null,

      files: [new MessageAttachment(buff, `generation.jpeg`)],
      embeds: [
        {
          title:
            (interaction.options.get("prompt").value as string).slice(0, 200) +
            "...",
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
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Patreon")
            .setStyle("LINK")
            .setURL("https://patreon.com/unexplored_horizons"),
          new MessageButton()
            .setLabel("Host Node")
            .setStyle("LINK")
            .setURL("https://github.com/harrisonvanderbyl/SD")
        ),
      ],
    });
  },
};
