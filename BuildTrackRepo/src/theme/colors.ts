/**
 * BuildTrack color palette — premium dark industrial theme
 */
export const Colors = {
  matteBlack: '#0B0B0B',
  charcoalBlack: '#161616',
  steelGrey: '#2A2A2A',
  burntOrange: '#FF6B00',
  amberOrange: '#FF8C42',
  softWhite: '#F5F5F5',
  lightGrey: '#B8B8B8',
  graphiteBorder: '#3A3A3A',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  transparent: 'transparent',
  overlay: 'rgba(11, 11, 11, 0.85)',
  orangeGlow: 'rgba(255, 107, 0, 0.25)',
  orangeGlowStrong: 'rgba(255, 107, 0, 0.45)',
  glass: 'rgba(42, 42, 42, 0.65)',
} as const;

export type ColorKey = keyof typeof Colors;
