import React from 'react';
import Sidebar from '../../components/common/Sidebar';
import { 
  BarChart3, 
  Plus, 
  Users, 
  FileText, 
  CreditCard, 
  Building, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const sidebarItems = [
  { label: 'Tổng Quan', href: '/company/dashboard', icon: BarChart3 },
  { label: 'Đăng Dự Án Mới', href: '/company/post-project', icon: Plus },
  { label: 'Dự Án Của Tôi', href: '/company/projects', icon: FileText },
  { label: 'Ứng Viên', href: '/company/candidates', icon: Users },
  { label: 'Hợp Đồng', href: '/company/contracts', icon: FileText },
  { label: 'Thanh Toán', href: '/company/payments', icon: CreditCard },
  { label: 'Hồ Sơ Công Ty', href: '/company/profile', icon: Building },
  { label: 'Cài Đặt', href: '/company/settings', icon: Settings },
];

export default function CompanyDashboard() {
  const stats = [
    {
      title: 'Dự Án Đang Chạy',
      value: '8',
      change: '+2 từ tháng trước',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'Tổng Ứng Viên',
      value: '127',
      change: '+15 tuần này',
      trend: 'up',
      color: 'green'
    },
    {
      title: 'Dự Án Hoàn Thành',
      value: '24',
      change: '+4 tháng này',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Tổng Chi Phí',
      value: '450M VNĐ',
      change: '+12% tháng này',
      trend: 'up',
      color: 'orange'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      status: 'active',
      applicants: 15,
      budget: '200M VNĐ',
      deadline: '15/02/2025'
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      status: 'completed',
      applicants: 8,
      budget: '150M VNĐ',
      deadline: '10/01/2025'
    },
    {
      id: 3,
      name: 'HR Management System',
      status: 'review',
      applicants: 22,
      budget: '100M VNĐ',
      deadline: '28/02/2025'
    }
  ];

  const recentActivities = [
    {
      type: 'application',
      message: 'Nguyễn Văn A đã ứng tuyển vào dự án E-commerce Platform',
      time: '2 giờ trước'
    },
    {
      type: 'project',
      message: 'Dự án Mobile Banking App đã hoàn thành',
      time: '1 ngày trước'
    },
    {
      type: 'payment',
      message: 'Thanh toán cho dự án CRM System đã được xử lý',
      time: '2 ngày trước'
    },
    {
      type: 'contract',
      message: 'Hợp đồng mới đã được ký với Trần Thị B',
      time: '3 ngày trước'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'completed': return 'Hoàn thành';
      case 'review': return 'Đang xem xét';
      default: return status;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Doanh Nghiệp" />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900">Chào mừng, Công ty ABC</h1>
          <p className="text-neutral-600 mt-1">Quản lý dự án và tuyển dụng hiệu quả</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Recent Projects */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Dự Án Gần Đây</h2>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{project.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                          {project.applicants} ứng viên
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                          {project.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1 group-hover:text-primary-700 transition-colors duration-300">{project.budget}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-gray-900">Hoạt Động Gần Đây</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="group flex space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        activity.type === 'application' ? 'bg-primary-100 group-hover:bg-primary-200' :
                        activity.type === 'project' ? 'bg-secondary-100 group-hover:bg-secondary-200' :
                        activity.type === 'payment' ? 'bg-accent-100 group-hover:bg-accent-200' :
                        'bg-warning-100 group-hover:bg-warning-200'
                      }`}>
                        {activity.type === 'application' && <Users className="w-4 h-4 text-primary-600" />}
                        {activity.type === 'project' && <CheckCircle className="w-4 h-4 text-secondary-600" />}
                        {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-accent-600" />}
                        {activity.type === 'contract' && <FileText className="w-4 h-4 text-warning-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{activity.message}</p>
                      <p className="text-xs text-neutral-500 mt-1 group-hover:text-neutral-600 transition-colors duration-300">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 border border-neutral-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Đăng Dự Án Mới</span>
              </button>
              <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-3 rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-300 shadow-soft hover:shadow-glow-green transform hover:scale-105">
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Xem Ứng Viên</span>
              </button>
              <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-6 py-3 rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-soft hover:shadow-glow-purple transform hover:scale-105">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Quản Lý Hợp Đồng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}