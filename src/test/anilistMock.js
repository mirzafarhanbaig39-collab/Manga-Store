import { vi } from "vitest";

export function makeMedia(id, name, type, genres = ["Action"]) {
  return {
    id,
    type,
    format: type === "ANIME" ? "TV" : "MANGA",
    status: "RELEASING",
    episodes: type === "ANIME" ? 24 : null,
    chapters: type === "MANGA" ? 130 : null,
    volumes: type === "MANGA" ? 12 : null,
    averageScore: 87,
    popularity: 12500 - id,
    genres,
    description: `${name} follows a group of unforgettable heroes.`,
    coverImage: {
      extraLarge: `https://example.test/${id}.jpg`,
      large: `https://example.test/${id}.jpg`,
      medium: `https://example.test/${id}.jpg`,
    },
    bannerImage: `https://example.test/${id}-banner.jpg`,
    startDate: { year: 2020, month: 1, day: 1 },
    updatedAt: 1710000000 + id,
    title: { romaji: name, english: name, native: "" },
    siteUrl: `https://anilist.co/${type.toLowerCase()}/${id}`,
  };
}

export const anilistFixture = {
  popularManga: [
    makeMedia(1, "One Piece", "MANGA", ["Action", "Adventure"]),
    makeMedia(2, "Jujutsu Kaisen", "MANGA", ["Action", "Supernatural"]),
    makeMedia(3, "Black Clover", "MANGA", ["Fantasy", "Action"]),
  ],
  trendingAnime: [
    makeMedia(4, "Solo Leveling", "ANIME", ["Action", "Fantasy"]),
    makeMedia(5, "Frieren: Beyond Journey's End", "ANIME", ["Adventure", "Fantasy"]),
  ],
  updatedManga: [makeMedia(6, "Demon Slayer", "MANGA", ["Action", "Supernatural"])],
  updatedAnime: [makeMedia(7, "Spy x Family", "ANIME", ["Comedy", "Action"])],
  trendingManga: [makeMedia(8, "Blue Lock", "MANGA", ["Sports", "Drama"])],
  newManga: [makeMedia(9, "Spy x Family", "MANGA", ["Comedy", "Action"])],
};

export function mockAniListFetch() {
  return vi.fn(async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.query.includes("MangaVerseCatalog")) {
      return { ok: true, status: 200, json: async () => ({ data: Object.fromEntries(
        Object.entries(anilistFixture).map(([key, media]) => [key, { media }]),
      ) }) };
    }
    if (body.query.includes("MangaVerseCurated")) {
      const batch = Number(body.query.match(/MangaVerseCurated(\d+)/)?.[1] || 0);
      const existing = [
        ...anilistFixture.popularManga,
        ...anilistFixture.trendingManga,
        ...anilistFixture.updatedManga,
        ...anilistFixture.newManga,
      ];
      const data = Object.fromEntries(Object.entries(body.variables).map(([key, title], index) => {
        const found = existing.find((item) =>
          item.type === "MANGA" && item.title.english.toLowerCase() === title.toLowerCase(),
        );
        return [`series${index}`, { media: [found || makeMedia(1000 + batch * 5 + index, title, "MANGA")] }];
      }));
      return { ok: true, status: 200, json: async () => ({ data }) };
    }
    if (body.query.includes("MangaVerseSearch")) {
      return { ok: true, status: 200, json: async () => ({ data: {
        anime: { media: [makeMedia(1, body.variables.search === "One Piece" ? "One Piece" : "Search Result Anime", "ANIME")] },
        manga: { media: [makeMedia(8, "Search Result Manga", "MANGA")] },
      } }) };
    }
    if (body.query.includes("MangaVerseDetails")) {
      const media = makeMedia(body.variables.id, "One Piece", "MANGA", ["Action", "Adventure"]);
      media.relations = { edges: [{ relationType: "SEQUEL", node: makeMedia(9, "One Piece", "MANGA") }] };
      return { ok: true, status: 200, json: async () => ({ data: { Media: media } }) };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  });
}
