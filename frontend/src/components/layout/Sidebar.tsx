import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  FolderHeart, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Reel', path: '/create', icon: Video },
    { name: 'Library', path: '/library', icon: FolderHeart },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`h-screen bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between transition-all duration-300 relative z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Sidebar Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-lg text-white tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                QODER
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 items-center justify-center hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-400 border-l-4 border-violet-500 font-semibold'
                      : 'hover:bg-slate-800/50 hover:text-slate-200 border-l-4 border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 duration-200" />
                {!isCollapsed && <span className="text-sm tracking-wide">{item.name}</span>}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-slate-200 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 border border-slate-800 shadow-xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 text-center">
        {!isCollapsed ? (
          <p className="text-xs text-slate-500 font-medium">Reels Generator v1.0.0</p>
        ) : (
          <span className="text-xs text-slate-500 font-bold">v1</span>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
