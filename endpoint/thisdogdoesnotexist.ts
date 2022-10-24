import { app } from "../commands/slashCommands/webserver/express";
import * as API from "../commands/slashCommands/sdhelpers/myApi";

export const initdog = () =>
  app.get("/thisdogdoesnotexist.webp", (req, res) => {
    const api = new API.Api();
    api.v2
      .postSyncGenerate({
        nsfw: false,
        censor_nsfw: true,
        prompt: "A cut doggo",
      })
      .then((t) => t.generations?.[0].img)
      .then((t) => {
        if (!t) throw new Error("No image found");
        return t;
      })
      .then((img) => Buffer.from(img, "base64"))
      .then((img) => res.setHeader("Content-Type", "image/webp").send(img))
      .catch((res) => res.status(500).send("Error"));
  });
