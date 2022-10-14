import * as womboDreamApi from "wombo-dream-api";

import axios from "axios";
import { client } from "./client";
import commands from "./slashCommands";
import config from "../config/config.json";
import { prompt } from "inquirer";
import { writeFileSync } from "fs";
import { MessageActionRow, MessageButton } from "discord.js";
const headers = {
  Authorization: "Bot " + config.token,
};
export const url = (guildID?: string) =>
  `https://discord.com/api/v10/applications/774799595570069534/${
    guildID ? `guilds/${guildID}/` : ""
  }commands`;

export const getGuildCommands = async (
  guildID
): Promise<
  {
    name: string;
    description: string;
    options: { name: string; description: string }[];
  }[]
> =>
  axios.get(url(guildID), { headers }).then(({ data }) =>
    data.map((d) => ({
      name: d.name,
      description: d.description,
      options:
        Object.values(commands).find((e) => e.commandSchema.name == d.name)
          ?.commandSchema?.options ?? [],
    }))
  );
// Finally, Ravenbot Begins
client.on("ready", async () => {
  writeFileSync(
    "./styles.json",
    JSON.stringify(await womboDreamApi.buildDefaultInstance().fetchStyles())
  );
  const runinterface = async () => {
    const details: { url: string; commandName: string } = {
      url: "",
      commandName: "",
    };

    //pb = 997631743425265794

    const { action } = await prompt({
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        {
          name: "Create or Update an existing command",
          value: "create",
        },
        {
          name: "Delete an existing command",
          value: "delete",
        },
        {
          name: "List all commands",
          value: "list",
        },
        {
          name: "Manage servers",
          value: "servers",
        },
      ],
    });
    const { scope } = await prompt({
      type: "list",
      name: "scope",
      message: "What is the command scope?",
      choices: ["global", "guild"],
    });
    if (scope === "guild") {
      const { guildID } = await prompt({
        type: "list",
        name: "guildID",
        message: "What is the guild ID?",
        choices: (
          await client.guilds.fetch()
        ).map((g) => ({ value: g.id, name: g.name })),
      });
      details.url = url(guildID);
    } else {
      details.url = url();
    }
    if (action === "create") {
      const { command } = await prompt({
        type: "list",
        name: "command",
        message: "What is the command name?",
        choices: Object.values(commands).map((c) => c.commandSchema.name),
      });

      details.commandName = command;

      axios
        .post(
          details.url,
          Object.values(commands).find(
            (c) => c.commandSchema.name == details.commandName
          )?.commandSchema,
          { headers }
        )
        .then((response) => console.log(JSON.stringify(response.data)))
        .catch((e) => console.log(JSON.stringify(e.response.data)));
    } else if (action === "delete") {
      const { commandlist } = await prompt({
        type: "checkbox",
        name: "commandlist",
        message: "What is the command name?",
        choices: await axios
          .get(details.url, { headers })
          .then((r) => r.data.map((c) => ({ value: c.id, name: c.name }))),
      });
      for (const command of commandlist) {
        // eait 1 second for the command to be deleted
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await axios
          .delete(details.url + "/" + command, { headers })
          .then((response) => console.log(JSON.stringify(response.data)))
          .catch((e) => console.log(JSON.stringify(e.response.data)));
      }
    } else if (action === "list") {
      await axios
        .get(details.url, { headers })
        .then(({ data }) => ({
          data: data.map((d) => ({
            name: d.name,
            description: d.description,
            id: d.id,
          })),
        }))
        .then((response) => {
          console.table(response.data);
        });
    } else if (action === "servers") {
      const { guildID } = await prompt({
        type: "list",
        name: "guildID",
        message: "What is the guild ID?",
        choices: (
          await client.guilds.fetch()
        ).map((g) => ({ value: g.id, name: g.name })),
      });
      const { action } = await prompt({
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: [
          {
            name: "view owner",
            value: "owner",
          },
          {
            name: "create invite",
            value: "invite",
          },
          {
            name: "leave",
            value: "leave",
          },
        ],
      });
      if (action === "leave") {
        await client.guilds.fetch(guildID).then((g) => g.leave());
      } else if (action === "owner") {
        await client.guilds.fetch(guildID).then((g) => console.log(g.ownerId));
      } else if (action === "invite") {
        const url = await client.guilds.fetch(guildID).then(async (g) => {
          const dm = await g.fetchOwner().then((o) => o.createDM());

          const message = await dm.send({
            content: `The owner of this bot would like to join ${g.name} to investigate a bug or to test its funtionality`,
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId("allow")
                  .setLabel("Thats fine!")
                  .setStyle("SUCCESS")
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId("deny")
                  .setLabel("No! This server has private information!")
                  .setStyle("DANGER")
              ),
            ],
          });
          message
            .awaitMessageComponent({
              filter: (i) => i.user.id === g.ownerId,
              time: 60000,
            })
            .then(async (i) => {
              if (i.customId === "allow") {
                await i.update({ components: [] });
                return (
                  await g.invites.create(
                    await g.channels
                      .fetch()
                      .then(
                        (c) =>
                          c
                            .map((c) => (c && c.isText() ? c : null))
                            .filter((c) => c)[0]
                      )
                  )
                ).url;
              } else {
                await i.update({ components: [] });
                return "nah";
              }
            })
            .then((url) => {
              console.log(url);
            });
        });
        console.log(url);
      }
    }
    await runinterface();
  };
  runinterface();
});
client.login(config.token);
