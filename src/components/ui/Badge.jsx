export function Badge({
  children,
  label,
  variant = 'default',
  className = '',
}) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none';

  const variants = {
    default:   'bg-ink/5 text-ink-soft',
    promo:     'bg-red-500 text-white',
    new:       'bg-silver/15 text-silver-deep border border-silver/30',
    bestseller:'bg-silver text-cream',
    lowstock:  'bg-orange-500/15 text-orange-600 border border-orange-500/30',
    success:   'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
    warning:   'bg-orange-500/15 text-orange-600 border border-orange-500/30',
  };

  const content = children || label;
  if (!content) return null;

  return (
    <span className={`${baseStyles} ${variants[variant] ?? variants.default} ${className}`}>
      {content}
    </span>
  );
}
