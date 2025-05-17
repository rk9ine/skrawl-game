import { shadows } from '../theme/theme';

/**
 * Applies a shadow from the theme
 * @param size 'sm' | 'md' | 'lg' - The shadow size to apply
 * @returns The shadow style object for the current platform
 */
export const applyThemeShadow = (size: 'sm' | 'md' | 'lg') => {
  return shadows[size];
};
