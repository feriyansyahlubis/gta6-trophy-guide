// Loads the official trophy list and its guides from data/trophies.json.
// The file is one of the app's own files, fetched relatively, so the app
// works offline from its own server.
let cachedTrophies = null;

export async function loadTrophyData() {
  if (cachedTrophies) return cachedTrophies;
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  cachedTrophies = doc;
  return doc;
}

export function trophyByName(doc, name) {
  return doc.trophies.find((trophy) => trophy.name === name) ?? null;
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const ROADMAP_STAGES = [
  { stage: 1, title: 'Story first — Chapters 1–4', text: 'Play the story in order. This stage earns every chapter trophy and every named-mission trophy: Gone Fishing, Chapters 1–4, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown and Operation Savage Glory. Nothing here is missable — finish each mission and the trophy pops.' },
  { stage: 2, title: 'Stranger strands & side missions', text: 'Between story chapters, work the side characters: Andy, Kenton, Billy, Randy and Tyrone each have a final mission, Bret has a unique hunt, and three more stranger strands complete the 8 needed for Strangers & Freaks. Choices offered along the way count toward Actions Speak Louder.' },
  { stage: 3, title: 'Activities & skills', text: 'The skill grind: gold all 42 Shooting Range challenges, win drone races at all 14 locations and 20 different races, pull off 250 stunts, complete 50 challenges, try every activity type once, and take the one-shot moments — Cal\u2019s fishing challenge, the VCIA departure, the showroom smash, the melee drive-by and the second-try trophy.' },
  { stage: 4, title: 'Collectibles & exploration', text: 'Sweep the map region by region: explore all 52 areas, meditate at all 18 spots, WAiNK It at 100 locations, complete 3 card sets, discover 100 vehicles, register 10 of them in the Scooter Bros app, buy all 8 garages, and enjoy the cocktail on Ocean Beach.' },
  { stage: 5, title: 'Money & crime clean-up', text: 'The crime economy: rob 5 bank vaults, one armored truck and one illegal operation per gang (9 gangs), launder $250,000 of Marked Bills, spend $100,000 across all shops, and run the three-shop partner robbery without losing your wanted level.' },
  { stage: 6, title: 'Finale & platinum', text: 'Finish the final mission for the gold, then check 100% completion. The platinum, Vice Got a Price!, unlocks automatically when the other 54 are earned.' },
];
