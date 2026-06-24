import { useState } from 'react';

/**
 * Hook personnalisé pour interagir avec le localStorage
 * Synchronise l'état React avec le localStorage du navigateur
 */
export function useLocalStorage(key, initialValue) {
  // L'état est initialisé en lisant depuis le localStorage une seule fois
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Retourne la valeur stockée (si existante) ou la valeur initiale
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur de lecture du localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour l'état et le localStorage
  const setValue = (value) => {
    try {
      // Permet de passer une fonction comme pour useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur d'écriture dans le localStorage pour la clé "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
