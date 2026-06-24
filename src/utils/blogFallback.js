const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&q=70&w=800',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=70&w=800',
];

export function blogFallbackImage(seed) {
  const key = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}
