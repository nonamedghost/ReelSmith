import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { updateClientBaseURL } from '../api/client';

interface SettingsContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isApiOnline: boolean;
  checkApiStatus: () => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    const savedUrl =
      import.meta.env.VITE_API_URL ||
      localStorage.getItem('backend_url') ||
      'http://localhost:3000';

    updateClientBaseURL(savedUrl);

    return savedUrl;
  }); // it remove trailing slash and update client base url

  const [isApiOnline, setIsApiOnline] = useState<boolean>(false);

  // const setBackendUrl = (url: string) => {
  //   setBackendUrlState(url);
  //   localStorage.setItem('backend_url', url);
  // };

  const setBackendUrl = (url: string) => {
    const normalizedUrl = url.replace(/\/+$/, '');

    setBackendUrlState(normalizedUrl);
    localStorage.setItem('backend_url', normalizedUrl);
    updateClientBaseURL(normalizedUrl);
  }; // it remove trailing slash and update client base url


  // Check API Status
  const checkApiStatus = async (): Promise<boolean> => {
    try {
      await axios.get(`${backendUrl}/api/health`, { timeout: 3000 });
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
