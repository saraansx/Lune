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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_COLORS: Record<AccentColor, { hex: string; rgb: string; mesh1: string; mesh2: string; mesh3: string }> = {
  slate: {
    hex: '#64748b', rgb: '100, 116, 139',
    mesh1: '45, 55, 72', mesh2: '35, 45, 60', mesh3: '55, 65, 85'
  },
  zinc: {
    hex: '#71717a', rgb: '113, 113, 122',
    mesh1: '50, 50, 55', mesh2: '40, 40, 45', mesh3: '60, 60, 65'
  },
  stone: {
    hex: '#78716c', rgb: '120, 113, 108',
    mesh1: '55, 50, 45', mesh2: '45, 40, 35', mesh3: '65, 60, 55'
  },
  red: {
    hex: '#dc2626', rgb: '220, 38, 38',
    mesh1: '65, 30, 30', mesh2: '55, 20, 20', mesh3: '75, 40, 40'
  },
  orange: {
    hex: '#f97316', rgb: '249, 115, 22',
    mesh1: '65, 45, 20', mesh2: '55, 35, 10', mesh3: '75, 55, 30'
  },
  yellow: {
    hex: '#eab308', rgb: '234, 179, 8',
    mesh1: '60, 50, 15', mesh2: '50, 40, 5', mesh3: '70, 60, 25'
  },
  green: {
    hex: '#22c55e', rgb: '34, 197, 94',
    mesh1: '25, 55, 35', mesh2: '15, 45, 25', mesh3: '35, 65, 45'
  },
  blue: {
    hex: '#0077f9', rgb: '0, 119, 249',
    mesh1: '30, 45, 65', mesh2: '20, 35, 55', mesh3: '40, 55, 75'
  },
  violet: {
    hex: '#8b5cf6', rgb: '139, 92, 246',
    mesh1: '45, 30, 65', mesh2: '35, 20, 55', mesh3: '55, 40, 75'
  },
  rose: {
    hex: '#ec4899', rgb: '236, 72, 153',
    mesh1: '65, 25, 50', mesh2: '55, 15, 40', mesh3: '75, 35, 60'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [layoutDensity, setLayoutDensityState] = useState<LayoutDensity>('comfortable');

  useEffect(() => {
    const savedColor = localStorage.getItem('lune_accent_color') as AccentColor;
    if (savedColor && ACCENT_COLORS[savedColor]) {
      setAccentColorState(savedColor);
    }
    
    const savedDensity = localStorage.getItem('lune_layout_density') as LayoutDensity;
    if (savedDensity) {
        setLayoutDensityState(savedDensity);
    }
  }, []);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('lune_accent_color', color);
  };

  const setLayoutDensity = (density: LayoutDensity) => {
      setLayoutDensityState(density);
      localStorage.setItem('lune_layout_density', density);
  };

  useEffect(() => {
    const theme = ACCENT_COLORS[accentColor];
    const root = document.documentElement;
    
    root.style.setProperty('--accent', theme.hex);
    root.style.setProperty('--accent-main', theme.hex);
    root.style.setProperty('--accent-rgb', theme.rgb);
    
    const meshGradient = `
      radial-gradient(at 0% 0%, rgba(${theme.mesh1}, 0.4) 0, transparent 40%),
      radial-gradient(at 100% 0%, rgba(${theme.mesh2}, 0.4) 0, transparent 40%),
      radial-gradient(at 50% 100%, rgba(${theme.mesh3}, 0.3) 0, transparent 50%)
    `;
    
    root.style.setProperty('--bg-mesh', meshGradient);
    root.setAttribute('data-density', layoutDensity);
  }, [accentColor, layoutDensity]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, layoutDensity, setLayoutDensity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
