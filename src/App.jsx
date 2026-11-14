import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Heart, Leaf, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import Header from './components/Header.jsx'
import ProductCard from './components/ProductCard.jsx'
import CollectionEdits from './components/CollectionEdits.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import QuickView from './components/QuickView.jsx'
import ProductDetails from './components/ProductDetails.jsx'
import Footer from './components/Footer.jsx'
import MirzaAssistant from './components/MirzaAssistant.jsx'
import AccountPage from './components/AccountPage.jsx'
import { categories, imageUrl, products } from './data/products.js'
import { StoreProvider, useStore } from './context/StoreContext.jsx'

const productFromHash = () => {
  const id = window.location.hash.startsWith('#product/') ? decodeURIComponent(window.location.hash.slice('#product/'.length)) : ''
  return products.find(product => product.id === id) ?? null
}

function Storefront() {
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [collectionMode, setCollectionMode] = useState('')
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(() => window.location.hash === '#account')
  const [quickProduct, setQuickProduct] = useState(null)
  const [detailProduct, setDetailProduct] = useState(productFromHash)
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mirza-recently-viewed') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const { wishlist } = useStore()
  useEffect(() => {
    const syncProductRoute = () => {
      setDetailProduct(productFromHash())
      setAccountOpen(window.location.hash === '#account')
    }
    window.addEventListener('popstate', syncProductRoute)
    window.addEventListener('hashchange', syncProductRoute)
    return () => { window.removeEventListener('popstate', syncProductRoute); window.removeEventListener('hashchange', syncProductRoute) }
  }, [])
  useEffect(() => {
    localStorage.setItem('mirza-recently-viewed', JSON.stringify(recentlyViewed))
  }, [recentlyViewed])
  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-on-scroll')
    if (!('IntersectionObserver' in window)) {
      sections.forEach(section => section.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.12 })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [detailProduct])
  const visibleProducts = useMemo(() => {
    let result = products.filter(p => (!category || p.category === category) && (!collectionMode || p.badge === collectionMode) && (!query || `${p.name} ${p.category} ${p.badge}`.toLowerCase().includes(query.toLowerCase())) && (view !== 'wishlist' || wishlist.includes(p.id)))
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [category, collectionMode, query, sort, view, wishlist])

  const selectCategory = value => { setCategory(value); setCollectionMode(''); setView('all') }
  const selectEdit = value => { setCategory(''); setQuery(''); setCollectionMode(value); setView('all'); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }
  const openCollection = () => { setCategory(''); setCollectionMode(''); setView('all'); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }
  const openProduct = product => { window.history.pushState({ productId: product.id }, '', `#product/${encodeURIComponent(product.id)}`); setAccountOpen(false); setQuickProduct(null); setDetailProduct(product); setRecentlyViewed(current => [product.id, ...current.filter(id => id !== product.id)].slice(0, 4)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeProduct = () => { window.history.replaceState({}, '', '#top'); setDetailProduct(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openAccount = () => { window.history.pushState({ page: 'account' }, '', '#account'); setDetailProduct(null); setAccountOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeAccount = () => { window.history.replaceState({}, '', '#top'); setAccountOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return <div id="top">
    <Header onAccount={openAccount} onCategory={value => { if (detailProduct) closeProduct(); if (accountOpen) closeAccount(); selectCategory(value) }} onSearch={value => { if (detailProduct) closeProduct(); if (accountOpen) closeAccount(); setQuery(value); setCollectionMode('') }} onCart={() => setCartOpen(true)} onWishlist={() => { if (detailProduct) closeProduct(); if (accountOpen) closeAccount(); setView('wishlist'); setCategory(''); setCollectionMode(''); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }} />
    {detailProduct ? <ProductDetails product={detailProduct} onBack={closeProduct}/> : accountOpen ? <AccountPage onBack={closeAccount} /> : <main>
      <section className="hero"><img className="hero-image" src={imageUrl('photo-1600210492486-724fe5c67fb0', 2200)} alt="Warm, sunlit living room with considered natural textures" fetchPriority="high" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = imageUrl('photo-1494438639946-1ebd1d20bf85', 2200) }} /><div className="hero-shade" /><div className="hero-content"><p className="hero-kicker"><span /> OBJECTS FOR A LIFE WELL LIVED</p><h1><span>Everyday finds.</span><br /><em>Extraordinary living.</em></h1><p className="hero-copy">Thoughtfully curated essentials<br className="hidden sm:block" /> for a more beautiful everyday.</p><div className="mt-8 flex flex-wrap gap-3"><button className="gold-button" onClick={openCollection}>Explore collection <ArrowRight size={16} /></button><a href="#story" className="story-link">Discover our story <ArrowUpRight size={15} /></a></div></div><div className="hero-index"><span>01</span><span className="hero-index-line" /><span>03</span></div><a href="#categories" className="scroll-cue"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></a><div className="hero-glow" aria-hidden="true" /></section>

      <section className="service-strip"><div><Truck /><span>Complimentary shipping <small>On orders over $100</small></span></div><div><ShieldCheck /><span>Thoughtfully sourced <small>Made to last, made with care</small></span></div><div><Leaf /><span>Conscious choices <small>Better for you and the planet</small></span></div><div><Sparkles /><span>Little details matter <small>Curated with intention</small></span></div></section>

      <section className="section-wrap categories-section reveal-on-scroll" id="categories"><div className="section-heading"><div><p className="eyebrow">THE MIRZA EDIT</p><h2 className="serif">A world of <em>good things.</em></h2></div><p>Considered pieces for every corner<br className="hidden sm:block" /> of your everyday.</p></div><div className="category-grid">{categories.map((item, i) => <button className={`category-card category-${i + 1}`} key={item.name} onClick={() => { selectCategory(item.name); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }}><img src={imageUrl(item.image, 850)} alt="" loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = imageUrl('photo-1494438639946-1ebd1d20bf85', 850) }}/><div className="category-scrim"/><div className="category-copy"><span>{item.description}</span><strong>{item.name}</strong></div><span className="category-arrow"><ArrowUpRight size={18}/></span></button>)}</div></section>

      <CollectionEdits onSelect={selectEdit}/>

      <section className="section-wrap collection-section" id="collection"><div className="section-heading collection-heading"><div><p className="eyebrow">THOUGHTFULLY SELECTED</p><h2 className="serif">{view === 'wishlist' ? <>Your <em>saved pieces.</em></> : collectionMode === 'New' ? <>New <em>arrivals.</em></> : collectionMode === 'Bestseller' ? <>Best <em>sellers.</em></> : collectionMode === 'Trending' ? <>Trending <em>now.</em></> : category ? <><em>{category}</em></> : <>Pieces to <em>live with.</em></>}</h2></div><p>Good design earns its place.<br className="hidden sm:block"/>These are a few of ours.</p></div>
        <div className="collection-toolbar"><div className="filter-tabs"><button className={!category && !collectionMode && view === 'all' ? 'active' : ''} onClick={() => { setCategory(''); setCollectionMode(''); setView('all') }}>All pieces</button>{['Home & Living', 'Fashion & Wear', 'Wellness', 'Travel', 'Jewellery', 'Electronics'].map(item => <button className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setCollectionMode(''); setView('all') }} key={item}>{item}</button>)}{collectionMode && <button className="active" onClick={() => setCollectionMode('')}>{collectionMode === 'New' ? 'New arrivals' : collectionMode === 'Bestseller' ? 'Best sellers' : 'Trending'} ×</button>}{view === 'wishlist' && <button className="active" onClick={() => setView('wishlist')}><Heart size={13} /> Saved</button>}</div><label className="sort-control">Sort by <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown size={14}/></label></div>
        {visibleProducts.length ? <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickProduct} onProductClick={openProduct}/>)}</div> : <div className="empty-state"><p className="serif text-2xl">{view === 'wishlist' ? 'Your wishlist is waiting.' : 'Nothing found just yet.'}</p><p className="mt-2 text-sm text-muted">{view === 'wishlist' ? 'Tap the heart on any piece to keep it close.' : 'Try another search or browse all of our pieces.'}</p><button className="text-link mt-5" onClick={() => { setQuery(''); setCategory(''); setCollectionMode(''); setView('all') }}>Explore all pieces <ArrowRight size={15}/></button></div>}
      </section>

      <section className="editorial-band" id="story"><div className="editorial-image"><img src={imageUrl('photo-1600210492486-724fe5c67fb0', 1100)} alt="Softly layered interior with natural materials" loading="lazy"/><span>THE MIRZA HOME EDIT · NO. 04</span></div><div className="editorial-copy"><p className="eyebrow">A MORE THOUGHTFUL EVERYDAY</p><h2 className="serif">Less,<br/><em>but better.</em></h2><p>We believe the things you live with should bring meaning, beauty and lasting value. Discover carefully selected pieces designed to make everyday living better.</p><div className="value-list"><div><span>01</span><p><strong>Made with intention</strong><small>Every detail has a reason to be here.</small></p></div><div><span>02</span><p><strong>Built to be kept</strong><small>Timeless materials, considered design.</small></p></div><div><span>03</span><p><strong>Better by nature</strong><small>Thoughtful choices at every step.</small></p></div></div><a href="#footer" className="text-link">Get to know Mirza <ArrowRight size={15}/></a></div></section>

      <section className="quote-section reveal-on-scroll"><p className="eyebrow">KIND WORDS FROM OUR COMMUNITY</p><div className="quote-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“A rare shop where every single thing feels considered. My home feels more like me with every piece.”</blockquote><p className="quote-credit">MAYA R. <span>·</span> MIRZA CUSTOMER, BROOKLYN</p><div className="quote-nav" aria-hidden="true"><span className="selected"/><span/><span/></div></section>

      {recentlyViewed.length > 0 && <section className="section-wrap recently-viewed reveal-on-scroll" aria-labelledby="recently-viewed-title"><div className="section-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2 className="serif" id="recently-viewed-title">Recently <em>viewed.</em></h2></div></div><div className="recent-grid">{recentlyViewed.map(id => products.find(product => product.id === id)).filter(Boolean).map(product => <button className="recent-card" key={product.id} onClick={() => openProduct(product)}><img src={imageUrl(product.image, 420)} alt="" loading="lazy"/><span>{product.name}</span><strong>${product.price}</strong></button>)}</div></section>}

      <section className="lifestyle-section reveal-on-scroll" aria-labelledby="lifestyle-title"><div className="lifestyle-heading"><p className="eyebrow">LIFE, A LITTLE MORE CONSIDERED</p><h2 id="lifestyle-title" className="serif">Find a little <em>inspiration.</em></h2></div><div className="lifestyle-grid">{['photo-1600210492486-724fe5c67fb0','photo-1490481651871-ab68de25d43d','photo-1545205597-3d9d02c29597','photo-1476514525535-07fb3b4ae5f1'].map((image, index) => <img key={image} src={imageUrl(image, 650)} alt={['Sunlit home with natural textures','Thoughtfully styled everyday wardrobe','A quiet moment for a daily wellness ritual','A beautiful destination for a weekend away'][index]} loading="lazy" />)}</div></section>

      <section className="faq-section reveal-on-scroll" aria-labelledby="faq-title"><p className="eyebrow">THE LITTLE DETAILS</p><h2 className="serif" id="faq-title">Good to <em>know.</em></h2><div className="faq-list"><details><summary>How does shipping work?</summary><p>Shipping options and estimated delivery times are shared at checkout. Complimentary shipping applies to qualifying orders over $100.</p></details><details><summary>What is your return policy?</summary><p>If a piece is not quite right, contact our customer care team within 30 days of delivery to discuss return options.</p></details><details><summary>How can I get help with an order?</summary><p>Write to hello@mirza.example and our customer care team will be happy to help.</p></details></div></section>

      <section className="newsletter-section"><div><p className="eyebrow">A LITTLE SOMETHING GOOD</p><h2 className="serif">A slower kind of <em>inbox.</em></h2><p>New finds, thoughtful notes and 10% off your first order.</p></div><form onSubmit={e => {e.preventDefault(); setNewsletterMessage('Thank you — you’re on the Mirza list.'); e.currentTarget.reset()}}><input type="email" name="email" placeholder="Your email address" required aria-label="Your email address"/><button aria-label="Subscribe"><ArrowRight size={18}/></button><small>By subscribing, you agree to our privacy policy.</small>{newsletterMessage && <span className="newsletter-success" role="status">{newsletterMessage}</span>}</form></section>
    </main>}
    <Footer/><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}/>{quickProduct && <QuickView product={quickProduct} onClose={() => setQuickProduct(null)} onDetails={openProduct}/>}<MirzaAssistant onOpenProduct={openProduct}/>
  </div>
}

export default function App() { return <StoreProvider><Storefront/></StoreProvider> }
