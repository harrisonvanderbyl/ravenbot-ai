// import { BaseCommandInteraction, MessageAttachment } from "discord.js";
// import { Configuration, OpenAIApi } from "openai";
// import { GenerationService, GenerationServiceClient } from "./bull/service";
// import { writeFile, writeFileSync } from "fs";

// import fetch from "node-fetch";

// const configuration = new Configuration({
//   apiKey: api,
//   basePath: "https://lab.dreamstudio.ai/apl/v1",
// });
// const openai = new OpenAIApi(configuration);

// openai.listEngines().then((data) => {
//   console.log(data);
// });

// const client = new GenerationServiceClient(GenerationService, {});
// client.generate("test").then((data) => {
//   console.log(Object.keys(data));
// });

// openai
//   .createCompletion("gpt-j-6b", {
//     prompt: `Roses are red `,
//     max_tokens: 25,
//   })
//   .then((completion) => console.log(completion.data.choices[0].text));
