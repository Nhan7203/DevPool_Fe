export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COMPANIES: '/companies',
  COMPANY_DETAIL_PATH: "/companies/:id",
  PROFESSIONALS: '/professionals',

  COMPANY_DETAIL: (id: string | number) => `/companies/${id}`,

  COMPANY: {
    DASHBOARD: '/company/dashboard',
    JOBS: '/company/jobs',
    CANDIDATES: '/company/candidates',
    PROFILE: '/company/profile',
    SETTINGS: '/company/settings'
  },
  
  PROFESSIONAL: {
    DASHBOARD: '/professional/dashboard',
    JOBS: '/professional/jobs',
    APPLICATIONS: '/professional/applications',
    PROFILE: '/professional/profile',
    SETTINGS: '/professional/settings'
  },
  
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COMPANIES: '/admin/companies',
    JOBS: '/admin/jobs',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings'
  }
} as const;

export type UserRole = 'company' | 'professional' | 'admin';

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'company':
      return ROUTES.COMPANY.DASHBOARD;
    case 'professional':
      return ROUTES.PROFESSIONAL.DASHBOARD;
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
};

export const getRoleBasedRoutes = (role: UserRole) => {
  switch (role) {
    case 'company':
      return ROUTES.COMPANY;
    case 'professional':
      return ROUTES.PROFESSIONAL;
    case 'admin':
      return ROUTES.ADMIN;
    default:
      return null;
  }
};