import { ArrowUpRight } from 'lucide-react'
import { imageUrl } from '../data/products.js'

const edits = [
  { key: 'New', title: 'Just arrived', kicker: 'THE NEW EDIT', image: 'photo-1490481651871-ab68de25d43d', note: 'Fresh finds, chosen with care' },
  { key: 'Bestseller', title: 'Most loved', kicker: 'THE COMMUNITY EDIT', image: 'photo-1616486338812-3dadae4b4ace', note: 'The pieces you come back to' },
  { key: 'Trending', title: 'In good company', kicker: 'THE NOW EDIT', image: 'photo-1602143407151-7111542de6e8', note: 'A few things on everyone’s list' },
]

export default function CollectionEdits({ onSelect }) {
  return <section className="section-wrap edits-section" aria-labelledby="edits-title"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2 className="serif" id="edits-title">The Mirza <em>edits.</em></h2></div><p>Start with what’s new, what’s loved,<br className="hidden sm:block"/> or what’s catching our eye.</p></div><div className="edits-grid">{edits.map(edit => <button className="edit-card" key={edit.key} aria-label={`Shop ${edit.title}`} onClick={() => onSelect(edit.key)}><img src={imageUrl(edit.image, 900)} alt="" loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = imageUrl('photo-1494438639946-1ebd1d20bf85', 900) }}/><span className="edit-scrim"/><span className="edit-content"><small>{edit.kicker}</small><strong>{edit.title}</strong><span>{edit.note} <ArrowUpRight size={14}/></span></span></button>)}</div></section>
}
