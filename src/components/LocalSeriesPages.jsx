import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Star } from "lucide-react";
import { featuredSeries } from "../data/featuredSeries.js";
import { getSeriesImage } from "../data/seriesArt.js";

const FAVORITES_KEY = "mangaverse-series-favorites-v1";

function readFavorites() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function useSeriesFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);
  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };
  return { favorites, toggleFavorite };
}

function SeriesPoster({ series }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? undefined : getSeriesImage(series);
  return <div className={`local-series-poster theme-${series.theme} ${image ? "has-poster" : ""}`} role="img" aria-label={image ? `${series.title} anime poster` : `Artwork for ${series.title}`}>
    {image && <img className="local-series-poster-image" src={image} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />}
    <span className="local-series-poster-mark" aria-hidden="true">{series.mark}</span>
    <span className="local-series-poster-label">MANGAVERSE COLLECTION</span>
    <strong>{series.title}</strong>
    <span className="local-series-poster-bottom">ANIME ADAPTATION</span>
  </div>;
}

function SeriesCard({ series, saved, onToggle }) {
  return <article className="local-series-card">
    <div className="local-series-card-visual">
      <Link to={`/series/${series.id}`} aria-label={`View details for ${series.title}`}><SeriesPoster series={series} /></Link>
      <button type="button" className={`wishlist-button ${saved ? "is-saved" : ""}`} aria-label={saved ? `Remove ${series.title} from favorites` : `Add ${series.title} to favorites`} aria-pressed={saved} onClick={() => onToggle(series.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
    </div>
    <div className="local-series-card-info">
      <span>{series.genres.join(" · ")}</span>
      <Link to={`/series/${series.id}`}>{series.title}</Link>
      <small>{series.author}</small>
      <div><span><Star size={12} fill="currentColor" /> {series.rating}</span><Link to={`/series/${series.id}`}>Details <ArrowRight size={13} /></Link></div>
    </div>
  </article>;
}

function SeriesGrid({ items, favorites, onToggle }) {
  return items.length ? <div className="local-series-grid">{items.map((item) => <SeriesCard key={item.id} series={item} saved={favorites.includes(item.id)} onToggle={onToggle} />)}</div>
    : <div className="empty-state"><Heart size={27} /><h2>No favorites saved yet.</h2><p>Tap a heart on a series to keep it close.</p><Link className="button button-red" to="/anime">Explore anime <ArrowRight size={15} /></Link></div>;
}

export function LocalSeriesPage() {
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useSeriesFavorites();
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return featuredSeries.filter((item) => !term || [item.title, item.author, ...item.genres].some((value) => value.toLowerCase().includes(term)));
  }, [query]);
  return <main className="page-content wrap local-series-page">
    <div className="page-banner"><p className="eyebrow">CURATED SERIES · NO EXTERNAL CATALOGUE</p><h1>Anime to <em>explore.</em></h1><p>Browse a locally maintained selection of popular anime adaptations.</p></div>
    <label className="local-series-search">Search series<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, creator or genre" /></label>
    <p className="local-series-count">{filtered.length} series</p>
    {filtered.length ? <SeriesGrid items={filtered} favorites={favorites} onToggle={toggleFavorite} /> : <div className="empty-state"><h2>No series found.</h2><p>Try a different title, creator or genre.</p></div>}
  </main>;
}

export function LocalFavoritesPage() {
  const { favorites, toggleFavorite } = useSeriesFavorites();
  const saved = featuredSeries.filter((item) => favorites.includes(item.id));
  return <main className="page-content wrap local-series-page">
    <div className="page-banner"><p className="eyebrow">YOUR LOCAL SHORTLIST</p><h1>My <em>favorites.</em></h1><p>Saved in this browser. No external catalogue or account is required.</p></div>
    <SeriesGrid items={saved} favorites={favorites} onToggle={toggleFavorite} />
  </main>;
}

export function LocalSeriesDetailsPage() {
  const { id } = useParams();
  const series = featuredSeries.find((item) => item.id === id);
  const { favorites, toggleFavorite } = useSeriesFavorites();
  if (!series) return <main className="page-content wrap"><div className="empty-state"><h2>That series isn't in this collection.</h2><Link className="button button-red" to="/anime">Browse anime <ArrowRight size={15} /></Link></div></main>;
  const saved = favorites.includes(series.id);
  return <main className="page-content wrap local-series-detail">
    <Link className="text-link" to="/anime"><ArrowLeft size={15} /> Back to anime</Link>
    <div className="local-series-detail-grid">
      <SeriesPoster series={series} />
      <div><p className="eyebrow">ANIME ADAPTATION · {series.genres.join(" / ")}</p><h1>{series.title}</h1><p className="local-series-author">By {series.author}</p><p className="local-series-rating"><Star size={15} fill="currentColor" /> {series.rating} community score · {series.volumes} volumes</p><p className="local-series-description">{series.description}</p>
        <div className="hero-actions"><button type="button" className={`button button-outline ${saved ? "is-saved" : ""}`} aria-pressed={saved} onClick={() => toggleFavorite(series.id)}><Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "In favorites" : "Add to favorites"}</button><Link className="button button-red" to="/manga">Shop manga <ArrowRight size={15} /></Link></div>
        {series.latestRelease && <a className="local-series-publisher-link" href={series.latestRelease.source} target="_blank" rel="noreferrer">Publisher listing: {series.latestRelease.title} <ArrowUpRight size={14} /></a>}
      </div>
    </div>
  </main>;
}
