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
    'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] select-none';

  const variants = {
    primary:
      'bg-gradient-to-b from-ink to-ink text-cream hover:from-ink-soft hover:to-ink focus-visible:ring-ink focus-visible:ring-offset-1 border border-ink/30 shadow-md shadow-ink/10',
    secondary:
      'bg-cream text-ink border border-ink/10 hover:bg-cream-deep hover:border-ink/20 focus-visible:ring-silver focus-visible:ring-offset-1 shadow-sm',
    ghost:
      'bg-transparent text-ink-soft hover:bg-cream-deep hover:text-ink focus-visible:ring-silver focus-visible:ring-offset-1',
    icon: 'bg-transparent text-ink-soft hover:text-ink hover:bg-cream-deep focus-visible:ring-silver focus-visible:ring-offset-1 rounded-full',
  };

  const sizes = {
    sm: variant === 'icon' ? 'p-1.5' : 'px-3 py-1.5 text-sm rounded-lg',
    md: variant === 'icon' ? 'p-2' : 'px-4 py-2.5 text-sm rounded-xl',
    lg: variant === 'icon' ? 'p-3' : 'px-6 py-3.5 text-base rounded-xl',
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
