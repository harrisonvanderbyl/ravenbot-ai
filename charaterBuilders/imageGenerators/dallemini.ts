import { BaseCommandInteraction, MessageAttachment } from "discord.js";

import axios from "axios";

export const dallemini = async (
  repmessage: BaseCommandInteraction,
  prompt: string
) => {
  try {
    return await axios
      .post("https://backend.craiyon.com/generate", {
        prompt,
      })
      .then(async (data) => {
        try {
          const images = data.data.images;
          const buffers = (await Promise.all(
            images.map(
              async (image: string): Promise<Buffer> =>
                Buffer.from(image, "base64")
            )
          )) as Buffer[];

          return buffers;
        } catch (e) {
          console.log("Error", JSON.stringify(e));
          return Promise.reject(e);
        }
      })
      .catch((e) => {
        console.log("Error", JSON.stringify(e));
        return Promise.reject(e);
      });
  } catch (e) {
    console.log("Error", JSON.stringify(e));
    return Promise.reject(e);
  }
};
