import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

function isProduct(value) {
  return value && typeof value.id === "string" && typeof value.title === "string" &&
    Number.isFinite(value.price);
}

function readStorage(key, fallback, isValid) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (!isValid(parsed)) throw new TypeError(`Invalid stored data for ${key}`);
    return parsed;
  } catch (error) {
    console.error(`Unable to restore ${key} from local storage.`, error);
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage(
    "mangaverse-cart",
    [],
    (value) => Array.isArray(value) && value.every((item) =>
      isProduct(item) && Number.isInteger(item.quantity) && item.quantity > 0),
  ));
  const [wishlist, setWishlist] = useState(() => readStorage(
    "mangaverse-wishlist",
    [],
    (value) => Array.isArray(value) && value.every(isProduct),
  ));

  useEffect(() => {
    window.localStorage.setItem("mangaverse-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("mangaverse-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart(product) {
      setCart((current) => {
        const found = current.find((item) => item.id === product.id);
        return found
          ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...current, { ...product, quantity: 1 }];
      });
    },
    removeFromCart(id) {
      setCart((current) => current.filter((item) => item.id !== id));
    },
    setQuantity(id, quantity) {
      setCart((current) => quantity < 1
        ? current.filter((item) => item.id !== id)
        : current.map((item) => item.id === id ? { ...item, quantity } : item));
    },
    toggleWishlist(product) {
      setWishlist((current) => current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]);
    },
  }), [cart, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
