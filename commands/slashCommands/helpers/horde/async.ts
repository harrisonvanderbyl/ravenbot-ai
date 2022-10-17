import { createStatusSheet } from "../quicktools/createStatusSheet";

export const hordeGenerate = async (hordeApi, params, interaction) => {
  return await hordeApi.v2
    .postAsyncGenerate(params)
    .then((data): Promise<string[] | null> => {
      return new Promise<string[] | null>((resolve, reject) => {
        const checkItem = async () => {
          const res = await hordeApi.v2.getAsyncCheck(data.id);

          if (res.done) {
            hordeApi.v2
              .getAsyncStatus(data.id)
              .then((res) => resolve(res.generations.map((e) => e.img)));
            return;
          }

          const workers = await hordeApi.v2.getWorkers();

          await interaction.editReply({
            embeds: [
              createStatusSheet("Generation in progress", {
                "Status (🟢, 🟡, 🔴)": `${res.finished.toString()}/${res.processing.toString()}/${res.waiting.toString()}`,
                "Queue Position": res.queue_position.toString(),
                Elapsed: `<t:${(interaction.createdAt.getTime() / 1000).toFixed(
                  0
                )}:R>`,
                ETA: `<t:${(
                  new Date().getTime() / 1000 +
                  res.wait_time
                ).toFixed(0)}:R>`,
                "Active Workers": workers
                  .filter((f) => !f.paused)
                  .length.toFixed(0),
              }),
              ...(interaction.createdAt.getTime() + 1000 * 60 * 1 < Date.now()
                ? [
                    {
                      title: "StableHorde Currently Under Load",
                      description:
                        "StableHorde is currently under load, Stablehorde is a community driven stable diffusion botnet. You can help by running a worker. You can find more information [here](https://stablehorde.net).",
                    },
                  ]
                : []),
            ],
          });
          if (interaction.createdAt.getTime() + 1000 * 60 * 10 > Date.now()) {
            setTimeout(checkItem, 10000);
          } else {
            reject("Generation timed out");
          }
        };
        setTimeout(checkItem, 10000);
      });
    })
    .catch(async (e) => {
      await interaction.editReply({
        content: "Error generating image. Please try again later.",
        embeds: null,
      });
      await interaction.followUp({
        content: "```" + e + "```",
        ephemeral: true,
      });
      return null;
    });
};
