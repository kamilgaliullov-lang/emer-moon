import type { ObjSphere } from './types';

export const SPHERE_COLORS: Record<ObjSphere, string> = {
  governance: '#007AFF',
  social: '#FF3B30',
  infrastructure: '#FFCC00',
  environment: '#34C759',
};

export const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  border: '#E5E5EA',
  separator: '#C6C6C8',
  destructive: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

export const RADIUS = {
  card: 20,
  button: 14,
  full: 9999,
  sheet: 24,
  small: 12,
};

export const SHADOW = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
