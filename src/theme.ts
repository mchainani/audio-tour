import { Platform } from 'react-native';

export const colors = {
  background: '#F7F7F2',
  surface: '#FFFFFF',
  ink: '#20392F',
  muted: '#65746A',
  border: '#DFE5DC',
  green: '#244F3D',
  greenDark: '#193E2E',
  sage: '#E9EEDF',
  mint: '#C7D9BD',
  cream: '#F3EDDA',
  orange: '#B56439',
} as const;

export const typography = {
  heading: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};
