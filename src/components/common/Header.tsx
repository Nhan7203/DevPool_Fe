import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Staff HR': return '/staff_hr/dashboard';
      case 'Staff Accountant': return '/staff_accountant/dashboard';
      case 'Staff Sales': return '/staff_sales/dashboard';
      case 'Developer': return '/developer/dashboard';
      case 'Manager': return '/manager/dashboard';
      case 'Admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-primary-700 bg-clip-text text-transparent">DevPool</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Trang Chủ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>           
            <Link to="/professionals" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Nhân Sự IT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Về Chúng Tôi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Liên Hệ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* <Link to="/projects" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Dự Án
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/companies" className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105 relative group">
              Doanh Nghiệp
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link> */}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="group relative p-2 text-neutral-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300">
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-gentle">
                    3
                  </span>
                </button>

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
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-neutral-700 font-medium group-hover:text-primary-700 transition-colors duration-300">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-medium py-2 z-50 border border-neutral-200 animate-slide-down">
                      <Link
                        to={getDashboardRoute()}
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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-down">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang Chủ
              </Link>
              <Link
                to="/projects"
                className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Dự Án
              </Link>
              <Link
                to="/professionals"
                className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Chuyên Gia IT
              </Link>
              <Link
                to="/companies"
                className="text-neutral-700 hover:text-primary-600 font-medium py-2 px-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Doanh Nghiệp
              </Link>

              {user ? (
                <div className="pt-3 border-t border-neutral-200">
                  <Link
                    to={getDashboardRoute()}
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
  );
}