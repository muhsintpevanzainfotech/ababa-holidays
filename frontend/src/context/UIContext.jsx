import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('notifications', isNotificationsEnabled);
  }, [isNotificationsEnabled]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleNotifications = () => setIsNotificationsEnabled(prev => !prev);

  return (
    <UIContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      isNotificationsEnabled, 
      toggleNotifications
    }}>
      {children}
    </UIContext.Provider>
  );
};
