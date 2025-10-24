import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../components/layouts/PublicLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, getDashboardRoute } from './routes';

// ========================================
// PUBLIC PAGES (Client)
// ========================================
import HomePage from '../pages/client/home-page';
import ProfessionalPage from '../pages/client/professional-page';
import AboutPage from '../pages/client/about-page';
import ContactPage from '../pages/client/contact-page';
import Auth from '../pages/client/auth-page';

// ========================================
// ADMIN PAGES
// ========================================
import AdminDashboard from '../pages/admin/Dashboard/AdminDashboard';
import CreateAccount from '../pages/admin/Users/Create';
import UserManagementPage from '../pages/admin/Users/List';
import JobRoleLevelCreatePage from '../pages/admin/Categories/jobRoleLevels/Create';
import JobRoleLevelDetailPage from '../pages/admin/Categories/jobRoleLevels/Detail';
import JobRoleLevelEditPage from '../pages/admin/Categories/jobRoleLevels/Edit';
import JobRoleLevelListPage from '../pages/admin/Categories/jobRoleLevels/List';
import JobRoleCreatePage from '../pages/admin/Categories/jobRoles/Create';
import JobRoleDetailPage from '../pages/admin/Categories/jobRoles/Detail';
import JobRoleEditPage from '../pages/admin/Categories/jobRoles/Edit';
import JobRoleListPage from '../pages/admin/Categories/jobRoles/List';
import MarketListPage from '../pages/admin/Categories/markets/List';
import MarketDetailPage from '../pages/admin/Categories/markets/Detail';
import MarketEditPage from '../pages/admin/Categories/markets/Edit';
import MarketCreatePage from '../pages/admin/Categories/markets/Create';
import IndustryListPage from '../pages/admin/Categories/industries/List';
import IndustryDetailPage from '../pages/admin/Categories/industries/Detail';
import IndustryEditPage from '../pages/admin/Categories/industries/Edit';
import IndustryCreatePage from '../pages/admin/Categories/industries/Create';
import LocationCreatePage from '../pages/admin/Categories/locations/Create';
import LocationDetailPage from '../pages/admin/Categories/locations/Detail';
import LocationEditPage from '../pages/admin/Categories/locations/Edit';
import LocationListPage from '../pages/admin/Categories/locations/List';
import SkillCreatePage from '../pages/admin/Categories/skill/Create';
import SkillDetailPage from '../pages/admin/Categories/skill/Detail';
import SkillEditPage from '../pages/admin/Categories/skill/Edit';
import SkillListPage from '../pages/admin/Categories/skill/List';
import SkillGroupCreatePage from '../pages/admin/Categories/skillGroups/Create';
import SkillGroupDetailPage from '../pages/admin/Categories/skillGroups/Detail';
import SkillGroupEditPage from '../pages/admin/Categories/skillGroups/Edit';
import SkillGroupListPage from '../pages/admin/Categories/skillGroups/List';
import WorkingStyleCreatePage from '../pages/admin/Categories/workingStyles.tsx/Create';
import WorkingStyleDetailPage from '../pages/admin/Categories/workingStyles.tsx/Detail';
import WorkingStyleEditPage from '../pages/admin/Categories/workingStyles.tsx/Edit';
import WorkingStyleListPage from '../pages/admin/Categories/workingStyles.tsx/List';

// ========================================
// HR STAFF PAGES
// ========================================
import HRDashboard from '../pages/hr_staff/dashboard/Dashboard';
import ListDev from '../pages/hr_staff/developers/List';
import CreateTalent from '../pages/hr_staff/developers/Create';
import ListCV from '../pages/hr_staff/cvs/List';
import TalentCVDetail from '../pages/hr_staff/cvs/Detail';
import CreateTalentCV from '../pages/hr_staff/cvs/Upload';
import MatchingCVPage from '../pages/hr_staff/cvs/Matching';
import ListPartner from '../pages/hr_staff/partners/List';
import CreatePartner from '../pages/hr_staff/partners/Create';
import Assignments from '../pages/hr_staff/assignments';
import ListRequest from '../pages/hr_staff/job-requests/List';
import JobRequestDetailHRPage from '../pages/hr_staff/job-requests/Detail';
import InterviewList from '../pages/hr_staff/interviews/List';
import InterviewHistory from '../pages/hr_staff/interviews/History';
import ScheduleInterview from '../pages/hr_staff/interviews/Schedule';
import ListContract from '../pages/hr_staff/contracts/List';
import UploadContract from '../pages/hr_staff/contracts/Upload';
import InterviewSuccess from '../pages/hr_staff/reports/Interview_success';
import DeveloperStatus from '../pages/hr_staff/reports/Developer_status';

// ========================================
// SALES STAFF PAGES
// ========================================
import SalesStaffDashboard from '../pages/sales_staff/Dashboard';
import ListClientContracts from '../pages/sales_staff/contracts/List';
import ContractDetailPage from '../pages/sales_staff/contracts/Detail';
import UploadSignedContract from '../pages/sales_staff/contracts/Upload';
import JobRequestListPage from '../pages/sales_staff/job-requests/List';
import JobRequestDetailPage from '../pages/sales_staff/job-requests/Detail';
import JobRequestEditPage from '../pages/sales_staff/job-requests/Edit';
import JobRequestCreatePage from '../pages/sales_staff/job-requests/Create';
import ClientCompanyListPage from '../pages/sales_staff/client-companies/List';
import ClientCompanyDetailPage from '../pages/sales_staff/client-companies/Detail';
import ClientCompanyEditPage from '../pages/sales_staff/client-companies/Edit';
import ClientCompanyCreatePage from '../pages/sales_staff/client-companies/Create';
import ProjectListPage from '../pages/sales_staff/projects/List';
import ProjectDetailPage from '../pages/sales_staff/projects/Detail';
import ProjectEditPage from '../pages/sales_staff/projects/Edit';
import ProjectCreatePage from '../pages/sales_staff/projects/Create';

// ========================================
// ACCOUNTANT STAFF PAGES
// ========================================
import AccountantDashboard from '../pages/accountant_staff/Dashboard';

// ========================================
// DEVELOPER PAGES
// ========================================
import DeveloperDashboard from '../pages/developer/Dashboard';

// ========================================
// MANAGER PAGES
// ========================================
import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import ClientContracts from '../pages/manager/contract/Clients/List';
import ClientDetailPage from '../pages/manager/contract/Clients/Detail';
import DevContracts from '../pages/manager/contract/Devs/List';
import DevDetailPage from '../pages/manager/contract/Devs/Detail';
import BusinessOverview from '../pages/manager/business/Overview';
import Revenue from '../pages/manager/business/Revenue';
import HROverview from '../pages/manager/hr/Overview';
import HRPerformance from '../pages/manager/hr/Performance';
import HRDevelopers from '../pages/manager/hr/Dev';
import Utilization from '../pages/manager/hr/Utilization';
import Overview from '../pages/manager/finance/Overview';
import CashFlow from '../pages/manager/finance/Cashflow';
import Debt from '../pages/manager/finance/Debt';
import Profit from '../pages/manager/finance/Profit';



const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ======================================== */}
      {/* PUBLIC ROUTES (với PublicLayout) */}
      {/* ======================================== */}
      <Route element={<PublicLayout />}>
        {/* Guest Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.PROFESSIONALS} element={<ProfessionalPage />} />
        <Route path={ROUTES.GUEST.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.GUEST.CONTACT} element={<ContactPage />} />
        
        {/* Auth Routes */}
        <Route 
          path={ROUTES.LOGIN} 
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />} 
        />
        <Route 
          path={ROUTES.REGISTER} 
          element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Auth />} 
        />

        {/* ======================================== */}
        {/* HR STAFF ROUTES */}
        {/* ======================================== */}
        <Route element={<ProtectedRoute requiredRole="Staff HR"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.HR_STAFF.DASHBOARD} element={<HRDashboard />} />
          
          {/* Developers */}
          <Route path={ROUTES.HR_STAFF.DEVELOPERS.LIST} element={<ListDev />} />
          <Route path={ROUTES.HR_STAFF.DEVELOPERS.CREATE} element={<CreateTalent />} />
          
          {/* CVs */}
          <Route path={ROUTES.HR_STAFF.CVS.LIST} element={<ListCV />} />
          <Route path={ROUTES.HR_STAFF.CVS.DETAIL} element={<TalentCVDetail />} />
          <Route path={ROUTES.HR_STAFF.CVS.UPLOAD} element={<CreateTalentCV />} />
          <Route path={ROUTES.HR_STAFF.CVS.MATCHING} element={<MatchingCVPage />} />
          
          {/* Partners */}
          <Route path={ROUTES.HR_STAFF.PARTNERS.LIST} element={<ListPartner />} />
          <Route path={ROUTES.HR_STAFF.PARTNERS.CREATE} element={<CreatePartner />} />
          
          {/* Assignments */}
          <Route path={ROUTES.HR_STAFF.ASSIGNMENTS} element={<Assignments />} />
          
          {/* Job Requests */}
          <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.LIST} element={<ListRequest />} />
          <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailHRPage />} />
          
          {/* Interviews */}
          <Route path={ROUTES.HR_STAFF.INTERVIEWS.LIST} element={<InterviewList />} />
          <Route path={ROUTES.HR_STAFF.INTERVIEWS.SCHEDULE} element={<ScheduleInterview />} />
          <Route path={ROUTES.HR_STAFF.INTERVIEWS.HISTORY} element={<InterviewHistory />} />
          
          {/* Contracts */}
          <Route path={ROUTES.HR_STAFF.CONTRACTS.LIST} element={<ListContract />} />
          <Route path={ROUTES.HR_STAFF.CONTRACTS.UPLOAD} element={<UploadContract />} />
          
          {/* Reports */}
          <Route path={ROUTES.HR_STAFF.REPORTS.INTERVIEW_SUCCESS} element={<InterviewSuccess />} />
          <Route path={ROUTES.HR_STAFF.REPORTS.DEVELOPER_STATUS} element={<DeveloperStatus />} />
        </Route>

        {/* ======================================== */}
        {/* SALES STAFF ROUTES */}
        {/* ======================================== */}
        <Route element={<ProtectedRoute requiredRole="Staff Sales"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.SALES_STAFF.DASHBOARD} element={<SalesStaffDashboard />} />
          
          {/* Contracts */}
          <Route path={ROUTES.SALES_STAFF.CONTRACTS.LIST} element={<ListClientContracts />} />
          <Route path={ROUTES.SALES_STAFF.CONTRACTS.DETAIL} element={<ContractDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.CONTRACTS.UPLOAD} element={<UploadSignedContract />} />
          
          {/* Job Requests */}
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.LIST} element={<JobRequestListPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.EDIT} element={<JobRequestEditPage />} />
          <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.CREATE} element={<JobRequestCreatePage />} />
          
          {/* Clients */}
          <Route path={ROUTES.SALES_STAFF.CLIENTS.LIST} element={<ClientCompanyListPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.DETAIL} element={<ClientCompanyDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.EDIT} element={<ClientCompanyEditPage />} />
          <Route path={ROUTES.SALES_STAFF.CLIENTS.CREATE} element={<ClientCompanyCreatePage />} />
          
          {/* Projects */}
          <Route path={ROUTES.SALES_STAFF.PROJECTS.LIST} element={<ProjectListPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.EDIT} element={<ProjectEditPage />} />
          <Route path={ROUTES.SALES_STAFF.PROJECTS.CREATE} element={<ProjectCreatePage />} />
                 
        </Route>

        {/* ======================================== */}
        {/* ACCOUNTANT STAFF ROUTES */}
        {/* ======================================== */}
        <Route element={<ProtectedRoute requiredRole="Staff Accountant"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.ACCOUNTANT_STAFF.DASHBOARD} element={<AccountantDashboard />} />
        </Route>

        {/* ======================================== */}
        {/* DEVELOPER ROUTES */}
        {/* ======================================== */}
        <Route element={<ProtectedRoute requiredRole="Developer"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.DEVELOPER.DASHBOARD} element={<DeveloperDashboard />} />
        </Route>

        {/* ======================================== */}
        {/* MANAGER ROUTES */}
        {/* ======================================== */}
        <Route element={<ProtectedRoute requiredRole="Manager"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.MANAGER.DASHBOARD} element={<ManagerDashboard />} />
          
          {/* Contracts */}
          <Route path={ROUTES.MANAGER.CONTRACT.CLIENTS} element={<ClientContracts />} />
          <Route path={ROUTES.MANAGER.CONTRACT.CLIENT_DETAIL} element={<ClientDetailPage />} />
          <Route path={ROUTES.MANAGER.CONTRACT.DEVS} element={<DevContracts />} />
          <Route path={ROUTES.MANAGER.CONTRACT.DEV_DETAIL} element={<DevDetailPage />} />
          
          {/* Business */}
          <Route path={ROUTES.MANAGER.BUSINESS.OVERVIEW} element={<BusinessOverview />} />
          <Route path={ROUTES.MANAGER.BUSINESS.REVENUE} element={<Revenue />} />
          
          {/* Human Resources */}
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.OVERVIEW} element={<HROverview />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.PERFORMANCE} element={<HRPerformance />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.DEVELOPERS} element={<HRDevelopers />} />
          <Route path={ROUTES.MANAGER.HUMAN_RESOURCES.UTILIZATION} element={<Utilization />} />
          
          {/* Finance */}
          <Route path={ROUTES.MANAGER.FINANCE.OVERVIEW} element={<Overview />} />
          <Route path={ROUTES.MANAGER.FINANCE.CASHFLOW} element={<CashFlow />} />
          <Route path={ROUTES.MANAGER.FINANCE.DEBT} element={<Debt />} />
          <Route path={ROUTES.MANAGER.FINANCE.PROFIT} element={<Profit />} />
        </Route>
      </Route>

      {/* ======================================== */}
      {/* ADMIN ROUTES (với AdminLayout) */}
      {/* ======================================== */}
      <Route element={<AdminLayout />}>
        <Route element={<ProtectedRoute requiredRole="Admin"><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
          
          {/* Users */}
          <Route path={ROUTES.ADMIN.USERS.LIST} element={<UserManagementPage />} />
          <Route path={ROUTES.ADMIN.USERS.CREATE_ACCOUNT} element={<CreateAccount />} />
          
          {/* Skills */}
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILLS.LIST} element={<SkillListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILLS.DETAIL} element={<SkillDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILLS.EDIT} element={<SkillEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILLS.CREATE} element={<SkillCreatePage />} />
          
          {/* Skill Groups */}
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILL_GROUPS.LIST} element={<SkillGroupListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILL_GROUPS.DETAIL} element={<SkillGroupDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILL_GROUPS.EDIT} element={<SkillGroupEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.SKILL_GROUPS.CREATE} element={<SkillGroupCreatePage />} />
          
          {/* Working Styles */}
          <Route path={ROUTES.ADMIN.CATEGORIES.WORKING_STYLES.LIST} element={<WorkingStyleListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.WORKING_STYLES.DETAIL} element={<WorkingStyleDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.WORKING_STYLES.EDIT} element={<WorkingStyleEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.WORKING_STYLES.CREATE} element={<WorkingStyleCreatePage />} />
          
          {/* Job Role Levels */}
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLE_LEVELS.LIST} element={<JobRoleLevelListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLE_LEVELS.DETAIL} element={<JobRoleLevelDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLE_LEVELS.EDIT} element={<JobRoleLevelEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLE_LEVELS.CREATE} element={<JobRoleLevelCreatePage />} />
          
          {/* Job Roles */}
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLES.LIST} element={<JobRoleListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLES.DETAIL} element={<JobRoleDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLES.EDIT} element={<JobRoleEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.JOB_ROLES.CREATE} element={<JobRoleCreatePage />} />
          
          {/* Locations */}
          <Route path={ROUTES.ADMIN.CATEGORIES.LOCATIONS.LIST} element={<LocationListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.LOCATIONS.DETAIL} element={<LocationDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.LOCATIONS.EDIT} element={<LocationEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.LOCATIONS.CREATE} element={<LocationCreatePage />} />
          
          {/* Markets */}
          <Route path={ROUTES.ADMIN.CATEGORIES.MARKETS.LIST} element={<MarketListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.MARKETS.DETAIL} element={<MarketDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.MARKETS.EDIT} element={<MarketEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.MARKETS.CREATE} element={<MarketCreatePage />} />
          
          {/* Industries */}
          <Route path={ROUTES.ADMIN.CATEGORIES.INDUSTRIES.LIST} element={<IndustryListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.INDUSTRIES.DETAIL} element={<IndustryDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.INDUSTRIES.EDIT} element={<IndustryEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.INDUSTRIES.CREATE} element={<IndustryCreatePage />} />
       
        </Route>
      </Route>

      {/* ======================================== */}
      {/* CATCH ALL ROUTE */}
      {/* ======================================== */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRouter;