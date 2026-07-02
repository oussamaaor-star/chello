import { createContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Utilise notre hook personnalisé pour la persistance dans localStorage
  const [items, setItems] = useLocalStorage('chello-cart-items', []);

  const addToCart = (product, selectedSize = null, qty = 1, selectedColor = null) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize && (item.selectedColor ?? null) === selectedColor
      );

      if (existingItemIndex >= 0) {
        return prevItems.map((item, idx) =>
          idx === existingItemIndex
            ? { ...item, quantity: Math.min(item.quantity + qty, 10) }
            : item
        );
      }

      return [...prevItems, { product, quantity: Math.min(qty, 10), selectedSize, selectedColor }];
    });
  };

  const removeFromCart = (productId, selectedSize, selectedColor = null) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize && (item.selectedColor ?? null) === selectedColor)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedSize, selectedColor = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize && (item.selectedColor ?? null) === selectedColor) {
          return { ...item, quantity: Math.min(quantity, 10) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calcul du nombre total d'articles (somme des quantités)
  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Calcul du prix total du panier (prix fixe par produit, la taille ne change pas le prix)
  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);
  }, [items]);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }), [items, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
