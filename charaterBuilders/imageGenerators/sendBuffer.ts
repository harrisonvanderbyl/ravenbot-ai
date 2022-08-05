// repmessage.editReply({
//     content: prompt,
//     files: await Promise.all(
//       buffers.map(async (gen, i): Promise<MessageAttachment> => {
//         return new MessageAttachment(gen, `${i + 1}.jpeg`);
//       })
//     ),
//     embeds: buffers.map((gen, i) => {
//       return {
//         title: `Generation ${i + 1}`,
//         image: {
//           url: "attachment://" + (i + 1) + ".jpeg",
//         },
//       };
//     }),
//   });
