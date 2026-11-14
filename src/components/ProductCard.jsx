import { useState } from 'react'
import { ArrowUpRight, Heart, Star } from 'lucide-react'
import { imageUrl } from '../data/products.js'
import { useStore } from '../context/StoreContext.jsx'

export default function ProductCard({ product, onQuickView, onProductClick }) {
  const { addToCart, toggleWishlist, wishlist } = useStore()
  const [added, setAdded] = useState(false)
  const saved = wishlist.includes(product.id)
  const discount = Math.round((1 - product.price / product.oldPrice) * 100)
  const add = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1200) }
  return <article className="product-card group">
    <div className="product-image-wrap"><img className="product-primary-image" src={imageUrl(product.image)} alt={product.name} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = imageUrl('photo-1494438639946-1ebd1d20bf85', 700) }} />{product.imageHover && <img className="product-hover-image" src={imageUrl(product.imageHover)} alt="" loading="lazy" />}<span className="product-badge">{product.oldPrice > product.price && <span className="sr-only">Discount </span>}{product.badge}</span>
      <button className={`wishlist-button ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`} onClick={() => toggleWishlist(product.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className="quick-view" onClick={() => onQuickView(product)}>Quick view <ArrowUpRight size={15} /></button>
    </div>
    <div className="flex items-start justify-between gap-2 pt-4"><div><p className="eyebrow">{product.category}</p><button className="product-name product-name-link" onClick={() => onProductClick(product)}>{product.name}</button></div><span className="rating"><Star size={13} fill="currentColor" /> {product.rating}</span></div>
    <div className="mt-2 flex items-center gap-2"><span className="price">${product.price}</span><span className="old-price">${product.oldPrice}</span><span className="discount">-{discount}%</span></div>
    <button className={`add-button ${added ? 'added' : ''}`} onClick={add}>{added ? 'Added to bag ✓' : 'Add to bag'}</button>
  </article>
}
