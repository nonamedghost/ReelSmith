import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
