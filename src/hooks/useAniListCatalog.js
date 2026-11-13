import { useCallback, useEffect, useState } from "react";
import { fetchAniListCatalog, getCachedAniListCatalog } from "../services/anilist.js";
import { fallbackCatalog, fallbackManga } from "../data/mangaFallback.js";

const EMPTY_CATALOG = fallbackCatalog;

function completeCatalog(catalog = {}) {
  const curated = catalog.curatedManga || [];
  const normalize = (title = "") => title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const titles = curated.map((item) => normalize(item.displayTitle));
  return {
    ...EMPTY_CATALOG,
    ...catalog,
    curatedManga: [
      ...curated,
      ...fallbackManga.filter((item) => {
        const title = normalize(item.displayTitle);
        return !titles.some((candidate) => candidate === title || candidate.startsWith(title));
      }),
    ],
  };
}

export function useAniListCatalog() {
  const cachedCatalog = getCachedAniListCatalog();
  const [catalog, setCatalog] = useState(() => completeCatalog(cachedCatalog?.catalog || fallbackCatalog));
  const [savedAt, setSavedAt] = useState(() => getCachedAniListCatalog()?.savedAt || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingCache, setUsingCache] = useState(Boolean(cachedCatalog?.catalog));
  const [usingFallback, setUsingFallback] = useState(!cachedCatalog?.catalog);

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAniListCatalog({ signal });
      setCatalog(completeCatalog(result.catalog));
      setSavedAt(result.savedAt);
      setUsingCache(false);
      setUsingFallback(false);
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      const cache = getCachedAniListCatalog();
      if (cache?.catalog) {
        setCatalog(completeCatalog(cache.catalog));
        setSavedAt(cache.savedAt);
        setUsingCache(true);
        setUsingFallback(false);
      } else {
        setCatalog(fallbackCatalog);
        setUsingFallback(true);
      }
      setError(requestError.message || "Unable to load the AniList catalogue.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { catalog, savedAt, loading, error, usingCache, usingFallback, refresh };
}
