const API_URL = "https://graphql.anilist.co";
const CACHE_KEY = "mangaverse-anilist-catalog-v1";

const MEDIA_FIELDS = `
  id
  type
  format
  status
  episodes
  chapters
  volumes
  averageScore
  genres
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
  const data = await postGraphQL(CATALOG_QUERY, {}, signal, fetchImpl);
  const catalog = {
    popularManga: normalizeMedia(data.popularManga?.media),
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
