import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { useAuth } from '../../contexts/AuthContext';

const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const showPublicBranding = user?.role !== 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showPublicBranding={showPublicBranding} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
