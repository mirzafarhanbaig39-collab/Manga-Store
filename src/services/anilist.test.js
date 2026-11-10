import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchAniListCatalog,
  fetchAniListMedia,
  getCachedAniListCatalog,
  getAniListCacheKey,
  searchAniList,
} from "./anilist.js";
import { anilistFixture, makeMedia, mockAniListFetch } from "../test/anilistMock.js";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("AniList service", () => {
  it("requests all feeds in one GraphQL request and caches normalized results", async () => {
    const fetchImpl = mockAniListFetch();
    const result = await fetchAniListCatalog({ fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(request.query).toContain("popularManga");
    expect(request.query).toContain("trendingAnime");
    expect(result.catalog.popularManga[0].displayTitle).toBe("One Piece");
    expect(result.catalog.popularManga[0].coverUrl).toContain("1.jpg");
    expect(getCachedAniListCatalog().catalog.updatedManga[0].displayTitle).toBe("Demon Slayer");
    expect(window.localStorage.getItem(getAniListCacheKey())).toContain("savedAt");
  });

  it("searches anime and manga and returns both media kinds", async () => {
    const results = await searchAniList("One Piece", { fetchImpl: mockAniListFetch() });
    expect(results.map((item) => item.type)).toEqual(["ANIME", "MANGA"]);
  });

  it("loads an individual AniList series and its relations", async () => {
    const media = await fetchAniListMedia(1, { fetchImpl: mockAniListFetch() });
    expect(media.displayTitle).toBe("One Piece");
    expect(media.relations.edges[0].node.id).toBe(9);
  });

  it("reports HTTP and GraphQL failures instead of returning empty success data", async () => {
    await expect(fetchAniListCatalog({
      fetchImpl: vi.fn(async () => ({ ok: false, status: 429 })),
    })).rejects.toThrow("HTTP 429");
    await expect(searchAniList("One Piece", {
      fetchImpl: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ errors: [{ message: "Too many requests" }] }),
      })),
    })).rejects.toThrow("Too many requests");
  });

  it("rejects invalid IDs before sending a request", async () => {
    const fetchImpl = mockAniListFetch();
    await expect(fetchAniListMedia("not-a-number", { fetchImpl })).rejects.toThrow("valid AniList series ID");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
