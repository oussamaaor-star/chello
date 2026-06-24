import { createContext, useState } from 'react';

export const CartDrawerContext = createContext(null);

export function CartDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartDrawerContext.Provider
      value={{
        isOpen,
        open:  () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}
