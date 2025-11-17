import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedRedirectListener from '../components/common/UnauthorizedRedirectListener';

// Layouts
import PublicLayout from '../components/layouts/PublicLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import HrLayout from '../components/layouts/HrLayout';
import SalesLayout from '../components/layouts/SalesLayout';
import ManagerLayout from '../components/layouts/ManagerLayout';
import DeveloperLayout from '../components/layouts/DeveloperLayout';
import AccountantLayout from '../components/layouts/AccountantLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, getDashboardRoute, NOTIFICATION_CENTER_ROUTE } from './routes';

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
import JobRoleLevelCreatePage from '../pages/admin/Categories/job-role-levels/Create';
import JobRoleLevelDetailPage from '../pages/admin/Categories/job-role-levels/Detail';
import JobRoleLevelEditPage from '../pages/admin/Categories/job-role-levels/Edit';
import JobRoleLevelListPage from '../pages/admin/Categories/job-role-levels/List';
import JobRoleCreatePage from '../pages/admin/Categories/job-roles/Create';
import JobRoleDetailPage from '../pages/admin/Categories/job-roles/Detail';
import JobRoleEditPage from '../pages/admin/Categories/job-roles/Edit';
import JobRoleListPage from '../pages/admin/Categories/job-roles/List';
import MarketListPage from '../pages/admin/Categories/markets/List';
import MarketDetailPage from '../pages/admin/Categories/markets/Detail';
import MarketEditPage from '../pages/admin/Categories/markets/Edit';
import MarketCreatePage from '../pages/admin/Categories/markets/Create';
import IndustryListPage from '../pages/admin/Categories/industries/List';
import IndustryDetailPage from '../pages/admin/Categories/industries/Detail';
import IndustryEditPage from '../pages/admin/Categories/industries/Edit';
import IndustryCreatePage from '../pages/admin/Categories/industries/Create';
import CertificateTypeListPage from '../pages/admin/Categories/certificate-types/List';
import CertificateTypeDetailPage from '../pages/admin/Categories/certificate-types/Detail';
import CertificateTypeEditPage from '../pages/admin/Categories/certificate-types/Edit';
import CertificateTypeCreatePage from '../pages/admin/Categories/certificate-types/Create';
import CVTemplateListPage from '../pages/admin/Categories/cv-templates/List';
import CVTemplateDetailPage from '../pages/admin/Categories/cv-templates/Detail';
import CVTemplateEditPage from '../pages/admin/Categories/cv-templates/Edit';
import CVTemplateCreatePage from '../pages/admin/Categories/cv-templates/Create';
import LocationCreatePage from '../pages/admin/Categories/locations/Create';
import LocationDetailPage from '../pages/admin/Categories/locations/Detail';
import LocationEditPage from '../pages/admin/Categories/locations/Edit';
import LocationListPage from '../pages/admin/Categories/locations/List';
import SkillCreatePage from '../pages/admin/Categories/skill/Create';
import SkillDetailPage from '../pages/admin/Categories/skill/Detail';
import SkillEditPage from '../pages/admin/Categories/skill/Edit';
import SkillListPage from '../pages/admin/Categories/skill/List';
import SkillGroupCreatePage from '../pages/admin/Categories/skill-groups/Create';
import SkillGroupDetailPage from '../pages/admin/Categories/skill-groups/Detail';
import SkillGroupEditPage from '../pages/admin/Categories/skill-groups/Edit';
import SkillGroupListPage from '../pages/admin/Categories/skill-groups/List';
import DocumentTypeListPage from '../pages/admin/Categories/document-types/List';
import DocumentTypeCreatePage from '../pages/admin/Categories/document-types/Create';
import DocumentTypeDetailPage from '../pages/admin/Categories/document-types/Detail';
import DocumentTypeEditPage from '../pages/admin/Categories/document-types/Edit';
import NotificationCenterPage from '../pages/common/notifications/List';

// ========================================
// HR STAFF PAGES
// ========================================
import HRDashboard from '../pages/hr_staff/dashboard/Dashboard';
import ListDev from '../pages/hr_staff/talents/List';
import CreateTalent from '../pages/hr_staff/talents/Create';
import MatchingCVPage from '../pages/hr_staff/job-requests/Matching';
import ListPartner from '../pages/hr_staff/partners/List';
import PartnerDetailPage from '../pages/hr_staff/partners/Detail';
import PartnerEditPage from '../pages/hr_staff/partners/Edit';
import CreatePartner from '../pages/hr_staff/partners/Create';
import Assignments from '../pages/hr_staff/assignments';
import ListRequest from '../pages/hr_staff/job-requests/List';
import JobRequestDetailHRPage from '../pages/hr_staff/job-requests/Detail';
import InterviewList from '../pages/hr_staff/interviews/List';
import InterviewHistory from '../pages/hr_staff/interviews/History';
import ScheduleInterview from '../pages/hr_staff/interviews/Schedule';
import ListContract from '../pages/hr_staff/contracts/List';
import ContractDetailPageHR from '../pages/hr_staff/contracts/Detail';
import CreatePartnerContractPage from '../pages/hr_staff/contracts/Create';
import EditPartnerContractPage from '../pages/hr_staff/contracts/Edit';
import HRPartnerPeriods from '../pages/hr_staff/payment-periods/PartnerPeriods';

// ========================================
// SALES STAFF PAGES
// ========================================
import SalesStaffDashboard from '../pages/sales_staff/Dashboard';
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
import SalesClientPeriods from '../pages/sales_staff/payment-periods/ClientPeriods';
import SalesApplicationListPage from '../pages/sales_staff/applications/List';
import SalesApplicationDetailPage from '../pages/sales_staff/applications/Detail';
import SalesApplyProcessTemplateListPage from '../pages/sales_staff/apply-process-templates/List';
import SalesApplyProcessTemplateDetailPage from '../pages/sales_staff/apply-process-templates/Detail';
import SalesApplyProcessTemplateCreatePage from '../pages/sales_staff/apply-process-templates/Create';
import SalesApplyProcessTemplateEditPage from '../pages/sales_staff/apply-process-templates/Edit';
import SalesApplyProcessStepListPage from '../pages/sales_staff/apply-process-steps/List';
import SalesApplyProcessStepDetailPage from '../pages/sales_staff/apply-process-steps/Detail';
import SalesApplyProcessStepCreatePage from '../pages/sales_staff/apply-process-steps/Create';
import SalesApplyProcessStepEditPage from '../pages/sales_staff/apply-process-steps/Edit';

// ========================================
// ACCOUNTANT STAFF PAGES
// ========================================
import AccountantDashboard from '../pages/accountant_staff/Dashboard';
import AccountantClientPeriods from '../pages/accountant_staff/payment-periods/ClientPeriods';
import AccountantPartnerPeriods from '../pages/accountant_staff/payment-periods/PartnerPeriods';
import AccountantDocumentsList from '../pages/accountant_staff/documents/List';
import AccountantClientContractDetail from '../pages/accountant_staff/contracts/Detail';
import AccountantPartnerContractDetail from '../pages/accountant_staff/contracts/PartnerDetail';

// ========================================
// DEVELOPER PAGES
// ========================================
import DeveloperDashboard from '../pages/developer/Dashboard';

// ========================================
// MANAGER PAGES
// ========================================
import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import ClientContracts from '../pages/manager/contract/clients/List';
import ClientDetailPage from '../pages/manager/contract/clients/Detail';
import DevContracts from '../pages/manager/contract/devs/List';
import DevDetailPage from '../pages/manager/contract/devs/Detail';
import BusinessOverview from '../pages/manager/business/Overview';
import Revenue from '../pages/manager/business/Revenue';
import ManagerClientPeriods from '../pages/manager/payment-periods/ClientPeriods';
import ManagerPartnerPeriods from '../pages/manager/payment-periods/PartnerPeriods';
import HROverview from '../pages/manager/hr/Overview';
import HRPerformance from '../pages/manager/hr/Performance';
import HRDevelopers from '../pages/manager/hr/Dev';
import Utilization from '../pages/manager/hr/Utilization';
import Overview from '../pages/manager/finance/Overview';
import CashFlow from '../pages/manager/finance/Cashflow';
import Debt from '../pages/manager/finance/Debt';
import Profit from '../pages/manager/finance/Profit';
import DeveloperStatus from '../pages/hr_staff/reports/Developer_status';
import InterviewSuccess from '../pages/hr_staff/reports/Interview_success';
import ContractDetailPage from '../pages/sales_staff/contracts/Detail';
import ListClientContracts from '../pages/sales_staff/contracts/List';
import CreateClientContractPage from '../pages/sales_staff/contracts/Create';
import EditClientContractPage from '../pages/sales_staff/contracts/Edit';
import TalentDetailPage from '../pages/hr_staff/talents/Detail';
import TalentEditPage from '../pages/hr_staff/talents/Edit';
import TalentSkillCreatePage from '../pages/hr_staff/talent-skills/Create';
import TalentSkillEditPage from '../pages/hr_staff/talent-skills/Edit';
import TalentProjectCreatePage from '../pages/hr_staff/talent-projects/Create';
import TalentProjectEditPage from '../pages/hr_staff/talent-projects/Edit';
import TalentWorkExperienceCreatePage from '../pages/hr_staff/talent-work-experiences/Create';
import TalentCertificateCreatePage from '../pages/hr_staff/talent-certificates/Create';
import TalentAvailableTimeCreatePage from '../pages/hr_staff/talent-available-times/Create';
import TalentCVCreatePage from '../pages/hr_staff/talent-cvs/Create';
import TalentCVEditPage from '../pages/hr_staff/talent-cvs/Edit';
import TalentJobRoleLevelCreatePage from '../pages/hr_staff/talent-job-role-levels/Create';
import TalentJobRoleLevelEditPage from '../pages/hr_staff/talent-job-role-levels/Edit';
import TalentCertificateEditPage from '../pages/hr_staff/talent-certificates/Edit';
import TalentAvailableTimeEditPage from '../pages/hr_staff/talent-available-times/Edit';
import TalentWorkExperienceEditPage from '../pages/hr_staff/talent-work-experiences/Edit';
import TalentCVApplicationDetailPage from '../pages/hr_staff/applications/Detail';
import TalentCVApplicationPage from '../pages/hr_staff/applications/List';
import ApplyActivityCreatePage from '../pages/hr_staff/apply-activities/Create';
import ApplyActivityDetailPage from '../pages/hr_staff/apply-activities/Detail';
import ApplyActivityEditPage from '../pages/hr_staff/apply-activities/Edit';


const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <UnauthorizedRedirectListener />
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

        {/* Thông báo chung cho tất cả vai trò */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path={NOTIFICATION_CENTER_ROUTE} element={<NotificationCenterPage />} />
        </Route>
      </Route>

      {/* ======================================== */}
      {/* HR STAFF ROUTES (với HrLayout) */}
      {/* ======================================== */}
      <Route element={<HrLayout />}>
          <Route element={<ProtectedRoute requiredRole="Staff HR"><Outlet /></ProtectedRoute>}>
            <Route path={ROUTES.HR_STAFF.DASHBOARD} element={<HRDashboard />} />
            
            {/* Developers */}
            <Route path={ROUTES.HR_STAFF.DEVELOPERS.LIST} element={<ListDev />} />
            <Route path={ROUTES.HR_STAFF.DEVELOPERS.DETAIL} element={<TalentDetailPage />} />
            <Route path={ROUTES.HR_STAFF.DEVELOPERS.EDIT} element={<TalentEditPage />} />
            <Route path={ROUTES.HR_STAFF.DEVELOPERS.CREATE} element={<CreateTalent />} />
            
            {/* Talent Available Times */}
            <Route path={ROUTES.HR_STAFF.TALENT_AVAILABLE_TIMES.EDIT} element={<TalentAvailableTimeEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_AVAILABLE_TIMES.CREATE} element={<TalentAvailableTimeCreatePage />} />
            
            {/* Talent Certificates */}
            <Route path={ROUTES.HR_STAFF.TALENT_CERTIFICATES.EDIT} element={<TalentCertificateEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_CERTIFICATES.CREATE} element={<TalentCertificateCreatePage />} />
            
            {/* Talent CVs */}
            <Route path={ROUTES.HR_STAFF.TALENT_CVS.EDIT} element={<TalentCVEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_CVS.CREATE} element={<TalentCVCreatePage />} />
            
            {/* Talent Job Role Levels */}
            <Route path={ROUTES.HR_STAFF.TALENT_JOB_ROLE_LEVELS.EDIT} element={<TalentJobRoleLevelEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_JOB_ROLE_LEVELS.CREATE} element={<TalentJobRoleLevelCreatePage />} />
            
            {/* Talent Projects */}
            <Route path={ROUTES.HR_STAFF.TALENT_PROJECTS.EDIT} element={<TalentProjectEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_PROJECTS.CREATE} element={<TalentProjectCreatePage />} />

            {/* Talent Skills */}
            <Route path={ROUTES.HR_STAFF.TALENT_SKILLS.EDIT} element={<TalentSkillEditPage />} />
            <Route path={ROUTES.HR_STAFF.TALENT_SKILLS.CREATE} element={<TalentSkillCreatePage />} />
                            
            {/* Talent Work Experiences */}
            <Route path={ROUTES.HR_STAFF.TALENT_WORK_EXPERIENCES.CREATE} element={<TalentWorkExperienceCreatePage />} />  
            <Route path={ROUTES.HR_STAFF.TALENT_WORK_EXPERIENCES.EDIT} element={<TalentWorkExperienceEditPage />} />
  
            {/* Partners */}
            <Route path={ROUTES.HR_STAFF.PARTNERS.LIST} element={<ListPartner />} />
            <Route path={ROUTES.HR_STAFF.PARTNERS.DETAIL} element={<PartnerDetailPage />} />
            <Route path={ROUTES.HR_STAFF.PARTNERS.EDIT} element={<PartnerEditPage />} />
            <Route path={ROUTES.HR_STAFF.PARTNERS.CREATE} element={<CreatePartner />} />
            
            {/* Assignments */}
            <Route path={ROUTES.HR_STAFF.ASSIGNMENTS} element={<Assignments />} />
            
            {/* Job Requests */}
            <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.LIST} element={<ListRequest />} />
            <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailHRPage />} />
            <Route path={ROUTES.HR_STAFF.JOB_REQUESTS.MATCHING} element={<MatchingCVPage />} />
            
            {/* Applications */}
            <Route path={ROUTES.HR_STAFF.APPLICATIONS.LIST} element={<TalentCVApplicationPage />} />
            <Route path={ROUTES.HR_STAFF.APPLICATIONS.DETAIL} element={<TalentCVApplicationDetailPage />} />

            {/* Apply Activities */}
            <Route path={ROUTES.HR_STAFF.APPLY_ACTIVITIES.DETAIL} element={<ApplyActivityDetailPage />} />
            <Route path={ROUTES.HR_STAFF.APPLY_ACTIVITIES.EDIT} element={<ApplyActivityEditPage />} />
            <Route path={ROUTES.HR_STAFF.APPLY_ACTIVITIES.CREATE} element={<ApplyActivityCreatePage />} />

            {/* Interviews */}
            <Route path={ROUTES.HR_STAFF.INTERVIEWS.LIST} element={<InterviewList />} />
            <Route path={ROUTES.HR_STAFF.INTERVIEWS.SCHEDULE} element={<ScheduleInterview />} />
            <Route path={ROUTES.HR_STAFF.INTERVIEWS.HISTORY} element={<InterviewHistory />} />
            
            {/* Contracts */}
            <Route path={ROUTES.HR_STAFF.CONTRACTS.LIST} element={<ListContract />} />
            <Route path={ROUTES.HR_STAFF.CONTRACTS.DETAIL} element={<ContractDetailPageHR />} />
            <Route path={ROUTES.HR_STAFF.CONTRACTS.CREATE} element={<CreatePartnerContractPage />} />
            <Route path={ROUTES.HR_STAFF.CONTRACTS.EDIT} element={<EditPartnerContractPage />} />

            {/* Payment Periods - Partner */}
            <Route path="/hr/payment-periods/partners" element={<HRPartnerPeriods />} />
            
            {/* Reports */}
            <Route path={ROUTES.HR_STAFF.REPORTS.INTERVIEW_SUCCESS} element={<InterviewSuccess />} />
            <Route path={ROUTES.HR_STAFF.REPORTS.DEVELOPER_STATUS} element={<DeveloperStatus />} />
          </Route>
        </Route>

        {/* ======================================== */}
        {/* SALES STAFF ROUTES (với SalesLayout) */}
        {/* ======================================== */}
        <Route element={<SalesLayout />}>
          <Route element={<ProtectedRoute requiredRole="Staff Sales"><Outlet /></ProtectedRoute>}>
            <Route path={ROUTES.SALES_STAFF.DASHBOARD} element={<SalesStaffDashboard />} />
            
            {/* Contracts */}
            <Route path={ROUTES.SALES_STAFF.CONTRACTS.LIST} element={<ListClientContracts />} />
            <Route path={ROUTES.SALES_STAFF.CONTRACTS.DETAIL} element={<ContractDetailPage />} />
            <Route path={ROUTES.SALES_STAFF.CONTRACTS.CREATE} element={<CreateClientContractPage />} />
            <Route path={ROUTES.SALES_STAFF.CONTRACTS.EDIT} element={<EditClientContractPage />} />

            {/* Payment Periods - Client */}
            <Route path="/sales/payment-periods/clients" element={<SalesClientPeriods />} />
            
            {/* Job Requests */}
            <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.LIST} element={<JobRequestListPage />} />
            <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.DETAIL} element={<JobRequestDetailPage />} />
            <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.EDIT} element={<JobRequestEditPage />} />
            <Route path={ROUTES.SALES_STAFF.JOB_REQUESTS.CREATE} element={<JobRequestCreatePage />} />

            {/* Apply Process Templates */}
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_TEMPLATES.LIST} element={<SalesApplyProcessTemplateListPage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_TEMPLATES.DETAIL} element={<SalesApplyProcessTemplateDetailPage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_TEMPLATES.CREATE} element={<SalesApplyProcessTemplateCreatePage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_TEMPLATES.EDIT} element={<SalesApplyProcessTemplateEditPage />} />

            {/* Apply Process Steps */}
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_STEPS.LIST} element={<SalesApplyProcessStepListPage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_STEPS.DETAIL} element={<SalesApplyProcessStepDetailPage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_STEPS.CREATE} element={<SalesApplyProcessStepCreatePage />} />
            <Route path={ROUTES.SALES_STAFF.APPLY_PROCESS_STEPS.EDIT} element={<SalesApplyProcessStepEditPage />} />

            {/* Applications */}
            <Route path={ROUTES.SALES_STAFF.APPLICATIONS.LIST} element={<SalesApplicationListPage />} />
            <Route path={ROUTES.SALES_STAFF.APPLICATIONS.DETAIL} element={<SalesApplicationDetailPage />} />
            
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
        </Route>

        {/* ======================================== */}
        {/* ACCOUNTANT STAFF ROUTES (với AccountantLayout) */}
        {/* ======================================== */}
        <Route element={<AccountantLayout />}>
          <Route element={<ProtectedRoute requiredRole="Staff Accountant"><Outlet /></ProtectedRoute>}>
            <Route path={ROUTES.ACCOUNTANT_STAFF.DASHBOARD} element={<AccountantDashboard />} />
            <Route path="/accountant/payment-periods/clients" element={<AccountantClientPeriods />} />
            <Route path="/accountant/payment-periods/partners" element={<AccountantPartnerPeriods />} />
            <Route path="/accountant/documents" element={<AccountantDocumentsList />} />
            <Route path="/accountant/contracts/clients/:id" element={<AccountantClientContractDetail />} />
            <Route path="/accountant/contracts/partners/:id" element={<AccountantPartnerContractDetail />} />
          </Route>
        </Route>

        {/* ======================================== */}
        {/* DEVELOPER ROUTES (với DeveloperLayout) */}
        {/* ======================================== */}
        <Route element={<DeveloperLayout />}>
          <Route element={<ProtectedRoute requiredRole="Developer"><Outlet /></ProtectedRoute>}>
            <Route path={ROUTES.DEVELOPER.DASHBOARD} element={<DeveloperDashboard />} />
          </Route>
        </Route>

        {/* ======================================== */}
        {/* MANAGER ROUTES (với ManagerLayout) */}
        {/* ======================================== */}
        <Route element={<ManagerLayout />}>
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
            
            {/* Payment Periods */}
            <Route path="/manager/payment-periods/clients" element={<ManagerClientPeriods />} />
            <Route path="/manager/payment-periods/partners" element={<ManagerPartnerPeriods />} />
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
          
          {/* Certificate Types */}
          <Route path={ROUTES.ADMIN.CATEGORIES.CERTIFICATE_TYPES.LIST} element={<CertificateTypeListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CERTIFICATE_TYPES.DETAIL} element={<CertificateTypeDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CERTIFICATE_TYPES.EDIT} element={<CertificateTypeEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CERTIFICATE_TYPES.CREATE} element={<CertificateTypeCreatePage />} />
          
          {/* CV Templates */}
          <Route path={ROUTES.ADMIN.CATEGORIES.CV_TEMPLATES.LIST} element={<CVTemplateListPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CV_TEMPLATES.DETAIL} element={<CVTemplateDetailPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CV_TEMPLATES.EDIT} element={<CVTemplateEditPage />} />
          <Route path={ROUTES.ADMIN.CATEGORIES.CV_TEMPLATES.CREATE} element={<CVTemplateCreatePage />} />
 
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

          {/* Document Types */}
          <Route path="/admin/categories/document-types" element={<DocumentTypeListPage />} />
          <Route path="/admin/categories/document-types/create" element={<DocumentTypeCreatePage />} />
          <Route path="/admin/categories/document-types/edit/:id" element={<DocumentTypeEditPage />} />
          <Route path="/admin/categories/document-types/:id" element={<DocumentTypeDetailPage />} />
       
        </Route>
      </Route>

      {/* ======================================== */}
      {/* CATCH ALL ROUTE */}
      {/* ======================================== */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;