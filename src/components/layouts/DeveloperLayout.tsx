import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';

const DeveloperLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showPublicBranding={false} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DeveloperLayout;

