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
      DETAIL: '/hr/developers/:id',              // Chi tiết developer   
      EDIT: '/hr/developers/edit/:id',           // Sửa thông tin developer
      CREATE: '/hr/developers/create',

    },
    TALENT_AVAILABLE_TIMES: {
      LIST: '/hr/talent-available-times',
      EDIT: '/hr/talent-available-times/edit/:id',
      CREATE: '/hr/talent-available-times/create',
    },
    TALENT_CERTIFICATES: {
      LIST: '/hr/talent-certificates',
      EDIT: '/hr/talent-certificates/edit/:id',
      CREATE: '/hr/talent-certificates/create',
    },
    TALENT_CVS: {
      LIST: '/hr/talent-cvs',
      EDIT: '/hr/talent-cvs/edit/:id',
      CREATE: '/hr/talent-cvs/create',
    },

    TALENT_JOB_ROLE_LEVELS: {
      LIST: '/hr/talent-job-role-levels',
      EDIT: '/hr/talent-job-role-levels/edit/:id',
      CREATE: '/hr/talent-job-role-levels/create',
    },

    TALENT_PROJECTS: {
      LIST: '/hr/talent-projects',
      EDIT: '/hr/talent-projects/edit/:id',
      CREATE: '/hr/talent-projects/create',
    },
    TALENT_SKILLS: {
      LIST: '/hr/talent-skills',
      EDIT: '/hr/talent-skills/edit/:id',
      CREATE: '/hr/talent-skills/create',
    },
    TALENT_WORK_EXPERIENCES: {
      LIST: '/hr/talent-work-experiences',
      EDIT: '/hr/talent-work-experiences/edit/:id',
      CREATE: '/hr/talent-work-experiences/create',
    },

    JOB_REQUESTS: {
      LIST: '/hr/job-requests',
      DETAIL: '/hr/job-requests/:id',
      MATCHING: '/hr/job-requests/matching-cv', // Matching CV với yêu cầu
    },

    APPLICATIONS: {
      LIST: '/hr/applications',
      DETAIL: '/hr/applications/:id',
    },

    APPLY_ACTIVITIES: {
      LIST: '/hr/apply-activities',
      DETAIL: '/hr/apply-activities/:id',
      EDIT: '/hr/apply-activities/edit/:id',
      CREATE: '/hr/apply-activities/create',
    },

    TEMPLATES: {
      LIST: '/hr/templates',
      CREATE: '/hr/templates/create',
      Assign: '/hr/templates/assgin',
    },

    PARTNERS: {
      LIST: '/hr/partners',
      DETAIL: '/hr/partners/:id',
      EDIT: '/hr/partners/edit/:id',
      CREATE: '/hr/partners/create',
    },
    ASSIGNMENTS: '/hr/assignments',                // staffTalentAssignments

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
      CREATE: '/hr/contracts/create',            // Tạo hợp đồng mới
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

    // Quản lý Hợp đồng 
    CONTRACTS: {
      LIST: '/sales/contracts',                     // Danh sách hợp đồng
      DETAIL: '/sales/contracts/:id',               // Chi tiết hợp đồng
      CREATE: '/sales/contracts/create',        // Tạo hợp đồng mới
    },
    APPLICATIONS: {
      LIST: '/sales/applications',
      DETAIL: '/sales/applications/:id',
    },
    APPLY_PROCESS_TEMPLATES: {
      LIST: '/sales/apply-process-templates',
      DETAIL: '/sales/apply-process-templates/:id',
      EDIT: '/sales/apply-process-templates/edit/:id',
      CREATE: '/sales/apply-process-templates/create',
    },
    APPLY_PROCESS_STEPS: {
      LIST: '/sales/apply-process-steps',
      DETAIL: '/sales/apply-process-steps/:id',
      EDIT: '/sales/apply-process-steps/edit/:id',
      CREATE: '/sales/apply-process-steps/create',
    },
    JOB_REQUESTS: {
      LIST: '/sales/job-requests',
      DETAIL: '/sales/job-requests/:id',
      EDIT: '/sales/job-requests/edit/:id',
      CREATE: '/sales/job-requests/create',
    },
    CLIENTS: {
      LIST: '/sales/clients',
      DETAIL: '/sales/clients/:id',
      EDIT: '/sales/clients/edit/:id',
      CREATE: '/sales/clients/create',
    },
    PROJECTS: {
      LIST: '/sales/projects',
      DETAIL: '/sales/projects/:id',
      EDIT: '/sales/projects/edit/:id',
      CREATE: '/sales/projects/create',
    },
    MARKETS: {
      LIST: '/sales/markets',
      DETAIL: '/sales/markets/:id',
      EDIT: '/sales/markets/edit/:id',
      CREATE: '/sales/markets/create',
    },
    INDUSTRIES: {
      LIST: '/sales/industries',
      DETAIL: '/sales/industries/:id',
      EDIT: '/sales/industries/edit/:id',
      CREATE: '/sales/industries/create',
    },
    JOB_ROLE_LEVELS: {
      LIST: '/sales/job-role-levels',
      DETAIL: '/sales/job-role-levels/:id',
      EDIT: '/sales/job-role-levels/edit/:id',
      CREATE: '/sales/job-role-levels/create',
    },
    JOB_ROLES: {
      LIST: '/sales/job-roles',
      DETAIL: '/sales/job-roles/:id',
      EDIT: '/sales/job-roles/edit/:id',
      CREATE: '/sales/job-roles/create',
    },

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
    CONTRACT: {
      CLIENTS: '/manager/contracts/clients',
      CLIENT_DETAIL: '/manager/contracts/clients/:id',
      DEVS: '/manager/contracts/developers',
      DEV_DETAIL: '/manager/contracts/developers/:id',
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
    },

    // Danh mục
    CATEGORIES: {
      SKILLS: {
        LIST: '/admin/categories/skills',
        DETAIL: '/admin/categories/skills/:id',
        EDIT: '/admin/categories/skills/edit/:id',
        CREATE: '/admin/categories/skills/create',
      },
      SKILL_GROUPS: {
        LIST: '/admin/categories/skill-groups',
        DETAIL: '/admin/categories/skill-groups/:id',
        EDIT: '/admin/categories/skill-groups/edit/:id',
        CREATE: '/admin/categories/skill-groups/create',
      },
      CERTIFICATE_TYPES: {
        LIST: '/admin/categories/certificate-types',
        DETAIL: '/admin/categories/certificate-types/:id',
        EDIT: '/admin/categories/certificate-types/edit/:id',
        CREATE: '/admin/categories/certificate-types/create',
      },
      CV_TEMPLATES: {
        LIST: '/admin/categories/cv-templates',
        DETAIL: '/admin/categories/cv-templates/:id',
        EDIT: '/admin/categories/cv-templates/edit/:id',
        CREATE: '/admin/categories/cv-templates/create',
      },
      JOB_ROLE_LEVELS: {
        LIST: '/admin/categories/job-role-levels',
        DETAIL: '/admin/categories/job-role-levels/:id',
        EDIT: '/admin/categories/job-role-levels/edit/:id',
        CREATE: '/admin/categories/job-role-levels/create',
      },
      JOB_ROLES: {
        LIST: '/admin/categories/job-roles',
        DETAIL: '/admin/categories/job-roles/:id',
        EDIT: '/admin/categories/job-roles/edit/:id',
        CREATE: '/admin/categories/job-roles/create',
      },
      LOCATIONS: {
        LIST: '/admin/categories/locations',
        DETAIL: '/admin/categories/locations/:id',
        EDIT: '/admin/categories/locations/edit/:id',
        CREATE: '/admin/categories/locations/create',
      },
      WORKING_STYLES: {
        LIST: '/admin/categories/working-styles',
        DETAIL: '/admin/categories/working-styles/:id',
        EDIT: '/admin/categories/working-styles/edit/:id',
        CREATE: '/admin/categories/working-styles/create',
      },
      MARKETS: {
        LIST: '/admin/categories/markets',
        DETAIL: '/admin/categories/markets/:id',
        EDIT: '/admin/categories/markets/edit/:id',
        CREATE: '/admin/categories/markets/create',
      },
      INDUSTRIES:
      {
        LIST: '/admin/categories/industries',
        DETAIL: '/admin/categories/industries/:id',
        EDIT: '/admin/categories/industries/edit/:id',
        CREATE: '/admin/categories/industries/create',
      },

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

export const NOTIFICATION_CENTER_ROUTE = '/notifications' as const;

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