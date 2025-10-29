import { 
  BarChart3,
  Users, 
  Layers, 
  FileText,
  Building,
} from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan',
    href: '/sales/dashboard',
    icon: BarChart3, // biểu đồ tổng quan
  },
  {
    label: 'Yêu Cầu Tuyển Dụng',
    href: '/sales/job-requests',
    icon: Users, // hợp lý cho nhân sự
    subItems: [
      { label: 'Danh sách yêu cầu', href: '/sales/job-requests' },
      { label: 'Tạo yêu cầu', href: '/sales/job-requests/create' },
    ]
  },
  {
    label: 'Quản Lý Công Ty KH',
    href: '/sales/clients',
    icon: Building, // công ty, doanh nghiệp
    subItems: [
      { label: 'Danh Sách công ty', href: '/sales/clients' },
      { label: 'Tạo công ty', href: '/sales/clients/create' },
    ]
  },
  {
    label: 'Quản Lý Dự Án',
    href: '/sales/projects',
    icon: Layers, // biểu tượng dự án/layer
    subItems: [
      { label: 'Danh Sách dự án', href: '/sales/projects' },
      { label: 'Tạo dự án', href: '/sales/projects/create' },
    ]
  },
  {
    label: 'Hợp Đồng KH',
    href: '/sales/contracts',
    icon: FileText, // hợp đồng
    subItems: [
      { label: 'Danh Sách Hợp Đồng', href: '/sales/contracts' },
      { label: 'Tải lên Hợp Đồng', href: '/sales/contracts/create' },
    ]
  },
];
