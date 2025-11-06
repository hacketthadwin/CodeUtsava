import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme color definitions
export const LIGHT_THEME = {
  // Main colors - Blue stays consistent
  primary: '#4A90E2',
  secondary: '#880E4F',
  tertiary: '#1B5E20',
  danger: '#B71C1C',
  darkBlue: '#0047AB',
  indigooprimary: '#311B92', 
  
  // Background colors - Clean whites
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  cardSecondary: '#F5F5F5',
  
  // Text colors - Black on white
  text: '#000000',
  textSecondary: '#666666',
  textLight: '#888888',
  textMuted: '#999999',
  
  // Navigation colors
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  headerBackground: '#FFFFFF',
  headerText: '#000000',
  
  // Button colors
  buttonBackground: '#F5F5F5',
  buttonText: '#000000',
  
  // Status bar
  statusBarStyle: 'dark-content',
  statusBarBackground: '#FFFFFF',
  
  // Paper theme colors
  paperBackground: '#FFFFFF',
  paperSurface: '#F5F5F5',
  paperText: '#000000',
};

export const DARK_THEME = {
  // Main colors - Blue stays consistent
  primary: '#4A90E2',
  secondary: '#FF80AB',
  tertiary: '#4CAF50',
  danger: '#F44336',
  darkBlue: '#4A90E2', // Keep blue consistent
  
  // Background colors - Dark theme
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  cardSecondary: '#383838',
  
  // Text colors - White on dark
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#888888',
  textMuted: '#666666',
  
  // Navigation colors
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#2C2C2C',
  headerBackground: '#1E1E1E',
  headerText: '#FFFFFF',
  
  // Button colors
  buttonBackground: '#2C2C2C',
  buttonText: '#FFFFFF',
  
  // Status bar
  statusBarStyle: 'light-content',
  statusBarBackground: '#121212',
  
  // Paper theme colors
  paperBackground: '#121212',
  paperSurface: '#1E1E1E',
  paperText: '#FFFFFF',
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const value = {
    isDarkMode,
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
