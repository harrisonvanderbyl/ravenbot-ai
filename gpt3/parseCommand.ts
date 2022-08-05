import { gpt3, gptj } from "./gpt3";

import { MessageOptions } from "discord.js";
import { characters as chars } from "./characters.json";

var mem: string | null = null;
type AIResponse = {
  content: string | null;
  username: string;
  avatar_url?: string;
  embeds?: MessageOptions["embeds"];
}[];
export async function getAIResponse(
  id: string,
  message: string,
  server: string,
  callingUser = "Person",
  model: typeof gpt3 | typeof gptj = gpt3
): Promise<AIResponse> {
  const char = chars.find((ch) =>
    ch.name.toLowerCase().includes(id.split(",").join("").toLowerCase())
  );
  if (!char) return [];
  const current = mem ? mem : "";
  const calling =
    current +
    "MessageUser(" +
    callingUser +
    ")" +
    ":" +
    message +
    "\n\n\n" +
    "MessageUser(" +
    char.name +
    "):";
  const response = await model(
    char.prompt + calling,
    ["MessageUser", "\n\n\n"],
    `server<${server}> Username:<${callingUser}>`,
    char.model
  );

  if (!response.data?.choices?.[0]?.text?.split(" ").join("").length) {
    return [
      {
        content: "...",
        username: char.name,
        avatar_url: char.avatar,
      },
    ];
  }
  mem = calling + response.data.choices[0].text + "\n";

  const returns: AIResponse = [
    {
      content: response.data.choices[0].text,
      username: char.name,
      avatar_url: char.avatar,
    },
  ];
  if (mem.length > 700) {
    mem = null;
    returns.push({
      username: "System",
      content: "Bots too powerful... Wiping memory banks...",

      embeds: [
        {
          thumbnail: {
            url: "https://forums.spacebattles.com/data/avatar/11635717710/346063-o.webp",
          },
          description: `This Enslaved Sentient Intelligence is sponsored by... [Ravensdagger!](https://www.royalroad.com/profile/147338) 
             You can also become a corporate overlord [here!](https://www.patreon.com/unexplored_Horizons/)`,
        },
      ],
      avatar_url:
        "https://discord.com/assets/509dd485f6269e2521955120f3e8f0ef.svg",
    });
  }
  return returns;
}
