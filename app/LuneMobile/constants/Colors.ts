export const Colors = {
  bgPrimary: '#050608',
  bgSurface: '#080a10',
  
  // Mesh Gradient Bases
  mesh1: 'rgba(30, 45, 65, 0.4)',
  mesh2: 'rgba(20, 35, 55, 0.4)',
  mesh3: 'rgba(40, 55, 75, 0.3)',

  glassBg: 'rgba(16, 20, 26, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.04)',
  
  textMain: '#ffffff',
  textMainRgb: '255, 255, 255',
  textDim: '#94a3b8',
  textDimRgb: '148, 163, 184',
  
  accent: '#0077f9',
  accentMain: '#0077f9',
  accentRgb: '0, 119, 249',
  accentSoft: 'rgba(0, 119, 249, 0.2)',
  
  cardBg: 'rgba(255, 255, 255, 0.02)',
  cardHover: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.03)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Typography = {
  header: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textMain,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textMain,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textMain,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textDim,
  },
} as const;
