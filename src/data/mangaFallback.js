import { getSeriesImage } from "./seriesArt.js";

const series = [
  ["one-piece", "One Piece", ["Adventure", "Fantasy"]],
  ["demon-slayer", "Demon Slayer", ["Action", "Fantasy"]],
  ["solo-leveling", "Solo Leveling", ["Action", "Fantasy"]],
  ["jujutsu-kaisen", "Jujutsu Kaisen", ["Action", "Supernatural"]],
  ["naruto", "Naruto", ["Action", "Adventure"]],
  ["attack-on-titan", "Attack on Titan", ["Action", "Thriller"]],
  ["bleach", "Bleach", ["Action", "Supernatural"]],
  ["chainsaw-man", "Chainsaw Man", ["Action", "Horror"]],
  ["blue-lock", "Blue Lock", ["Sports", "Drama"]],
  ["death-note", "Death Note", ["Mystery", "Thriller"]],
  ["dragon-ball", "Dragon Ball", ["Action", "Adventure"]],
  ["tokyo-revengers", "Tokyo Revengers", ["Action", "Drama"]],
  ["my-hero-academia", "My Hero Academia", ["Action", "Superhero"]],
  ["black-clover", "Black Clover", ["Action", "Fantasy"]],
  ["hunter-x-hunter", "Hunter x Hunter", ["Adventure", "Fantasy"]],
  ["spy-x-family", "Spy x Family", ["Comedy", "Action"]],
  ["vinland-saga", "Vinland Saga", ["Historical", "Adventure"]],
  ["berserk", "Berserk", ["Dark Fantasy", "Action"]],
];

export const fallbackManga = series.map(([slug, title, genres]) => {
  const image = getSeriesImage({ coverKey: slug });
  return {
    id: `fallback-${slug}`,
    type: "MANGA",
    format: "MANGA",
    title: { english: title, romaji: title, native: "" },
    displayTitle: title,
    genres,
    description: "",
    coverUrl: image || null,
    coverImage: image
      ? { extraLarge: image, large: image, medium: image }
      : { extraLarge: null, large: null, medium: null },
    averageScore: null,
    popularity: null,
    status: null,
    startDate: null,
    updatedAt: null,
    updatedDate: null,
    isFallback: true,
  };
});

export const fallbackCatalog = {
  popularManga: fallbackManga,
  curatedManga: fallbackManga,
  trendingManga: [],
  newManga: [],
  trendingAnime: [],
  updatedManga: [],
  updatedAnime: [],
};
