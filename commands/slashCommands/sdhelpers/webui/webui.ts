import { MessageAttachment, TextChannel } from "discord.js";
import { readFileSync } from "fs";
import { client } from "../../../client";
import { app } from "../../webserver/express";
import { compileNetworkStats, stable } from "../sdhelpers";
export const startWebUi = ()=>{
app.get("/webui/",(req,res)=>{
    // set to html
    res.setHeader("Content-Type","text/html");
    res.send(readFileSync(__dirname+"/web.html"));
})
app.get("/webui/ping", (req, res) => {
    res.send(compileNetworkStats(req.query.job))
})

app.post("/webui/image",async (req,res)=>{
    const {prompt,num_outputs,num_inference_steps,guidance_scale,width,height,seed} = (req.body);

    
    const c = (await client.channels.fetch(
        "1019524093067939882"
      )) as TextChannel;
      const message = await c.send("Someone used the webui to generate a picture...");
     
      const dream = prompt
      
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
      ).catch(e=>null);
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
                  value: seed,
                  inline: true,
                },
              ],
              image: {
                url: `attachment://generation.png`,
              },
            },
          ],
        });
        res.send("<img>"+message.embeds[0].image.url+"</img>");
    }



})}