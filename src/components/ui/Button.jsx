export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] select-none';

  const variants = {
    primary:
      'rounded-full bg-ink text-cream hover:bg-ink/90 focus-visible:ring-ink focus-visible:ring-offset-1',
    secondary:
      'rounded-full border border-ink/20 text-ink font-medium hover:border-ink hover:bg-ink/5 focus-visible:ring-silver focus-visible:ring-offset-1',
    ghost:
      'rounded-full bg-transparent text-ink-soft font-medium hover:bg-cream-deep hover:text-ink focus-visible:ring-silver focus-visible:ring-offset-1',
    icon: 'bg-transparent text-ink-soft hover:text-ink hover:bg-cream-deep focus-visible:ring-silver focus-visible:ring-offset-1 rounded-full',
  };

  const sizes = {
    sm: variant === 'icon' ? 'p-1.5' : 'px-5 py-2.5 text-[12px] uppercase tracking-[0.18em]',
    md: variant === 'icon' ? 'p-2' : 'px-8 py-4 text-[13px] uppercase tracking-[0.18em]',
    lg: variant === 'icon' ? 'p-3' : 'px-10 py-4 text-[13px] uppercase tracking-[0.18em]',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none active:scale-100'
    : '';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
