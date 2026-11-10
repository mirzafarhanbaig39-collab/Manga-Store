import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, RefreshCw, Search, Settings2, ShoppingBag, Star } from "lucide-react";
import { fetchAniListMedia, searchAniList } from "../services/anilist.js";
import { useStore } from "../context/StoreContext.jsx";

const FAVORITES_KEY = "mangaverse-anilist-favorites-v1";
const MANAGEMENT_KEY = "mangaverse-series-management-v1";
const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Sports", "Supernatural", "Thriller",
];
const EMPTY_CATALOG = { popularManga: [], trendingAnime: [], updatedManga: [], updatedAnime: [] };

function readLocal(key, fallback, isValid) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (!isValid(parsed)) throw new TypeError(`Invalid stored data for ${key}`);
    return parsed;
  } catch (error) {
    console.error(`Unable to restore ${key} from local storage.`, error);
    return fallback;
  }
}

function useFavorites() {
  const [favorites, setFavorites] = useState(() => readLocal(
    FAVORITES_KEY,
    [],
    (value) => Array.isArray(value) && value.every((item) => Number.isInteger(item.id)),
  ));
  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);
  function toggleFavorite(media) {
    setFavorites((current) => current.some((item) => item.id === media.id)
      ? current.filter((item) => item.id !== media.id)
      : [...current, media]);
  }
  return { favorites, toggleFavorite };
}

function useManagement() {
  const [settings, setSettings] = useState(() => readLocal(
    MANAGEMENT_KEY,
    { featuredIds: [], customMedia: [], notes: {} },
    (value) => value && Array.isArray(value.featuredIds) &&
      Array.isArray(value.customMedia) && value.notes && typeof value.notes === "object",
  ));
  useEffect(() => {
    window.localStorage.setItem(MANAGEMENT_KEY, JSON.stringify(settings));
  }, [settings]);
  return [settings, setSettings];
}

function titleOf(media) {
  return media.displayTitle || media.title?.english || media.title?.romaji || media.title?.native || "Untitled";
}

function imageOf(media) {
  return media.coverUrl || media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "";
}

function cleanDescription(description = "") {
  return description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function MediaImage({ media, className = "" }) {
  const [failed, setFailed] = useState(false);
  const image = imageOf(media);
  return <div className={`media-image ${failed || !image ? "media-image-fallback" : ""} ${className}`}>
    {image && !failed
      ? <img src={image} alt={`${titleOf(media)} cover`} loading="lazy" onError={() => setFailed(true)} />
      : <span aria-label={`${titleOf(media)} cover unavailable`} role="img">{titleOf(media)}</span>}
  </div>;
}

function FavoriteButton({ media, favorites, onToggle }) {
  const saved = favorites.some((item) => item.id === media.id);
  return <button
    type="button"
    className={`media-favorite ${saved ? "is-saved" : ""}`}
    aria-label={saved ? `Remove ${titleOf(media)} from favorites` : `Add ${titleOf(media)} to favorites`}
    aria-pressed={saved}
    onClick={() => onToggle(media)}
  ><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>;
}

function AddDemoBagButton({ media }) {
  const { addToCart } = useStore();
  const product = {
    id: `anilist-${media.id}`,
    title: titleOf(media),
    genre: media.genres?.[0] || media.type,
    category: media.type,
    theme: "series",
    mark: "物語",
    author: "AniList catalogue series",
    description: "Demo-only series item. This is not a real listing, stock record, or publisher product.",
    price: 499,
    rating: media.averageScore ? media.averageScore / 10 : 0,
    tag: "DEMO ITEM",
  };
  return <button
    type="button"
    className="media-add-button"
    aria-label={`Add demo ${titleOf(media)} to bag`}
    onClick={() => addToCart(product)}
  ><ShoppingBag size={14} /> Add demo item · ₹499</button>;
}

function MediaCard({ media, favorites, onToggle, updated = false }) {
  const date = media.updatedDate || (media.updatedAt ? new Date(media.updatedAt * 1000).toISOString() : "");
  const year = media.startDate?.year;
  return <article className="media-card">
    <div className="media-card-art">
      <Link to={`/series/${media.id}`} aria-label={`View details for ${titleOf(media)}`}>
        <MediaImage media={media} />
      </Link>
      <FavoriteButton media={media} favorites={favorites} onToggle={onToggle} />
      {updated && date && <span className="media-update-tag">CATALOG UPDATED</span>}
    </div>
    <div className="media-card-copy">
      <div className="media-card-meta">
        <span>{media.genres?.slice(0, 2).join(" · ") || media.type}</span>
        {media.averageScore != null
          ? <span className="media-rating"><Star size={12} fill="currentColor" /> {(media.averageScore / 10).toFixed(1)}</span>
          : <span className="media-rating">Unrated</span>}
      </div>
      <Link className="media-title" to={`/series/${media.id}`}>{titleOf(media)}</Link>
      <p className="media-card-subtitle">
        {year || media.status?.replaceAll("_", " ").toLowerCase() || "AniList catalogue"}
        {updated && date ? ` · ${new Date(date).toLocaleDateString()}` : ""}
      </p>
      <AddDemoBagButton media={media} />
    </div>
  </article>;
}

function MediaCarousel({ title, eyebrow, items = [], favorites, onToggle, updated = false, action }) {
  const railRef = useRef(null);
  const pointer = useRef(null);
  const dragged = useRef(false);
  const scroll = (direction) => railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: "smooth" });
  return <section className="discovery-section">
    <div className="discovery-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      <div className="discovery-heading-actions">
        {action && <Link className="text-link" to={action.to}>{action.label}<ArrowRight size={15} /></Link>}
        <button type="button" className="rail-arrow" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}><ArrowLeft size={17} /></button>
        <button type="button" className="rail-arrow" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}><ArrowRight size={17} /></button>
      </div>
    </div>
    {items.length ? <div
      className="media-rail"
      ref={railRef}
      role="region"
      aria-label={`${title} carousel`}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && !event.target.closest("button")) {
          pointer.current = {
            x: event.clientX,
            left: railRef.current.scrollLeft,
            pointerId: event.pointerId,
            captured: false,
          };
          dragged.current = false;
        }
      }}
      onPointerMove={(event) => {
        if (!pointer.current) return;
        const distance = event.clientX - pointer.current.x;
        if (Math.abs(distance) > 5) {
          dragged.current = true;
          if (!pointer.current.captured) {
            railRef.current.setPointerCapture?.(pointer.current.pointerId);
            pointer.current.captured = true;
          }
        }
        railRef.current.scrollLeft = pointer.current.left - distance;
      }}
      onPointerUp={() => { pointer.current = null; }}
      onPointerCancel={() => { pointer.current = null; }}
      onClickCapture={(event) => {
        if (dragged.current) {
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }
      }}
    >
      {items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} updated={updated} />)}
    </div> : <div className="media-empty">Catalogue entries will appear here when AniList responds.</div>}
  </section>;
}

function FreshnessStatus({ loading, error, usingCache, savedAt, onRefresh }) {
  return <div className="catalog-status" aria-live="polite">
    <span>{loading ? "Refreshing AniList catalogue…" : usingCache ? "Showing saved catalogue data" : "Live catalogue from AniList"}</span>
    {savedAt && <span>Last fetched {new Date(savedAt).toLocaleString()}</span>}
    {error && <span className="catalog-error">{error}</span>}
    <button type="button" className="text-link" onClick={onRefresh} disabled={loading}><RefreshCw size={14} /> Refresh</button>
  </div>;
}

function HeroFeature({ media, onPrevious, onNext, favorites, onToggle }) {
  if (!media) return <section className="discovery-hero discovery-hero-empty">
    <div className="wrap"><p className="eyebrow">MANGAVERSE · ANIList DISCOVERY</p><h1>Enter the world<br />of <em>anime & manga.</em></h1>
      <p className="discovery-hero-text">We are waiting for AniList catalogue data. You can retry now or browse the store demo.</p>
      <Link className="button button-red" to="/store">Explore demo store <ArrowRight size={16} /></Link>
    </div>
  </section>;
  const image = media.bannerImage || imageOf(media);
  return <section className="discovery-hero" style={image ? { "--hero-cover": `url("${image}")` } : undefined}>
    <div className="discovery-hero-scrim" />
    <div className="wrap discovery-hero-inner">
      <div className="discovery-hero-copy">
        <p className="eyebrow">FEATURED FROM ANILIST · {media.type}</p>
        <h1>Enter the world<br />of <em>manga.</em></h1>
        <h2>{titleOf(media)}</h2>
        <p className="discovery-hero-text">{cleanDescription(media.description) || "Explore the worlds and stories readers are discovering right now."}</p>
        <div className="discovery-hero-meta">{media.genres?.slice(0, 3).join(" · ")}{media.startDate?.year ? ` · ${media.startDate.year}` : ""}</div>
        <div className="hero-actions"><Link className="button button-red" to={`/series/${media.id}`}>Explore this series <ArrowRight size={16} /></Link><Link className="button button-ghost" to="/manga">Discover manga</Link>
          <FavoriteButton media={media} favorites={favorites} onToggle={onToggle} />
        </div>
      </div>
      <div className="discovery-hero-art"><MediaImage media={media} /></div>
      <div className="discovery-hero-controls">
        <button type="button" className="rail-arrow" aria-label="Previous featured series" onClick={onPrevious}><ArrowLeft size={17} /></button>
        <span>FEATURED SERIES</span>
        <button type="button" className="rail-arrow" aria-label="Next featured series" onClick={onNext}><ArrowRight size={17} /></button>
      </div>
    </div>
  </section>;
}

export function DiscoveryHome({ catalog, loading, error, usingCache, savedAt, refresh, favorites, onToggle, settings }) {
  const allFeatures = useMemo(() => {
    const combined = [...settings.customMedia, ...catalog.trendingAnime, ...catalog.popularManga];
    const ids = new Set(settings.featuredIds);
    const selected = combined.filter((item) => ids.has(item.id));
    return selected.length ? selected : [...catalog.trendingAnime, ...catalog.popularManga];
  }, [catalog, settings]);
  const [featureIndex, setFeatureIndex] = useState(0);
  useEffect(() => setFeatureIndex(0), [allFeatures.length]);
  useEffect(() => {
    if (allFeatures.length < 2) return undefined;
    const timer = window.setInterval(() => setFeatureIndex((index) => (index + 1) % allFeatures.length), 8000);
    return () => window.clearInterval(timer);
  }, [allFeatures.length]);
  const genreNavigate = useNavigate();
  const featured = allFeatures[featureIndex];
  const customAndCatalog = useMemo(() => {
    const items = [...settings.customMedia, ...catalog.popularManga, ...catalog.trendingAnime, ...catalog.updatedManga, ...catalog.updatedAnime];
    return [...new Map(items.map((item) => [item.id, item])).values()];
  }, [catalog, settings.customMedia]);

  return <main className="discovery-page">
    <HeroFeature
      media={featured}
      onPrevious={() => setFeatureIndex((index) => (index - 1 + allFeatures.length) % allFeatures.length)}
      onNext={() => setFeatureIndex((index) => (index + 1) % allFeatures.length)}
      favorites={favorites}
      onToggle={onToggle}
    />
    <div className="wrap"><FreshnessStatus loading={loading} error={error} usingCache={usingCache} savedAt={savedAt} onRefresh={refresh} />
      {!catalog.trendingAnime.length && loading && <div className="catalog-loading" role="status">Connecting to AniList…</div>}
      <MediaCarousel title="Trending anime" eyebrow="WHAT THE WORLD IS WATCHING" items={catalog.trendingAnime} favorites={favorites} onToggle={onToggle} action={{ label: "Browse anime", to: "/anime" }} />
      <MediaCarousel title="Popular manga" eyebrow="FAN-FAVOURITE SERIES" items={catalog.popularManga} favorites={favorites} onToggle={onToggle} action={{ label: "Browse manga", to: "/manga" }} />
      <section className="discovery-section genre-explorer" id="genres">
        <div className="discovery-heading"><div><p className="eyebrow">FIND YOUR NEXT OBSESSION</p><h2>Explore by genre.</h2></div><Link className="text-link" to="/manga">All manga <ArrowRight size={15} /></Link></div>
        <div className="discovery-genres">{GENRES.map((genre) => <button key={genre} type="button" onClick={() => genreNavigate(`/manga?genre=${encodeURIComponent(genre)}`)}>{genre}<ArrowUpRight size={14} /></button>)}</div>
      </section>
      <MediaCarousel title="Recently updated manga" eyebrow="ANILIST CATALOGUE ACTIVITY" items={catalog.updatedManga} favorites={favorites} onToggle={onToggle} updated action={{ label: "All updates", to: "/updates" }} />
      <p className="catalog-footnote">“Updated” refers to the AniList catalogue record timestamp, not a confirmed new chapter or episode publication.</p>
      <MediaCarousel title="Recently updated anime" eyebrow="ANILIST CATALOGUE ACTIVITY" items={catalog.updatedAnime} favorites={favorites} onToggle={onToggle} updated action={{ label: "Latest updates", to: "/updates" }} />
      <MediaCarousel title="Editor's manga shelf" eyebrow="A FEW MORE WORLDS TO EXPLORE" items={customAndCatalog.filter((item) => item.type === "MANGA").slice(8, 24)} favorites={favorites} onToggle={onToggle} />
    </div>
  </main>;
}

function BrowsePage({ catalog, favorites, onToggle, type }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [genre, setGenre] = useState(params.get("genre") || "");
  const [sort, setSort] = useState("score");
  useEffect(() => setGenre(new URLSearchParams(location.search).get("genre") || ""), [location.search]);
  const feed = type === "ANIME" ? catalog.trendingAnime : catalog.popularManga;
  const allMedia = type === "ANIME"
    ? [...feed, ...catalog.updatedAnime]
    : [...feed, ...catalog.updatedManga];
  const items = useMemo(() => {
    const unique = [...new Map(allMedia.map((media) => [media.id, media])).values()];
    const filtered = unique.filter((media) => !genre || media.genres?.includes(genre));
    if (sort === "score") filtered.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    if (sort === "title") filtered.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    if (sort === "updated") filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return filtered;
  }, [allMedia, genre, sort]);
  const heading = type === "ANIME" ? "Explore anime." : "Explore manga.";
  return <main className="wrap discovery-listing">
    <div className="page-banner"><p className="eyebrow">ANILIST LIVE CATALOGUE · {type}</p><h1>{heading}</h1><p>Real catalogue entries and cover artwork supplied by AniList. Search to find more titles.</p></div>
    <div className="discovery-filters">
      <label><span>Genre</span><select aria-label="Filter series by genre" value={genre} onChange={(event) => { setGenre(event.target.value); navigate({ search: event.target.value ? `?genre=${encodeURIComponent(event.target.value)}` : "" }, { replace: true }); }}><option value="">All genres</option>{GENRES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Sort by</span><select aria-label="Sort series" value={sort} onChange={(event) => setSort(event.target.value)}><option value="score">Highest score</option><option value="updated">Catalogue recently updated</option><option value="title">Title A–Z</option></select></label>
      <span>{items.length} titles</span>
    </div>
    {items.length
      ? <div className="discovery-grid">{items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} />)}</div>
      : <div className="media-empty">{feed.length ? "No titles match this genre in the current selection." : "AniList data is not available yet. Try refreshing the homepage."}</div>}
  </main>;
}

function SearchPage({ catalog, favorites, onToggle }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("q") || "";
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setInput(initialQuery);
    setQuery(initialQuery);
  }, [initialQuery]);
  useEffect(() => {
    if (!query.trim()) { setItems([]); setLoading(false); setError(""); return undefined; }
    const genre = GENRES.find((item) => item.toLowerCase() === query.trim().toLowerCase());
    if (genre) {
      const localItems = [
        ...catalog.popularManga, ...catalog.trendingAnime,
        ...catalog.updatedManga, ...catalog.updatedAnime,
      ].filter((media) => media.genres?.includes(genre));
      setItems([...new Map(localItems.map((media) => [media.id, media])).values()]);
      setLoading(false);
      setError("");
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchAniList(query, { signal: controller.signal }).then(setItems).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [catalog, query]);
  return <main className="wrap discovery-listing">
    <div className="page-banner"><p className="eyebrow">SEARCH THE UNIVERSE</p><h1>Find a story.</h1></div>
    <form className="discovery-search" onSubmit={(event) => { event.preventDefault(); setQuery(input.trim()); }}>
      <Search size={18} /><input aria-label="Search AniList titles" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Anime, manga or genre…" /><button className="button button-red" type="submit">Search</button>
    </form>
    {loading && <p className="catalog-loading" role="status">Searching AniList…</p>}
    {error && <p className="catalog-error" role="alert">{error}</p>}
    {!loading && query && !error && !items.length && <div className="media-empty"><h2>No matching titles</h2><p>Try a different title or genre.</p></div>}
    {items.length > 0 && <div className="discovery-grid">{items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} />)}</div>}
  </main>;
}

function UpdatesPage({ catalog, favorites, onToggle }) {
  return <main className="wrap discovery-listing">
    <div className="page-banner"><p className="eyebrow">LATEST AVAILABLE CATALOGUE DATA</p><h1>Recent updates.</h1><p>AniList record updates are shown here; they do not confirm a newly published chapter or episode.</p></div>
    <MediaCarousel title="Manga catalogue updates" eyebrow="RECENTLY EDITED RECORDS" items={catalog.updatedManga} favorites={favorites} onToggle={onToggle} updated />
    <MediaCarousel title="Anime catalogue updates" eyebrow="RECENTLY EDITED RECORDS" items={catalog.updatedAnime} favorites={favorites} onToggle={onToggle} updated />
  </main>;
}

function FavoritesPage({ favorites, onToggle }) {
  return <main className="wrap discovery-listing">
    <div className="page-banner"><p className="eyebrow">YOUR LOCAL SHORTLIST</p><h1>My favorites.</h1><p>Saved on this device. Your list is not sent to AniList.</p></div>
    {favorites.length
      ? <div className="discovery-grid">{favorites.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} />)}</div>
      : <div className="media-empty"><Heart size={22} /><h2>No favorites saved yet.</h2><p>Tap the heart on a series to keep it close.</p><Link className="button button-red" to="/manga">Explore manga</Link></div>}
  </main>;
}

function SeriesDetails({ catalog, favorites, onToggle }) {
  const { id } = useParams();
  const mediaId = Number(id);
  const known = useMemo(() => [...catalog.popularManga, ...catalog.trendingAnime, ...catalog.updatedManga, ...catalog.updatedAnime].find((item) => item.id === mediaId), [catalog, mediaId]);
  const [media, setMedia] = useState(known || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!known);
  useEffect(() => {
    setMedia(known || null);
    setError("");
    setLoading(!known);
    const controller = new AbortController();
    // The full request includes related series, which are not part of the list feeds.
    fetchAniListMedia(id, { signal: controller.signal }).then(setMedia).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  if (loading) return <main className="wrap discovery-listing"><p className="catalog-loading">Loading series details…</p></main>;
  if (error || !media) return <main className="wrap discovery-listing"><div className="media-empty"><h1>Series unavailable</h1><p>{error || "No details were found."}</p><Link className="text-link" to="/manga"><ArrowLeft size={15} /> Back to manga</Link></div></main>;
  const related = media.relations?.edges?.map((edge) => edge.node).filter((node) => node && node.id) || [];
  return <main className="wrap series-detail-page">
    <Link className="text-link" to={media.type === "ANIME" ? "/anime" : "/manga"}><ArrowLeft size={15} /> Back to {media.type === "ANIME" ? "anime" : "manga"}</Link>
    <div className="series-detail-grid">
      <div className="series-detail-cover"><MediaImage media={media} /></div>
      <div className="series-detail-copy">
        <p className="eyebrow">{media.type} · {media.format || "SERIES"}</p><h1>{titleOf(media)}</h1>
        {media.title?.native && <p className="series-native-title">{media.title.native}</p>}
        <p className="series-genres">{media.genres?.join(" · ")}</p>
        <div className="series-facts">{media.averageScore != null && <span><Star size={14} fill="currentColor" /> {(media.averageScore / 10).toFixed(1)} / 10</span>}
          {media.startDate?.year && <span>{media.startDate.year}</span>}
          <span>{media.status?.replaceAll("_", " ") || "Status unavailable"}</span>
          {media.episodes && <span>{media.episodes} episodes</span>}
          {media.chapters && <span>{media.chapters} chapters</span>}
          {media.volumes && <span>{media.volumes} volumes</span>}
        </div>
        <div className="series-description">{cleanDescription(media.description) || "AniList does not provide a synopsis for this series."}</div>
        <div className="hero-actions"><button type="button" className={`button button-outline ${favorites.some((item) => item.id === media.id) ? "is-saved" : ""}`} onClick={() => onToggle(media)}><Heart size={16} fill={favorites.some((item) => item.id === media.id) ? "currentColor" : "none"} /> {favorites.some((item) => item.id === media.id) ? "In favorites" : "Add to favorites"}</button>
          {media.siteUrl && <a className="button button-ghost" href={media.siteUrl} target="_blank" rel="noreferrer">AniList page <ArrowUpRight size={15} /></a>}</div>
        <div className="series-demo-purchase"><AddDemoBagButton media={media} /><small>Demo sample item only; not a real product or stock listing.</small></div>
      </div>
    </div>
    {related.length > 0 && <MediaCarousel title="Related series" eyebrow="CONNECTED WORLDS" items={related} favorites={favorites} onToggle={onToggle} />}
  </main>;
}

export function SeriesManagement({ catalog, settings, setSettings }) {
  const [idInput, setIdInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const candidates = useMemo(() => [...new Map([
    ...settings.customMedia, ...catalog.trendingAnime, ...catalog.popularManga,
    ...catalog.updatedAnime, ...catalog.updatedManga,
  ].map((item) => [item.id, item])).values()], [catalog, settings.customMedia]);
  const featured = useMemo(() => {
    const byId = new Map(candidates.map((item) => [item.id, item]));
    return settings.featuredIds.map((id) => byId.get(id)).filter(Boolean);
  }, [candidates, settings.featuredIds]);
  function toggleFeatured(media) {
    setSettings((current) => ({
      ...current,
      featuredIds: current.featuredIds.includes(media.id)
        ? current.featuredIds.filter((id) => id !== media.id)
        : [...current.featuredIds, media.id],
    }));
    setNotice(`${titleOf(media)} ${settings.featuredIds.includes(media.id) ? "removed from" : "added to"} featured series.`);
  }
  async function addById(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const media = await fetchAniListMedia(idInput);
      setSettings((current) => ({
        ...current,
        customMedia: [...current.customMedia.filter((item) => item.id !== media.id), media],
        featuredIds: current.featuredIds.includes(media.id) ? current.featuredIds : [...current.featuredIds, media.id],
      }));
      setIdInput("");
      setNotice(`${titleOf(media)} added to your featured series.`);
    } catch (requestError) {
      setError(requestError.message || "Could not add that AniList series.");
    } finally {
      setBusy(false);
    }
  }
  return <main className="wrap discovery-listing management-page">
    <div className="page-banner"><p className="eyebrow"><Settings2 size={14} /> LOCAL SERIES MANAGEMENT</p><h1>Curate the spotlight.</h1><p>Feature or unfeature series without removing them from the AniList catalogue. Changes stay in this browser.</p></div>
    <form className="discovery-search management-add" onSubmit={addById}><label htmlFor="anilist-series-id">Add series by AniList ID</label><input id="anilist-series-id" inputMode="numeric" pattern="[0-9]+" required value={idInput} onChange={(event) => setIdInput(event.target.value)} placeholder="e.g. 21" /><button className="button button-red" type="submit" disabled={busy}>{busy ? "Adding…" : "Add series"}</button></form>
    {error && <p className="catalog-error" role="alert">{error}</p>}{notice && <p className="form-status status-success" role="status">{notice}</p>}
    <section className="management-featured"><div className="discovery-heading"><div><p className="eyebrow">HOMEPAGE ROTATION</p><h2>Featured series · {featured.length}</h2></div></div>
      {featured.length ? <div className="management-feature-list">{featured.map((media) => <article key={media.id}><MediaImage media={media} /><div><b>{titleOf(media)}</b><small>{media.type} · AniList ID {media.id}</small><label>Collection note<input value={settings.notes[media.id] || ""} maxLength={100} placeholder="Optional editorial note" onChange={(event) => setSettings((current) => ({ ...current, notes: { ...current.notes, [media.id]: event.target.value } }))} /></label></div><button type="button" className="button button-outline" onClick={() => toggleFeatured(media)}>Unfeature</button></article>)}</div> : <p className="media-empty">No featured series yet. Feature an existing series or add one by AniList ID.</p>}
    </section>
    <section className="management-candidates"><div className="discovery-heading"><div><p className="eyebrow">AVAILABLE CATALOGUE TITLES</p><h2>Choose what appears.</h2></div></div>
      <div className="management-list">{candidates.map((media) => <div key={media.id}><span>{titleOf(media)} <small>{media.type}</small></span><button type="button" className="text-link" onClick={() => toggleFeatured(media)}>{settings.featuredIds.includes(media.id) ? "Unfeature" : "Feature"} <ArrowRight size={14} /></button></div>)}</div>
    </section>
  </main>;
}

export function DiscoveryRoutes({ catalog: incomingCatalog, loading, error, usingCache, savedAt, refresh }) {
  const catalog = incomingCatalog || EMPTY_CATALOG;
  const { favorites, toggleFavorite } = useFavorites();
  const [settings, setSettings] = useManagement();
  const location = useLocation();
  const page = location.pathname;
  if (page === "/anime") return <BrowsePage catalog={catalog} favorites={favorites} onToggle={toggleFavorite} type="ANIME" />;
  if (page === "/manga") return <BrowsePage catalog={catalog} favorites={favorites} onToggle={toggleFavorite} type="MANGA" />;
  if (page === "/search") return <SearchPage catalog={catalog} favorites={favorites} onToggle={toggleFavorite} />;
  if (page === "/updates") return <UpdatesPage catalog={catalog} favorites={favorites} onToggle={toggleFavorite} />;
  if (page === "/favorites") return <FavoritesPage favorites={favorites} onToggle={toggleFavorite} />;
  if (page === "/manage") return <SeriesManagement catalog={catalog} settings={settings} setSettings={setSettings} />;
  if (page.startsWith("/series/")) return <SeriesDetails catalog={catalog} favorites={favorites} onToggle={toggleFavorite} />;
  return <DiscoveryHome catalog={catalog} loading={loading} error={error} usingCache={usingCache} savedAt={savedAt} refresh={refresh} favorites={favorites} onToggle={toggleFavorite} settings={settings} />;
}
