
export const randomArray = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };
import nouns from "./Wordlist-Nouns-All.json"
import verbs from "./Wordlist-Verbs-All.json"
import adjectives from "./Wordlist-Adjectives-All.json"
import adverbs from "./Wordlist-Adverbs-All.json"
const mediums = [
    "photo",
    "drawing",
    "painting",
    "sculpture",
    "digital art",
    "mixed media",
    "performance art",
    "installation",
    "video",
    "sound",
    "text",
]


export const createDreamString = ()=>
`a ${randomArray(mediums)} of ${randomArray(adjectives)} ${randomArray(nouns)} ${randomArray(verbs)} ${randomArray(adverbs)} by ${randomArray([
    "wlop",
    "thomas kinkade",
    "ted nasmith",
    "wes anderson",
    "marc simonetti",
    "jim burns",
    "gustave dore",
    "greg rutkowski",
    "ansel adams",
    "Michelangelo",
    "Rembrandt",
    "William-Adolphe Bouguereau",
    "Claude Monet",
    "Hieronymus Bosch",
    "Caspar David Friedrich",
    "Paul Cezanne",
    "Norman Rockwell",
    "Wayne Barlowe",
    "Seb McKinnon",
    "Terese Nielsen",
    "Rebecca Guay",
    "Jack Kirby",
    "Aubrey Beardsley",
    "Theodor Seuss Geisel",
    "Pablo Picasso",
    "Hokusai",
    "Makoto Shinkai",
    "Ralph Steadman",
    "Bill Watterson",
    "Tim Doyle",
    "Quentin Blake",
    "Alphonse Mucha",
    "Anton Fadeev",
  ])}`;
