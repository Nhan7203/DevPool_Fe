export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COMPANIES: '/companies',
  COMPANY_DETAIL_PATH: "/companies/:id",
  PROFESSIONALS: '/professionals',
  PROJECTS: '/projects',

  PROJECT_DETAIL: (id: string | number) => `/projects/${id}`,
  PROFESSIONAL_DETAIL: (id: string | number) => `/professionals/${id}`,

  COMPANY_DETAIL: (id: string | number) => `/companies/${id}`,

  // =======================================
  // GUEST - Khách vãng lai (chưa đăng nhập)
  // =======================================
  GUEST: {
    HOME: '/',                                       // Trang chủ
    ABOUT: '/about',                                 // Giới thiệu
    SERVICES: '/services',                           // Dịch vụ
    CONTACT: '/contact',                             // Liên hệ
    DEVELOPERS: '/developers',                       // Xem danh sách dev (public)
    LOGIN: '/login',                                 // Đăng nhập
  },

  // =======================================
  // HR_STAFF - Nhân viên hành chính nhân sự
  // =======================================
  HR_STAFF: {
    DASHBOARD: '/hr/dashboard',

    // Talent & nguồn cung
    DEVELOPERS: {
      LIST: '/hr/developers',                    // Danh sách tất cả developers
      MANAGE_CV: '/hr/developers/manage-cv',     // Quản lý CV vào pool
      EDIT: '/hr/developers/:id/edit',           // Sửa thông tin developer
      DETAIL: '/hr/developers/:id',              // Chi tiết developer   
    },
    PARTNERS: {
      LIST: '/hr/partners',
      DETAIL: '/hr/partners/:id',
    },
    ASSIGNMENTS: '/hr/assignments',                // staffTalentAssignments

    // Quản lý Job Request từ công ty
    JOB_REQUESTS: {
      LIST: '/hr/job-requests',                  // Danh sách yêu cầu tuyển dụng
      DETAIL: '/hr/job-requests/:id',            // Chi tiết yêu cầu
      MATCHING: '/hr/job-requests/:id/matching', // Matching CV với yêu cầu
    },

    // Quản lý Phỏng vấn
    INTERVIEWS: {
      LIST: '/hr/interviews',                    // Danh sách phỏng vấn
      SCHEDULE: '/hr/interviews/schedule',       // Sắp xếp lịch phỏng vấn
      RESULT: '/hr/interviews/:id/result',       // Cập nhật kết quả phỏng vấn
      HISTORY: '/hr/interviews/history',         // Lịch sử phỏng vấn
    },

    // Quản lý Hợp đồng 
    CONTRACTS: {
      LIST: '/hr/contracts',                     // Danh sách hợp đồng
      DETAIL: '/hr/contracts/:id',               // Chi tiết hợp đồng
      UPLOAD: '/hr/contracts/upload',        // Upload file hợp đồng
    },

    // WorkReports: HR nhập & upload, submit để duyệt
    WORKREPORTS: {
      LIST: '/hr/workreports',
      CREATE: '/hr/workreports/create',
      DETAIL: '/hr/workreports/:id',
      UPLOAD: '/hr/workreports/:id/upload',
      SUBMIT: '/hr/workreports/:id/submit',
    },

    // Báo cáo
    REPORTS: {
      INTERVIEW_SUCCESS: '/hr/reports/interview-success', // Tỷ lệ PV thành công
      DEVELOPER_STATUS: '/hr/reports/developer-status',   // Trạng thái developers
    }
  },

  // =======================================
  // SALES_STAFF - Nhân viên Kinh doanh/Account
  // (MỚI THÊM – chịu trách nhiệm với KH & tạo JobRequest)
  // =======================================
  SALES_STAFF: {
    DASHBOARD: '/sales/dashboard',

    CLIENTS: {
      LIST: '/sales/clients',
      DETAIL: '/sales/clients/:id',
    },
    PROJECTS: {
      LIST: '/sales/projects',
      DETAIL: '/sales/projects/:id',
    },
    JOB_REQUESTS: {
      LIST: '/sales/job-requests',
      CREATE: '/sales/job-requests/create',
      DETAIL: '/sales/job-requests/:id',
    },
    QUOTES: {
      LIST: '/sales/quotes',
      CREATE: '/sales/quotes/create',
      DETAIL: '/sales/quotes/:id',
    },
    CUSTOMER_CONTRACTS: {
      LIST: '/sales/contracts',
      DETAIL: '/sales/contracts/:id',
      UPLOAD: '/sales/contracts/upload',
    },
    BILLING_OVERVIEW: '/sales/billing',            // read-only tình trạng WR/Invoice
  },

  // ====================================
  // ACCOUNTANT_STAFF - Nhân viên Kế toán
  // ====================================
  ACCOUNTANT_STAFF: {
    DASHBOARD: '/accountant/dashboard',

    // WorkReports đã manager-approve → khóa sổ
    WORKREPORTS: {
      SUBMITTED: '/accountant/workreports/submitted',
      LOCKED: '/accountant/workreports/locked',
      DETAIL: '/accountant/workreports/:id',
    },

    // Quản lý Hóa đơn
    INVOICES: {
      LIST: '/accountant/invoices',                   // Danh sách hóa đơn
      CREATE: '/accountant/invoices/create',          // Tạo hóa đơn
      RECEIVED: '/accountant/invoices/received',      // hóa đơn đầu vào từ dev/đối tác
      ISSUED: '/accountant/invoices/issued',          // Hóa đơn đầu ra (cho client)
      DETAIL: '/accountant/invoices/:id',
    },

    // Quản lý Thanh toán
    PAYMENTS: {
      LIST: '/accountant/payments',                    // Danh sách thanh toán
      PENDING: '/accountant/payments/pending',         // Thanh toán chờ xử lý
      CREATE_REQUEST: '/accountant/payments/request',  // Tạo đề nghị thanh toán
      DETAIL: '/accountant/payments/:id',             // Chi tiết thanh toán
    },

    // Nghiệm thu thanh toán
    ACCEPTANCE: {
      LIST: '/accountant/acceptance',                 // Bảng nghiệm thu
      UPLOAD: '/accountant/acceptance/upload',        // Upload file Excel nghiệm thu
      VERIFY: '/accountant/acceptance/verify',        // Xác nhận nghiệm thu
    },

    // Báo cáo tài chính
    REPORTS: {
      REVENUE: '/accountant/reports/revenue',         // Báo cáo doanh thu
      EXPENSE: '/accountant/reports/expense',         // Báo cáo chi phí
      DEBT: '/accountant/reports/debt',               // Công nợ
      MONTHLY: '/accountant/reports/monthly',         // Báo cáo tháng
    }
  },

  // ==============================================================
  // DEVELOPER - Lập trình viên - có tài khoản sau khi ký hợp đồng
  // ==============================================================
  DEVELOPER: {
    DASHBOARD: '/developer/dashboard',          // Tổng quan

    // Thông tin cá nhân
    PROFILE: '/developer/profile',              // Xem/sửa thông tin cá nhân
    CV: '/developer/cv',                        // submit thay đổi → HR duyệt

    // Hợp đồng
    CONTRACTS: {
      LIST: '/developer/contracts',             // Danh sách hợp đồng của mình
      CURRENT: '/developer/contracts/current',  // Hợp đồng đang thực hiện
      DETAIL: '/developer/contracts/:id',       // Chi tiết hợp đồng
    },

    // Timesheet/WorkReport: chỉ xem
    WORKREPORTS: {
      LIST: '/developer/workreports',
      DETAIL: '/developer/workreports/:id',
    },
  },

  // ==============================================================
  // MANAGER - Quản lý (phê duyệt & báo cáo)
  // ==============================================================
  MANAGER: {
    DASHBOARD: '/manager/dashboard',

    APPROVALS: '/manager/approvals',               // hàng chờ: shortlist, rate, contract, WR
    WORKREPORT_REVIEW: '/manager/workreports',     // duyệt/Reject trước khi kế toán khóa sổ

    BUSINESS: {
      OVERVIEW: '/manager/business/overview',
      REVENUE: '/manager/business/revenue',
      CLIENTS: '/manager/business/clients',
      PROJECTS: '/manager/business/projects',
      SUCCESS_RATE: '/manager/business/success-rate',
    },
    HUMAN_RESOURCES: {
      OVERVIEW: '/manager/hr/overview',
      DEVELOPERS: '/manager/hr/developers',
      UTILIZATION: '/manager/hr/utilization',
      PERFORMANCE: '/manager/hr/performance',
    },
    FINANCE: {
      OVERVIEW: '/manager/finance/overview',
      CASHFLOW: '/manager/finance/cashflow',
      DEBT: '/manager/finance/debt',
      PROFIT: '/manager/finance/profit',
    },
    ANALYTICS: {
      TRENDS: '/manager/analytics/trends',
      FORECAST: '/manager/analytics/forecast',
      KPI: '/manager/analytics/kpi',
    },
  },


  // =====================================
  // ADMIN - Quản trị hệ thống
  // =====================================
  ADMIN: {
    DASHBOARD: '/admin/dashboard',

    // Quản lý Users
    USERS: {
      LIST: '/admin/users',                          // Danh sách users
      CREATE_ACCOUNT: '/admin/users/create-account', // Tạo tài khoản cho dev đã ký HĐ
      EDIT: '/admin/users/:id/edit',                 // Sửa user
      ROLES: '/admin/users/roles',                   // Quản lý phân quyền
      PERMISSIONS: '/admin/users/permissions',       // Quản lý permissions
    },

    // Quản lý Công ty
    COMPANIES: {
      LIST: '/admin/companies',                      // Danh sách công ty
      CLIENTS: '/admin/companies/clients',           // Công ty khách hàng
      PARTNERS: '/admin/companies/partners',         // Công ty đối tác
      CREATE: '/admin/companies/create',             // Thêm công ty
      EDIT: '/admin/companies/:id/edit',
    },

    // Cấu hình hệ thống
    SETTINGS: {
      GENERAL: '/admin/settings/general',            // Cài đặt chung
      EMAIL: '/admin/settings/email',                // Cấu hình email
      NOTIFICATIONS: '/admin/settings/notifications', // Thông báo
      BACKUP: '/admin/settings/backup',              // Sao lưu
      LOGS: '/admin/settings/logs',                  // System logs  
    },

    // Danh mục
    CATEGORIES: {
      SKILLS: '/admin/categories/skills',            // Danh mục kỹ năng
      SKILL_GROUPS: '/admin/categories/skill-groups', // Nhóm kỹ năng
      POSITIONS: '/admin/categories/positions',      // Danh mục vị trí
      WORKING_STYLES: '/admin/categories/working-styles',
      MARKETS: '/admin/categories/markets',
      INDUSTRIES: '/admin/categories/industries',
      OVERTIME_COEFFICIENTS: '/admin/categories/overtime-coefficients', // Hệ số OT
      NUMBERING: '/admin/categories/numbering',     // Cấu hình số hóa đơn, hợp đồng
    },

    // Quản lý Templates
    TEMPLATES: {
      LIST: '/admin/templates',                      // Danh sách templates
      CONTRACTS: '/admin/templates/contracts',       // Mẫu hợp đồng
      INVOICES: '/admin/templates/invoices',         // Mẫu hóa đơn
      REPORTS: '/admin/templates/reports',           // Mẫu báo cáo
    },

    AUDIT: '/admin/audit',                        // Audit logs
  },


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

} as const;

export type UserRole = 
  | 'Staff HR'
  | 'Staff Accountant'
  | 'Staff Sales'
  | 'Developer'
  | 'Manager'
  | 'Admin';

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'Staff HR':
      return ROUTES.HR_STAFF.DASHBOARD;
    case 'Staff Accountant':
      return ROUTES.ACCOUNTANT_STAFF.DASHBOARD;
    case 'Staff Sales':
      return ROUTES.SALES_STAFF.DASHBOARD;
    case 'Developer':
      return ROUTES.DEVELOPER.DASHBOARD;
    case 'Manager':
      return ROUTES.MANAGER.DASHBOARD;
    case 'Admin':
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
};

export const getRoleBasedRoutes = (role: UserRole) => {
  switch (role) {
    case 'Staff HR':
      return ROUTES.HR_STAFF;
    case 'Manager':
      return ROUTES.MANAGER;
    case 'Admin':
      return ROUTES.ADMIN;
    default:
      return null;
  }
};