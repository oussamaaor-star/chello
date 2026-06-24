export function GlowCard({ children, className = '' }) {
  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    currentTarget.style.setProperty('--gx', `${clientX - left}px`);
    currentTarget.style.setProperty('--gy', `${clientY - top}px`);
  }

  function onMouseEnter({ currentTarget }) {
    currentTarget.style.setProperty('--grad', '200px');
    currentTarget.style.setProperty('--spot', '280px');
  }

  function onMouseLeave({ currentTarget }) {
    currentTarget.style.setProperty('--grad', '0px');
    currentTarget.style.setProperty('--spot', '0px');
  }

  return (
    <div
      className={`group/glow relative rounded-[17px] p-[1px] transition-shadow duration-500
        hover:shadow-[0_8px_40px_-10px_rgba(245,158,11,0.28)] ${className}`}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        '--gx': '50%',
        '--gy': '50%',
        '--grad': '0px',
        '--spot': '0px',
        background: 'radial-gradient(var(--grad) circle at var(--gx) var(--gy), rgba(245,158,11,0.55), rgba(245,158,11,0.04) 60%, transparent 80%)',
      }}
    >
      <div className="relative rounded-2xl h-full">
        {children}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl z-[5]"
          style={{
            background: 'radial-gradient(var(--spot) circle at var(--gx) var(--gy), rgba(245,158,11,0.10), transparent 80%)',
          }}
        />
      </div>
    </div>
  );
}
