import { BarChart3, Grid, Settings, Users, LogOut } from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan Hệ Thống',
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
    ]
  },
  {
    label: 'Danh Mục',
    href: '/admin/categories',
    icon: Grid,
    subItems: [
      { label: 'Kỹ năng', href: '/admin/categories/skills' },
      { label: 'Nhóm kỹ năng', href: '/admin/categories/skill-groups' },
      // { label: 'Kiểu làm việc', href: '/admin/categories/working-styles' },
      { label: 'Mẫu CV', href: '/admin/categories/cv-templates' },
      { label: 'Loại chứng chỉ', href: '/admin/categories/certificate-types' },
      { label: 'Vị trí tuyển dụng', href: '/admin/categories/job-role-levels' },
      { label: 'Loại vị trí tuyển dụng', href: '/admin/categories/job-roles' },
      { label: 'Khu vực làm việc', href: '/admin/categories/locations' },
      { label: 'Thị trường', href: '/admin/categories/markets' },
      { label: 'Lĩnh vực', href: '/admin/categories/industries' },
      { label: 'Loại tài liệu', href: '/admin/categories/document-types' },
    ]
  },
  // {
  //   label: 'Cài Đặt',
  //   href: '/admin/settings',
  //   icon: Settings,
  //   subItems: [
  //     // { label: 'Thông tin tài khoản', href: '/admin/settings/profile', icon: User },
  //     // { label: 'Thông báo', href: '/admin/settings/notifications', icon: Bell },
  //     { label: 'Đăng xuất', href: '/logout', icon: LogOut },
  //   ]
  // }
];