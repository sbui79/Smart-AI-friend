/**
 * Color palette for Ages 15+ theme
 * Modern, clean aesthetic with good contrast
 */
export const colors = {
  // Primary colors
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Secondary colors
  secondary: '#EC4899', // Pink
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',

  // Neutral colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Status colors - for creature stats
  success: '#10B981', // Green - healthy stats
  warning: '#F59E0B', // Amber - medium stats
  error: '#EF4444', // Red - critical stats
  info: '#3B82F6', // Blue

  // Mood colors
  happy: '#10B981',
  excited: '#F59E0B',
  sad: '#6366F1',
  tired: '#8B5CF6',
  sick: '#EF4444',
  neutral: '#6B7280',

  // UI elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Special
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKey = keyof typeof colors;
