import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageContainer from './PageContainer';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar header */}
        <Topbar />

        {/* Content body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
