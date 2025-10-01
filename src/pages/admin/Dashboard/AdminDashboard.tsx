import { sidebarItems } from '../../../components/admin/SidebarItems';
import Sidebar from '../../../components/common/Sidebar';
import {
  BarChart3,
  Users,
  FolderOpen,
  CreditCard,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';


export default function AdminDashboard() {
  const kpiStats = [
    {
      title: 'Tổng Người Dùng',
      value: '1,247',
      change: '+12% tháng này',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'Dự Án Hoạt Động',
      value: '89',
      change: '+5 tuần này',
      trend: 'up',
      color: 'green'
    },
    {
      title: 'Doanh Thu Tháng',
      value: '2.4B VNĐ',
      change: '+18% tháng trước',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Tỷ Lệ Thành Công',
      value: '94.2%',
      change: '+2.1% cải thiện',
      trend: 'up',
      color: 'orange'
    }
  ];

  const recentUsers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'user1@example.com',
      type: 'professional',
      status: 'pending',
      joinDate: '15/01/2025'
    },
    {
      id: 2,
      name: 'Công ty ABC',
      email: 'company@abc.com',
      type: 'company',
      status: 'verified',
      joinDate: '14/01/2025'
    },
    {
      id: 3,
      name: 'Trần Thị B',
      email: 'user2@example.com',
      type: 'professional',
      status: 'verified',
      joinDate: '13/01/2025'
    }
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'Có 12 tài khoản chờ xác minh',
      time: '10 phút trước'
    },
    {
      type: 'info',
      message: 'Cập nhật hệ thống đã được triển khai thành công',
      time: '2 giờ trước'
    },
    {
      type: 'success',
      message: 'Doanh thu tháng này đã đạt mục tiêu',
      time: '1 ngày trước'
    }
  ];

  const topSkills = [
    { skill: 'React/JavaScript', projects: 45, growth: '+8%' },
    { skill: 'Node.js', projects: 38, growth: '+12%' },
    { skill: 'Python', projects: 32, growth: '+5%' },
    { skill: 'Mobile Development', projects: 28, growth: '+15%' },
    { skill: 'UI/UX Design', projects: 25, growth: '+7%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Đã xác minh';
      case 'pending': return 'Chờ xác minh';
      case 'suspended': return 'Tạm khóa';
      default: return status;
    }
  };

  const getUserTypeText = (type: string) => {
    switch (type) {
      case 'company': return 'Doanh nghiệp';
      case 'professional': return 'Chuyên gia IT';
      default: return type;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Shield className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />

      <div className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Hệ Thống</h1>
            <p className="text-neutral-600 mt-1">Giám sát và quản lý toàn bộ hoạt động DevPool</p>
          </div>
        </header>


        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {kpiStats.map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                  stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                    stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                      'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                  } transition-all duration-300`}>
                  <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in">
          {/* Recent Users */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Người Dùng Mới</h2>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform">
                  Quản lý tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300">
                        {user.type === 'company' ? (
                          <Shield className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors duration-300" />
                        ) : (
                          <Users className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors duration-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{user.name}</h3>
                        <div className="text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                          {user.email} • {getUserTypeText(user.type)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                      <p className="text-xs text-neutral-500 mt-1 group-hover:text-neutral-600 transition-colors duration-300">{user.joinDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-gray-900">Cảnh Báo Hệ Thống</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="group flex items-start space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{alert.message}</p>
                      <p className="text-xs text-neutral-500 mt-1 group-hover:text-neutral-600 transition-colors duration-300">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
          {/* Top Skills */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-gray-900">Kỹ Năng Phổ Biến</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topSkills.map((item, index) => (
                  <div key={index} className="group flex items-center justify-between hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300">
                        <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 transition-colors duration-300">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{item.skill}</h3>
                        <p className="text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{item.projects} dự án</p>
                      </div>
                    </div>
                    <span className="text-secondary-600 text-sm font-medium group-hover:text-secondary-700 transition-colors duration-300">{item.growth}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-gray-900">Thao Tác Nhanh</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button className="group flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-primary-300 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium group-hover:text-primary-700 transition-colors duration-300">Xác minh người dùng</span>
                  </div>
                  <span className="bg-warning-100 text-warning-800 text-xs px-2 py-1 rounded-full animate-pulse-gentle">12 chờ</span>
                </button>

                <button className="group flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-secondary-300 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-5 h-5 text-secondary-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium group-hover:text-secondary-700 transition-colors duration-300">Giám sát dự án</span>
                  </div>
                  <span className="bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded-full">89 hoạt động</span>
                </button>

                <button className="group flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-accent-300 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-accent-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium group-hover:text-accent-700 transition-colors duration-300">Xử lý thanh toán</span>
                  </div>
                  <span className="bg-error-100 text-error-800 text-xs px-2 py-1 rounded-full animate-pulse-gentle">3 vấn đề</span>
                </button>

                <button className="group flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-warning-300 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-warning-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium group-hover:text-warning-700 transition-colors duration-300">Xem báo cáo</span>
                  </div>
                  <Clock className="w-4 h-4 text-neutral-400 group-hover:text-neutral-500 transition-colors duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}