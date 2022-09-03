import { existsSync, readFileSync, writeFileSync } from "fs";

import { createImage } from "../wombo";
import express from "express";

enum Age {
  //  TEENAGER = "teenage",
  YOUNG = "young",
  ADULT = "adult",
  OLD = "OLD",
}

const imagePrompt = (
  gender: "male" | "female" | "androgynous",
  hairColor: string,
  eyeColor: string,
  skinColor: string,
  age: Age
) =>
  `portrait of a ${age} ${gender} human with ${hairColor} hair and ${skinColor} skin closed eyes fantasy artwork epic detailed and intricate digital painting trending on artstation by wlop octane render`;

// Elemental affinity is really just akashic knowledge they have access to because of family ties to acended entities who left there mark in the akasha when they left

const bloodlines = {
  phoenix: {
    hair: "red",
    skin: "light",
    eyes: "bright",
  },
  wolf: {
    hair: "brunette",
    eyes: "brown",
    skin: "light",
  },
  fox: {
    hair: "orange",
    eyes: "brown",
    skin: "light",
  },
  bear: {
    hair: "brown",
    eyes: "brown",
    skin: "dark",
  },
  dragon: {
    hair: "no",
    eyes: "blue",
    skin: "scaled",
  },
  peacock: {
    hair: "rainbow",
    eyes: "rainbow",
    skin: "light",
  },
};

type Person = {
  name: string;
  age: Age;
  gender: "male" | "female" | "androgynous";
  bloodline: keyof typeof bloodlines;
  personality: string;
  cultivation: string;
  picture: string; // Base 64 buffer of image
  parents: Person[];
};

const chooseFromArray = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const createPerson = async (
  parents?: Person[],
  age = parents
    ? parents[0].age == Age.ADULT
      ? Age.YOUNG
      : Age.ADULT
    : chooseFromArray(Object.values(Age))
): Promise<Person> => {
  const init: Person = {
    name: "",
    age,
    bloodline: parents
      ? chooseFromArray(parents.map((b) => b.bloodline))
      : chooseFromArray(Object.keys(bloodlines) as (keyof typeof bloodlines)[]),
    cultivation: "",
    personality: "",
    picture: "",
    gender: chooseFromArray(["male", "female", "androgynous"]),
    parents: parents ?? [],
  };

  const looks = bloodlines[init.bloodline];

  init.picture = (
    await createImage(
      imagePrompt(init.gender, looks.hair, looks.eyes, looks.skin, init.age),
      "HIGH",
      32
    )
  ).buffer.toString("base64");

  return init;
};

const app = express();

// app.get("/:filename/:name", async (req, res) => {
//   const filename = "./characters/" + req.params.filename + ".json";
//   if (!existsSync(filename)) {
//     await createPerson().then((d) =>
//       writeFileSync(filename, JSON.stringify(d))
//     );
//   }

//   const file = readFileSync(filename, {
//     encoding: "utf-8",
//   });
//   const data = JSON.parse(file);

//   res.send(
//     `
//     <div>
//     <div>
//     age:${data.age}
//     bloodline:${data.bloodline}
//     gender:${data.gender}
//     image:
//     </div>
//     <img src='data:image/jpeg;base64, ${data.picture}'>
//     </div>
//     `
//   );
// });

// app.listen(3000, () => {
//   console.log("listen");
// });

// 200 people
// 10 families of 10 people each
// 10 families of 5 people each
// 10 families of 3 people each
// 10 families of 2 people each
// 10 families of 1 person each
