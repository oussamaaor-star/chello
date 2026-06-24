import { useContext } from 'react';
import { CartDrawerContext } from '../context/CartDrawerContext';

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer doit être utilisé à l\'intérieur d\'un CartDrawerProvider');
  }
  return context;
}
