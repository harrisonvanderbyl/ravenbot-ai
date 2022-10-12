import {
  BaseCommandInteraction,
  Interaction,
  Message,
  MessageAttachment,
} from "discord.js";

import axios from "axios";
import config from "../../config/config.json";
import request from "request";

export class Dalle {
  private bearerToken: string;
  private url: string;
  private crediturl = "https://labs.openai.com/api/labs/billing/credit_summary";
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.url = "https://labs.openai.com/api/labs/tasks";
  }

  async getUsage(): Promise<any> {
    return new Promise((resolve, reject) => {
      request.get(
        {
          url: this.crediturl,
          headers: {
            Authorization: "Bearer " + this.bearerToken,
          },
          json: true,
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            console.log(response.statusCode, body);
            if (response.body.error) {
              reject(response.body.error.message);
            }
            resolve(body);
          }
        }
      );
    });
  }

  async generate(
    promt,
    img?: Buffer
  ): Promise<{ generation: { image_path: string } }[]> {
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: this.url,
          headers: {
            Authorization: "Bearer " + this.bearerToken,
          },
          json: true,
          body: {
            task_type: img ? "inpainting" : "text2im",
            prompt: {
              caption: promt,
              batch_size: 4,
              ...(img
                ? {
                    masked_image: img.toString("base64"),
                    image: img.toString("base64"),
                  }
                : {}),
            },
          },
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            console.log(response.statusCode, body);
            if (response.body.error) {
              reject(response.body.error.message);
            }
            const taskId = body.id;

            const refreshIntervalId = setInterval(() => {
              request.get(
                {
                  url: this.url + "/" + taskId,
                  headers: {
                    Authorization: "Bearer " + this.bearerToken,
                  },
                  json: true,
                },
                (error, response, body) => {
                  if (error) {
                    reject(error);
                  } else {
                    if (body.status === "succeeded") {
                      const generations = body.generations;
                      clearInterval(refreshIntervalId);
                      resolve(generations.data);
                    } else if (body.status === "rejected") {
                      clearInterval(refreshIntervalId);
                      reject("Failed due to policy violation, Bonk!");
                    }
                  }
                }
              );
            }, 3000);
          }
        }
      );
    });
  }
}
