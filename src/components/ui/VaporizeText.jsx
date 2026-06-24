import { useEffect, useRef, useState } from 'react';

export const Direction = {
  LEFT_TO_RIGHT: 'left-to-right',
  RIGHT_TO_LEFT: 'right-to-left',
  TOP_TO_BOTTOM: 'top-to-bottom',
  BOTTOM_TO_TOP: 'bottom-to-top',
};

function parseColor(colorStr) {
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  const hex = colorStr.replace('#', '');
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return { r: 255, g: 255, b: 255 };
}

function getTextX(textAlign, width) {
  if (textAlign === 'left') return 8;
  if (textAlign === 'right') return width - 8;
  return width / 2;
}

function sampleTextPixels(text, font, width, height, pixelGap, textAlign) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.font = font;
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.textAlign = textAlign;
  ctx.fillText(text, getTextX(textAlign, width), height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = [];
  for (let y = 0; y < height; y += pixelGap) {
    for (let x = 0; x < width; x += pixelGap) {
      const idx = (y * width + x) * 4;
      if (imageData.data[idx + 3] > 128) {
        pixels.push({ x, y });
      }
    }
  }
  return pixels;
}

function getDirectionProgress(particle, direction, width, height) {
  switch (direction) {
    case Direction.RIGHT_TO_LEFT:  return 1 - particle.originX / width;
    case Direction.TOP_TO_BOTTOM:  return particle.originY / height;
    case Direction.BOTTOM_TO_TOP:  return 1 - particle.originY / height;
    default:                        return particle.originX / width;
  }
}

class Particle {
  constructor(x, y, color, direction, width, height) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = 1;
    this.vx = 0;
    this.vy = 0;
    this.size = 1.5;

    const dirProgress = getDirectionProgress(this, direction, width, height);
    this.delay = dirProgress * 0.65 + Math.random() * 0.15;
    this.duration = 0.4 + Math.random() * 0.3;

    switch (direction) {
      case Direction.LEFT_TO_RIGHT:
        this.vx = 1.5 + Math.random() * 2;
        this.vy = (Math.random() - 0.5) * 1.5;
        break;
      case Direction.RIGHT_TO_LEFT:
        this.vx = -(1.5 + Math.random() * 2);
        this.vy = (Math.random() - 0.5) * 1.5;
        break;
      case Direction.TOP_TO_BOTTOM:
        this.vy = 1.5 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 1.5;
        break;
      case Direction.BOTTOM_TO_TOP:
        this.vy = -(1.5 + Math.random() * 2);
        this.vx = (Math.random() - 0.5) * 1.5;
        break;
    }
  }

  update(progress) {
    if (progress < this.delay) return;
    const localP = Math.min(1, (progress - this.delay) / this.duration);
    const eased = localP < 0.5 ? 2 * localP * localP : -1 + (4 - 2 * localP) * localP;
    this.x = this.originX + this.vx * eased * 55;
    this.y = this.originY + this.vy * eased * 55;
    this.alpha = Math.max(0, 1 - eased);
    this.size = 1.5 * (1 - eased * 0.5);
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function VaporizeCanvas({ text, font, color, direction, pixelGap, textAlign, onDone, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;
    const ctx = canvas.getContext('2d');
    const parsed = parseColor(color);
    const pixels = sampleTextPixels(text, font, width, height, pixelGap, textAlign);
    const particles = pixels.map(
      (p) => new Particle(p.x, p.y, parsed, direction, width, height)
    );

    let progress = 0;
    let last = null;
    let rafId;

    function step(ts) {
      if (last === null) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      progress = Math.min(1, progress + dt * 0.95);
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => { p.update(progress); p.draw(ctx); });
      ctx.globalAlpha = 1;

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, width, height);
        onDone?.();
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [text, font, color, direction, pixelGap, textAlign, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

function StaticCanvas({ text, font, color, textAlign, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = textAlign;
    ctx.fillText(text, getTextX(textAlign, width), height / 2);
  }, [text, font, color, textAlign, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

/**
 * VaporizeText — cycles through texts with a particle vaporize exit animation.
 *
 * Props:
 *  texts          string[]   — phrases to cycle through
 *  color          string     — CSS color (rgb/hex)
 *  fontFamily     string
 *  fontSize       number     — base px size (overridden if fontSizeRatio is set)
 *  fontSizeRatio  number     — fraction of container width (e.g. 0.11 = 11%)
 *  fontWeight     string
 *  direction      Direction
 *  holdMs         number     — ms to display text before vaporizing
 *  pixelGap       number     — particle density (lower = denser)
 *  textAlign      string     — 'left' | 'center' | 'right'
 *  height         number     — canvas height in px
 *  className      string
 */
function fitFontSize(texts, fontFamily, fontWeight, maxSize, width, padding = 24) {
  if (!width) return maxSize;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let size = maxSize;
  while (size > 12) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    const longestWidth = Math.max(...texts.map((t) => ctx.measureText(t).width));
    if (longestWidth <= width - padding) break;
    size -= 1;
  }
  return size;
}

// ─── Mobile static version (no canvas, no hooks overhead) ─────────────────────

function VaporizeTextMobile({ texts, color, fontFamily, fontWeight, fontSizeRatio, fontSize, heightRatio, height, mobileCenterBelow, textAlign, className }) {
  const vw = Math.min(window.innerWidth, document.documentElement.clientWidth);
  const mobileSize = fontSizeRatio ? Math.round(vw * fontSizeRatio) : fontSize;
  const mobileHeight = heightRatio ? Math.round(mobileSize * heightRatio) : height;
  const align = mobileCenterBelow > 0 && vw < mobileCenterBelow ? 'center' : textAlign;
  return (
    <div
      className={`relative select-none flex items-center overflow-hidden ${className}`}
      style={{ height: mobileHeight, minHeight: mobileHeight, maxWidth: '100%' }}
      aria-label={texts[0]}
    >
      <span
        style={{
          color,
          fontSize: `${mobileSize}px`,
          fontWeight,
          fontFamily,
          textAlign: align,
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {texts[0]}
      </span>
    </div>
  );
}

// ─── Desktop animated version (canvas + particle hooks) ───────────────────────

function VaporizeTextDesktop({
  texts, color, fontFamily, fontSize, fontSizeRatio, fontWeight,
  direction, holdMs, pixelGap, textAlign, mobileCenterBelow, heightRatio, height, className,
}) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('enter');
  const [fittedSize, setFittedSize] = useState(fontSize);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;
    const maxSize = fontSizeRatio ? Math.round(width * fontSizeRatio) : fontSize;
    setFittedSize(fitFontSize(texts, fontFamily, fontWeight, maxSize, width));
  }, [width, texts, fontFamily, fontWeight, fontSize, fontSizeRatio]);

  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('static'), 80);
      return () => clearTimeout(t);
    }
    if (phase === 'static') {
      const t = setTimeout(() => setPhase('vaporize'), holdMs);
      return () => clearTimeout(t);
    }
  }, [phase, holdMs]);

  const handleVaporizeDone = () => {
    setIdx((prev) => (prev + 1) % texts.length);
    setPhase('enter');
  };

  const effectiveAlign =
    mobileCenterBelow > 0 && width > 0 && width < mobileCenterBelow ? 'center' : textAlign;
  const effectiveHeight = heightRatio ? Math.round(fittedSize * heightRatio) : height;
  const font = `${fontWeight} ${fittedSize}px ${fontFamily}`;
  const text = texts[idx];

  return (
    <div
      ref={containerRef}
      role="img"
      className={`relative select-none ${className}`}
      style={{ height: effectiveHeight }}
      aria-label={text}
    >
      {width > 0 && phase === 'static' && (
        <StaticCanvas text={text} font={font} color={color} textAlign={effectiveAlign} width={width} height={effectiveHeight} />
      )}
      {width > 0 && phase === 'vaporize' && (
        <VaporizeCanvas
          key={`${idx}-vaporize`}
          text={text}
          font={font}
          color={color}
          direction={direction}
          pixelGap={pixelGap}
          textAlign={effectiveAlign}
          width={width}
          height={effectiveHeight}
          onDone={handleVaporizeDone}
        />
      )}
    </div>
  );
}

// ─── Public export — delegates to mobile or desktop version ───────────────────

export function VaporizeText(props) {
  const {
    texts = ['Hello'],
    color = 'rgb(255,255,255)',
    fontFamily = "Georgia, 'Times New Roman', serif",
    fontSize = 64,
    fontSizeRatio = null,
    fontWeight = '400',
    direction = Direction.LEFT_TO_RIGHT,
    holdMs = 2200,
    pixelGap = 3,
    textAlign = 'left',
    mobileCenterBelow = 0,
    heightRatio = null,
    height = 90,
    className = '',
  } = props;

  const isMobile = typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches;

  const allProps = { texts, color, fontFamily, fontSize, fontSizeRatio, fontWeight, direction, holdMs, pixelGap, textAlign, mobileCenterBelow, heightRatio, height, className };

  if (isMobile) return <VaporizeTextMobile {...allProps} />;
  return <VaporizeTextDesktop {...allProps} />;
}
