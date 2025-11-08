import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../router/routes';

interface SubItem {
  label: string;
  href: string;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: SubItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export default function Sidebar({ items, title }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const topAndHeightClass = isAdminRoute
    ? 'top-0 h-screen'
    : 'top-16 h-[calc(100vh-4rem)]';

  const toggleExpand = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={`w-64 bg-white shadow-sm sticky ${topAndHeightClass} overflow-y-auto z-10 flex-shrink-0`}>
      <div className="p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-6">{title}</h2>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const isExpanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.href}>
                {hasSubItems ? (
                  // Items with subitems
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => toggleExpand(item.href)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {hasSubItems && (
                      <div className="text-gray-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Items without subitems - Make them clickable links
                  <Link
                    to={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )}

                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;
                      
                      // Handle logout specially
                      if (subItem.href === '/logout') {
                        return (
                          <button
                            key={subItem.href}
                            onClick={handleLogout}
                            className="w-full text-left block px-3 py-2 rounded-lg text-sm transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {subItem.label}
                          </button>
                        );
                      }
                      
                      return (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isSubActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}