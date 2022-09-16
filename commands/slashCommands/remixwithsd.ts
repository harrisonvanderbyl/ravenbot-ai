import * as WomboDreamApi from "wombo-dream-api";

import {
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageContextMenuInteraction,
  Modal,
  ModalSubmitInteraction,
  TextInputComponent,
} from "discord.js";
import {
  downloadToBuffer,
  wombo,
} from "../../charaterBuilders/imageGenerators/wombo";

import { SlashCommand } from "./typing";
import { addToolbar } from "./helpers/buttons";
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
      .setCustomId("remixwithsd")
      .setTitle("remix with stable diffusion");

    const level = new TextInputComponent()
      .setCustomId("level")
      .setLabel("Influence level (0.0-1.0)")
      .setStyle("SHORT")
      .setValue("0.8");

    const steps = new TextInputComponent()
      .setCustomId("steps")
      .setLabel("Number of steps")
      .setStyle("SHORT")
      .setValue("20");

    const informationValueRow2: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        level
      ) as any as MessageActionRow<TextInputComponent>;

    const informationValueRow3: MessageActionRow<TextInputComponent> =
      new MessageActionRow<TextInputComponent>().addComponents(
        steps
      ) as any as MessageActionRow<TextInputComponent>;
    modal.addComponents(
      informationValueRow2,
      informationValueRow4,
      informationValueRow3,
      informationValueRow5
    );

    await interaction.showModal(modal);
  },
  modalSubmit: async (client, interaction: ModalSubmitInteraction) => {
    const imageUrl = interaction.fields.getTextInputValue("imageUrl");
    const prompt = interaction.fields.getTextInputValue("prompt");
    const level = interaction.fields.getTextInputValue("level");
    const steps = interaction.fields.getTextInputValue("steps");
    if (Number(level) < 0.0 || Number(level) > 1.0) {
      await interaction.editReply("level must be between 0.0 and 1.0");
      return;
    }
    const image = sharp(await downloadToBuffer(imageUrl))

    const [w,h] =  await image.metadata().then((m) => [m.width,m.height]).then(([w,h])=>{
      const ww = Math.min(w,512)
      // Resize to keep aspect ratio
      return [ww,Math.min(Math.round(h*(ww/w)),1024)]
    }).then(m=>m.map(w=>Math.floor(w/64)*64)).then(([w,h])=>[`${w}`,`${h}`])
    const buff = await stable(
      interaction as any,
      prompt,
      (Math.random()*10000).toFixed(0),
        await image
        .png()
        .toBuffer()
        .then((b) => b.toString("base64")),
      level,
      true,
      w,h,
      "1",
      undefined,
      steps
    ).catch(async (e) => {
      console.log(e);
      await interaction.followUp({ content: "error: " + e, ephemeral: true });
      return null;
    });
    if (buff == null) {
      return;
    }
    const message = await interaction.editReply({
      content: null,

      files: [new MessageAttachment(buff, `generation.png`)],
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
            ),
          new MessageButton()
            .setLabel("Original Image")
            .setStyle("LINK")
            .setURL(imageUrl)
        ),
      ]
    );
  },
};
