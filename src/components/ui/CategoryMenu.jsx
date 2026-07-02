import { Link } from 'react-router-dom';
import {
  GiDress,
  GiRobe,
  GiHandBag,
  GiHighHeel,
  GiPerfumeBottle,
} from 'react-icons/gi';
import categoriesData from '../../data/categories.json';
import { useLanguage } from '../../contexts/LanguageContext';

// ── « Tout » : grille neutre dessinée sur-mesure (pas d'icône Gi équivalente) ──
const IconAll = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
  </svg>
);

// Config par catégorie — icône (react-icons / Game Icons) + dégradé "marque"
const MENU = {
  all:      { icon: IconAll,          from: '#5b5650', to: '#2e2a25' },
  dresses:  { icon: GiDress,          from: '#8a7b5c', to: '#6b5d3f' },
  abayas:   { icon: GiRobe,           from: '#3a342b', to: '#18140f' },
  bags:     { icon: GiHandBag,        from: '#7a6a5a', to: '#574a3d' },
  shoes:    { icon: GiHighHeel,       from: '#7d7d84', to: '#56565c' },
  perfumes: { icon: GiPerfumeBottle,  from: '#a8736e', to: '#7d4f4b' },
};

/**
 * CategoryMenu.
 * - Si `onSelect` est fourni → mode CONTRÔLÉ : chaque pill est un <button> qui appelle
 *   onSelect(slug | 'all') (filtre animé client-side, sans navigation).
 * - Sinon → mode navigation : liens vers /categorie/:slug.
 */
export function CategoryMenu({ activeSlug, onSelect }) {
  const { lang } = useLanguage();
  const current = activeSlug || '';

  const items = [
    { slug: '', label: 'الكل', labelEn: 'All', cfg: MENU.all },
    ...categoriesData.map((c) => ({
      slug: c.slug,
      label: c.label,
      labelEn: c.labelEn,
      cfg: MENU[c.slug] ?? MENU.all,
    })),
  ];

  // Choisit l'élément déclencheur : bouton (contrôlé) ou Link (navigation)
  const trigger = (item) =>
    onSelect
      ? { Tag: 'button', extra: { type: 'button', onClick: () => onSelect(item.slug || 'all') } }
      : { Tag: Link, extra: { to: item.slug ? `/categorie/${item.slug}` : '/catalogue' } };

  return (
    <>
      {/* ── Desktop : pills animées (icône → s'agrandit au survol) ── */}
      <ul className="hidden lg:flex items-center justify-center gap-3">
        {items.map((item) => {
          const Icon = item.cfg.icon;
          const isActive = current === item.slug;
          const grad = `linear-gradient(135deg, ${item.cfg.from}, ${item.cfg.to})`;
          const label = lang === 'ar' ? item.label : item.labelEn;
          const { Tag, extra } = trigger(item);

          return (
            <li key={item.slug || 'all'}>
              <Tag
                {...extra}
                aria-label={label}
                className={`group relative flex h-14 cursor-pointer items-center justify-center rounded-full transition-[width,box-shadow] duration-500 ease-out ${
                  isActive
                    ? 'w-44 border border-transparent'
                    : 'w-14 border border-ink/10 bg-cream shadow-sm hover:w-44'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ backgroundImage: grad }}
                />
                <span
                  aria-hidden
                  className={`absolute -z-10 inset-x-3 top-2 h-full rounded-full blur-[14px] transition-opacity duration-500 ${
                    isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-30'
                  }`}
                  style={{ backgroundImage: grad }}
                />
                <span
                  className={`relative z-10 transition-transform duration-500 ${
                    isActive ? 'scale-0' : 'scale-100 group-hover:scale-0'
                  }`}
                >
                  <Icon className="h-5 w-5 text-ink-soft" />
                </span>
                <span
                  className={`absolute z-10 px-2 text-center text-xs font-semibold uppercase tracking-wider text-cream transition-transform delay-100 duration-500 ${
                    isActive ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`}
                >
                  {label}
                </span>
              </Tag>
            </li>
          );
        })}
      </ul>

      {/* ── Mobile/tablette : chips texte scrollables ── */}
      <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-none lg:hidden">
        {items.map((item) => {
          const isActive = current === item.slug;
          const label = lang === 'ar' ? item.label : item.labelEn;
          const { Tag, extra } = trigger(item);
          return (
            <Tag
              key={item.slug || 'all'}
              {...extra}
              className={`shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/15 text-ink-soft hover:border-ink hover:text-ink'
              }`}
            >
              {label}
            </Tag>
          );
        })}
      </div>
    </>
  );
}

export default CategoryMenu;
