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
    DASHBOARD: '/ta/dashboard',
    PROFILE: '/ta/profile',

    // Talent & nguồn cung
    DEVELOPERS: {
      LIST: '/ta/developers',                    // Danh sách tất cả developers
      DETAIL: '/ta/developers/:id',              // Chi tiết developer   
      EDIT: '/ta/developers/edit/:id',           // Sửa thông tin developer
      CREATE: '/ta/developers/create',

    },
    TALENT_AVAILABLE_TIMES: {
      LIST: '/ta/talent-available-times',
      EDIT: '/ta/talent-available-times/edit/:id',
      CREATE: '/ta/talent-available-times/create',
    },
    TALENT_CERTIFICATES: {
      LIST: '/ta/talent-certificates',
      EDIT: '/ta/talent-certificates/edit/:id',
      CREATE: '/ta/talent-certificates/create',
    },
    TALENT_CVS: {
      LIST: '/ta/talent-cvs',
      EDIT: '/ta/talent-cvs/edit/:id',
      CREATE: '/ta/talent-cvs/create',
    },

    TALENT_JOB_ROLE_LEVELS: {
      LIST: '/ta/talent-job-role-levels',
      EDIT: '/ta/talent-job-role-levels/edit/:id',
      CREATE: '/ta/talent-job-role-levels/create',
    },

    TALENT_PROJECTS: {
      LIST: '/ta/talent-projects',
      EDIT: '/ta/talent-projects/edit/:id',
      CREATE: '/ta/talent-projects/create',
    },
    TALENT_SKILLS: {
      LIST: '/ta/talent-skills',
      EDIT: '/ta/talent-skills/edit/:id',
      CREATE: '/ta/talent-skills/create',
    },
    TALENT_WORK_EXPERIENCES: {
      LIST: '/ta/talent-work-experiences',
      EDIT: '/ta/talent-work-experiences/edit/:id',
      CREATE: '/ta/talent-work-experiences/create',
    },

    JOB_REQUESTS: {
      LIST: '/ta/job-requests',
      DETAIL: '/ta/job-requests/:id',
      MATCHING: '/ta/job-requests/matching-cv', // Matching CV với yêu cầu
    },

    APPLICATIONS: {
      LIST: '/ta/applications',
      DETAIL: '/ta/applications/:id',
    },

    APPLY_ACTIVITIES: {
      LIST: '/ta/apply-activities',
      DETAIL: '/ta/apply-activities/:id',
      EDIT: '/ta/apply-activities/edit/:id',
      CREATE: '/ta/apply-activities/create',
    },

    TEMPLATES: {
      LIST: '/ta/templates',
      CREATE: '/ta/templates/create',
      Assign: '/ta/templates/assgin',
    },

    PARTNERS: {
      LIST: '/ta/partners',
      DETAIL: '/ta/partners/:id',
      EDIT: '/ta/partners/edit/:id',
      CREATE: '/ta/partners/create',
    },
    ASSIGNMENTS: '/ta/assignments',                // staffTalentAssignments

    // Quản lý Phỏng vấn
    INTERVIEWS: {
      LIST: '/ta/interviews',                    // Danh sách phỏng vấn
      SCHEDULE: '/ta/interviews/schedule',       // Sắp xếp lịch phỏng vấn
      RESULT: '/ta/interviews/:id/result',       // Cập nhật kết quả phỏng vấn
      HISTORY: '/ta/interviews/history',         // Lịch sử phỏng vấn
    },

    // Quản lý Hợp đồng 
    CONTRACTS: {
      LIST: '/ta/contracts',                     // Danh sách hợp đồng
      DETAIL: '/ta/contracts/:id',               // Chi tiết hợp đồng
      CREATE: '/ta/contracts/create',            // Tạo hợp đồng mới
      EDIT: '/ta/contracts/edit/:id',           // Chỉnh sửa hợp đồng
      UPLOAD: '/ta/contracts/upload',        // Upload file hợp đồng
    },

    // WorkReports: TA nhập & upload, submit để duyệt
    WORKREPORTS: {
      LIST: '/ta/workreports',
      CREATE: '/ta/workreports/create',
      DETAIL: '/ta/workreports/:id',
      UPLOAD: '/ta/workreports/:id/upload',
      SUBMIT: '/ta/workreports/:id/submit',
    },

    // Báo cáo
    REPORTS: {
      INTERVIEW_SUCCESS: '/ta/reports/interview-success', // Tỷ lệ PV thành công
      DEVELOPER_STATUS: '/ta/reports/developer-status',   // Trạng thái developers
    }
  },

  // =======================================
  // SALES_STAFF - Nhân viên Kinh doanh/Account
  // (MỚI THÊM – chịu trách nhiệm với KH & tạo JobRequest)
  // =======================================
  SALES_STAFF: {
    DASHBOARD: '/sales/dashboard',
    PROFILE: '/sales/profile',

    // Quản lý Hợp đồng 
    CONTRACTS: {
      LIST: '/sales/contracts',                     // Danh sách hợp đồng
      DETAIL: '/sales/contracts/:id',               // Chi tiết hợp đồng
      CREATE: '/sales/contracts/create',        // Tạo hợp đồng mới
      EDIT: '/sales/contracts/edit/:id',        // Chỉnh sửa hợp đồng
      CLIENTS: '/sales/contracts/clients',           // Danh sách hợp đồng khách hàng
      CLIENT_DETAIL: '/sales/contracts/clients/:id', // Chi tiết hợp đồng khách hàng
      PARTNERS: '/sales/contracts/partners',        // Danh sách hợp đồng đối tác
      PARTNER_DETAIL: '/sales/contracts/partners/:id', // Chi tiết hợp đồng đối tác
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
    CONTACT_INQUIRIES: {
      LIST: '/sales/contact-inquiries',
      DETAIL: '/sales/contact-inquiries/:id',
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
    PROFILE: '/accountant/profile',

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
    CV: '/developer/cv',                        // submit thay đổi → TA duyệt
    CV_CREATE: '/developer/cv/create',          // Tạo CV mới

    // Hợp đồng
    CONTRACTS: {
      LIST: '/developer/contracts',             // Danh sách hợp đồng của mình
      CURRENT: '/developer/contracts/current',  // Hợp đồng đang thực hiện
      DETAIL: '/developer/contracts/:id',       // Chi tiết hợp đồng đối tác
    },

    // Timesheet/WorkReport: chỉ xem
    WORKREPORTS: {
      LIST: '/developer/workreports',
      DETAIL: '/developer/workreports/:id',
    },

    // Payment Status
    PAYMENTS: {
      LIST: '/developer/payments',
      DETAIL: '/developer/payments/:id',
    },
  },

  // ==============================================================
  // MANAGER - Quản lý (phê duyệt & báo cáo)
  // ==============================================================
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    PROFILE: '/manager/profile',

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
      PARTNERS: '/manager/contracts/partners',
      PARTNER_DETAIL: '/manager/contracts/partners/:id',
    },
    CLIENT_COMPANY: {
      LIST: '/manager/client-companies',
      DETAIL: '/manager/client-companies/:id',
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
    PROFILE: '/admin/profile',

    // Quản lý Users
    USERS: {
      LIST: '/admin/users',                          // Danh sách users (staff)
      CREATE_ACCOUNT: '/admin/users/create-account', // Tạo tài khoản cho staff
      TALENT_LIST: '/admin/users/talents',           // Danh sách talent (dev)
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

    AUDIT: {
      LIST: '/admin/audit-log',                   // Audit logs list
      DETAIL: '/admin/audit-log/:entityName/:entityId', // Audit log detail for entity
    },
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
  | 'Staff TA'
  | 'Staff Accountant'
  | 'Staff Sales'
  | 'Developer'
  | 'Manager'
  | 'Admin';

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'Staff TA':
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
    case 'Staff TA':
      return ROUTES.HR_STAFF;
    case 'Manager':
      return ROUTES.MANAGER;
    case 'Admin':
      return ROUTES.ADMIN;
    default:
      return null;
  }
};