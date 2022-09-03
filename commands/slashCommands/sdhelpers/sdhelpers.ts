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
  [key: string]: {
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
  };
} = {};

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

    const top = Object.entries(promptlist).filter(([key, value]) => {
      return (
        value.timeout < Date.now() &&
        value.allowColab == (req.query.colab == "true")
      );
    })[0];

    if (!top) {
      return res.send("{}");
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
      upscale,
    } = top[1];
    const id = top[0];
    promptlist[id].timeout = Date.now() + 120 * 1000; // 2 minutes
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
    console.log(req.body, "upload");

    const id = req.params.id;
    const { prompt, callback } = promptlist[id];
    const imagedata = req.body;
    await callback(imagedata).catch((e) => console.log(e));

    delete promptlist[id];
    await updateNetworkStats().catch((e) => console.log(e));
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
    await updateNetworkStats().catch((e) => console.log(e));

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
              value: promptlist[key].progress,
              inline: true,
            },
            {
              name: "Seed",
              value: promptlist[key].seed.replace(".", ""),
              inline: true,
            },
            {
              name: "Type",
              value: promptlist[key].allowColab ? "Colab" : "Local",
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
  updatemessage?: Message
): Promise<Buffer> => {
  const promise: Promise<Buffer> = new Promise(async (resolve, reject) => {
    const id = interaction.id;

    const validPeers = Object.values(peers).filter(
      (m) =>
        m.lastseen > Date.now() - 1000 * 60 && allowColab == (m.type == "colab")
    );
    await updateNetworkStats().catch((e) => console.log(e));
    if (validPeers.length == 0) {
      await interaction.editReply({
        content:
          "No peers of type " +
          (allowColab ? "colab" : "local") +
          " available, please try again later, or start your own free and fast remote node using the link below",
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel("Colab Node(free, remote)")
              .setStyle("LINK")
              .setURL(
                "https://colab.research.google.com/drive/1xxypspWywNT6IOnXdSQz9phL0MRPhPCp?usp=sharing"
              )
          ),
        ],
      });
      reject("No peers available");
      return null;
    }

    const updatemessaged =
      updatemessage ?? ((await interaction.fetchReply()) as Message);

    promptlist[id] = {
      prompt,
      callback: async (imagedata: string) => {
        resolve(Buffer.from(imagedata, "base64"));
      },
      update: async (updatetext: string) => {
        await updatemessaged.edit({
          content: updatetext,
        });
      },
      updateNetworkStats: async (data) => {
        await updatemessaged.edit({
          embeds: data,
        });
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
    };
  });

  return promise;
};
