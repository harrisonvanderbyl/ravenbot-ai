import {
  Configuration,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import axios, { AxiosResponse } from "axios";

import { apikey } from "../config/config.json";

const configuration = new Configuration({
  apiKey: apikey,
});
const openai = new OpenAIApi(configuration);

export const gpt3 = async (
  prompt = "",
  stop: string[] | string | undefined = undefined, // Terminate at this string
  requestor = "HarrisonVanderbyl@gmail.com", // For complience, all requests need to send identifying infomation
  engine = "text-davinci-002"
) =>
  openai.createCompletion(engine, {
    prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    stop: stop,
    frequency_penalty: 1.2,
    presence_penalty: 1.2,
    user: requestor,
  });

export const gptj = async (
  prompt = "",
  stop: string[] | string | undefined = undefined, // Terminate at this string
  requestor = "H ", // For complience, all requests need to send identifying infomation
  engine = "text-davinci-002"
) =>
  axios
    .post(
      "https://api-inference.huggingface.co/models/EleutherAI/gpt-neox-20b",
      {
        inputs: prompt,
      }
    )
    .then(
      async (
        res
      ): Promise<Pick<AxiosResponse<CreateCompletionResponse>, "data">> => {
        return {
          data: {
            choices: (await res.data).map((d) => ({
              text: d.generated_text.replace(prompt, ""),
            })),
          },
        };
      }
    );
