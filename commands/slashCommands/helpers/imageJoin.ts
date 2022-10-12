import joinImages from "join-images";

export const imageJoin = async (buffers: Buffer[], isCompressed = false) =>
  buffers.length == 1
    ? buffers[0]
    : buffers.length == 4
    ? Promise.all([
        joinImages([buffers[0], buffers[1]], {
          direction: "horizontal",
        }).then((buff) => buff.png().toBuffer()),
        joinImages([buffers[2], buffers[3]], {
          direction: "horizontal",
        }).then((buff) => buff.png().toBuffer()),
      ])
        .then((buffers) => joinImages(buffers, { direction: "vertical" }))
        .then((buff) => buff.png().toBuffer())
    : Promise.all([
        joinImages([buffers[0], buffers[1], buffers[2]], {
          direction: "horizontal",
        }).then((buff) => buff.png().toBuffer()),
        joinImages([buffers[3], buffers[4], buffers[5]], {
          direction: "horizontal",
        }).then((buff) => buff.png().toBuffer()),
        joinImages([buffers[6], buffers[7], buffers[8]], {
          direction: "horizontal",
        }).then((buff) => buff.png().toBuffer()),
      ])
        .then((buffers) => joinImages(buffers, { direction: "vertical" }))
        .then((buff) =>
          isCompressed
            ? buff.jpeg({ quality: 90 }).toBuffer()
            : buff.png().toBuffer()
        );
