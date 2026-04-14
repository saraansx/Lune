import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentColor = 
  | 'slate' | 'zinc' | 'stone' | 'red' | 'orange' 
  | 'yellow' | 'green' | 'blue' | 'violet' | 'rose';

export type LayoutDensity = 'comfortable' | 'compact';

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  dynamicColor: boolean;
  setDynamicColor: (v: boolean) => void;
  applyDynamicColor: (imageUrl: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_COLORS: Record<AccentColor, { hex: string; rgb: string; mesh1: string; mesh2: string; mesh3: string }> = {
  slate:  { hex: '#64748b', rgb: '100, 116, 139', mesh1: '45, 55, 72',  mesh2: '35, 45, 60',  mesh3: '55, 65, 85'  },
  zinc:   { hex: '#71717a', rgb: '113, 113, 122', mesh1: '50, 50, 55',  mesh2: '40, 40, 45',  mesh3: '60, 60, 65'  },
  stone:  { hex: '#78716c', rgb: '120, 113, 108', mesh1: '55, 50, 45',  mesh2: '45, 40, 35',  mesh3: '65, 60, 55'  },
  red:    { hex: '#dc2626', rgb: '220, 38, 38',   mesh1: '65, 30, 30',  mesh2: '55, 20, 20',  mesh3: '75, 40, 40'  },
  orange: { hex: '#f97316', rgb: '249, 115, 22',  mesh1: '65, 45, 20',  mesh2: '55, 35, 10',  mesh3: '75, 55, 30'  },
  yellow: { hex: '#eab308', rgb: '234, 179, 8',   mesh1: '60, 50, 15',  mesh2: '50, 40, 5',   mesh3: '70, 60, 25'  },
  green:  { hex: '#22c55e', rgb: '34, 197, 94',   mesh1: '25, 55, 35',  mesh2: '15, 45, 25',  mesh3: '35, 65, 45'  },
  blue:   { hex: '#0077f9', rgb: '0, 119, 249',   mesh1: '30, 45, 65',  mesh2: '20, 35, 55',  mesh3: '40, 55, 75'  },
  violet: { hex: '#8b5cf6', rgb: '139, 92, 246',  mesh1: '45, 30, 65',  mesh2: '35, 20, 55',  mesh3: '55, 40, 75'  },
  rose:   { hex: '#ec4899', rgb: '236, 72, 153',  mesh1: '65, 25, 50',  mesh2: '55, 15, 40',  mesh3: '75, 35, 60'  },
};

/* ─── Colour Extraction via Canvas ─── */
const extractDominantColor = (imageUrl: string): Promise<[number, number, number]> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const SIZE = 64;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no ctx'));
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let r = 0, g = 0, b = 0, tot = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          const lum = (pr + pg + pb) / 3;
          if (lum < 15 || lum > 245) continue;
          const sat = Math.max(pr, pg, pb) === 0
            ? 0 : (Math.max(pr, pg, pb) - Math.min(pr, pg, pb)) / Math.max(pr, pg, pb);
          const w = 1 + sat * 4;
          r += pr * w; g += pg * w; b += pb * w; tot += w;
        }
        if (tot === 0) return reject(new Error('no usable pixels'));

        let fr = Math.round(r / tot);
        let fg = Math.round(g / tot);
        let fb = Math.round(b / tot);

        // Boost saturation if colour is too muted
        const avg = (fr + fg + fb) / 3;
        const maxC = Math.max(fr, fg, fb);
        const sat2 = maxC === 0 ? 0 : (maxC - Math.min(fr, fg, fb)) / maxC;
        if (sat2 < 0.25) {
          const boost = 1.6;
          fr = Math.min(255, Math.round(fr + (fr - avg) * boost));
          fg = Math.min(255, Math.round(fg + (fg - avg) * boost));
          fb = Math.min(255, Math.round(fb + (fb - avg) * boost));
        }

        // Lift very dark results
        const lum2 = (fr + fg + fb) / 3;
        if (lum2 < 80 && lum2 > 0) {
          const fac = 80 / lum2;
          fr = Math.min(255, Math.round(fr * fac));
          fg = Math.min(255, Math.round(fg * fac));
          fb = Math.min(255, Math.round(fb * fac));
        }

        resolve([fr, fg, fb]);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = imageUrl;
  });

/* ─── Smooth CSS-var Animator (RAF) ─── */
let _rafId: number | null = null;

const animateToColor = (
  from: [number, number, number],
  to:   [number, number, number],
  durationMs = 1400,
) => {
  if (_rafId !== null) cancelAnimationFrame(_rafId);
  const start = performance.now();
  const root  = document.documentElement;
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const m   = (c: number, f: number) => Math.min(255, Math.round(c * f));

  const tick = (now: number) => {
    const raw = Math.min((now - start) / durationMs, 1);
    const t   = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2; // ease-in-out cubic

    const r = from[0] + (to[0] - from[0]) * t;
    const g = from[1] + (to[1] - from[1]) * t;
    const b = from[2] + (to[2] - from[2]) * t;

    root.style.setProperty('--accent',     `#${hex(r)}${hex(g)}${hex(b)}`);
    root.style.setProperty('--accent-main',`#${hex(r)}${hex(g)}${hex(b)}`);
    root.style.setProperty('--accent-rgb', `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`);

    const mesh = `
      radial-gradient(at 0% 0%,   rgba(${m(r,.45)}, ${m(g,.45)}, ${m(b,.45)}, 0.45) 0, transparent 40%),
      radial-gradient(at 100% 0%, rgba(${m(r,.30)}, ${m(g,.30)}, ${m(b,.30)}, 0.40) 0, transparent 40%),
      radial-gradient(at 50% 100%,rgba(${m(r,.55)}, ${m(g,.55)}, ${m(b,.55)}, 0.30) 0, transparent 50%)`;
    root.style.setProperty('--bg-mesh', mesh);

    if (raw < 1) { _rafId = requestAnimationFrame(tick); }
    else { _rafId = null; }
  };
  _rafId = requestAnimationFrame(tick);
};

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const getCurrentAccentRgb = (): [number, number, number] => {
  const raw   = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  const parts = raw.split(',').map(s => parseInt(s.trim(), 10));
  return parts.length === 3 && parts.every(n => !isNaN(n))
    ? [parts[0], parts[1], parts[2]]
    : [0, 119, 249];
};

/* ─── Provider ─── */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor,    setAccentColorState]    = useState<AccentColor>('blue');
  const [layoutDensity,  setLayoutDensityState]  = useState<LayoutDensity>('comfortable');
  const [dynamicColor,   setDynamicColorState]   = useState<boolean>(
    () => localStorage.getItem('lune_dynamic_color') === 'true',
  );

  // Load persisted preferences on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('lune_accent_color') as AccentColor;
    if (savedColor && ACCENT_COLORS[savedColor]) setAccentColorState(savedColor);

    const savedDensity = localStorage.getItem('lune_layout_density') as LayoutDensity;
    if (savedDensity) setLayoutDensityState(savedDensity);
  }, []);

  // Sync accent (static) → CSS vars whenever dynamic mode is OFF
  useEffect(() => {
    if (dynamicColor) return;
    const theme = ACCENT_COLORS[accentColor];
    const root  = document.documentElement;
    root.style.setProperty('--accent',      theme.hex);
    root.style.setProperty('--accent-main', theme.hex);
    root.style.setProperty('--accent-rgb',  theme.rgb);
    root.style.setProperty('--bg-mesh', `
      radial-gradient(at 0% 0%,   rgba(${theme.mesh1}, 0.4) 0, transparent 40%),
      radial-gradient(at 100% 0%, rgba(${theme.mesh2}, 0.4) 0, transparent 40%),
      radial-gradient(at 50% 100%,rgba(${theme.mesh3}, 0.3) 0, transparent 50%)`);
    root.setAttribute('data-density', layoutDensity);
  }, [accentColor, layoutDensity, dynamicColor]);

  // Keep density attr in sync regardless of dynamic mode
  useEffect(() => {
    document.documentElement.setAttribute('data-density', layoutDensity);
  }, [layoutDensity]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('lune_accent_color', color);
  };

  const setLayoutDensity = (density: LayoutDensity) => {
    setLayoutDensityState(density);
    localStorage.setItem('lune_layout_density', density);
  };

  const setDynamicColor = (v: boolean) => {
    setDynamicColorState(v);
    localStorage.setItem('lune_dynamic_color', String(v));
    // Turning off → animate back to the saved static accent
    if (!v) {
      const theme = ACCENT_COLORS[accentColor];
      animateToColor(getCurrentAccentRgb(), hexToRgb(theme.hex));
    }
  };

  /** Called by DynamicColorSync whenever the current track's album art changes. */
  const applyDynamicColor = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
      const toRgb   = await extractDominantColor(imageUrl);
      const fromRgb = getCurrentAccentRgb();
      animateToColor(fromRgb, toRgb);
    } catch {
      // Silently keep current colour on extraction failure
    }
  };

  return (
    <ThemeContext.Provider value={{
      accentColor, setAccentColor,
      layoutDensity, setLayoutDensity,
      dynamicColor, setDynamicColor,
      applyDynamicColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
