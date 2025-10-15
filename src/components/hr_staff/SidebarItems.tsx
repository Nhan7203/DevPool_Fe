import { BarChart3, Users, FileText, Calendar, Building, Settings } from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan',
    href: '/hr/dashboard',
    icon: BarChart3
  },
  {
    label: 'Quản Lý Talent',
    href: '/hr/developers',
    icon: Users,
    subItems: [
      { label: 'Danh sách talent', href: '/hr/developers' },
      { label: 'Tạo talent', href: '/hr/developers/create' },

    ]
  },
  {
    label: 'Quản Lý Partner',
    href: '/hr/partners',
    icon: Users,
    subItems: [
      { label: 'Danh Sách Partner', href: '/hr/partners' },
      { label: 'Tạo Partner', href: '/hr/partners/create' },
    ]
  },
  {
    label: 'Quản Lý CV',
    href: '/hr/cvs',
    icon: Users,
    subItems: [
      { label: 'Danh Sách CV', href: '/hr/cvs' },
      { label: 'Upload CV', href: '/hr/cvs/upload' },
      { label: 'Matching CV', href: '/hr/cvs/matching' },
    ]
  },
  {
    label: 'Yêu Cầu Tuyển Dụng',
    href: '/hr/job-requests',
    icon: FileText,
    subItems: [
      { label: 'Danh Sách Yêu Cầu', href: '/hr/job-requests' },
    ]
  },
  {
    label: 'Quản lý Template CV',
    href: '/hr/templates',
    icon: Users,
    subItems: [
      { label: 'Danh Sách Template', href: '/hr/templates' },
      { label: 'Tạo Template', href: '/hr/templates/create' },
      { label: 'Gán Template KH', href: '/hr/templates/assign' },
    ]
  },
  {
    label: 'Quản Lý ST Assignment',
    href: '/hr/assignments',
    icon: Users,
    subItems: [
      { label: 'Danh Sách ST Assignment', href: '/hr/assignments' },
    ]
  },
  {
    label: 'Phỏng Vấn',
    href: '/hr/interviews',
    icon: Calendar,
    subItems: [
      { label: 'Danh sách Phỏng Vấn', href: '/hr/interviews' },
      { label: 'Lịch Phỏng Vấn', href: '/hr/interviews/schedule' },
      { label: 'Lịch Sử Phỏng Vấn', href: '/hr/interviews/history' }
    ]
  },
  {
    label: 'Hợp Đồng Dev',
    href: '/hr/contracts',
    icon: FileText,
    subItems: [
      { label: 'Danh Sách Hợp Đồng', href: '/hr/contracts' },
      { label: 'Upload File Hợp Đồng', href: '/hr/contracts/upload' },
    ]
  },
  {
    label: 'Báo Cáo',
    href: '/hr/reports',
    icon: Building,
    subItems: [
      { label: 'Tỷ Lệ PV Thành Công', href: '/hr/reports/interview-success' },
      { label: 'Trạng Thái Dev', href: '/hr/reports/developer-status' },
    ]
  },
  {
    label: 'Cài Đặt',
    href: '/hr/settings',
    icon: Settings
  }
];