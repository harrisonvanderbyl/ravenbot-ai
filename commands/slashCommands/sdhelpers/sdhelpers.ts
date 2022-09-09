import {
  CategoryChannel,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  TextChannel,
} from "discord.js";

import { app } from "../webserver/express";
import { client } from "../../client";

// This is a decentralized generator that allows for anyone to deploy a generator to lighten the server.
// TODO: create client and implement security
const promptlist: {
  [key: string]:
    | {
        prompt: string;
        callback: (imagedata: string) => Promise<void>;
        update: (updatetext: string) => Promise<void>;
        updateNetworkStats: (data: MessageEmbedOptions[]) => Promise<void>;
        timeout: number;
        seed: string;
        samples: string;
        progress: string;
        input?: string;
        strength?: string;
        allowColab: boolean;
        width: string;
        height: string;
        iterations: string;
        mask?: string;
        upscale?: string;
        cfg: string;
      }
    | {
        rwky: true;
        prompt: string;
        callback: (imagedata: string) => Promise<void>;
        update: (updatetext: string) => Promise<void>;
        updateNetworkStats: (data: MessageEmbedOptions[]) => Promise<void>;
        timeout: number;
        temp: string;
        top: string;
        progress: string;
        seed: string;
        allowColab: boolean;
      };
} = {};

var lock = false;

const awaiters: ((a: any) => void)[] = [];

async function parselout() {
  const top = Object.entries(promptlist).filter(([key, value]) => {
    return value.timeout < Date.now();
  })[0];
  const next = awaiters.pop();
  if (next) {
    if (top) {
      console.log("assigning:" + top[0]);
      promptlist[top[0]].timeout = Date.now() + 1200 * 1000; // 2 minutes
    }
    next(top);
  }
}

// Do every 10 seconds
setInterval(parselout, 3 * 1);

const peers: {
  [key: string]: {
    name: "string";
    lastseen: number;
    type: "colab" | "local";
  };
} = {};

app.get("/sdlist", async (req, res) => {
  try {
    peers[req.ip ?? "unknown"] = {
      name: req.headers.name ?? "unknown",
      lastseen: Date.now(),
      type: req.query.colab == "true" ? "colab" : "local",
    };

    const channel = (
      (await client.channels.fetch("1011928316711817246")) as TextChannel
    ).setName(
      "Colab Nodes: " +
        Object.values(peers)
          .filter(
            (m) => m.lastseen > Date.now() - 1000 * 60 && m.type == "colab"
          )
          .length.toFixed(0)
    );

    const top: any = await new Promise((res, rej) => {
      awaiters.push(res);
    });

    if (!top) {
      return res.send("{}");
    }
    const ret = top[1];
    if (ret.hasOwnProperty("rwky")) {
      return res.send(
        JSON.stringify({
          id: top[0],
          prompt: ret.prompt,
          temp: ret.temp,
          top: ret.top,
          rwky: true,
        })
      );
    }
    const {
      prompt,
      callback,
      timeout,

      samples,
      seed,
      input,
      strength,
      width,
      height,
      iterations,
      mask,
      cfg,
      upscale,
    } = ret;
    const id = top[0];

    return res.send(
      JSON.stringify({
        prompt,
        id,
        samples,
        seed,
        input,
        strength,
        width,
        height,
        cfg,
        iterations,
        mask,
        upscale,
      })
    );
  } catch (e) {
    console.log(e);
    res.send("{}");
  }
  //res.send(JSON.stringify(Object.entries(promptlist)
});

app.post("/upload/:id", async (req, res) => {
  try {
    peers[req.ip ?? "unknown"] = {
      name: req.headers.name ?? "unknown",
      lastseen: Date.now(),
      type: req.query.colab == "true" ? "colab" : "local",
    };

    console.log(req.params.id, "upload");

    const id = req.params.id;
    const { prompt, callback } = promptlist[id];
    const imagedata = req.body;
    await callback(imagedata).catch((e) => console.log(e));

    delete promptlist[id];
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    console.log(req.params.id, "update");

    const id = req.params.id;
    promptlist[id].progress = req.body;

    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

const updateNetworkStats = async () => {
  for (const [key, value] of Object.entries(promptlist)) {
    await value
      .updateNetworkStats([
        {
          title: "Stats",

          fields: [
            {
              name: "Status",
              value: promptlist[key]?.progress,
              inline: true,
            },
            {
              name: "Seed",
              value: promptlist[key]?.seed.replace(".", ""),
              inline: true,
            },
            {
              name: "Type",
              value: promptlist[key]?.allowColab ? "Colab" : "Local",
            },
            {
              name: "Colab Nodes",
              value: Object.values(peers)
                .filter(
                  (m) =>
                    m.lastseen > Date.now() - 1000 * 60 && m.type == "colab"
                )
                .length.toFixed(0),
              inline: true,
            },

            {
              name: "Pending Colab",
              value: Object.values(promptlist)
                .filter((m) => m.allowColab == true)
                .length.toFixed(0),
              inline: true,
            },
          ],
        },
      ])
      .catch((e) => console.log(e));
  }
};
// Every 5 seconds
setInterval(updateNetworkStats, 5 * 1000);

export const stable = async (
  interaction: CommandInteraction,
  prompt: string,
  seed: string,
  img?: string,
  strength?: string,
  allowColab: boolean = true,
  width = "512",
  height = "512",
  iterations = "1",
  mask?: string,
  samples = "20",
  upscale?: string,
  updatemessage?: Message,
  cfg: string = "7.5"
): Promise<Buffer> => {
  const promise: Promise<Buffer> = new Promise(async (resolve, reject) => {
    const id = interaction.id;

    const validPeers = Object.values(peers).filter(
      (m) =>
        m.lastseen > Date.now() - 1000 * 60 && allowColab == (m.type == "colab")
    );
    if (validPeers.length == 0) {
      reject("No peers available");
      return null;
    }

    const updatemessaged =
      updatemessage ?? ((await interaction.fetchReply()) as Message);
    var resolved = false;
    promptlist[id] = {
      prompt,
      callback: async (imagedata: string) => {
        resolved = true;
        resolve(Buffer.from(imagedata, "base64"));
      },
      update: async (updatetext: string) => {
        if (!resolved) {
          await updatemessaged.edit({
            content: updatetext,
          });
        }
      },
      updateNetworkStats: async (data) => {
        if (!resolved) {
          await updatemessaged.edit({
            embeds: data,
          });
        }
      },

      timeout: 0,
      // use rand to generate a seed for the generator
      seed,
      samples,
      progress: "Pending",
      input: img,
      strength: strength,
      allowColab,
      width,
      height,
      iterations,
      mask,
      upscale,
      cfg,
    };
  });

  return promise;
};

export const rwky = async (
  interaction: CommandInteraction,
  prompt: string,
  temp: string,
  top: string,
  updatemessage?: Message
) => {
  const id = interaction.id;

  const validPeers = Object.values(peers).filter(
    (m) => m.lastseen > Date.now() - 1000 * 60
  );
  if (validPeers.length == 0) {
    return null;
  }

  const updatemessaged =
    updatemessage ?? ((await interaction.fetchReply()) as Message);
  var resolved = false;
  promptlist[id] = {
    prompt,
    callback: async (ret: string) => {
      resolved = true;
      await updatemessaged.edit({
        embeds: [
          {
            title: "Result",
            description: ret,
          },
        ],
      });
    },
    update: async (updatetext: string) => {
      if (!resolved) {
        await updatemessaged.edit({
          content: updatetext,
        });
      }
    },
    updateNetworkStats: async (data) => {
      if (!resolved) {
        await updatemessaged.edit({
          embeds: data,
        });
      }
    },

    timeout: 0,
    // use rand to generate a seed for the generator
    seed: "RWKV completion",
    temp,
    top,

    progress: "Pending",
    rwky: true,
    allowColab: true,
  };
};
