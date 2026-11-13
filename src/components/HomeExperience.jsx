import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, X } from "lucide-react";
import { featuredSeries, latestEnglishEditions } from "../data/featuredSeries.js";

const seriesArtFiles = import.meta.glob("../assets/series/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
  query: "?url",
});

const seriesArt = Object.fromEntries(
  Object.entries(seriesArtFiles).map(([path, url]) => [
    path.split("/").pop().replace(/\.(png|jpe?g|webp|avif)$/i, ""),
    url,
  ]),
);

function getSeriesImage(series, coverKey = series.coverKey) {
  return seriesArt[coverKey];
}

function formatReleaseDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function SeriesArtwork({ series, hero = false, coverKey = series.coverKey }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? undefined : getSeriesImage(series, coverKey);
  return (
    <div
      className={`series-art theme-${series.theme} ${hero ? "series-art-hero" : ""} ${image ? "has-cover-art" : ""}`}
      role="img"
      aria-label={image ? `${series.title} manga cover artwork` : `Original artwork slot for ${series.title}; add authorized cover art in src/assets/series`}
    >
      {image && <img className="series-cover-image" src={image} alt="" loading={hero ? "eager" : "lazy"} decoding="async" onError={() => setImageFailed(true)} />}
      <span className="art-sun" />
      <span className="art-landscape art-landscape-back" />
      <span className="art-landscape art-landscape-front" />
      <span className="art-mark" aria-hidden="true">{series.mark}</span>
      <span className="art-index">MANGA VERSE / FEATURE {String(featuredSeries.indexOf(series) + 1).padStart(2, "0")}</span>
      {!image && <span className="art-slot-label">ADD LICENSED COVER</span>}
      <strong className="art-title">{series.title}</strong>
      {hero && <span className="art-edition">{series.latestRelease?.title ?? "THE COLLECTOR'S EDITION · VOL. 01"}</span>}
    </div>
  );
}

function LatestEditions() {
  return (
    <section className="latest-editions" aria-labelledby="latest-editions-title">
      <div className="latest-editions-inner">
        <div className="latest-editions-heading">
          <div>
            <p className="eyebrow">PUBLISHER-VERIFIED · ENGLISH EDITIONS</p>
            <h2 id="latest-editions-title">The latest <em>on the shelf.</em></h2>
            <p>Newest confirmed English volume releases, kept in date order.</p>
          </div>
          <span className="latest-updated"><i /> RELEASE DATES: MANUALLY VERIFIED</span>
        </div>
        <div className="latest-editions-grid">
          {latestEnglishEditions.map((series) => (
            <article className="latest-edition-card" key={series.id}>
              <div className="latest-edition-cover">
                <SeriesArtwork series={series} coverKey={series.latestRelease.coverKey} />
                <span className="latest-badge">LATEST EDITION</span>
              </div>
              <div className="latest-edition-info">
                <p className="eyebrow">{formatReleaseDate(series.latestRelease.releaseDate)} · ENGLISH RELEASE</p>
                <h3>{series.latestRelease.title}</h3>
                <p>By {series.author}</p>
                <a href={series.latestRelease.source} target="_blank" rel="noreferrer">
                  Check publisher listing <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="latest-editions-note">Release dates reflect the linked English-language publisher listings. Local India stock and availability may differ.</p>
      </div>
    </section>
  );
}

function SeriesCard({ series, onOpen, index }) {
  return (
    <motion.article
      className="series-card"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
    >
      <button className="series-card-art-button" onClick={() => onOpen(series)} aria-label={`View details for ${series.title}`}>
        <SeriesArtwork series={series} />
        <span className="series-card-action">DISCOVER SERIES <ArrowUpRight size={13} /></span>
      </button>
      <div className="series-card-info">
        <div className="series-card-kicker"><span>{series.genres.join(" · ")}</span><span className="series-rating"><span aria-hidden="true">★</span> {series.rating}</span></div>
        <h3>{series.title}</h3>
        <p>{series.author}</p>
        <div className="series-card-bottom"><span><BookOpen size={13} /> {series.volumes} volumes</span><button onClick={() => onOpen(series)}>Series notes <ArrowRight size={13} /></button></div>
      </div>
    </motion.article>
  );
}

function SeriesDialog({ series, onClose }) {
  if (!series) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="series-dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <motion.section
          className="series-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="series-dialog-title"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
        >
          <button className="series-dialog-close" onClick={onClose} aria-label="Close series details"><X size={19} /></button>
          <div className="series-dialog-art"><SeriesArtwork series={series} hero /></div>
          <div className="series-dialog-copy">
            <p className="eyebrow">SERIES NOTES · {series.genres.join(" / ")}</p>
            <h2 id="series-dialog-title">{series.title}</h2>
            <p className="series-dialog-author">By {series.author}</p>
            <div className="series-dialog-facts"><span><BookOpen size={15} /> {series.volumes} volumes</span><span><span aria-hidden="true">★</span> {series.rating} demo reader score</span></div>
            <p className="series-dialog-description">{series.description}</p>
            <div className="series-artwork-note"><Check size={15} /> {getSeriesImage(series) ? "Publisher cover image loaded from your local asset." : "Add your licensed cover file to src/assets/series."}</div>
            <button className="button button-red" onClick={onClose}>Back to featured series <ArrowRight size={16} /></button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HomeExperience() {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesOffset, setSeriesOffset] = useState(0);
  const visibleSeries = featuredSeries.slice(seriesOffset, seriesOffset + 4);

  function moveSeries(direction) {
    setSeriesOffset((current) => Math.min(
      Math.max(current + direction, 0),
      featuredSeries.length - 4,
    ));
  }

  const heroSeries = latestEnglishEditions[0] ?? featuredSeries[0];
  return (
    <>
      <main>
        <section className="manga-hero" aria-labelledby="hero-title">
          <div className="hero-grain" />
          <div className="hero-vertical-copy" aria-hidden="true">物語は、ここから</div>
          <div className="manga-hero-inner">
            <div className="manga-hero-copy">
              <p className="hero-edition"><span /> THE COLLECTOR'S UNIVERSE <span>EST. 2025</span></p>
              <h1 id="hero-title">ENTER THE<br />WORLD OF <em>MANGA.</em></h1>
              <p className="manga-hero-intro">Discover legendary stories, unforgettable characters and extraordinary worlds. Your next obsession starts here.</p>
              <div className="manga-hero-actions">
                <a className="button button-red" href="#featured-series">Explore manga <ArrowDown size={16} /></a>
                <a className="button button-outline" href="#collector-note">Discover collections <ArrowUpRight size={15} /></a>
              </div>
              <div className="hero-featured-note">
                <span className="hero-note-index">01</span>
                <span><small>LATEST PUBLISHER LISTING · {heroSeries.latestRelease.title}</small><b>{heroSeries.title}</b><i>By {heroSeries.author}</i></span>
                <button onClick={() => setSelectedSeries(heroSeries)} aria-label={`Read ${heroSeries.title} series notes`}><ArrowUpRight size={17} /></button>
              </div>
            </div>
            <button className="manga-hero-art-button" onClick={() => setSelectedSeries(heroSeries)} aria-label="Open featured series notes for One Piece">
              <SeriesArtwork series={heroSeries} hero coverKey={heroSeries.latestRelease?.coverKey ?? heroSeries.coverKey} />
              <span className="hero-art-caption">NEWEST CONFIRMED <span>·</span> {heroSeries.latestRelease.title.toUpperCase()}</span>
            </button>
          </div>
          <div className="hero-bottomline"><span>DISCOVER STORIES. COLLECT LEGENDS.</span><a href="#featured-series">SCROLL TO EXPLORE <ArrowDown size={13} /></a></div>
        </section>

        <LatestEditions />

        <section className="series-section" id="featured-series" aria-labelledby="series-heading">
          <div className="home-section-head">
            <div>
              <p className="eyebrow">THE WORLDS THAT STAY WITH YOU</p>
              <h2 id="series-heading">Legends on <em>the shelf.</em></h2>
              <p className="home-section-intro">A first look at the stories that shaped a generation—and the ones readers keep passing along.</p>
            </div>
            <div className="series-rail-controls">
              <span>{String(seriesOffset + 1).padStart(2, "0")} <i>/</i> {String(featuredSeries.length - 3).padStart(2, "0")}</span>
              <button onClick={() => moveSeries(-1)} disabled={seriesOffset === 0} aria-label="Show previous manga series"><ArrowLeft size={17} /></button>
              <button onClick={() => moveSeries(1)} disabled={seriesOffset >= featuredSeries.length - 4} aria-label="Show more manga series"><ArrowRight size={17} /></button>
            </div>
          </div>
          <span id="characters" className="home-anchor" />
          <div className="series-rail" role="region" aria-label="Featured manga series" aria-live="polite">
            {visibleSeries.map((series, index) => <SeriesCard key={series.id} series={series} index={seriesOffset + index} onOpen={setSelectedSeries} />)}
          </div>
          <p className="artwork-disclosure">Original art slots are shown until authorized cover artwork is added. Reader scores are demonstration data.</p>
        </section>

        <section className="collector-note" id="collector-note" aria-labelledby="collector-heading">
          <div className="collector-note-art" aria-hidden="true"><span className="collector-ring ring-one" /><span className="collector-ring ring-two" /><span className="collector-jp">蒐集</span><span className="collector-stamp">MV<br />01</span></div>
          <div className="collector-note-copy">
            <p className="eyebrow">A HOME FOR EVERY UNIVERSE</p>
            <h2 id="collector-heading">Stories to read.<br /><em>Worlds to keep.</em></h2>
            <p>From first-volume discoveries to shelf-worthy favourites, MangaVerse brings the reader and the collector into one universe.</p>
            <Link className="text-link" to="/manga">Step into the store <ArrowRight size={16} /></Link>
          </div>
          <span className="collector-note-index">COLLECTOR'S NOTE&nbsp; / &nbsp;001</span>
        </section>
      </main>
      <SeriesDialog series={selectedSeries} onClose={() => setSelectedSeries(null)} />
    </>
  );
}
