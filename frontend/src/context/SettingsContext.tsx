import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface SettingsContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isApiOnline: boolean;
  checkApiStatus: () => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    return localStorage.getItem('backend_url') || 'http://localhost:3000';
  });
  const [isApiOnline, setIsApiOnline] = useState<boolean>(false);

  const setBackendUrl = (url: string) => {
    setBackendUrlState(url);
    localStorage.setItem('backend_url', url);
  };

  const checkApiStatus = async (): Promise<boolean> => {
    try {
      // We will create a simple GET /api/health or /api/topics/random endpoint later
      // For now, let's just do a ping to backendUrl/api/topics/random or the base URL
      await axios.get(`${backendUrl}/api/topics/random`, { timeout: 3000 });
      setIsApiOnline(true);
      return true;
    } catch {
      setIsApiOnline(false);
      return false;
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 15000); // Check status every 15s
    return () => clearInterval(interval);
  }, [backendUrl]);

  return (
    <SettingsContext.Provider value={{ backendUrl, setBackendUrl, isApiOnline, checkApiStatus }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
