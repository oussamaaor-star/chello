import React from 'react';

/* ════════════════════════════════════════════════════════════════
   Device specs — logical px per model.
   notch  → models with a top notch (iPhone X / 14)
   island → models with the Dynamic Island (14 Pro / 15 / 15 Pro)
   ════════════════════════════════════════════════════════════════ */
const DEVICE_SPECS = {
  x: {
    w: 375, h: 812, radius: 50, bezel: 12, topSafe: 47, bottomSafe: 34,
    notch: { w: 210, h: 35, r: 18 },
  },
  '14': {
    w: 390, h: 844, radius: 56, bezel: 12, topSafe: 47, bottomSafe: 34,
    notch: { w: 225, h: 33, r: 18 },
  },
  '14-pro': {
    w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  '15': {
    w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  '15-pro': {
    w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  '16-pro-max': {
    w: 408, h: 886, radius: 60, bezel: 9, topSafe: 60, bottomSafe: 34,
    island: { w: 125, h: 36, r: 19 },
  },
  plain: {
    w: 390, h: 844, radius: 56, bezel: 12, topSafe: 16, bottomSafe: 16,
  },
};

const PRESET_COLORS = {
  black: '#0b0b0d',
  midnight: '#0b0c10',
  silver: '#d7d8dc',
  starlight: '#f1eee9',
  'space-black': '#1c1e22',
  gold: '#f2dfb3',
  blue: '#2b4fa8',
  pink: '#ffbfd1',
  titanium: '#837a72',
  'natural-titanium': '#a69a8a',
  'desert-titanium': '#c8b89a',
  green: '#2b622e',
  red: '#c81f2f',
};

/* Lighten (pct > 0) or darken (pct < 0) a #rrggbb hex by pct (-100..100). */
function shade(hex, pct) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const num = parseInt(h, 16);
  const amt = Math.round(2.55 * pct);

  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function IPhoneMockup({
  model = '14-pro',
  color = 'space-black',
  orientation = 'portrait',
  scale = 1,
  bezel,
  radius,
  shadow = true,
  screenBg = '#000',
  wallpaper,
  wallpaperFit = 'cover',
  wallpaperPosition = 'center',
  dynamicIsland,
  notch,
  safeArea = true,
  showHomeIndicator = true,
  innerShadow = true,
  style,
  className,
  frameStyle,
  screenStyle,
  children,
}) {
  const spec = DEVICE_SPECS[model] || DEVICE_SPECS['14-pro'];

  const resolvedColor = PRESET_COLORS[color] || color;
  const resolvedBezel = bezel != null ? bezel : spec.bezel;
  const resolvedRadius = radius != null ? radius : spec.radius;

  const isLandscape = orientation === 'landscape';
  const screenW = isLandscape ? spec.h : spec.w;
  const screenH = isLandscape ? spec.w : spec.h;

  const frameW = screenW + resolvedBezel * 2;
  const frameH = screenH + resolvedBezel * 2;

  // Decide which top cutout to draw.
  const hasIsland = dynamicIsland != null ? dynamicIsland : !!spec.island;
  const hasNotch = notch != null ? notch : (!!spec.notch && !hasIsland);

  const topSafe = safeArea ? spec.topSafe : 0;
  const bottomSafe = safeArea ? spec.bottomSafe : 0;

  const frameStyles = {
    position: 'relative',
    width: frameW,
    height: frameH,
    borderRadius: resolvedRadius + resolvedBezel,
    padding: resolvedBezel,
    background: `linear-gradient(135deg, ${shade(resolvedColor, 8)}, ${resolvedColor} 40%, ${shade(resolvedColor, -14)})`,
    boxShadow: shadow
      ? '0 30px 60px -15px rgba(0,0,0,0.45), 0 10px 24px -8px rgba(0,0,0,0.35)'
      : 'none',
    overflow: 'hidden',
    ...frameStyle,
  };

  const screenStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: resolvedRadius,
    overflow: 'hidden',
    background: screenBg,
    boxShadow: innerShadow ? 'inset 0 0 6px 2px rgba(0,0,0,0.45)' : 'none',
    ...screenStyle,
  };

  const wrapperStyles = {
    display: 'inline-block',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top center',
    ...style,
  };

  const island = spec.island;
  const notchSpec = spec.notch;

  return (
    <div className={className} style={wrapperStyles}>
      <div style={frameStyles}>
        <div style={screenStyles}>
          {/* Wallpaper */}
          {wallpaper && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: wallpaperFit,
                backgroundPosition: wallpaperPosition,
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* Dynamic Island */}
          {hasIsland && island && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: island.w,
                height: island.h,
                borderRadius: island.r,
                background: '#000',
                zIndex: 2,
              }}
            />
          )}

          {/* Notch */}
          {hasNotch && notchSpec && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: notchSpec.w,
                height: notchSpec.h,
                borderBottomLeftRadius: notchSpec.r,
                borderBottomRightRadius: notchSpec.r,
                background: '#000',
                zIndex: 2,
              }}
            />
          )}

          {/* Content area (respects safe-area insets) */}
          <div
            style={{
              position: 'absolute',
              top: topSafe,
              bottom: bottomSafe,
              left: 0,
              right: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
            }}
          >
            {children}
          </div>

          {/* Home indicator */}
          {showHomeIndicator && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 134,
                height: 5,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.85)',
                zIndex: 3,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default IPhoneMockup;
