import { 
  BarChart3,
  Users, 
} from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan',
    href: '/sales/dashboard',
    icon: BarChart3
  },
  {
    label: 'Hợp Đồng',
    href: '/sales/contracts',
    icon: Users,
    subItems: [
      { label: 'Danh Sách Hợp Đồng', href: '/sales/contracts' },
      { label: 'Tải lên Hợp Đồng', href: '/sales/contracts/upload' },
    ]
  },
  {
    label: 'Yêu Cầu Tuyển Dụng',
    href: '/sales/job-requests',
    icon: Users,
    subItems: [
      { label: 'Danh Sách Yêu Cầu', href: '/sales/job-requests' },
      { label: 'Tạo Yêu Cầu', href: '/sales/job-requests/create' },
    ]
  },
];