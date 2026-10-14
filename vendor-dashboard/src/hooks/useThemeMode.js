import { useTheme, useColorScheme } from '@mui/material/styles';

/**
 * Custom hook to reliably read and toggle theme mode (light / dark)
 * across vendor dashboard components, subscribing reactively to MUI CSS variables mode changes.
 */
export default function useThemeMode() {
  const theme = useTheme();
  const { mode, setMode, systemMode } = useColorScheme();

  const domScheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-color-scheme') : null;
  const resolvedMode = (mode === 'system' ? systemMode : mode) || domScheme || 'dark';
  const isDark = resolvedMode === 'dark';

  const toggleMode = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return {
    mode: resolvedMode,
    isDark,
    isLight: !isDark,
    setMode,
    toggleMode,
    theme
  };
}
