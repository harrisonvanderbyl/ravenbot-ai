import { CommandInteraction } from "discord.js";
import { app } from "../webserver/express";
// This is a decentralized generator that allows for anyone to deploy a generator to lighten the server.
// TODO: create client and implement security
const promptlist: {
  [key: string]: {
    prompt: string;
    callback: (imagedata: string) => Promise<void>;
    timeout: number;
  };
} = {};

app.get("/sdlist", (req, res) => {
  const top = Object.entries(promptlist).filter(([key, value]) => {
    return value.timeout < Date.now();
  })[0];

  if (!top) {
    return res.send("{}");
  }
  const { prompt, callback, timeout } = top[1];
  const id = top[0];
  promptlist[id].timeout = Date.now() + 120 * 1000; // 2 minutes
  return res.send(
    JSON.stringify({
      prompt,
      id,
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
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

export const stable = async (
  interaction: CommandInteraction,
  prompt: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const id = interaction.id;
    promptlist[id] = {
      prompt,
      callback: async (imagedata: string) => {
        resolve(Buffer.from(imagedata, "base64"));
      },
      timeout: 0,
    };
  });
};
