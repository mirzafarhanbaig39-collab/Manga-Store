import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, RefreshCw, Search, Settings2, ShoppingBag, Star } from "lucide-react";
import { fetchAniListMedia, searchAniList } from "../services/anilist.js";
import { useStore } from "../context/StoreContext.jsx";

const FAVORITES_KEY = "mangaverse-anilist-favorites-v1";
const MANAGEMENT_KEY = "mangaverse-series-management-v1";
const GENRES = [
  "Action", "Adventure", "Fantasy", "Romance", "Horror", "Mystery",
  "Thriller", "Comedy", "Supernatural", "Sci-Fi", "Sports", "Martial Arts",
];
const EMPTY_CATALOG = {
  popularManga: [], curatedManga: [], trendingManga: [], newManga: [],
  trendingAnime: [], updatedManga: [], updatedAnime: [],
};

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
  if (typeof description !== "string") return "";
  return description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function mediaHasGenre(media, genre) {
  return media.genres?.includes(genre) || media.tags?.some((tag) => tag.name === genre);
}

function MediaImage({ media, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  const image = imageOf(media);
  useEffect(() => setFailed(false), [image, media.id]);
  return <div className={`media-image ${failed || !image ? "media-image-fallback" : ""} ${className}`}>
    {image && !failed
      ? <img src={image} alt={`${titleOf(media)} manga cover`} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />
      : <div className="media-image-fallback-art" role="img" aria-label={`${titleOf(media)} cover artwork unavailable`}>
        <span>{media.genres?.[0] || "MANGA VERSE"}</span><strong>{titleOf(media)}</strong><small>Cover artwork unavailable</small>
      </div>}
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
    onPointerDown={(event) => event.stopPropagation()}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      addToCart(product);
    }}
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
      {updated && date && <span className="media-update-tag">CATALOGUE RECORD</span>}
    </div>
    <div className="media-card-copy">
      <div className="media-card-meta">
        <span>{media.genres?.slice(0, 2).join(" · ") || media.type}</span>
        {media.averageScore != null
          ? <span className="media-rating"><Star size={12} fill="currentColor" /> {(media.averageScore / 10).toFixed(1)}</span>
          : <span className="media-rating">No score</span>}
      </div>
      <Link className="media-title" to={`/series/${media.id}`}>{titleOf(media)}</Link>
      <p className="media-card-description">{cleanDescription(media.description) || "Explore the series, its publication details and related stories."}</p>
      <div className="media-card-footer"><span>{year || media.status?.replaceAll("_", " ").toLowerCase() || "AniList title"}{media.chapters ? ` · ${media.chapters} chapters` : ""}</span>
        {updated && date && <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>}
      </div>
      <AddDemoBagButton media={media} />
    </div>
  </article>;
}

function MediaCarousel({ title, eyebrow, items = [], favorites, onToggle, updated = false, action, loading = false }) {
  const railRef = useRef(null);
  const pointer = useRef(null);
  const dragged = useRef(false);
  const scroll = (direction) => railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: "smooth" });
  return <section className="discovery-section" role="region" aria-label={`${title} carousel`}>
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
      role="group"
      aria-label={`${title} carousel`}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && !event.target.closest("button, a")) {
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
        if (dragged.current && !event.target.closest("button, a")) {
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }
      }}
    >
      {items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} updated={updated} />)}
    </div> : loading
      ? <div className="media-skeleton-rail" role="status" aria-label={`Loading ${title}`}>
        {Array.from({ length: 6 }, (_, index) => <div className="media-skeleton" key={index}><span /><i /><i /></div>)}
      </div>
      : <div className="media-empty">No verified catalogue entries are available here right now.</div>}
  </section>;
}

function FreshnessStatus({ loading, error, usingCache, usingFallback, savedAt, onRefresh }) {
  return <div className="catalog-status" aria-live="polite">
    <span>{loading ? "Connecting to AniList…" : usingFallback ? "Showing the local manga guide" : usingCache ? "Showing saved catalogue data" : "Live catalogue from AniList"}</span>
    {savedAt && <span>Last fetched {new Date(savedAt).toLocaleString()}</span>}
    {error && <span className="catalog-error">{error}</span>}
    <button type="button" className="text-link" onClick={onRefresh} disabled={loading}><RefreshCw size={14} /> Retry</button>
  </div>;
}

function HeroFeature({ media, index, total, onPrevious, onNext, favorites, onToggle }) {
  if (!media) return <section className="discovery-hero discovery-hero-empty">
    <div className="wrap"><p className="eyebrow">MANGAVERSE · MANGA DISCOVERY</p><h1>Find your next<br /><em>great story.</em></h1>
      <p className="discovery-hero-text">A fresh reading list is on its way. Browse the local manga guide while catalogue data reconnects.</p>
      <Link className="button button-red" to="/manga">Browse manga <ArrowRight size={16} /></Link>
    </div>
  </section>;
  const banner = media.bannerImage;
  const score = media.averageScore == null ? "" : (media.averageScore / 10).toFixed(1);
  return <section className="discovery-hero" style={banner ? { "--hero-cover": `url("${banner}")` } : undefined}>
    <div className="discovery-hero-scrim" />
    <div className="wrap discovery-hero-inner">
      <div className="discovery-hero-copy">
        <p className="eyebrow">MANGAVERSE SPOTLIGHT · {media.type}</p>
        <h1>Enter the world<br /><em>of manga.</em></h1>
        <h2>{titleOf(media)}</h2>
        <p className="discovery-hero-text">{cleanDescription(media.description) || "Explore the worlds and stories readers are discovering right now."}</p>
        <div className="discovery-hero-meta">
          {media.genres?.slice(0, 3).join(" · ")}
          {media.startDate?.year ? ` · ${media.startDate.year}` : ""}
          {score && <span className="hero-score"><Star size={14} fill="currentColor" /> {score}</span>}
        </div>
        <div className="hero-actions"><Link className="button button-red" to={`/series/${media.id}`}>Explore this series <ArrowRight size={16} /></Link><Link className="button button-ghost" to="/manga">Discover manga</Link>
          <FavoriteButton media={media} favorites={favorites} onToggle={onToggle} />
        </div>
      </div>
      <div className="discovery-hero-art"><MediaImage media={media} className="hero-cover" eager /></div>
      <div className="discovery-hero-controls">
        <button type="button" className="rail-arrow" aria-label="Previous featured series" onClick={onPrevious}><ArrowLeft size={17} /></button>
        <span>0{index + 1} <i>/</i> 0{total}</span>
        <button type="button" className="rail-arrow" aria-label="Next featured series" onClick={onNext}><ArrowRight size={17} /></button>
      </div>
    </div>
  </section>;
}

function GenreExplorer({ onSelect }) {
  return <section className="discovery-section genre-explorer" id="genres">
    <div className="discovery-heading">
      <div><p className="eyebrow">PICK A PATH</p><h2>Explore by genre.</h2><p className="section-intro">Find the kind of story you’re in the mood for.</p></div>
      <Link className="text-link" to="/manga">All manga <ArrowRight size={15} /></Link>
    </div>
    <div className="discovery-genres">{GENRES.map((genre, index) => <button className={`genre-tile genre-tone-${index % 6}`} key={genre} type="button" onClick={() => onSelect(genre)}>
      <span className="genre-tile-index">{String(index + 1).padStart(2, "0")}</span><strong>{genre}</strong><ArrowUpRight size={16} />
    </button>)}</div>
  </section>;
}

function PopularMangaCollection({ items, favorites, onToggle }) {
  return <section className="discovery-section popular-collection" id="popular-manga">
    <div className="discovery-heading">
      <div><p className="eyebrow">THE ESSENTIAL READING LIST</p><h2>The collection</h2><p className="section-intro">A hand-picked gateway to celebrated manga worlds. Scores and descriptions come from AniList when available.</p></div>
      <Link className="text-link" to="/manga">Browse the collection <ArrowRight size={15} /></Link>
    </div>
    <div className="discovery-popular-grid">{items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} />)}</div>
  </section>;
}

export function DiscoveryHome({ catalog, loading, error, usingCache, usingFallback, savedAt, refresh, favorites, onToggle, settings }) {
  const allFeatures = useMemo(() => {
    const mangaItems = catalog.curatedManga?.length ? catalog.curatedManga : catalog.popularManga;
    const combined = [...settings.customMedia, ...mangaItems];
    const ids = new Set(settings.featuredIds);
    const selected = combined.filter((item) => ids.has(item.id) && item.type === "MANGA");
    return selected.length ? selected : mangaItems.slice(0, 4);
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
  const curatedManga = catalog.curatedManga?.length ? catalog.curatedManga : catalog.popularManga;
  const popularIds = new Set(curatedManga.map((item) => item.id));
  const trendingManga = catalog.trendingManga.filter((item) => !popularIds.has(item.id));
  const trendingIds = new Set(trendingManga.map((item) => item.id));
  const newManga = catalog.newManga.filter((item) => !popularIds.has(item.id) && !trendingIds.has(item.id));

  return <main className="discovery-page">
    <HeroFeature
      media={featured}
      index={featureIndex}
      total={allFeatures.length}
      onPrevious={() => setFeatureIndex((index) => (index - 1 + allFeatures.length) % allFeatures.length)}
      onNext={() => setFeatureIndex((index) => (index + 1) % allFeatures.length)}
      favorites={favorites}
      onToggle={onToggle}
    />
    <div className="wrap discovery-content">
      <FreshnessStatus loading={loading} error={error} usingCache={usingCache} usingFallback={usingFallback} savedAt={savedAt} onRefresh={refresh} />
      <MediaCarousel title="Latest manga updates" eyebrow="RECENTLY TOUCHED CATALOGUE RECORDS" items={catalog.updatedManga} favorites={favorites} onToggle={onToggle} updated loading={loading} action={{ label: "All manga updates", to: "/updates" }} />
      <p className="catalog-footnote">Update dates reflect AniList catalogue record edits, not confirmed chapter or volume publication dates.</p>
      <MediaCarousel title="Popular manga" eyebrow="POPULARITY ON ANILIST" items={catalog.popularManga.filter((item) => !popularIds.has(item.id))} favorites={favorites} onToggle={onToggle} loading={loading} action={{ label: "Browse the collection", to: "/manga" }} />
      <PopularMangaCollection items={curatedManga.slice(0, 18)} favorites={favorites} onToggle={onToggle} />
      <GenreExplorer onSelect={(genre) => genreNavigate(`/manga?genre=${encodeURIComponent(genre)}`)} />
      <MediaCarousel title="Trending manga" eyebrow="READER MOMENTUM ON ANILIST" items={trendingManga} favorites={favorites} onToggle={onToggle} loading={loading} action={{ label: "Explore manga", to: "/manga" }} />
      <MediaCarousel title="Newly listed manga" eyebrow="RECENTLY STARTED SERIES" items={newManga} favorites={favorites} onToggle={onToggle} loading={loading} action={{ label: "Browse new series", to: "/manga?sort=new" }} />
      <MediaCarousel title="Trending anime" eyebrow="FROM PAGE TO SCREEN" items={catalog.trendingAnime} favorites={favorites} onToggle={onToggle} loading={loading} action={{ label: "Browse anime", to: "/anime" }} />
      <MediaCarousel title="Recently updated anime" eyebrow="ANILIST CATALOGUE ACTIVITY" items={catalog.updatedAnime} favorites={favorites} onToggle={onToggle} updated loading={loading} action={{ label: "Latest anime updates", to: "/updates" }} />
    </div>
  </main>;
}

function BrowsePage({ catalog, favorites, onToggle, type }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [genre, setGenre] = useState(params.get("genre") || "");
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState(params.get("status") || "");
  const [sort, setSort] = useState(params.get("sort") || "popular");
  useEffect(() => {
    const current = new URLSearchParams(location.search);
    setGenre(current.get("genre") || "");
    setQuery(current.get("q") || "");
    setStatus(current.get("status") || "");
    setSort(current.get("sort") || "popular");
  }, [location.search]);
  const allMedia = type === "ANIME"
    ? [...catalog.trendingAnime, ...catalog.updatedAnime]
    : [...catalog.curatedManga, ...catalog.popularManga, ...catalog.trendingManga, ...catalog.newManga, ...catalog.updatedManga];
  const items = useMemo(() => {
    const unique = [...new Map(allMedia.map((media) => [media.id, media])).values()];
    const term = query.trim().toLowerCase();
    const filtered = unique.filter((media) =>
      (!term || titleOf(media).toLowerCase().includes(term)) &&
      (!genre || mediaHasGenre(media, genre)) &&
      (!status || media.status === status),
    );
    if (sort === "score") filtered.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    if (sort === "popular") filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    if (sort === "title") filtered.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    if (sort === "new") filtered.sort((a, b) => (b.startDate?.year || 0) - (a.startDate?.year || 0));
    return filtered;
  }, [allMedia, genre, query, sort, status]);
  function updateFilter(key, value) {
    const next = new URLSearchParams();
    const values = { genre, q: query.trim(), status, sort, [key]: value };
    Object.entries(values).forEach(([name, item]) => {
      if (item) next.set(name, item);
    });
    navigate({ search: next.toString() ? `?${next.toString()}` : "" }, { replace: true });
  }
  const heading = type === "ANIME" ? "Explore anime." : "Explore manga.";
  return <main className="wrap discovery-listing">
    <div className="page-banner"><p className="eyebrow">MANGAVERSE DISCOVERY · {type}</p><h1>{heading}</h1><p>Search real catalogue entries, explore by genre and find your next series.</p></div>
    <div className="discovery-filters">
      <label className="browse-search"><span>Title</span><input aria-label="Search titles" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title" /></label>
      <label><span>Genre</span><select aria-label="Filter series by genre" value={genre} onChange={(event) => { setGenre(event.target.value); updateFilter("genre", event.target.value); }}><option value="">All genres</option>{GENRES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Status</span><select aria-label="Filter by publication status" value={status} onChange={(event) => { setStatus(event.target.value); updateFilter("status", event.target.value); }}><option value="">Any status</option><option value="RELEASING">Releasing</option><option value="FINISHED">Finished</option><option value="HIATUS">Hiatus</option><option value="NOT_YET_RELEASED">Not yet released</option><option value="CANCELLED">Cancelled</option></select></label>
      <label><span>Sort by</span><select aria-label="Sort series" value={sort} onChange={(event) => { setSort(event.target.value); updateFilter("sort", event.target.value); }}><option value="popular">Popularity</option><option value="score">Highest rating</option><option value="new">Release year</option><option value="title">Title A–Z</option></select></label>
      <span className="filter-count">{items.length} titles</span>
    </div>
    {items.length
      ? <div className="discovery-grid">{items.map((media) => <MediaCard key={media.id} media={media} favorites={favorites} onToggle={onToggle} />)}</div>
      : <div className="media-empty"><h2>No titles match those filters.</h2><p>Try a different title, genre or publication status.</p></div>}
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
        ...catalog.curatedManga, ...catalog.popularManga, ...catalog.trendingManga,
        ...catalog.newManga, ...catalog.trendingAnime,
        ...catalog.updatedManga, ...catalog.updatedAnime,
      ].filter((media) => mediaHasGenre(media, genre));
      setItems([...new Map(localItems.map((media) => [media.id, media])).values()]);
      setLoading(false);
      setError("");
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchAniList(query, { signal: controller.signal }).then(setItems).catch((requestError) => {
      if (requestError.name !== "AbortError") {
        const localItems = [
          ...catalog.curatedManga, ...catalog.popularManga, ...catalog.trendingManga,
          ...catalog.newManga, ...catalog.updatedManga, ...catalog.updatedAnime,
        ].filter((media) => titleOf(media).toLowerCase().includes(query.trim().toLowerCase()));
        setItems([...new Map(localItems.map((media) => [media.id, media])).values()]);
        setError(requestError.message);
      }
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
  const known = useMemo(() => [
    ...catalog.curatedManga, ...catalog.popularManga, ...catalog.trendingManga,
    ...catalog.newManga, ...catalog.trendingAnime, ...catalog.updatedManga, ...catalog.updatedAnime,
  ].find((item) => item.id === mediaId || item.id === id), [catalog, id, mediaId]);
  const [media, setMedia] = useState(known || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!known);
  useEffect(() => {
    setMedia(known || null);
    setError("");
    setLoading(!known);
    if (known?.isFallback) return undefined;
    const controller = new AbortController();
    // The full request includes related series, which are not part of the list feeds.
    fetchAniListMedia(id, { signal: controller.signal }).then(setMedia).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, known]);
  if (loading) return <main className="wrap discovery-listing"><p className="catalog-loading">Loading series details…</p></main>;
  if (error || !media) return <main className="wrap discovery-listing"><div className="media-empty"><h1>Series unavailable</h1><p>{error || "No details were found."}</p><Link className="text-link" to="/manga"><ArrowLeft size={15} /> Back to manga</Link></div></main>;
  const related = media.relations?.edges?.map((edge) => edge.node).filter((node) => node && node.id && node.type === "MANGA") || [];
  const contributors = [...new Set((media.staff?.edges || [])
    .filter((edge) => /story|art|author|original/i.test(edge.role || ""))
    .map((edge) => edge.node?.name?.full)
    .filter(Boolean))];
  const startDate = media.startDate?.year
    ? [media.startDate.year, media.startDate.month, media.startDate.day].filter(Boolean).join("-")
    : "";
  const status = media.status?.replaceAll("_", " ").toLowerCase();
  return <main className="wrap series-detail-page">
    <Link className="text-link" to={media.type === "ANIME" ? "/anime" : "/manga"}><ArrowLeft size={15} /> Back to {media.type === "ANIME" ? "anime" : "manga"}</Link>
    <div className="series-detail-grid">
      <div className="series-detail-cover"><MediaImage media={media} /></div>
      <div className="series-detail-copy">
        <p className="eyebrow">{media.type} · {media.format || "SERIES"}</p><h1>{titleOf(media)}</h1>
        {media.title?.native && <p className="series-native-title">{media.title.native}</p>}
        <p className="series-genres">{media.genres?.join(" · ")}</p>
        <div className="series-facts">{media.averageScore != null
          ? <span><Star size={14} fill="currentColor" /> {(media.averageScore / 10).toFixed(1)} / 10</span>
          : <span>Not rated</span>}
          {status && <span>{status}</span>}
          {startDate && <span>Started {startDate}</span>}
          {media.episodes && <span>{media.episodes} episodes</span>}
          {media.chapters && <span>{media.chapters} chapters</span>}
          {media.volumes && <span>{media.volumes} volumes</span>}
        </div>
        {contributors.length > 0 && <p className="series-contributors">Creator · {contributors.join(", ")}</p>}
        <div className="series-description">{cleanDescription(media.description) || (media.isFallback
          ? "Full synopsis and publication details will appear when AniList is available."
          : "AniList does not provide a synopsis for this series.")}</div>
        <div className="hero-actions"><button type="button" className={`button button-outline ${favorites.some((item) => item.id === media.id) ? "is-saved" : ""}`} onClick={() => onToggle(media)}><Heart size={16} fill={favorites.some((item) => item.id === media.id) ? "currentColor" : "none"} /> {favorites.some((item) => item.id === media.id) ? "In favorites" : "Add to favorites"}</button>
          {media.siteUrl && <a className="button button-ghost" href={media.siteUrl} target="_blank" rel="noreferrer">AniList page <ArrowUpRight size={15} /></a>}</div>
        {!media.isFallback && <div className="series-demo-purchase"><AddDemoBagButton media={media} /><small>Demo sample item only; not a real product or stock listing.</small></div>}
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
    ...catalog.updatedAnime, ...catalog.updatedManga, ...catalog.curatedManga,
    ...catalog.trendingManga, ...catalog.newManga,
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
