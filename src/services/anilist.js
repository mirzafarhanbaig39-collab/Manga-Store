const API_URL = "https://graphql.anilist.co";
const CACHE_KEY = "mangaverse-anilist-catalog-v2";

const MEDIA_FIELDS = `
  id
  type
  format
  status
  episodes
  chapters
  volumes
  averageScore
  popularity
  genres
  tags { name }
  description(asHtml: false)
  coverImage { extraLarge large medium }
  bannerImage
  startDate { year month day }
  updatedAt
  title { romaji english native }
  siteUrl
`;

const CATALOG_QUERY = `
  query MangaVerseCatalog {
    popularManga: Page(page: 1, perPage: 24) {
      media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
    trendingManga: Page(page: 1, perPage: 18) {
      media(type: MANGA, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
    newManga: Page(page: 1, perPage: 18) {
      media(type: MANGA, sort: START_DATE_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
    trendingAnime: Page(page: 1, perPage: 24) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
    updatedManga: Page(page: 1, perPage: 24) {
      media(type: MANGA, sort: UPDATED_AT_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
    updatedAnime: Page(page: 1, perPage: 24) {
      media(type: ANIME, sort: UPDATED_AT_DESC, isAdult: false) { ${MEDIA_FIELDS} }
    }
  }
`;

const CURATED_SERIES = [
  { title: "One Piece", search: "One Piece", aliases: ["One Piece"] },
  { title: "Demon Slayer", search: "Demon Slayer", aliases: ["Demon Slayer", "Demon Slayer: Kimetsu no Yaiba"] },
  { title: "Solo Leveling", search: "Solo Leveling", aliases: ["Solo Leveling"] },
  { title: "Jujutsu Kaisen", search: "Jujutsu Kaisen", aliases: ["Jujutsu Kaisen"] },
  { title: "Naruto", search: "Naruto", aliases: ["Naruto"] },
  { title: "Attack on Titan", search: "Attack on Titan", aliases: ["Attack on Titan", "Shingeki no Kyojin"] },
  { title: "Bleach", search: "Bleach", aliases: ["Bleach"] },
  { title: "Chainsaw Man", search: "Chainsaw Man", aliases: ["Chainsaw Man"] },
  { title: "Blue Lock", search: "Blue Lock", aliases: ["Blue Lock"] },
  { title: "Death Note", search: "Death Note", aliases: ["Death Note"] },
  { title: "Dragon Ball", search: "Dragon Ball", aliases: ["Dragon Ball"] },
  { title: "Tokyo Revengers", search: "Tokyo Revengers", aliases: ["Tokyo Revengers"] },
  { title: "My Hero Academia", search: "My Hero Academia", aliases: ["My Hero Academia", "Boku no Hero Academia"] },
  { title: "Black Clover", search: "Black Clover", aliases: ["Black Clover"] },
  { title: "Hunter x Hunter", search: "Hunter x Hunter", aliases: ["Hunter x Hunter"] },
  { title: "Spy x Family", search: "Spy x Family", aliases: ["Spy x Family"] },
  { title: "Vinland Saga", search: "Vinland Saga", aliases: ["Vinland Saga"] },
  { title: "Berserk", search: "Berserk", aliases: ["Berserk"] },
];

const CURATED_FIELDS = `
  id type format status chapters volumes averageScore popularity genres tags { name }
  description(asHtml: false)
  coverImage { extraLarge large medium }
  bannerImage startDate { year month day } updatedAt
  title { romaji english native } siteUrl
`;

function createCuratedBatch(series, batchIndex) {
  const variables = {};
  const declarations = [];
  const fields = series.map((item, index) => {
    const variable = `search${index}`;
    variables[variable] = item.search;
    declarations.push(`$${variable}: String!`);
    return `series${index}: Page(page: 1, perPage: 8) {
      media(type: MANGA, search: $${variable}, sort: SEARCH_MATCH, isAdult: false) { ${CURATED_FIELDS} }
    }`;
  });
  return {
    variables,
    query: `query MangaVerseCurated${batchIndex}(${declarations.join(", ")}) { ${fields.join("\n")} }`,
  };
}

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function chooseCuratedMedia(items) {
  const allCandidates = items.flatMap((batch) => Object.values(batch).flatMap((page) =>
    normalizeMedia(page?.media),
  ));
  return CURATED_SERIES.map((series) => {
    const aliases = series.aliases.map(normalizeTitle);
    return allCandidates.find((item) => aliases.includes(normalizeTitle(item.displayTitle)) ||
      aliases.includes(normalizeTitle(item.title?.romaji)) ||
      aliases.includes(normalizeTitle(item.title?.native)));
  }).filter(Boolean);
}

const SEARCH_QUERY = `
  query MangaVerseSearch($search: String!) {
    anime: Page(page: 1, perPage: 18) {
      media(type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) { ${MEDIA_FIELDS} }
    }
    manga: Page(page: 1, perPage: 18) {
      media(type: MANGA, search: $search, sort: SEARCH_MATCH, isAdult: false) { ${MEDIA_FIELDS} }
    }
  }
`;

const DETAIL_QUERY = `
  query MangaVerseDetails($id: Int!) {
    Media(id: $id) {
      ${MEDIA_FIELDS}
      staff {
        edges {
          role
          node { name { full } }
        }
      }
      relations {
        edges {
          relationType
          node { id type format status averageScore genres coverImage { large medium } title { romaji english } }
        }
      }
    }
  }
`;

function assertMedia(value) {
  return value && Number.isInteger(value.id) && value.title && value.coverImage;
}

function readCatalogCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.catalog || !Array.isArray(parsed.catalog.popularManga)) return null;
    return parsed;
  } catch (error) {
    console.warn("Could not read the AniList catalogue cache.", error);
    return null;
  }
}

function writeCatalogCache(catalog) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      catalog,
    }));
  } catch (error) {
    console.warn("Could not save the AniList catalogue cache.", error);
  }
}

async function postGraphQL(query, variables = {}, signal, fetchImpl = globalThis.fetch) {
  if (!fetchImpl) throw new Error("This browser does not support network requests.");
  let response;
  try {
    response = await fetchImpl(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("AniList could not be reached. Check your connection and try again.", { cause: error });
  }

  if (!response.ok) {
    throw new Error(`AniList returned HTTP ${response.status}. Please try again later.`);
  }
  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((item) => item.message).join("; "));
  }
  if (!result.data) throw new Error("AniList returned an empty catalogue response.");
  return result.data;
}

function normalizeMedia(items) {
  return (items || []).filter(assertMedia).map((item) => ({
    ...item,
    displayTitle: item.title.english || item.title.romaji || item.title.native || "Untitled",
    updatedDate: item.updatedAt ? new Date(item.updatedAt * 1000).toISOString() : null,
    coverUrl: item.coverImage.extraLarge || item.coverImage.large || item.coverImage.medium || null,
  }));
}

export async function fetchAniListCatalog({ signal, fetchImpl } = {}) {
  const batches = [];
  for (let index = 0; index < CURATED_SERIES.length; index += 5) {
    batches.push(CURATED_SERIES.slice(index, index + 5));
  }
  const requests = batches.map((batch, index) => createCuratedBatch(batch, index));
  const [data, ...curatedData] = await Promise.all([
    postGraphQL(CATALOG_QUERY, {}, signal, fetchImpl),
    ...requests.map(({ query, variables }) => postGraphQL(query, variables, signal, fetchImpl)),
  ]);
  const catalog = {
    popularManga: normalizeMedia(data.popularManga?.media),
    curatedManga: chooseCuratedMedia(curatedData),
    trendingManga: normalizeMedia(data.trendingManga?.media),
    newManga: normalizeMedia(data.newManga?.media),
    trendingAnime: normalizeMedia(data.trendingAnime?.media),
    updatedManga: normalizeMedia(data.updatedManga?.media),
    updatedAnime: normalizeMedia(data.updatedAnime?.media),
  };
  writeCatalogCache(catalog);
  return { catalog, savedAt: new Date().toISOString(), fromCache: false };
}

export function getCachedAniListCatalog() {
  return readCatalogCache();
}

export async function searchAniList(query, { signal, fetchImpl } = {}) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await postGraphQL(SEARCH_QUERY, { search: trimmed }, signal, fetchImpl);
  return [
    ...normalizeMedia(data.anime?.media),
    ...normalizeMedia(data.manga?.media),
  ];
}

export async function fetchAniListMedia(id, { signal, fetchImpl } = {}) {
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) throw new Error("Enter a valid AniList series ID.");
  const data = await postGraphQL(DETAIL_QUERY, { id: mediaId }, signal, fetchImpl);
  if (!data.Media) throw new Error("That series could not be found on AniList.");
  return normalizeMedia([data.Media])[0] || data.Media;
}

export function getAniListCacheKey() {
  return CACHE_KEY;
}
