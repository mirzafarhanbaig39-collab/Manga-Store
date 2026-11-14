import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const StoreContext = createContext(null)
const read = (key, fallback) => {
  try {
    const current = localStorage.getItem(key)
    const previous = current === null ? localStorage.getItem(key.replace('mirza-', 'luma-')) : null
    return JSON.parse(current ?? previous) ?? fallback
  } catch { return fallback }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('mirza-cart', []))
  const [wishlist, setWishlist] = useState(() => read('mirza-wishlist', []))
  useEffect(() => localStorage.setItem('mirza-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('mirza-wishlist', JSON.stringify(wishlist)), [wishlist])

  const value = useMemo(() => ({
    cart, wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart: (product, quantity = 1) => setCart(current => {
      const found = current.find(item => item.id === product.id)
      return found ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...product, quantity }]
    }),
    setQuantity: (id, quantity) => setCart(current => quantity <= 0 ? current.filter(item => item.id !== id) : current.map(item => item.id === id ? { ...item, quantity } : item)),
    removeFromCart: (id) => setCart(current => current.filter(item => item.id !== id)),
    toggleWishlist: (id) => setWishlist(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]),
  }), [cart, wishlist])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
