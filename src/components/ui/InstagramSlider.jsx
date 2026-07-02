// Galerie "Instagram" — défilement infini horizontal (vraies images boutique Chello).
// Adapté pour le thème crème : bords fondus, pause au survol, tuiles arrondies.
const FEED = [
  '/feed/feed-1.jpg',                 // mannequin ensemble olive
  '/feed/feed-2.jpg',                 // mannequin abaya sombre (mall)
  '/feed/feed-8.jpg',                 // mannequin manteau teal
  '/videos/posters/jewelry.jpg',      // bijoux cristal
  '/feed/feed-9.jpg',                 // talons noirs
  '/feed/feed-6.jpg',                 // mannequin abaya soirée
  '/videos/posters/abayas.jpg',       // abaya mauve
  '/feed/feed-10.jpg',                // étagère parfums
  '/videos/posters/storefront.jpg',   // devanture
  '/feed/feed-4.jpg',                 // bijoux perles
  '/videos/posters/details.jpg',      // mur de chaussures
];

export function InstagramSlider() {
  const doubled = [...FEED, ...FEED];

  return (
    <>
      <style>{`
        @keyframes chello-marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .chello-marquee { animation: chello-marquee-scroll 45s linear infinite; }
        .chello-marquee:hover { animation-play-state: paused; }
        .chello-marquee-mask {
          -webkit-mask: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%);
          mask: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .chello-marquee { animation: none; }
        }
      `}</style>

      <div className="chello-marquee-mask w-full overflow-hidden">
        <div className="chello-marquee flex gap-4 sm:gap-5 w-max">
          {doubled.map((src, i) => (
            <a
              key={i}
              href="https://www.instagram.com/chello.stor"
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={i >= FEED.length}
              className="group flex-shrink-0 w-44 sm:w-52 lg:w-60 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm ring-1 ring-ink/10 bg-cream-deep"
            >
              <img
                src={src}
                alt="Chello"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default InstagramSlider;
