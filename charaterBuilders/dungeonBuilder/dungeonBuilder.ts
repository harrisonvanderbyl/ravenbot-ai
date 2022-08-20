import { writeFileSync } from "fs";

enum Sizes {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

enum CreatureStyles {
  "Tree" = "tree",
  "Flower" = "flower",
  "Fern" = "fern",
  "Grass" = "grass",
  "Mushroom" = "mushroom",
  "Mammal" = "mammal",
  "Reptile" = "reptile",
  "Insect" = "insect",
  "Fish" = "fish",
  "Bird" = "bird",
  "Amphibian" = "amphibian",
}

enum MovementStyles {
  "Bipedal" = "bipedal",
  "Quadrupedal" = "quadrupedal",
  "Flying" = "flying",
  "Aerial" = "aerial",
  "Aquatic" = "aquatic",
  "Stationary" = "stationary",
  "Arboreal" = "arboreal",
  "Burrowing" = "burrowing",
}

type Animal = {
  Phylum: CreatureStyles;
  Movement: MovementStyles;
};

enum Enviroments {
  MEADOWS = "meadows",
  FOREST = "forest",
  DESERT = "desert",
  CAVE = "cave",
  FIELD = "field",
  MOUNTAIN = "mountain",
  OASIS = "oasis",
  RIVER = "river",
  SWAMP = "swamp",
  CITY = "city",
}

enum Elements {
  FIRE = "fire",
  WATER = "water",
  EARTH = "earth",
  AIR = "air",
  MAGMA = "magma",
  ICE = "ice",
  LIGHT = "light",
  DARK = "dark",
  CLOCKWORK = "clockwork",
  MECHANICAL = "mechanical",
  ELECTRIC = "electric",
  POISON = "poison",
  RADIATION = "radiation",
  LIGHTNING = "lightning",
  GRASSY = "grassy",
  VIVIC = "vivic",
  WOODEN = "wooden",
  METAL = "metal",
  STONE = "stone",
  GLASS = "glass",
  CRYSTAL = "crystal",
  GEM = "gem",
  GOLD = "gold",
  SILVER = "silver",
  COPPER = "copper",
  BRONZE = "bronze",
  STEEL = "steel",
  PAPER = "paper",
  PLASTIC = "plastic",
  ETHERIAL = "etherial",
  DEMONIC = "demonic",
  UNDEAD = "undead",
}

enum AreaOfEffects {
  RANGE = "range",
  SELF = "self",
  TOUCH = "touch",
  SELF_AREA = "self_area",
  RANGE_AREA = "range_area",
}

type Move = {
  damage: number;
  areaOfEffect: AreaOfEffects;
};

type Monster<theme> = {
  description: Animal;
  size: Sizes;
  theme: theme;
  picture: string;
  health: number;
  moves: Move[];
};

type Room<theme> = {
  theme: theme;
  size: Sizes;
  monsters: Monster<theme>[];
};

type Floor<Theme> = {
  rooms: Room<Theme>[];
};

type Dungeon = {
  floors: Floor<{
    element: Elements;
    environment: Enviroments;
  }>[];
};
const chooseFromArray = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const createDungeon = async (): Promise<Dungeon> => {
  const dungeon: Dungeon = {
    floors: [],
  };
  for (let i = 0; i < 10; i++) {
    const floor: Dungeon["floors"][number] = {
      rooms: [],
    };
    for (let j = 0; j < 10; j++) {
      const room: Dungeon["floors"][number]["rooms"][number] = {
        theme: {
          element: chooseFromArray(Object.values(Elements)),
          environment: chooseFromArray(Object.values(Enviroments)),
        },
        size: chooseFromArray(Object.values(Sizes)),
        monsters: [],
      };
      for (let k = 0; k < 10; k++) {
        const monster: Dungeon["floors"][number]["rooms"][number]["monsters"][number] =
          {
            description: {
              Phylum: chooseFromArray(Object.values(CreatureStyles)),
              Movement: chooseFromArray(Object.values(MovementStyles)),
            },
            size: chooseFromArray(Object.values(Sizes)),
            theme: room.theme,
            picture: "",
            health: 10,
            moves: [1, 2, 3].map(
              (): Move => ({
                damage: Math.floor(Math.random() * 10),
                areaOfEffect: chooseFromArray(Object.values(AreaOfEffects)),
              })
            ),
          };
        room.monsters.push(monster);
      }
      floor.rooms.push(room);
    }
    dungeon.floors.push(floor);
  }
  return dungeon;
};

createDungeon()
  .then((dungeon) => {
    writeFileSync("./dungeon.json", JSON.stringify(dungeon));
  })
  .catch((err) => {
    console.log(err);
  });
