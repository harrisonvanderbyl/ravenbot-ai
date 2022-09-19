import { MessageAttachment, TextChannel } from "discord.js";
import { readFileSync } from "fs";
import { client } from "../../../client";
import { addToolbar } from "../../helpers/buttons";
import { split } from "../../helpers/imagesplit";
import { app } from "../../webserver/express";
import { compileNetworkStats, stable } from "../sdhelpers";
export const startWebUi = () => {
  app.get("/webui/", (req, res) => {
    // set to html
    res.setHeader("Content-Type", "text/html");
    res.send(readFileSync(__dirname + "/web.html"));
  });
  app.get("/webui/ping", (req, res) => {
    res.send(compileNetworkStats(req.query.job));
  });

  app.post("/webui/image", async (req, res) => {
    const {
      prompt,
      num_outputs,
      num_inference_steps,
      guidance_scale,
      width,
      height,
      seed,
    } = req.body;
    console.log({
      prompt,
      num_outputs,
      num_inference_steps,
      guidance_scale,
      width,
      height,
      seed,
    });

    const c = (await client.channels.fetch(
      "1019524093067939882"
    )) as TextChannel;
    const message = await c.send(
      "Someone used the webui to generate a picture..."
    );

    const dream = prompt;

    const buffers = await stable(
      { id: message.id, fetchReply: () => message } as any,
      dream,
      `${seed}`,
      undefined,
      undefined,
      true,
      `${width}`,
      `${height}`,
      `${num_outputs}`,
      undefined,
      `${num_inference_steps}`,
      undefined,
      message,
      `${guidance_scale}`
    ).catch((e) => null);
    if (!buffers) {
      await message.edit({
        content: "failed to dream",
        embeds: null,
      });
      res.send("failed to dream");
    } else {
      await message.edit({
        content: null,
        files: [new MessageAttachment(buffers, "generation.png")],
        embeds: [
          {
            title: dream.slice(0, 250) + "...",
            fields: [
              {
                name: "Seed",
                value: `${seed}`,
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
        message,
        await split(buffers, Number(num_outputs) as 1 | 4 | 9 | 81),
        [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                style: "LINK",
                label: "Webui",
                url: "https://writerbot.selkiemyth.com/webui/",
              },
            ],
          },
        ]
      );
      res.send(
        "<h1>Please use the discord for NSFW</h1><h4>We can all see you searching up porn stars, the generations here are public and available to see in the discord server</h4><img src='" +
          message.embeds[0].image.url +
          "'><a href='" +
          message.url +
          "'>View in discord</a>"
      );
    }
  });
};
