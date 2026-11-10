import { useCallback, useEffect, useState } from "react";
import { fetchAniListCatalog, getCachedAniListCatalog } from "../services/anilist.js";

export function useAniListCatalog() {
  const [catalog, setCatalog] = useState(() => getCachedAniListCatalog()?.catalog || null);
  const [savedAt, setSavedAt] = useState(() => getCachedAniListCatalog()?.savedAt || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingCache, setUsingCache] = useState(Boolean(catalog));

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAniListCatalog({ signal });
      setCatalog(result.catalog);
      setSavedAt(result.savedAt);
      setUsingCache(false);
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      const cache = getCachedAniListCatalog();
      if (cache?.catalog) {
        setCatalog(cache.catalog);
        setSavedAt(cache.savedAt);
        setUsingCache(true);
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

  return { catalog, savedAt, loading, error, usingCache, refresh };
}
