import { CommandInteraction, MessageEmbed, MessageEmbedOptions } from "discord.js";

import { app } from "../webserver/express";

// This is a decentralized generator that allows for anyone to deploy a generator to lighten the server.
// TODO: create client and implement security
const promptlist: {
  [key: string]: {
    prompt: string;
    callback: (imagedata: string) => Promise<void>;
    update: (updatetext: string) => Promise<void>;
    updateNetworkStats: (data:MessageEmbedOptions[]) => Promise<void>;
    timeout: number;
    seed: string;
    samples: string;
    progress: string;
  };
} = {};

const peers: {
  [key: string]: {
    name: "string";
    lastseen: number;
  };
} = {};

app.get("/sdlist", (req, res) => {
  peers[req.ip ?? "unknown"] = {
    name: req.headers.name ?? "unknown",
    lastseen: Date.now(),
  };

  const top = Object.entries(promptlist).filter(([key, value]) => {
    return value.timeout < Date.now();
  })[0];

  if (!top) {
    return res.send("{}");
  }
  const { prompt, callback, timeout, samples, seed } = top[1];
  const id = top[0];
  promptlist[id].timeout = Date.now() + 120 * 1000; // 2 minutes
  return res.send(
    JSON.stringify({
      prompt,
      id,
      samples,
      seed,
    })
  );
  //res.send(JSON.stringify(Object.entries(promptlist)
});

app.post("/upload/:id", async (req, res) => {
  try {
    console.log(req.params.id, "upload");
    console.log(req.body, "upload");

    const id = req.params.id;
    const { prompt, callback } = promptlist[id];
    const imagedata = req.body;
    await callback(imagedata);

    delete promptlist[id];
    await updateNetworkStats();
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    console.log(req.params.id, "update");
    console.log(req.body, "update");

    const id = req.params.id;
    promptlist[id].progress = req.body;
    await updateNetworkStats();

    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

const updateNetworkStats = async ()=>{
    for (const [key, value] of Object.entries(promptlist)) {
      await value.updateNetworkStats(
        [
            {
                title: "Stats",
                footer:{
                    text: "Peers:"+Object.entries(peers).filter(([a,b])=>b.lastseen>Date.now()-1000*60).map(([a,b])=>b.name+"("+a+")").join(", ")
                },
                description: 
                `Deploy your own [node](https://github.com/harrisonvanderbyl/SD)
                Support me on [patreon](https://www.patreon.com/unexplored_horizons/)
                `,
                fields: [
                    {
                        name: "Status",
                        value: promptlist[key].progress,
                        inline: true
                    },
                    {
                        name: "Seed",
                        value: promptlist[key].seed.replace(".",""),
                        inline: true
                    },
                    {
                        name: "Peers",
                        value: Object.values(peers).filter(m=>m.lastseen>Date.now()-1000*60).length.toFixed(0),
                        inline: true
                    },
                    {
                        name: "Pending",
                        value: Object.keys(promptlist).length.toFixed(0),
                        inline: true
                    }
                    
                ]
            }
        ]
      );
    }
}

export const stable = async (
  interaction: CommandInteraction,
  prompt: string,
  seed:string
): Promise<Buffer> => {
  const promise:Promise<Buffer> = new Promise((resolve, reject) => {
    const id = interaction.id;
    promptlist[id] = {
      prompt,
      callback: async (imagedata: string) => {
        resolve(Buffer.from(imagedata, "base64"));
      },
      update: async (updatetext: string) => {
        interaction.editReply({
          content: updatetext,
        });
      },
      updateNetworkStats: async (data) => {await interaction.editReply({
        embeds: data})},

      timeout: 0,
      // use rand to generate a seed for the generator
      seed,
      samples: (interaction.options.get("samples")?.value as string) || "20",
        progress: "Pending",
    };
  })

  await updateNetworkStats();
    
  return promise;
};
