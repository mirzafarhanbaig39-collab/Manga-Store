import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, Menu, Minus,
  Plus, Search, ShoppingBag, Sparkles, Star, Trash2, UserRound, X,
} from "lucide-react";
import { allProducts, genres, manga, merchandise, series } from "./data/catalog.js";
import { useStore } from "./context/StoreContext.jsx";
import HomeExperience from "./components/HomeExperience.jsx";
import { DiscoveryRoutes } from "./components/DiscoveryPlatform.jsx";
import { useAniListCatalog } from "./hooks/useAniListCatalog.js";

const money = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function Brand({ compact = false }) {
  return <Link to="/" className="brand" aria-label="MANGAVERSE home">
    <span className="brand-mark">M.</span><span className={compact ? "sr-only" : ""}>MANGA<span className="brand-light">VERSE</span></span>
  </Link>;
}

function Header({ onCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { cartCount, wishlist } = useStore();
  const submit = (event) => {
    event.preventDefault();
    navigate(`/search${search ? `?q=${encodeURIComponent(search)}` : ""}`);
    setMenuOpen(false);
  };
  return <>
    <div className="announcement"><span>DISCOVER STORIES</span><span className="announcement-divider">✳</span><span>COLLECT LEGENDS</span><span className="announcement-divider">✳</span><span>EXPLORE EVERY UNIVERSE</span></div>
    <header className="site-header">
      <div className="header-main wrap">
        <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Brand />
        <form className="search-box" onSubmit={submit}>
          <Search size={17} aria-hidden="true" />
          <input aria-label="Search anime, manga and genres" placeholder="Search stories and genres..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <kbd>↵</kbd>
        </form>
        <div className="header-actions">
          <Link className="header-link" to="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved items`}><Heart /><span className="action-label">Saved</span>{wishlist.length > 0 && <b className="count-badge">{wishlist.length}</b>}</Link>
          <button className="header-link" onClick={onCart} aria-label={`Open bag, ${cartCount} items`}><ShoppingBag /><span className="action-label">Bag</span><b className="count-badge">{cartCount}</b></button>
          <details className="account-menu"><summary className="header-link" aria-label="Open account menu"><UserRound /><span className="action-label">Profile</span></summary><div className="account-popover"><b>Your MangaVerse</b><span>Favorites and cart are saved on this device.</span><Link to="/favorites" onClick={() => setMenuOpen(false)}>Your favorites</Link><Link to="/manage" onClick={() => setMenuOpen(false)}>Manage series</Link><Link to="/cart" onClick={() => setMenuOpen(false)}>Your bag</Link></div></details>
        </div>
      </div>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
        <div className="wrap nav-inner">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/anime" onClick={() => setMenuOpen(false)}>Anime</Link>
          <Link to="/manga" onClick={() => setMenuOpen(false)}>Manga</Link>
          <Link to="/updates" onClick={() => setMenuOpen(false)}>Latest updates</Link>
          <a href="/#genres" onClick={() => setMenuOpen(false)}>Genres</a>
          <a href="/#popular-manga" onClick={() => setMenuOpen(false)}>Collections</a>
          <Link to="/favorites" onClick={() => setMenuOpen(false)}>Favorites</Link>
          <Link to="/manage" onClick={() => setMenuOpen(false)}>Manage series</Link>
        </div>
      </nav>
    </header>
  </>;
}

function CoverArt({ item, large = false }) {
  return <div className={`cover-art theme-${item.theme} ${large ? "cover-large" : ""}`} aria-label={`Illustrated cover art for ${item.title}`} role="img">
    <span className="cover-orbit" /><span className="cover-sun" /><span className="cover-jp">{item.mark}</span>
    <span className="cover-caption">MANGAVERSE ORIGINAL<br />VOL. 01 — {item.genre || item.category}</span>
    <strong>{item.title}</strong><span className="cover-footer">STORIES FROM ANOTHER WORLD</span>
  </div>;
}

function SectionHeading({ eyebrow, title, text, action, to = "/manga" }) {
  return <div className="section-heading">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-intro">{text}</p>}</div>
    {action && <Link className="text-link" to={to}>{action}<ArrowRight size={16} /></Link>}
  </div>;
}

function ProductCard({ product, onQuickView }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const saved = wishlist.some((item) => item.id === product.id);
  return <article className="product-card">
    <div className="product-visual">
      <Link to={`/manga/${product.id}`} className="product-image-link" aria-label={`View ${product.title}`}><CoverArt item={product} /></Link>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button className={`wishlist-button ${saved ? "is-saved" : ""}`} aria-label={saved ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
      <button className="quick-view" onClick={() => onQuickView(product)}>Quick view <ArrowUpRight size={14} /></button>
    </div>
    <div className="product-info">
      <div className="product-meta"><span>{product.genre || product.category}</span><span className="rating"><Star size={12} fill="currentColor" /> {product.rating}</span></div>
      <Link className="product-title" to={`/manga/${product.id}`}>{product.title}{product.volume ? ` · Vol. ${String(product.volume).padStart(2, "0")}` : ""}</Link>
      <p className="product-byline">{product.author || "MANGAVERSE STUDIO"}</p>
      <div className="product-buy"><div><strong>{money(product.price)}</strong>{product.originalPrice && <del>{money(product.originalPrice)}</del>}</div>
        <button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.title} to bag`}><Plus size={17} /><span>Add</span></button>
      </div>
    </div>
  </article>;
}

function ProductGrid({ products, onQuickView, emptyTitle = "No stories found", emptyText = "Try another search or clear your filters." }) {
  if (!products.length) return <div className="empty-state"><Sparkles size={25} /><h3>{emptyTitle}</h3><p>{emptyText}</p></div>;
  return <div className="product-grid">{products.map((item) => <ProductCard key={item.id} product={item} onQuickView={onQuickView} />)}</div>;
}

function CollectionSection() {
  return <section className="section wrap" id="collections">
    <SectionHeading eyebrow="THE MANGAVERSE EDIT" title="Legends, reimagined." text="Original worlds. Unforgettable characters. Find the story you didn't know you were looking for." action="Explore all manga" />
    <div className="collection-grid">{series.map((item, index) => <Link className={`collection-card theme-${item.theme}`} key={item.title} to="/manga">
      <div className="collection-art"><span>{item.mark}</span><i>0{index + 1}</i></div>
      <div className="collection-copy"><span>{item.genre}</span><h3>{item.title}</h3><p>{item.note}</p><span className="collection-cta">DISCOVER SERIES <ArrowUpRight size={14} /></span></div>
    </Link>)}</div>
  </section>;
}

function GenreExplorer({ active, onSelect }) {
  return <section className="genre-section" id="genres"><div className="wrap">
    <SectionHeading eyebrow="FIND YOUR NEXT OBSESSION" title="Browse by feeling." text="Every mood has a world waiting for you." action="View the collection" />
    <div className="genre-list">{genres.map((genre, index) => <button key={genre} onClick={() => onSelect(genre)} className={`genre-pill ${active === genre ? "genre-active" : ""}`}><span className={`genre-dot dot-${index % 6}`} />{genre}<ArrowUpRight size={13} /></button>)}</div>
  </div></section>;
}

function Catalog({ onQuickView, initialQuery = "", initialGenre = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(2000);
  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setGenre(initialGenre), [initialGenre]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = manga.filter((item) => (!q || [item.title, item.author, item.genre].some((value) => value.toLowerCase().includes(q))) && (!genre || item.genre === genre) && item.price <= maxPrice);
    if (sort === "low") results.sort((a, b) => a.price - b.price);
    if (sort === "high") results.sort((a, b) => b.price - a.price);
    if (sort === "rating") results.sort((a, b) => b.rating - a.rating);
    if (sort === "popular") results.sort((a, b) => b.popular - a.popular);
    return results;
  }, [query, genre, sort, maxPrice]);
  return <section className="section wrap catalog-section" id="catalog">
    <SectionHeading eyebrow="A SHELF FULL OF WORLDS" title="Find your next chapter." text="Twelve original series. One very good reason to stay up late." />
    <div className="catalog-controls">
      <label className="catalog-search"><Search size={16} /><input aria-label="Search the catalog" placeholder="Search title, author or genre" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <label className="filter-control"><span>Genre</span><select aria-label="Filter by genre" value={genre} onChange={(e) => setGenre(e.target.value)}><option value="">All genres</option>{genres.map((g) => <option key={g}>{g}</option>)}</select></label>
      <label className="filter-control price-filter"><span>Up to {money(maxPrice)}</span><input aria-label="Maximum price" type="range" min="300" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /></label>
      <label className="filter-control"><span>Sort by</span><select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Highest rated</option><option value="popular">Most popular</option></select></label>
    </div>
    <div className="result-line"><span>{filtered.length} stories to explore</span>{(genre || query || maxPrice < 2000) && <button className="clear-filters" onClick={() => { setGenre(""); setQuery(""); setMaxPrice(2000); }}>Clear filters <X size={13} /></button>}</div>
    <ProductGrid products={filtered} onQuickView={onQuickView} />
  </section>;
}

function Hero() {
  return <section className="hero">
    <div className="hero-texture" />
    <div className="hero-content wrap"><div className="hero-copy">
      <p className="eyebrow hero-eyebrow"><span /> AN INDEPENDENT MANGA MARKETPLACE</p>
      <h1>Enter the world<br />of <em>manga.</em></h1>
      <p className="hero-description">Discover legendary stories, unforgettable characters and collections worth keeping.</p>
      <div className="hero-actions"><a className="button button-red" href="#catalog">Explore manga <ArrowRight size={16} /></a><a className="button button-ghost" href="#collections">Shop collections <ArrowDown size={15} /></a></div>
      <div className="hero-proof"><span className="proof-star">✳</span><span>Curated for the curious.<br /><b>Made for the collectors.</b></span></div>
    </div>
    <div className="hero-art-wrap" aria-label="Abstract original Japanese-inspired artwork">
      <div className="hero-art"><div className="hero-moon" /><div className="hero-sun" /><div className="hero-tower tower-one" /><div className="hero-tower tower-two" /><div className="hero-tower tower-three" /><div className="hero-wave wave-one" /><div className="hero-wave wave-two" /><span className="hero-kanji">物語</span><span className="hero-vertical">A NEW CHAPTER BEGINS</span><span className="hero-art-label">ISSUE 001&nbsp; / &nbsp;THE NEW WORLDS EDIT</span></div>
      <span className="art-stamp">新<br />刊</span>
    </div></div>
    <div className="hero-bottom wrap"><span>01 — STORIES WITH SOUL</span><span>SCROLL TO DISCOVER <ArrowDown size={13} /></span></div>
  </section>;
}

function Editorial() {
  return <section className="editorial" id="story"><div className="wrap editorial-grid">
    <div className="editorial-art"><div className="editorial-circle" /><span className="editorial-kanji">物<br />語</span><span className="editorial-art-note">A LITTLE MORE WONDER<br />IN EVERYDAY LIFE</span></div>
    <div className="editorial-copy"><p className="eyebrow">MORE THAN JUST STORIES</p><h2>For the worlds<br />you carry <em>with you.</em></h2><p>Every volume holds a new world. Every collection carries a story. Discover the art of manga and bring your favourite stories home.</p>
      <div className="value-list"><div><span>01</span><b>Stories worth keeping</b><small>Thoughtfully curated, beautifully collected.</small></div><div><span>02</span><b>Room for every fan</b><small>Find your next favourite at any age.</small></div><div><span>03</span><b>Always something new</b><small>Fresh stories, straight from our shelves.</small></div></div>
      <Link className="text-link" to="/manga">Get to know us <ArrowRight size={16} /></Link>
    </div>
  </div></section>;
}

function Merchandise({ onQuickView }) {
  return <section className="section wrap" id="merchandise">
    <SectionHeading eyebrow="BRING THE STORY HOME" title="A little something extra." text="Objects for your shelf, your walls and everywhere in between." action="Shop all merchandise" to="/manga" />
    <ProductGrid products={merchandise} onQuickView={onQuickView} />
  </section>;
}

function Reviews() {
  return <section className="reviews-section"><div className="wrap">
    <div className="review-top"><div><p className="eyebrow">NOTES FROM THE COMMUNITY</p><h2>Stories travel.<br /><em>So do we.</em></h2></div><div className="review-rating"><strong>4.9</strong><span><span className="stars">★★★★★</span><small>Sample community rating</small></span></div></div>
    <div className="review-grid"><article><div className="stars">★★★★★</div><p>“The kind of shop that makes discovering a new series feel like finding a hidden bookstore.”</p><span>PRIYA R. <small>— MANGA READER</small></span></article><article><div className="stars">★★★★★</div><p>“Beautifully packed, thoughtfully picked. My new ritual is checking the latest arrivals.”</p><span>ARJUN M. <small>— COLLECTOR</small></span></article><article><div className="stars">★★★★★</div><p>“Finally, a place that treats every story like it matters. Found my next all-time favourite here.”</p><span>MEERA S. <small>— COMMUNITY MEMBER</small></span></article></div>
    <p className="demo-note">Demonstration content — these sample reviews are fictional and do not represent verified customer testimonials.</p>
  </div></section>;
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  function subscribe(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("Enter a valid email address to join."); return; }
    setStatus("You're on the list. Your next story starts here.");
    setEmail("");
  }
  return <section className="newsletter"><div className="wrap newsletter-inner"><div><p className="eyebrow">A GOOD THING IN YOUR INBOX</p><h2>Your next story<br /><em>starts here.</em></h2><p>New releases, thoughtful finds and the occasional surprise. No noise.</p></div>
    <form onSubmit={subscribe} className="newsletter-form"><label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label><div><input id="newsletter-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setStatus(""); }} required /><button className="button button-red" type="submit">Join the list <ArrowRight size={16} /></button></div><small>By subscribing, you agree to our privacy policy. Unsubscribe any time.</small>{status && <p className={`form-status ${status.startsWith("You're") ? "status-success" : ""}`} role="status">{status}</p>}</form>
  </div></section>;
}

function Footer() {
  return <footer className="footer"><div className="wrap">  <div className="footer-main"><div className="footer-brand"><Brand /><p>A home for manga discovery, thoughtful collections and the stories that stay with you.</p><span className="footer-socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="MangaVerse on Instagram">IG</a><a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="MangaVerse on YouTube">YT</a><a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="MangaVerse on Pinterest">PIN</a></span></div><div><h3>EXPLORE</h3><Link to="/manga">Manga collection</Link><Link to="/anime">Anime</Link><Link to="/updates">Latest updates</Link><a href="/#genres">Popular genres</a><a href="/#popular-manga">Collections</a></div><div><h3>ABOUT</h3><p className="footer-about">MangaVerse brings readers closer to new worlds through a live catalogue and locally saved favorites.</p><a href="mailto:hello@mangaverse.example">Contact</a><Link to="/privacy">Privacy policy</Link></div><div><h3>YOUR ACCOUNT</h3><Link to="/favorites">Saved favorites</Link><Link to="/wishlist">Saved items</Link><Link to="/cart">Your cart</Link><Link to="/manage">Manage series</Link></div></div>
    <div className="footer-bottom"><span>© 2026 MANGAVERSE. MADE FOR STORY LOVERS.</span><span>AN INDEPENDENT MANGA DISCOVERY DEMO <span className="footer-red">✳</span> NOT AFFILIATED WITH ANY PUBLISHER.</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>;
}

function Modal({ product, onClose }) {
  const { addToCart } = useStore();
  if (!product) return null;
  return <AnimatePresence><motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <motion.div className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}>
      <button className="icon-button modal-close" aria-label="Close quick view" onClick={onClose}><X /></button><div className="modal-cover"><CoverArt item={product} large /></div><div className="modal-detail"><p className="eyebrow">QUICK LOOK · {product.genre || product.category}</p><h2 id="modal-title">{product.title}{product.volume ? ` · Volume ${product.volume}` : ""}</h2><div className="rating"><Star size={14} fill="currentColor" /> {product.rating} <span>({product.reviews || 36} reader notes)</span></div><p>{product.description || "A thoughtfully designed collectible made for your shelf and your next great story."}</p><div className="modal-price">{money(product.price)} {product.originalPrice && <del>{money(product.originalPrice)}</del>}</div><p className="stock-status"><Check size={15} /> In stock — ready for a new home</p><button className="button button-red modal-add" onClick={() => { addToCart(product); onClose(); }}>Add to bag <ShoppingBag size={16} /></button></div>
    </motion.div></motion.div></AnimatePresence>;
}

function CartDrawer({ open, onClose }) {
  const { cart, subtotal, setQuantity, removeFromCart } = useStore();
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 79;
  return <AnimatePresence>{open && <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <motion.aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
      <div className="drawer-head"><div><p className="eyebrow">YOUR LITTLE STACK</p><h2 id="cart-title">The bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="icon-button" aria-label="Close bag" onClick={onClose}><X /></button></div>
      {cart.length ? <><div className="drawer-items">{cart.map((item) => <div className="cart-line" key={item.id}><div className="cart-thumb"><CoverArt item={item} /></div><div className="cart-line-info"><b>{item.title}</b><small>{item.genre || item.category}{item.volume ? ` · Vol. ${item.volume}` : ""}</small><strong>{money(item.price)}</strong><div className="quantity-control"><button aria-label={`Decrease ${item.title} quantity`} onClick={() => setQuantity(item.id, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.title} quantity`} onClick={() => setQuantity(item.id, item.quantity + 1)}><Plus size={13} /></button></div></div><button className="remove-item" aria-label={`Remove ${item.title}`} onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button></div>)}</div>
        <div className="drawer-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Shipping estimate</span><b>{shipping ? money(shipping) : "Complimentary"}</b></div><div className="summary-total"><span>Estimated total</span><b>{money(subtotal + shipping)}</b></div><p>{subtotal >= 999 ? "You've unlocked complimentary shipping." : `Add ${money(999 - subtotal)} more for complimentary shipping.`}</p><Link className="button button-red checkout-button" to="/checkout" onClick={onClose}>Continue to checkout <ArrowRight size={16} /></Link><button className="continue-shopping" onClick={onClose}>Continue exploring</button></div>
      </> : <div className="drawer-empty"><ShoppingBag size={33} /><h3>Your bag is taking a breather.</h3><p>Find a story that feels like yours.</p><Link className="button button-red" to="/manga" onClick={onClose}>Explore manga <ArrowRight size={16} /></Link></div>}
    </motion.aside></motion.div>}</AnimatePresence>;
}

function HomePage({ onQuickView }) {
  const navigate = useNavigate();
  return <>
    <HomeExperience />
    <GenreExplorer active="" onSelect={(genre) => navigate(`/manga?genre=${encodeURIComponent(genre)}`)} />
    <Catalog onQuickView={onQuickView} />
    <Merchandise onQuickView={onQuickView} />
    <Newsletter />
  </>;
}

function ListingPage({ onQuickView }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const query = params.get("q") || "";
  const genre = params.get("genre") || "";
  return <><div className="page-banner wrap"><p className="eyebrow">THE COMPLETE COLLECTION</p><h1>Stories for <em>every shelf.</em></h1><p>Discover original manga worlds, carefully picked for curious readers.</p></div><Catalog onQuickView={onQuickView} initialQuery={query} initialGenre={genre} /><Newsletter /></>;
}

function WishlistPage({ onQuickView }) {
  const { wishlist, toggleWishlist } = useStore();
  return <main className="page-content wrap"><div className="page-banner"><p className="eyebrow">YOUR PERSONAL SHORTLIST</p><h1>Saved for <em>later.</em></h1><p>Good stories are worth coming back to.</p></div>{wishlist.length ? <><div className="wishlist-toolbar"><span>{wishlist.length} saved {wishlist.length === 1 ? "story" : "stories"}</span><button className="clear-filters" onClick={() => wishlist.forEach((item) => toggleWishlist(item))}>Clear wishlist <Trash2 size={14} /></button></div><ProductGrid products={wishlist} onQuickView={onQuickView} /></> : <div className="empty-state"><Heart size={25} /><h3>Your shortlist is a blank page.</h3><p>Tap the heart on anything that catches your eye.</p><Link className="button button-red" to="/manga">Find a story <ArrowRight size={16} /></Link></div>}</main>;
}

function CartPage() {
  const { cart, subtotal, setQuantity, removeFromCart } = useStore();
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 79;
  return <main className="page-content wrap"><div className="page-banner"><p className="eyebrow">YOUR LITTLE STACK</p><h1>The <em>bag.</em></h1></div>{cart.length ? <div className="cart-page-grid"><div className="cart-page-items">{cart.map((item) => <div className="cart-line cart-page-line" key={item.id}><div className="cart-thumb"><CoverArt item={item} /></div><div className="cart-line-info"><b>{item.title}</b><small>{item.genre || item.category}</small><strong>{money(item.price)}</strong><div className="quantity-control"><button aria-label={`Decrease ${item.title} quantity`} onClick={() => setQuantity(item.id, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.title} quantity`} onClick={() => setQuantity(item.id, item.quantity + 1)}><Plus size={13} /></button></div></div><button className="remove-item" aria-label={`Remove ${item.title}`} onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button></div>)}</div><OrderSummary subtotal={subtotal} shipping={shipping} /></div> : <div className="empty-state"><ShoppingBag size={28} /><h3>Your bag is taking a breather.</h3><p>Find a story that feels like yours.</p><Link className="button button-red" to="/manga">Explore manga <ArrowRight size={16} /></Link></div>}</main>;
}

function OrderSummary({ subtotal, shipping }) {
  return <aside className="order-summary"><p className="eyebrow">THE DETAILS</p><h2>Order summary</h2><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Shipping</span><b>{shipping ? money(shipping) : "Complimentary"}</b></div><div className="summary-total"><span>Total</span><b>{money(subtotal + shipping)}</b></div><p className="demo-note">No payment will be collected in this prototype.</p><Link className="button button-red checkout-button" to="/checkout">Continue to checkout <ArrowRight size={16} /></Link><Link className="continue-shopping" to="/manga">Continue shopping</Link></aside>;
}

function CheckoutPage() {
  const { cart, subtotal } = useStore();
  const [placed, setPlaced] = useState(false);
  const shipping = subtotal >= 999 ? 0 : 79;
  if (placed) return <main className="page-content wrap"><div className="empty-state success-state"><Check size={28} /><h2>Your demo order is in the books.</h2><p>No payment was processed. Thanks for exploring MANGAVERSE.</p><Link className="button button-red" to="/">Back to the stories</Link></div></main>;
  return <main className="page-content wrap"><div className="page-banner"><p className="eyebrow">THE FINAL CHAPTER (FOR NOW)</p><h1>Demo <em>checkout.</em></h1><p>This prototype does not process payments or save personal information.</p></div>{cart.length ? <div className="cart-page-grid"><form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setPlaced(true); }}><h2>Delivery details</h2><div className="form-grid"><label>First name<input required autoComplete="given-name" /></label><label>Last name<input required autoComplete="family-name" /></label><label className="span-two">Email address<input required type="email" autoComplete="email" /></label><label className="span-two">Address<input required autoComplete="street-address" /></label><label>City<input required autoComplete="address-level2" /></label><label>Postal code<input required autoComplete="postal-code" /></label></div><h2>Payment method</h2><label className="payment-choice"><input type="radio" name="payment" defaultChecked /> Demo payment on delivery <small>No payment is collected in this prototype.</small></label><button className="button button-red" type="submit">Place demo order · {money(subtotal + shipping)} <ArrowRight size={16} /></button></form><OrderSummary subtotal={subtotal} shipping={shipping} /></div> : <div className="empty-state"><ShoppingBag size={28} /><h3>Nothing to check out just yet.</h3><Link className="button button-red" to="/manga">Explore manga</Link></div>}</main>;
}

function PrivacyPage() {
  return <main className="wrap discovery-listing privacy-page">
    <p className="eyebrow">MANGAVERSE · PRIVACY</p><h1>Your reading list stays <em>yours.</em></h1>
    <p>Favorites, the demo cart and catalogue cache are stored in this browser using local storage. This demo has no account service, payment processing or newsletter backend, and does not send these saved lists to AniList.</p>
    <Link className="text-link" to="/">Back to discovery <ArrowRight size={15} /></Link>
  </main>;
}

function DetailPage({ onQuickView }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { id } = useParams();
  const item = allProducts.find((product) => product.id === id);
  if (!item) return <main className="page-content wrap"><div className="empty-state"><h2>That story isn't on this shelf.</h2><Link className="button button-red" to="/manga">Explore the collection</Link></div></main>;
  const saved = wishlist.some((product) => product.id === item.id);
  return <main className="page-content wrap detail-page"><div className="detail-grid"><div className="detail-cover"><CoverArt item={item} large /></div><div className="detail-copy"><p className="eyebrow">{item.genre || item.category} · ORIGINAL SERIES</p><h1>{item.title}{item.volume ? <span> Volume {String(item.volume).padStart(2, "0")}</span> : ""}</h1><p className="detail-byline">Words & art by {item.author || "MANGAVERSE STUDIO"}</p><div className="rating"><Star size={15} fill="currentColor" /> {item.rating} <span>· {item.reviews || 36} reader notes</span></div><div className="detail-price">{money(item.price)} {item.originalPrice && <del>{money(item.originalPrice)}</del>}</div><p className="detail-description">{item.description || "A thoughtfully designed collectible made for your shelf and your next great story."}</p><ul className="detail-facts"><li><Check size={15} /> Paperback edition</li><li><Check size={15} /> English language</li><li><Check size={15} /> In stock and ready to ship</li></ul><div className="detail-actions"><button className="button button-red" onClick={() => addToCart(item)}>Add to bag <ShoppingBag size={16} /></button><button className={`button button-outline ${saved ? "is-saved" : ""}`} aria-pressed={saved} onClick={() => toggleWishlist(item)}><Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save for later"}</button></div><p className="detail-shipping">Complimentary shipping on orders over ₹999.</p></div></div><section className="section related-section"><SectionHeading eyebrow="KEEP THE STORY GOING" title="You might also like." /><ProductGrid products={manga.filter((product) => product.id !== item.id).slice(0, 4)} onQuickView={onQuickView} /></section></main>;
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const { catalog, loading, error, usingCache, usingFallback, savedAt, refresh } = useAniListCatalog();
  const discoveryProps = { catalog, loading, error, usingCache, usingFallback, savedAt, refresh };
  return <div id="top" className="min-h-screen bg-ink text-paper"><Header onCart={() => setCartOpen(true)} /><Routes>
    <Route path="/" element={<><DiscoveryRoutes {...discoveryProps} /><Newsletter /></>} />
    <Route path="/anime" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/manga" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/search" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/updates" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/favorites" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/manage" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/series/:id" element={<DiscoveryRoutes {...discoveryProps} />} />
    <Route path="/manga/:id" element={<DetailPage onQuickView={setQuickView} />} />
    <Route path="/wishlist" element={<WishlistPage onQuickView={setQuickView} />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="*" element={<DiscoveryRoutes {...discoveryProps} />} />
  </Routes><Footer /><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} /><Modal product={quickView} onClose={() => setQuickView(null)} /></div>;
}

export default App;
