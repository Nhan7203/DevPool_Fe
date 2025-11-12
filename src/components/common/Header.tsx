import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Bell,
  LogOut,
  Settings,
  Loader2,
  Shield,
  UserCog,
  UserCheck,
  Briefcase,
  DollarSign,
  Code,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute, ROUTES, NOTIFICATION_CENTER_ROUTE } from '../../router/routes';
import {
  notificationService,
  type Notification,
  NotificationType,
  NotificationPriority,
} from '../../services/Notification';
import { decodeJWT } from '../../services/Auth';

type ExtendedNotification = Notification & {
  metaData?: Record<string, string | number | boolean> | null;
};

interface GroupedNotifications {
  group: string;
  items: ExtendedNotification[];
  isReadGroup?: boolean;
  readTotal?: number;
}

function getNotificationGroup(type: NotificationType): string {
  if (type >= 1000 && type < 2000) return 'Tuyển dụng & Ứng tuyển';
  if (type >= 2000 && type < 3000) return 'Jobs & Projects';
  if (type >= 3000 && type < 4000) return 'Hợp đồng';
  if (type >= 5000 && type < 6000) return 'Talent';
  if (type >= 6000 && type < 7000) return 'Tài liệu';
  return 'Thông báo khác';
}

function getPriorityBadge(priority?: NotificationPriority) {
  switch (priority) {
    case NotificationPriority.Urgent:
      return 'bg-red-100 text-red-700 border border-red-200';
    case NotificationPriority.High:
      return 'bg-orange-100 text-orange-700 border border-orange-200';
    case NotificationPriority.Medium:
      return 'bg-primary-100 text-primary-700 border border-primary-200';
    default:
      return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
  }
}

interface HeaderProps {
  showPublicBranding?: boolean;
}

export default function Header({ showPublicBranding = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewNotification, setViewNotification] = useState<ExtendedNotification | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const resolvedUserId = useMemo(() => {
    if (!user) return null;
    const token = localStorage.getItem('accessToken');
    if (!token) return user.id;
    const decoded = decodeJWT(token);
    const idFromToken = decoded?.nameid || decoded?.sub || decoded?.userId || decoded?.uid;
    return idFromToken || user.id;
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!resolvedUserId) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      try {
        setIsLoadingNotifications(true);
        const result = await notificationService.getAll({
          userId: resolvedUserId,
          pageNumber: 1,
          pageSize: 20,
        });
        setNotifications((result.notifications || []) as ExtendedNotification[]);
        setUnreadCount(result.unreadCount ?? 0);
      } catch (error) {
        console.error('Không thể tải thông báo:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [resolvedUserId]);

  const groupedNotifications: GroupedNotifications[] = useMemo(() => {
    if (!notifications.length) return [];

    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications
      .filter((n) => n.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groups: GroupedNotifications[] = [];

    if (unread.length) {
      const unreadMap = new Map<string, ExtendedNotification[]>();
      unread.forEach((notification) => {
        const group = getNotificationGroup(notification.type);
        if (!unreadMap.has(group)) unreadMap.set(group, []);
        unreadMap.get(group)!.push(notification);
      });
      const unreadGroup = Array.from(unreadMap.entries()).map(([group, items]) => ({ group: `${group} (Chưa đọc)`, items }));
      groups.push(...unreadGroup);
    }

    if (read.length) {
      groups.push({
        group: 'Thông báo đã đọc gần đây',
        items: read.slice(0, 1),
        isReadGroup: true,
        readTotal: read.length,
      });
    }

    return groups;
  }, [notifications]);

  const markNotificationAsRead = async (notification: ExtendedNotification) => {
    if (notification.isRead) return notification;
    try {
      const updated = (await notificationService.markAsRead(notification.id)) as ExtendedNotification;
      setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      return updated;
    } catch (error) {
      console.error('Không thể đánh dấu thông báo đã đọc:', error);
      const fallback = {
        ...notification,
        isRead: true,
        readAt: new Date().toISOString(),
      } as ExtendedNotification;
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? fallback : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      return fallback;
    }
  };

  const getRoleDisplay = () => {
    const role = user?.role;
    if (!role) {
      return {
        icon: <User className="w-4 h-4 text-white" />,
        containerClass: 'bg-gradient-to-r from-primary-600 to-accent-600',
      };
    }

    switch (role) {
      case 'Admin':
        return {
          icon: <Shield className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors duration-300" />,
          containerClass: 'bg-red-50',
        };
      case 'Manager':
        return {
          icon: <UserCog className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />,
          containerClass: 'bg-purple-50',
        };
      case 'Staff HR':
        return {
          icon: <UserCheck className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />,
          containerClass: 'bg-blue-50',
        };
      case 'Staff Sales':
        return {
          icon: <Briefcase className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors duration-300" />,
          containerClass: 'bg-green-50',
        };
      case 'Staff Accountant':
        return {
          icon: <DollarSign className="w-5 h-5 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />,
          containerClass: 'bg-yellow-50',
        };
      case 'Developer':
        return {
          icon: <Code className="w-5 h-5 text-cyan-600 group-hover:text-cyan-700 transition-colors duration-300" />,
          containerClass: 'bg-cyan-50',
        };
      default:
        return {
          icon: <Users className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors duration-300" />,
          containerClass: 'bg-neutral-100',
        };
    }
  };

  const roleDisplay = useMemo(getRoleDisplay, [user?.role]);
  const handleNotificationNavigate = async (notification: ExtendedNotification) => {
    try {
      const resolved = await markNotificationAsRead(notification);
      setIsNotificationOpen(false);
      navigate(resolved.actionUrl || notification.actionUrl || '/');
    } catch (error) {
      console.error('Không thể chuyển hướng thông báo:', error);
      setIsNotificationOpen(false);
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    }
  };

  const handleNotificationDetail = async (notification: ExtendedNotification) => {
    try {
      const resolved = await markNotificationAsRead(notification);
      setIsNotificationOpen(false);
      setViewNotification(resolved);
    } catch (error) {
      console.error('Không thể cập nhật thông báo:', error);
    }
  };

  const handleCloseNotificationDetail = () => {
    setViewNotification(null);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const desktopLinks = showPublicBranding
    ? [
        { label: 'Trang Chủ', to: '/' },
        { label: 'Nhân Sự IT', to: '/professionals' },
        { label: 'Về Chúng Tôi', to: '/about' },
        { label: 'Liên Hệ', to: '/contact' },
      ]
    : [];

  const mobileLinks = showPublicBranding
    ? [
        { label: 'Trang Chủ', to: '/' },
        { label: 'Dự Án', to: '/projects' },
        { label: 'Chuyên Gia IT', to: '/professionals' },
        { label: 'Doanh Nghiệp', to: '/companies' },
      ]
    : [];

  const hasDesktopLinks = desktopLinks.length > 0;
  const hasMobileLinks = mobileLinks.length > 0;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center min-h-[40px]">
            {showPublicBranding ? (
              <Link to="/" className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-primary-700 bg-clip-text text-transparent">
                  DevPool
                </span>
              </Link>
            ) : null}
          </div>

          {/* Desktop Navigation */}
          {hasDesktopLinks ? (
            <nav className="hidden md:flex space-x-8">
              {desktopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          ) : (
            <div className="hidden md:flex flex-1" />
          )}

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="group relative p-2 text-neutral-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300"
                  >
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center animate-pulse-gentle">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-hidden bg-white rounded-2xl shadow-medium border border-neutral-200 z-50 animate-slide-down">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">Thông báo</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span>Bạn có {unreadCount} thông báo chưa đọc</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsNotificationOpen(false);
                            navigate(NOTIFICATION_CENTER_ROUTE);
                          }}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Xem tất cả
                        </button>
                      </div>

                      <div className="max-h-[340px] overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="flex items-center justify-center py-10 text-neutral-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Đang tải thông báo...
                          </div>
                        ) : groupedNotifications.length === 0 ? (
                          <div className="py-10 text-center text-neutral-500 text-sm">Không có thông báo nào</div>
                        ) : (
                          groupedNotifications.map((group) => (
                            <div key={group.group} className="border-b border-neutral-100 last:border-0">
                              <div className="flex items-center justify-between px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                <span>{group.isReadGroup ? 'Thông báo đã đọc' : group.group}</span>
                                {group.isReadGroup && group.readTotal ? (
                                  <button
                                    onClick={() => {
                                      setIsNotificationOpen(false);
                                      navigate(NOTIFICATION_CENTER_ROUTE);
                                    }}
                                    className="text-[10px] font-medium text-primary-600 hover:text-primary-700"
                                  >
                                    {group.readTotal > 1 ? `Xem ${group.readTotal} thông báo đã đọc` : 'Xem tất cả'}
                                  </button>
                                ) : null}
                              </div>
                              {group.isReadGroup ? (
                                <div className="space-y-1 pb-3">
                                  {group.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className={`px-4 py-3 transition-all duration-200 rounded-xl border border-transparent ${
                                        item.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-primary-50/60 hover:bg-primary-50 border-primary-100'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${item.isRead ? 'bg-neutral-300' : 'bg-primary-500'}`} />
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug">
                                              {item.title}
                                            </p>
                                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(item.priority)}`}>
                                              {item.priority === NotificationPriority.Urgent
                                                ? 'Khẩn cấp'
                                                : item.priority === NotificationPriority.High
                                                ? 'Cao'
                                                : item.priority === NotificationPriority.Medium
                                                ? 'Trung bình'
                                                : 'Thấp'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                                            {item.message}
                                          </p>
                                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                            <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                                            {item.actionUrl ? (
                                              <button
                                                type="button"
                                                onClick={() => handleNotificationNavigate(item)}
                                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                              >
                                                Xem chi tiết
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleNotificationDetail(item)}
                                                className={`text-xs font-medium ${
                                                  item.isRead ? 'text-neutral-400 cursor-default' : 'text-primary-600 hover:text-primary-700'
                                                }`}
                                              >
                                                Đã đọc
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {group.readTotal && group.readTotal > 1 && (
                                    <button
                                      onClick={() => {
                                        setIsNotificationOpen(false);
                                        navigate(NOTIFICATION_CENTER_ROUTE);
                                      }}
                                      className="w-full px-4 text-xs text-primary-600 text-left font-medium hover:text-primary-700"
                                    >
                                      Xem thêm {group.readTotal - 1} thông báo đã đọc khác
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1 pb-3">
                                  {group.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className={`px-4 py-3 transition-all duration-200 rounded-xl border border-transparent ${
                                        item.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-primary-50/60 hover:bg-primary-50 border-primary-100'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${item.isRead ? 'bg-neutral-300' : 'bg-primary-500'}`} />
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug">
                                              {item.title}
                                            </p>
                                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(item.priority)}`}>
                                              {item.priority === NotificationPriority.Urgent
                                                ? 'Khẩn cấp'
                                                : item.priority === NotificationPriority.High
                                                ? 'Cao'
                                                : item.priority === NotificationPriority.Medium
                                                ? 'Trung bình'
                                                : 'Thấp'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                                            {item.message}
                                          </p>
                                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                            <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                                            {item.actionUrl ? (
                                              <button
                                                type="button"
                                                onClick={() => handleNotificationNavigate(item)}
                                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                              >
                                                Xem chi tiết
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleNotificationDetail(item)}
                                                className={`text-xs font-medium ${
                                                  item.isRead ? 'text-neutral-400 cursor-default' : 'text-primary-600 hover:text-primary-700'
                                                }`}
                                              >
                                                Đã đọc
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                        <button
                          onClick={() => {
                            setIsNotificationOpen(false);
                            navigate(NOTIFICATION_CENTER_ROUTE);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all"
                        >
                          Xem tất cả thông báo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="group flex items-center space-x-2 p-2 rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:shadow-soft"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300 shadow-sm group-hover:scale-110 ${roleDisplay.containerClass}`}
                      >
                        {roleDisplay.icon}
                      </div>
                    )}
                    <span className="text-neutral-700 font-medium group-hover:text-primary-700 transition-colors duration-300">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-medium py-2 z-50 border border-neutral-200 animate-slide-down">
                      <Link
                        to={user ? getDashboardRoute(user.role) : '/login'}
                        className="group flex items-center px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        className="group flex items-center px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Cài Đặt
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="group flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-error-50 hover:text-error-700 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Đăng Xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                >
                  Đăng Nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {hasMobileLinks && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && hasMobileLinks && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-down">
            <nav className="flex flex-col space-y-3">
              {mobileLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-3 border-t border-neutral-200">
                  <Link
                    to={getDashboardRoute(user.role)}
                    className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-neutral-700 hover:text-error-600 font-medium py-2 px-2 rounded-lg hover:bg-error-50 transition-all duration-300 text-left w-full"
                  >
                    Đăng Xuất
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-neutral-200">
                  <Link
                    to="/login"
                    className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium inline-block mt-2 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
    {viewNotification && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden animate-slide-up">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Chi tiết thông báo</p>
              <p className="text-xs text-neutral-500">{new Date(viewNotification.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <button
              onClick={handleCloseNotificationDetail}
              className="text-neutral-400 hover:text-neutral-600 transition-colors text-xl leading-none"
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-base font-semibold text-neutral-900 mb-1">{viewNotification.title}</p>
              <span className={`inline-flex items-center text-[11px] px-2 py-1 rounded-full ${getPriorityBadge(viewNotification.priority)}`}>
                {viewNotification.priority === NotificationPriority.Urgent
                  ? 'Khẩn cấp'
                  : viewNotification.priority === NotificationPriority.High
                  ? 'Cao'
                  : viewNotification.priority === NotificationPriority.Medium
                  ? 'Trung bình'
                  : 'Thấp'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">{viewNotification.message}</p>
            {viewNotification.metaData && Object.keys(viewNotification.metaData).length > 0 && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Thông tin bổ sung</p>
                <div className="space-y-1">
                  {Object.entries(viewNotification.metaData).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm text-neutral-700">
                      <span className="font-medium text-neutral-600">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewNotification.actionUrl && (
              <button
                onClick={() => {
                  handleCloseNotificationDetail();
                  navigate(viewNotification.actionUrl!);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow"
              >
                Xem chi tiết
              </button>
            )}
          </div>
          <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-right">
            <button
              onClick={handleCloseNotificationDetail}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}