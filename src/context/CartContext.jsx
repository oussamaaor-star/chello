import { createContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Utilise notre hook personnalisé pour la persistance dans localStorage
  const [items, setItems] = useLocalStorage('pm-cart-items', []);

  const addToCart = (product, selectedSize = null, qty = 1) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingItemIndex >= 0) {
        return prevItems.map((item, idx) =>
          idx === existingItemIndex
            ? { ...item, quantity: Math.min(item.quantity + qty, 10) }
            : item
        );
      }

      return [...prevItems, { product, quantity: Math.min(qty, 10), selectedSize }];
    });
  };

  const removeFromCart = (productId, selectedSize) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedSize) => {
    // Si la quantité passe à 0 ou moins, on retire l'article
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
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

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
