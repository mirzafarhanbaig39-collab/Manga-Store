import { useState } from 'react'
import { ArrowRight, Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { products } from '../data/products.js'
import { useStore } from '../context/StoreContext.jsx'

const categoryHints = [
  { words: ['home', 'living', 'ceramic', 'candle', 'vase', 'linen'], category: 'Home & Living' },
  { words: ['fashion', 'wear', 'shirt', 'tote', 'clothes'], category: 'Fashion & Wear' },
  { words: ['wellness', 'ritual', 'bottle', 'self care'], category: 'Wellness' },
  { words: ['travel', 'trip', 'weekend', 'organizer', 'pouch'], category: 'Travel' },
  { words: ['jewellery', 'jewelry', 'necklace', 'watch'], category: 'Jewellery' },
  { words: ['electronics', 'tech', 'phone', 'headphones', 'speaker', 'charger'], category: 'Electronics' },
]

export function getAssistantReply(prompt) {
  const text = prompt.trim()
  const normalized = text.toLowerCase()
  const category = categoryHints.find(hint => hint.words.some(word => normalized.includes(word)))?.category
  const inrBudget = /₹|\binr\b|\brupees?\b|\brs\.?\s*\d/i.test(normalized)
  const budgetMatch = normalized.match(/(?:under|below|less than|budget(?: of)?|up to)\s*\$?\s*(\d+(?:\.\d+)?)/i)
  const budget = budgetMatch ? Number(budgetMatch[1]) : null
  const namedProducts = products.filter(product => normalized.includes(product.name.toLowerCase()))
  const isComparison = /\b(compare|comparison|versus|vs\.?)\b/i.test(normalized)
  let recommendations = [...products]
  let message

  if (isComparison && namedProducts.length > 1) {
    recommendations = namedProducts.slice(0, 3)
    message = 'Here are the catalogue details side by side. Prices and ratings are shown on each piece.'
  } else {
    if (category) recommendations = recommendations.filter(product => product.category === category)
    if (budget !== null && !inrBudget) recommendations = recommendations.filter(product => product.price <= budget)

    if (namedProducts.length && !isComparison) {
      recommendations = namedProducts
    } else if (category) {
      recommendations.sort((a, b) => b.rating - a.rating)
    } else if (/\bgifts?\b/i.test(normalized)) {
      recommendations.sort((a, b) => a.price - b.price || b.rating - a.rating)
    } else {
      const terms = normalized.split(/[^a-z0-9]+/).filter(word => word.length > 2 && !['suggest', 'recommend', 'please', 'find', 'gift', 'gifts', 'under', 'below', 'with', 'for', 'the', 'and', 'that', 'this'].includes(word))
      const score = product => terms.reduce((total, term) => total + (`${product.name} ${product.category} ${product.badge} ${product.color}`.toLowerCase().includes(term) ? 1 : 0), 0)
      recommendations.sort((a, b) => score(b) - score(a) || b.rating - a.rating)
    }

    if (inrBudget) {
      message = 'I can suggest pieces from the catalogue, but prices are currently listed in USD, so I can’t verify which fit an INR budget. Here are well-loved options to explore:'
    } else if (budget !== null) {
      message = recommendations.length
        ? `Here are catalogue picks at or below $${budget}.`
        : `I couldn’t find a catalogue item under $${budget}. Try a higher budget or explore all pieces.`
    } else if (category) {
      message = `A few thoughtful picks from ${category}:`
    } else if (isComparison) {
      recommendations = products.filter(product => product.badge === 'Bestseller').slice(0, 3)
      message = 'Tell me the names of two catalogue pieces to compare, or start with these community favourites.'
    } else {
      message = 'Based on the Mirza catalogue, here are a few pieces you might enjoy:'
    }
  }

  return { message, products: recommendations.slice(0, 3) }
}

export default function MirzaAssistant({ onOpenProduct }) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const { addToCart } = useStore()

  const ask = value => {
    const question = value.trim()
    if (!question) return
    const reply = getAssistantReply(question)
    setMessages(current => [...current, { role: 'user', text: question }, { role: 'assistant', ...reply }])
    setPrompt('')
  }

  return <>
    <button className="ai-launcher" type="button" aria-label={open ? 'Close MIRZA AI' : 'Open MIRZA AI shopping assistant'} aria-expanded={open} onClick={() => setOpen(value => !value)}>
      {open ? <X size={20} /> : <Sparkles size={20} />}
      <span>{open ? 'Close' : 'MIRZA AI'}</span>
    </button>
    {open && <section className="ai-panel" aria-label="MIRZA AI shopping assistant">
      <header className="ai-header"><div className="ai-avatar"><Bot size={19} /></div><div><h2>MIRZA AI</h2><p>Here to help you find a good thing.</p></div><button className="icon-button" aria-label="Close MIRZA AI" onClick={() => setOpen(false)}><X size={18} /></button></header>
      <div className="ai-demo-note"><span className="ai-status" /> Demo mode · catalogue recommendations only</div>
      <div className="ai-messages" aria-live="polite">
        {!messages.length && <div className="ai-welcome"><span><Sparkles size={17} /></span><p>Looking for something thoughtful? Ask me to find a gift, explore a category, or compare pieces from our collection.</p><div className="ai-prompts">{['Suggest a gift under $50', 'Find something for travel', 'Compare the Sol Pendant Necklace and Form Minimal Watch'].map(example => <button type="button" key={example} onClick={() => ask(example)}>{example}<ArrowRight size={13} /></button>)}</div></div>}
        {messages.map((message, index) => message.role === 'user'
          ? <p className="ai-user-message" key={`${index}-${message.text}`}>{message.text}</p>
          : <div className="ai-answer" key={`${index}-${message.message}`}><p>{message.message}</p>{message.products.map(product => <article className="ai-product" key={product.id}><img src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=140&q=75`} alt="" loading="lazy" /><div><strong>{product.name}</strong><span>${product.price} · ★ {product.rating}</span><div className="ai-product-actions"><button type="button" onClick={() => { setOpen(false); onOpenProduct(product) }}>Details</button><button type="button" onClick={() => addToCart(product)}>Add to bag</button></div></div></article>)}</div>)}
      </div>
      <form className="ai-input" onSubmit={event => { event.preventDefault(); ask(prompt) }}><label className="sr-only" htmlFor="mirza-ai-prompt">Ask MIRZA AI</label><input id="mirza-ai-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Ask for a thoughtful find…" /><button type="submit" aria-label="Send message" disabled={!prompt.trim()}><Send size={17} /></button></form>
      <p className="ai-disclaimer"><MessageCircle size={12} /> No external AI service is connected. Recommendations come from the current product catalogue.</p>
    </section>}
  </>
}
