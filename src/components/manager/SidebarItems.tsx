import { 
  BarChart3, 
  Settings, 
  LineChart, 
  Users, 
  DollarSign 
} from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan',
    href: '/manager/dashboard',
    icon: BarChart3
  },
  {
    label: 'Hợp Đồng',
    href: '/manager/contract',
    icon: Users,
    subItems: [
      { label: 'Danh Sách Hợp Đồng Khách Hàng', href: '/manager/contracts/clients' },
      { label: 'Danh Sách Hợp Đồng Dev', href: '/manager/contracts/developers' },
    ]
  },
  {
    label: 'Báo cáo Kinh doanh',
    href: '/manager/business',
    icon: LineChart,
    subItems: [
      { label: 'Tổng quan kinh doanh', href: '/manager/business/overview' },
      { label: 'Doanh thu', href: '/manager/business/revenue' },
    ]
  },
  {
    label: 'Báo cáo Nhân sự',
    href: '/manager/hr',
    icon: Users,
    subItems: [
      { label: 'Tổng quan nhân sự', href: '/manager/hr/overview' },
      { label: 'Thống kê developers', href: '/manager/hr/developers' },
      { label: 'Tỷ lệ sử dụng nhân sự', href: '/manager/hr/utilization' },
      { label: 'Hiệu suất làm việc', href: '/manager/hr/performance' }
    ]
  },
  {
    label: 'Báo cáo Tài chính',
    href: '/manager/finance',
    icon: DollarSign,
    subItems: [
      { label: 'Tổng quan tài chính', href: '/manager/finance/overview' },
      { label: 'Dòng tiền', href: '/manager/finance/cashflow' },
      { label: 'Công nợ', href: '/manager/finance/debt' },
      { label: 'Lợi nhuận', href: '/manager/finance/profit' }
    ]
  },
  {
    label: 'Cài Đặt',
    href: '/manager/settings',
    icon: Settings
  }
];