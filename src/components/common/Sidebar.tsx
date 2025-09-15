import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export default function Sidebar({ items, title }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm h-screen sticky top-16">
      <div className="p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-6">{title}</h2>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}