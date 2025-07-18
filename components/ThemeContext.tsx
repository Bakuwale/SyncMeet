import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Appearance } from 'react-native';

// Types
export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use system theme as default, but don't listen for changes
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<ThemeType>(colorScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const themeColors = {
  light: {
    background: '#FFFFFF',
    cardBackground: '#F8F9FA',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    borderColor: '#E0E0E0',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    toastBackground: '#F8F9FA',
    toastText: '#1A1A1A',
  },
  dark: {
    background: '#121212',
    cardBackground: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#888888',
    borderColor: '#333333',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    toastBackground: '#232323',
    toastText: '#FFFFFF',
  },
}; 