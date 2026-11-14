import { useMemo, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { categories, imageUrl, products } from '../data/products.js'
import { useStore } from '../context/StoreContext.jsx'

const navItems = ['All Products', 'Home', 'Fashion & Wear', 'Wellness', 'Travel', 'Jewellery', 'Electronics']

const categoryForNav = item => {
  if (item === 'All Products') return ''
  return item === 'Home' ? 'Home & Living' : item
}

export default function Header({ onAccount, onCategory, onSearch, onCart, onWishlist }) {
  const { cartCount, wishlist } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeNav, setActiveNav] = useState(null)

  const matches = query.trim()
    ? products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 4)
    : []

  const navigationOptions = useMemo(() => {
    if (!activeNav) return []
    const category = categoryForNav(activeNav)
    if (!category) {
      return categories.slice(0, 4).map(item => ({ ...item, type: 'category', label: item.name, subtitle: item.description }))
    }
    return products.filter(product => product.category === category).slice(0, 8).map(product => ({ ...product, type: 'product', label: product.name, subtitle: product.category }))
  }, [activeNav])

  const scrollToCollection = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  const submit = event => { event.preventDefault(); onSearch(query); setSuggestionsOpen(false); scrollToCollection() }
  const chooseSuggestion = value => { setQuery(value); onSearch(value); setSuggestionsOpen(false); scrollToCollection() }
  const selectNavigationItem = item => {
    if (item.type === 'category') onCategory(item.name)
    else onSearch(item.name)
    setActiveNav(null)
    setMenuOpen(false)
    scrollToCollection()
  }

  const searchBox = mobile => <div className={`search-wrap ${mobile ? 'mobile-search mx-5 mb-3 md:hidden' : 'desktop-search hidden md:block'}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false) }}><form onSubmit={submit} className="search-box flex"><Search size={17} /><input aria-label="Search products" placeholder={mobile ? 'Search the collection' : 'What are you looking for?'} value={query} onFocus={() => setSuggestionsOpen(true)} onChange={event => { setQuery(event.target.value); onSearch(event.target.value); setSuggestionsOpen(true) }} onKeyDown={event => { if (event.key === 'Escape') setSuggestionsOpen(false) }} /><kbd className={mobile ? 'hidden' : ''}>↵</kbd></form>{suggestionsOpen && query.trim() && <div className="search-suggestions" role="listbox" aria-label="Search suggestions">{matches.length ? matches.map(product => <button key={product.id} type="button" role="option" onMouseDown={event => event.preventDefault()} onClick={() => chooseSuggestion(product.name)}><span>{product.name}<small>{product.category}</small></span><span>${product.price}</span></button>) : <p>No matching pieces. Try another search.</p>}</div>}</div>

  return <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md">
    <div className="announcement">A little more meaning in every day <span>·</span> Complimentary shipping over $100</div>
    <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 md:px-10">
      <button className="icon-button md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <a href="#top" className="brand-lockup" aria-label="Mirza home"><span className="brand">MIRZA</span><span className="brand-tag">BETTER THINGS, EVERY DAY</span></a>
      {searchBox(false)}
      <div className="flex items-center gap-1 sm:gap-3">
        <button className="icon-button hidden sm:flex" aria-label="Account" onClick={onAccount}><UserRound /></button>
        <button className="icon-button relative" aria-label={`Wishlist, ${wishlist.length} items`} onClick={onWishlist}><Heart /><span className="count-dot">{wishlist.length}</span></button>
        <button className="icon-button relative" aria-label={`Shopping bag, ${cartCount} items`} onClick={onCart}><ShoppingBag /><span className="count-dot">{cartCount}</span></button>
      </div>
    </div>
    <nav className={`${menuOpen ? 'block' : 'hidden'} relative border-t border-ink/10 md:block`} aria-label="Main navigation" onMouseLeave={() => setActiveNav(null)}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-0 px-5 md:flex-row md:justify-center md:gap-10 md:px-10">
        {navItems.map(item => <button key={item} className="nav-link" onMouseEnter={() => setActiveNav(item)} onFocus={() => setActiveNav(item)} onClick={() => { onCategory(categoryForNav(item)); setMenuOpen(false); setActiveNav(null); scrollToCollection() }}>{item}</button>)}
        <button className="nav-link md:hidden" aria-label="Account sign in" onClick={() => { onAccount(); setMenuOpen(false) }}>Account</button>
      </div>
      {activeNav && navigationOptions.length > 0 && <div className="absolute inset-x-0 top-full hidden border-b border-ink/10 bg-cream shadow-xl md:block"><div className="mx-auto grid max-w-[1120px] grid-cols-4 gap-4 px-10 py-6">{navigationOptions.map(item => <button key={item.id ?? item.name} type="button" className="group overflow-hidden text-left" onClick={() => selectNavigationItem(item)}><img className="aspect-[1.35] w-full bg-[#e9e3d8] object-cover transition duration-300 group-hover:scale-[1.03]" src={imageUrl(item.image, 500)} alt="" loading="lazy" /><span className="mt-3 block text-sm font-medium text-ink">{item.label}</span><span className="mt-1 block text-[10px] uppercase tracking-[.12em] text-muted">{item.subtitle}</span></button>)}</div></div>}
    </nav>
    {searchBox(true)}
  </header>
}
