import { 
  BarChart3,
  Users, 
  Briefcase, 
  Layers, 
  Grid,
  FileText,
  Building,
  Globe,
  List, 
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
    label: 'Quản Lý Vị Trí TD',
    href: '/sales/job-positions',
    icon: Grid, // vị trí tuyển dụng => nhân sự
    subItems: [
      { label: 'Danh sách vị trí TD', href: '/sales/job-positions' },
      { label: 'Tạo vị trí TD', href: '/sales/job-positions/create' },
    ]
  },
  {
    label: 'Quản Lý Kiểu Vị Trí',
    href: '/sales/position-type',
    icon: List, // kiểu vị trí => biểu tượng lưới
    subItems: [
      { label: 'Danh sách Kiểu Vị Trí', href: '/sales/position-type' },
      { label: 'Tạo kiểu vị trí', href: '/sales/position-type/create' },
    ]
  },
  {
    label: 'Quản Lý Thị Trường',
    href: '/sales/markets',
    icon: Globe, // thị trường, địa điểm
    subItems: [
      { label: 'Danh sách thị trường', href: '/sales/markets' },
      { label: 'Tạo thị trường', href: '/sales/markets/create' },
    ]
  },
  {
    label: 'Quản Lý Ngành',
    href: '/sales/industries',
    icon: Briefcase, // ngành nghề => dùng briefcase cũng hợp
    subItems: [
      { label: 'Danh sách ngành', href: '/sales/industries' },
      { label: 'Tạo ngành', href: '/sales/industries/create' },
    ]
  },
  {
    label: 'Hợp Đồng KH',
    href: '/sales/contracts',
    icon: FileText, // hợp đồng
    subItems: [
      { label: 'Danh Sách Hợp Đồng', href: '/sales/contracts' },
      { label: 'Tải lên Hợp Đồng', href: '/sales/contracts/upload' },
    ]
  },
];
