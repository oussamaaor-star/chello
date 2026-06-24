-- Ajouter les colonnes de limite d'utilisation aux codes promo
ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_promo_codes_times_used ON promo_codes(times_used);
