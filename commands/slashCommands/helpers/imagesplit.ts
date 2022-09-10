import sharp from "sharp";

export const split = async (buffer: Buffer, num: 1 | 4 | 9 | 81) => {
  // Split using sharp
  const obj = sharp(buffer);
  const { width, height } = await obj.metadata();
  const splitWidth = width / Math.sqrt(num);
  const splitHeight = height / Math.sqrt(num);
  const buffers: Buffer[] = [];
  for (let i = 0; i < Math.sqrt(num); i++) {
    for (let j = 0; j < Math.sqrt(num); j++) {
      buffers.push(
        await obj
          .extract({
            left: j * splitWidth,
            top: i * splitHeight,
            width: splitWidth,
            height: splitHeight,
          })
          .png()
          .toBuffer()
      );
    }
  }
  return buffers;
};
