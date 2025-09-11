import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../components/layouts/PublicLayout';
import AdminLayout from '../components/layouts/AdminLayout';

// Pages
import HomePage from '../pages/client/home-page';
import CompanyClientPage from '../pages/client/company-page';
import ProfessionalClientPage from '../pages/client/professional-page';
import Auth from '../pages/client/auth-page';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import ProfessionalDashboard from '../pages/professional/ProfessionalDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

// Components
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, getDashboardRoute } from './routes';

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Routes với PublicLayout (có Header và Footer) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
     
        <Route path={ROUTES.COMPANIES} element={<CompanyClientPage />} />

        <Route path={ROUTES.PROFESSIONALS} element={<ProfessionalClientPage />} />

        <Route 
          path={ROUTES.LOGIN} 
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />} 
        />
        
        <Route 
          path={ROUTES.REGISTER} 
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />} 
        />

        {/* Company Dashboard với PublicLayout */}
        <Route 
          path={ROUTES.COMPANY.DASHBOARD} 
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Professional Dashboard với PublicLayout */}
        <Route 
          path={ROUTES.PROFESSIONAL.DASHBOARD} 
          element={
            <ProtectedRoute requiredRole="professional">
              <ProfessionalDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Admin Routes với AdminLayout (không có Header và Footer) */}
      <Route element={<AdminLayout />}>
        <Route 
          path={ROUTES.ADMIN.DASHBOARD} 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRouter;