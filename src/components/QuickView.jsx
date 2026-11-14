import { X } from 'lucide-react'
import { imageUrl } from '../data/products.js'
import { useStore } from '../context/StoreContext.jsx'

export default function QuickView({ product, onClose, onDetails }) {
  const { addToCart } = useStore()
  if (!product) return null
  return <div className="overlay" onMouseDown={onClose}><section className="quick-modal" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`} onMouseDown={e => e.stopPropagation()}><button className="icon-button absolute right-4 top-4 z-10 bg-white/80" aria-label="Close quick view" onClick={onClose}><X /></button><img src={imageUrl(product.image, 900)} alt={product.name} /><div className="p-7 md:p-10"><p className="eyebrow">{product.category} · {product.badge}</p><h2 className="serif mt-2 text-4xl">{product.name}</h2><p className="mt-3 text-sm leading-7 text-muted">Considered materials, a thoughtful silhouette, and the little details that make everyday rituals feel special.</p><p className="mt-5 text-xl font-semibold">${product.price} <span className="ml-2 text-base font-normal text-muted line-through">${product.oldPrice}</span></p><p className="mt-1 text-xs text-muted">Colour: {product.color}</p><button className="gold-button mt-7 w-full" onClick={() => { addToCart(product); onClose() }}>Add to bag <span>→</span></button><button className="detail-link" onClick={() => onDetails(product)}>View full product details <span>→</span></button></div></section></div>
}
