import { BarChart3, CalendarClock, Wallet, FileText} from "lucide-react";

export const sidebarItems = [
  {
    label: 'Tổng Quan',
    href: '/accountant/dashboard',
    icon: BarChart3
  },
  {
    label: 'Kỳ Thanh Toán',
    href: '/accountant/payment-periods',
    icon: CalendarClock,
    subItems: [
      { label: 'Khách hàng', href: '/accountant/payment-periods/clients', icon: Wallet },
      { label: 'Đối tác', href: '/accountant/payment-periods/partners', icon: Wallet },
    ]
  },
  {
    label: 'Danh sách tài liệu',
    href: '/accountant/documents',
    icon: FileText
  },
];