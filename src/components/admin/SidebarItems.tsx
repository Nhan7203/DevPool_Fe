import { BarChart3, Users } from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan Hệ Thống Quan',
    href: '/admin/dashboard',
    icon: BarChart3
  },
  {
    label: 'Quản Lý Người Dùng',
    href: '/admin/users',
    icon: Users,
    subItems: [
      { label: 'Danh sách người dùng', href: '/admin/users' },
      { label: 'Tạo tài khoản', href: '/admin/users/create-account' },
      { label: 'Quản lý phân quyền', href: '/admin/users/roles' },
      { label: 'Quản lý permissions', href: '/admin/users/permissions' },
    ]
  },
  {
    label: 'Quản Lý Công Ty',
    href: '/admin/companies',
    icon: Users,
    subItems: [
      { label: 'Danh sách công ty', href: '/admin/companies' },
      { label: 'Công ty khách hàng', href: '/admin/companies/clients' },

    ]
  },
];