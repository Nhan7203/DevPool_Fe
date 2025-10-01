import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../components/layouts/PublicLayout';
import AdminLayout from '../components/layouts/AdminLayout';

// Pages
import HomePage from '../pages/client/home-page';
import ProfessionalPage from '../pages/client/professional-page';
import AboutPage from '../pages/client/about-page';
import ContactPage from '../pages/client/contact-page';
import Auth from '../pages/client/auth-page';
import AdminDashboard from '../pages/admin/Dashboard/AdminDashboard';
import HRDashboard from '../pages/hr_staff/dashboard/Dashboard';
import ListDev from '../pages/hr_staff/developers/List_dev';
import CreateAccount from '../pages/admin/Users/Create_account';
import ManageCV from '../pages/hr_staff/developers/Manage_CV';
import ListContract from '../pages/hr_staff/contracts/List_contract';
import UploadContract from '../pages/hr_staff/contracts/Upload_contract';
import ListRequest from '../pages/hr_staff/job-requests/List_request';
import InterviewSuccess from '../pages/hr_staff/reports/Interview_success';
import DeveloperStatus from '../pages/hr_staff/reports/Developer_status';
import BusinessOverview from '../pages/manager/business/Overview';
import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import Revenue from '../pages/manager/business/Revenue';
import Utilization from '../pages/manager/hr/Utilization';
import HRPerformance from '../pages/manager/hr/Performance';
import HROverview from '../pages/manager/hr/Overview';
import HRDevelopers from '../pages/manager/hr/Dev';
import Debt from '../pages/manager/finance/Debt';
import Overview from '../pages/manager/finance/Overview';
import Profit from '../pages/manager/finance/Profit';
import CashFlow from '../pages/manager/finance/Cashflow';
import ListPartner from '../pages/hr_staff/partners/List_partner';
import Assignments from '../pages/hr_staff/assignments';
import InterviewList from '../pages/hr_staff/interviews/List';
import InterviewHistory from '../pages/hr_staff/interviews/History';
import ScheduleInterview from '../pages/hr_staff/interviews/Schedule';
import UserManagementPage from '../pages/admin/Users/List_user';
import RolesPage from '../pages/admin/Users/Roles';
import { PermissionsPage } from '../pages/admin/Users/Permissions';
import CompaniesPage from '../pages/admin/Companies/List_company';
import ClientsPage from '../pages/admin/Companies/Clients';
import SalesStaffDashboard from '../pages/sales_staff/Dashboard';
import AccountantDashboard from '../pages/accountant_staff/Dashboard';
import DeveloperDashboard from '../pages/developer/Dashboard';

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

        <Route path={ROUTES.PROFESSIONALS} element={<ProfessionalPage />} />

        <Route
          path={ROUTES.GUEST.ABOUT}
          element={<AboutPage />}
        />

        <Route
          path={ROUTES.GUEST.CONTACT}
          element={<ContactPage />}
        />

        <Route
          path={ROUTES.LOGIN}
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />}
        />

        <Route
          path={ROUTES.REGISTER}
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />}
        />

        {/* HR_STAFF Dashboard với PublicLayout */}
        <Route
          element={
            <ProtectedRoute requiredRole="Staff HR">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.HR_STAFF.DASHBOARD} element={<HRDashboard />} />

          <Route path={ROUTES.HR_STAFF.DEVELOPERS.LIST} element={<ListDev />} />
          <Route path={ROUTES.HR_STAFF.DEVELOPERS.MANAGE_CV} element={<ManageCV />} />

          <Route path={ROUTES.HR_STAFF.PARTNERS.LIST} element={<ListPartner />} />

          <Route path={ROUTES.HR_STAFF.ASSIGNMENTS} element={<Assignments />} />

          <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.LIST} element={<ListRequest />} />

          <Route path={ROUTES.HR_STAFF.INTERVIEWS.LIST} element={<InterviewList />} />
          <Route path={ROUTES.HR_STAFF.INTERVIEWS.SCHEDULE} element={<ScheduleInterview />} />
          <Route path={ROUTES.HR_STAFF.INTERVIEWS.HISTORY} element={<InterviewHistory />} />

          <Route path={ROUTES.HR_STAFF.CONTRACTS.LIST} element={<ListContract />} />
          <Route path={ROUTES.HR_STAFF.CONTRACTS.UPLOAD} element={<UploadContract />} />

          <Route path={ROUTES.HR_STAFF.REPORTS.INTERVIEW_SUCCESS} element={<InterviewSuccess />} />
          <Route path={ROUTES.HR_STAFF.REPORTS.DEVELOPER_STATUS} element={<DeveloperStatus />} />
        </Route>

        {/* SALES_STAFF Dashboard với PublicLayout */}
        <Route
          element={
            <ProtectedRoute requiredRole="Staff Sales">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.SALES_STAFF.DASHBOARD} element={<SalesStaffDashboard />} />
        </Route>

        {/* ACCOUNTANT_STAFF Dashboard với PublicLayout */}
        <Route
          element={
            <ProtectedRoute requiredRole="Staff Accountant">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ACCOUNTANT_STAFF.DASHBOARD} element={<AccountantDashboard />} />
        </Route>

        {/* DEVELOPER Dashboard với PublicLayout */}
        <Route
          element={
            <ProtectedRoute requiredRole="Developer">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DEVELOPER.DASHBOARD} element={<DeveloperDashboard />} />
        </Route>

        {/* MANAGER Dashboard với PublicLayout */}
        <Route
          element={
            <ProtectedRoute requiredRole="Manager">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.MANAGER.DASHBOARD} element={<ManagerDashboard />} />

          <Route path={ROUTES.MANAGER.BUSINESS.OVERVIEW} element={<BusinessOverview />} />
          <Route path={ROUTES.MANAGER.BUSINESS.REVENUE} element={<Revenue />} />

          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.OVERVIEW} element={<HROverview />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.PERFORMANCE} element={<HRPerformance />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.DEVELOPERS} element={<HRDevelopers />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.UTILIZATION} element={<Utilization />} />

          <Route path={ROUTES.MANAGER.FINANCE.CASHFLOW} element={<CashFlow />} />
          <Route path={ROUTES.MANAGER.FINANCE.DEBT} element={<Debt />} />
          <Route path={ROUTES.MANAGER.FINANCE.OVERVIEW} element={<Overview />} />
          <Route path={ROUTES.MANAGER.FINANCE.PROFIT} element={<Profit />} />
        </Route>
      </Route>

      {/* Admin Routes với AdminLayout (không có Header và Footer) */}
      <Route element={<AdminLayout />}>
        <Route
          element={
            <ProtectedRoute requiredRole="Admin">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />

          <Route path={ROUTES.ADMIN.USERS.LIST} element={<UserManagementPage />} />
          <Route path={ROUTES.ADMIN.USERS.CREATE_ACCOUNT} element={<CreateAccount />} />
          <Route path={ROUTES.ADMIN.USERS.ROLES} element={<RolesPage />} />
          <Route path={ROUTES.ADMIN.USERS.PERMISSIONS} element={<PermissionsPage />} />

          <Route path={ROUTES.ADMIN.COMPANIES.LIST} element={<CompaniesPage />} />
          <Route path={ROUTES.ADMIN.COMPANIES.CLIENTS} element={<ClientsPage />} />
        </Route>

      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRouter;