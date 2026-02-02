import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'luxury' | 'modern';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Persist theme preference
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dyad-theme') as Theme) || 'luxury';
    }
    return 'luxury';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'luxury') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    root.setAttribute('data-theme', theme);
    localStorage.setItem('dyad-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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