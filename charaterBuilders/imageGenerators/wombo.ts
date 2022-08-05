import * as WomboDreamApi from "wombo-dream-api";

import {
  BaseCommandInteraction,
  Interaction,
  Message,
  MessageAttachment,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { existsSync, readFileSync } from "fs";

import axios from "axios";
import sharp from "sharp";

const uploadImage = async (
  instance: WomboDreamApi.WomboDream.WomboDream,
  imageData: Buffer | undefined
) => {
  return imageData ? instance.uploadImage(imageData) : undefined;
};

export const downloadToBuffer = async (imageUrl: string): Promise<Buffer> => {
  return (
    await axios.get(imageUrl, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
  ).data;
};

const createImage = async (
  loadingMessage: BaseCommandInteraction | ModalSubmitInteraction,
  prompt: string,
  level: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM",
  style: number = 10,
  imageData?: Buffer,
  memberID = loadingMessage.user.id ?? "default",
  makeButtons = true
) => {
  const instance = WomboDreamApi.buildDefaultInstance();

  if (
    !(await instance.fetchStyles()).map((s: any) => s.id).includes(style) 
  ) {
    throw "Please select a valid type";
  }

  var stuckchecker = -1;
  var timesstuck = 0;

  return await uploadImage(instance, imageData).then((uploadedImageInfo) => {
    const layerUrls = [];
    return instance
      .generatePicture(
        prompt,
        style,
        (task) => {
          if (
            stuckchecker == task.photo_url_list.length &&
            task.photo_url_list.length > 0
          ) {
            timesstuck++;
          } else {
            timesstuck = 0;
          }
          if (timesstuck > 5) {
            throw "Stuck";
          }
          stuckchecker = task.photo_url_list.length;
        },
        imageData
          ? {
              mediastore_id: uploadedImageInfo?.id ?? "",
              weight: level,
            }
          : undefined,
        undefined,
        undefined,
        true
      )
      .then(async (task) => {
        return downloadToBuffer(task.result.final).then((buff) => ({
          buffer: buff,
          urls: task.photo_url_list,
        }));
      })
      .catch((err) => {
        throw "something went wrong";
      });
  });
};

export const wombo = async (
  loadingMessage: BaseCommandInteraction | ModalSubmitInteraction,
  prompt: string,
  level: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM",
  style: number = 10,
  imageData?: Buffer,
  memberID = loadingMessage.user.id ?? "default",
  makeButtons = true
) => {
  //14
  const firstBuffer = await createImage(
    loadingMessage,
    prompt,
    level,
    style,
    imageData,
    memberID,
    makeButtons
  ).catch((err) => {
    throw err;
  });
  const buffers = [firstBuffer];

  return buffers.map((buffer) => buffer.buffer);
};