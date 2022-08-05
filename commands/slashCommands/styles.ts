import * as WomboDreamApi from "wombo-dream-api";

import { SlashCommand } from "./typing";

export const styles: SlashCommand = {
  slashCommand: async (client, interaction) => {
    // get styles

    const styles =
      (await WomboDreamApi.buildDefaultInstance().fetchStyles()) as any;

    console.log(styles);

    const buttons = styles.map((style: any) => ({
      type: "BUTTON",

      custom_id: style.id,
      style: "PRIMARY",
      label: style.id + " : " + style.name,
    }));
    const components:any = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const chunk = buttons.slice(i, i + 5);
      components.push({ components: chunk, type: "ACTION_ROW" });
      // do whatever
    }
    const outMessage = await interaction.editReply({
      content: "Available Styles, Click to view",
      components: components,
    });
    const collector = outMessage.createMessageComponentCollector({
      time: 12000,
    });
    collector.on("end", async (m) => {
      outMessage.delete();
    });
    collector.on("collect", async (i) => {
      const style = styles.find((s) => `${s.id}` == i.customId);
      if (!style) return;
      await i.update({
        content: "Available Styles, Click to view",
        embeds: [
          {
            title: style.name,
            description: "number: " + style.id,
            image: {
              url: style.photo_url,
            },
          },
        ],
        components: components,
      });
      return;
    });
  },
  commandSchema: {
    name: "styles",
    description: "list wombo styles",
  },
  contextCommand: async (interaction) => {
    return;
  },
  modalSubmit: async (interaction) => {
    return;
  },
};
