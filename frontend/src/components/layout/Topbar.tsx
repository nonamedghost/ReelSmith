import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon, Wifi, WifiOff } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isApiOnline } = useSettings();
  const location = useLocation();

  // Deduce page title from path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/create':
        return 'Create Video Reel';
      case '/library':
        return 'Video Library';
      case '/settings':
        return 'Settings & API Keys';
      default:
        return 'Reels Generator';
    }
  };

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Page Title */}
      <h2 className="text-xl font-bold text-white tracking-tight">
        {getPageTitle()}
      </h2>

      {/* Actions / Status Indicators */}
      <div className="flex items-center gap-6">
        {/* API Status Indicator */}
        <div className="flex items-center gap-2">
          {isApiOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Server Connected</span>
              <span className="sm:hidden">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Server Disconnected</span>
              <span className="sm:hidden">Offline</span>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
