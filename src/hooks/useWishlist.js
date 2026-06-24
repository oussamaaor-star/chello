import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

export function useWishlist() {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist doit être utilisé à l\'intérieur d\'un WishlistProvider');
  }
  
  return context;
}
