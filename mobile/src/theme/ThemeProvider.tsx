import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

import { ThemeDefinition, ThemeKey, themeList } from './theme';
import themeDefinitions from './theme';

interface ThemeContextValue {
  theme: ThemeDefinition['tokens'];
  themeKey: ThemeKey;
  themeLabel: string;
  skinLabel: string;
  themes: ThemeDefinition[];
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeKey, setThemeKey] = useState<ThemeKey>('blue');
  const activeTheme = useMemo(() => themeDefinitions[themeKey], [themeKey]);
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme.tokens,
      themeKey,
      themeLabel: activeTheme.label,
      skinLabel: activeTheme.skin,
      themes: themeList,
      setTheme: setThemeKey
    }),
    [activeTheme, themeKey]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
