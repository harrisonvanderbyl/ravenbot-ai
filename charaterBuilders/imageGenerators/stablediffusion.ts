import { diffusionMap } from "stability-ts/build/utils";
import { generate } from "stability-ts";
import { writeFileSync } from "fs";
export const StableDiffusion = async ({
  key,
  prompt,
  cfgScale,
  diffusion,
  height,
  samples,
  seed,
  steps,
  width,
}: {
  key: string;
  prompt: string;
  samples?: number;
  seed?: number;
  cfgScale?: number;
  diffusion?: keyof typeof diffusionMap;
  height?: number;
  width?: number;
  steps?: number;
}) => {
  return new Promise((resolve, reject) => {
    const api = generate({
      prompt,
      apiKey: key,
      noStore: true,
      samples,
      seed,
      cfgScale,
      diffusion,
      height,
      width,
      steps,
    });
    const buffers: Buffer[] = [];
    api.on("image", ({ buffer, filePath }) => {
      buffers.push(buffer);
    });

    api.on("end", () => {
      resolve(buffers);
    });
  });
};
