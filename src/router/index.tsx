import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../components/layouts/PublicLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, getDashboardRoute } from './routes';

// Client
import HomePage from '../pages/client/home-page';
import ProfessionalPage from '../pages/client/professional-page';
import AboutPage from '../pages/client/about-page';
import ContactPage from '../pages/client/contact-page';
import Auth from '../pages/client/auth-page';
//Admin
import AdminDashboard from '../pages/admin/Dashboard/AdminDashboard';
import CreateAccount from '../pages/admin/Users/Create';
import UserManagementPage from '../pages/admin/Users/List';
import RolesPage from '../pages/admin/Users/Roles';
import { PermissionsPage } from '../pages/admin/Users/Permissions';
import CompaniesPage from '../pages/admin/Companies/List';
import ClientsPage from '../pages/admin/Companies/Clients';
//HR Staff
import ListCV from '../pages/hr_staff/cvs/List';
import ListContract from '../pages/hr_staff/contracts/List';
import UploadContract from '../pages/hr_staff/contracts/Upload';
import ListRequest from '../pages/hr_staff/job-requests/List';
import InterviewSuccess from '../pages/hr_staff/reports/Interview_success';
import DeveloperStatus from '../pages/hr_staff/reports/Developer_status';
import HRDashboard from '../pages/hr_staff/dashboard/Dashboard';
import ListDev from '../pages/hr_staff/developers/List';
import ListPartner from '../pages/hr_staff/partners/List';
import CreatePartner from '../pages/hr_staff/partners/Create';
import Assignments from '../pages/hr_staff/assignments';
import InterviewList from '../pages/hr_staff/interviews/List';
import InterviewHistory from '../pages/hr_staff/interviews/History';
import ScheduleInterview from '../pages/hr_staff/interviews/Schedule';
//Manager
import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import ClientContracts from '../pages/manager/contract/Clients/List';
import ClientDetailPage from '../pages/manager/contract/Clients/Detail';
import DevContracts from '../pages/manager/contract/Devs/List';
import DevDetailPage from '../pages/manager/contract/Devs/Detail';
import BusinessOverview from '../pages/manager/business/Overview';
import Revenue from '../pages/manager/business/Revenue';
import Utilization from '../pages/manager/hr/Utilization';
import HRPerformance from '../pages/manager/hr/Performance';
import HROverview from '../pages/manager/hr/Overview';
import HRDevelopers from '../pages/manager/hr/Dev';
import Debt from '../pages/manager/finance/Debt';
import Overview from '../pages/manager/finance/Overview';
import Profit from '../pages/manager/finance/Profit';
import CashFlow from '../pages/manager/finance/Cashflow';
//Sale Staff
import SalesStaffDashboard from '../pages/sales_staff/Dashboard';
import UploadSignedContract from '../pages/sales_staff/contract/Upload';
import ListClientContracts from '../pages/sales_staff/contract/List';
import ContractDetailPage from '../pages/sales_staff/contract/Detail';
import JobRequestListPage from '../pages/sales_staff/job-requests/List';
import JobRequestDetailPage from '../pages/sales_staff/job-requests/Detail';
import JobRequestCreatePage from '../pages/sales_staff/job-requests/Create';
//Accountant Staff
import AccountantDashboard from '../pages/accountant_staff/Dashboard';
//Developer
import DeveloperDashboard from '../pages/developer/Dashboard';
import JobRequestEditPage from '../pages/sales_staff/job-requests/Edit';
import JobRequestDetailHRPage from '../pages/hr_staff/job-requests/Detail';
import TalentCVDetail from '../pages/hr_staff/cvs/Detail';
import CreateTalentCV from '../pages/hr_staff/cvs/Upload';
import MatchingCVPage from '../pages/hr_staff/cvs/Matching';
import ClientCompanyListPage from '../pages/sales_staff/client-companies/List';
import ClientCompanyDetailPage from '../pages/sales_staff/client-companies/Detail';
import ClientCompanyEditPage from '../pages/sales_staff/client-companies/Edit';
import ClientCompanyCreatePage from '../pages/sales_staff/client-companies/Create';
import ProjectListPage from '../pages/sales_staff/projects/List';
import ProjectDetailPage from '../pages/sales_staff/projects/Detail';
import ProjectEditPage from '../pages/sales_staff/projects/Edit';
import ProjectCreatePage from '../pages/sales_staff/projects/Create';
import JobPositionListPage from '../pages/sales_staff/job-positions/List';
import JobPositionDetailPage from '../pages/sales_staff/job-positions/Detail';
import JobPositionEditPage from '../pages/sales_staff/job-positions/Edit';
import JobPositionCreatePage from '../pages/sales_staff/job-positions/Create';
import PositionTypeListPage from '../pages/sales_staff/position-type/List';
import PositionTypeDetailPage from '../pages/sales_staff/position-type/Detail';
import PositionTypeEditPage from '../pages/sales_staff/position-type/Edit';
import PositionTypeCreatePage from '../pages/sales_staff/position-type/Create';
import MarketListPage from '../pages/sales_staff/markets/List';
import MarketDetailPage from '../pages/sales_staff/markets/Detail';
import MarketEditPage from '../pages/sales_staff/markets/Edit';
import MarketCreatePage from '../pages/sales_staff/markets/Create';
import IndustryListPage from '../pages/sales_staff/industries/List';
import IndustryDetailPage from '../pages/sales_staff/industries/Detail';
import IndustryEditPage from '../pages/sales_staff/industries/Edit';
import IndustryCreatePage from '../pages/sales_staff/industries/Create';
import CreateTalent from '../pages/hr_staff/developers/Create';


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
          <Route path={ROUTES.HR_STAFF.DEVELOPERS.CREATE} element={<CreateTalent />} />

          <Route path={ROUTES.HR_STAFF.CVS.LIST} element={<ListCV />} />
          <Route path={ROUTES.HR_STAFF.CVS.DETAIL} element={<TalentCVDetail />} />
          <Route path={ROUTES.HR_STAFF.CVS.UPLOAD} element={<CreateTalentCV />} />
          <Route path={ROUTES.HR_STAFF.CVS.MATCHING} element={<MatchingCVPage />} />

          <Route path={ROUTES.HR_STAFF.PARTNERS.LIST} element={<ListPartner />} />
          <Route path={ROUTES.HR_STAFF.PARTNERS.CREATE} element={<CreatePartner />} />

          <Route path={ROUTES.HR_STAFF.ASSIGNMENTS} element={<Assignments />} />

          <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.LIST} element={<ListRequest />} />
          <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailHRPage />} />

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

          <Route path={ROUTES.SALES_STAFF.CONTRACTS.LIST} element={<ListClientContracts />} />
          <Route path={ROUTES.SALES_STAFF.CONTRACTS.DETAIL} element={<ContractDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.CONTRACTS.UPLOAD} element={<UploadSignedContract />} />

          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.LIST} element={<JobRequestListPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.EDIT} element={<JobRequestEditPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.CREATE} element={<JobRequestCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.CLIENTS.LIST} element={<ClientCompanyListPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.DETAIL} element={<ClientCompanyDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.EDIT} element={<ClientCompanyEditPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.CREATE} element={<ClientCompanyCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.PROJECTS.LIST} element={<ProjectListPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.EDIT} element={<ProjectEditPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.CREATE} element={<ProjectCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.JOB_POSITIONS.LIST} element={<JobPositionListPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_POSITIONS.DETAIL} element={<JobPositionDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_POSITIONS.EDIT} element={<JobPositionEditPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_POSITIONS.CREATE} element={<JobPositionCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.POSITION_TYPE.LIST} element={<PositionTypeListPage />} />
          <Route path={ROUTES.SALES_STAFF.POSITION_TYPE.DETAIL} element={<PositionTypeDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.POSITION_TYPE.EDIT} element={<PositionTypeEditPage />} />
          <Route path={ROUTES.SALES_STAFF.POSITION_TYPE.CREATE} element={<PositionTypeCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.MARKETS.LIST} element={<MarketListPage />} />
          <Route path={ROUTES.SALES_STAFF.MARKETS.DETAIL} element={<MarketDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.MARKETS.EDIT} element={<MarketEditPage />} />
          <Route path={ROUTES.SALES_STAFF.MARKETS.CREATE} element={<MarketCreatePage />} />

          <Route path={ROUTES.SALES_STAFF.INDUSTRIES.LIST} element={<IndustryListPage />} />
          <Route path={ROUTES.SALES_STAFF.INDUSTRIES.DETAIL} element={<IndustryDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.INDUSTRIES.EDIT} element={<IndustryEditPage />} />
          <Route path={ROUTES.SALES_STAFF.INDUSTRIES.CREATE} element={<IndustryCreatePage />} />
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

          <Route path={ROUTES.MANAGER.CONTRACT.CLIENTS} element={<ClientContracts />} />
          <Route path={ROUTES.MANAGER.CONTRACT.CLIENT_DETAIL} element={<ClientDetailPage />} />
          <Route path={ROUTES.MANAGER.CONTRACT.DEVS} element={<DevContracts />} />
          <Route path={ROUTES.MANAGER.CONTRACT.DEV_DETAIL} element={<DevDetailPage />} />

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