
import { TrendingUp, Briefcase, Clock, Calendar, FileText, UserPlus } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';



export default function HRDashboard() {
  const stats = [
    {
      title: 'Developer Đang Hoạt Động',
      value: '45',
      change: '+5 từ tháng trước',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'CV Trong Pool',
      value: '127',
      change: '+12 tuần này',
      trend: 'up',
      color: 'green'
    },
    {
      title: 'Phỏng Vấn Tuần Này',
      value: '18',
      change: '+3 từ tuần trước',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Tỷ Lệ Thành Công',
      value: '85%',
      change: '+5% tháng này',
      trend: 'up',
      color: 'orange'
    }
  ];

  const recentCandidates = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      position: 'Frontend Developer',
      status: 'pending',
      experience: '3 năm',
      techStack: 'React, Vue.js',
      interview: '20/02/2025'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      position: 'Backend Developer',
      status: 'interviewed',
      experience: '4 năm',
      techStack: 'Node.js, Python',
      interview: '18/02/2025'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      position: 'Fullstack Developer',
      status: 'approved',
      experience: '5 năm',
      techStack: 'React, Node.js',
      interview: '15/02/2025'
    }
  ];

  const recentActivities = [
    {
      type: 'interview',
      message: 'Phỏng vấn với Nguyễn Văn A cho vị trí Frontend Developer',
      time: '2 giờ trước'
    },
    {
      type: 'contract',
      message: 'Ký hợp đồng với Trần Thị B cho dự án Mobile Banking',
      time: '1 ngày trước'
    },
    {
      type: 'cv',
      message: 'Thêm mới 5 CV vào pool Developer',
      time: '2 ngày trước'
    },
    {
      type: 'request',
      message: 'Yêu cầu tuyển dụng mới từ Công ty XYZ',
      time: '3 ngày trước'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ phỏng vấn';
      case 'interviewed': return 'Đã phỏng vấn';
      case 'approved': return 'Đã duyệt';
      default: return status;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900">Chào mừng, HR Staff</h1>
          <p className="text-neutral-600 mt-1">Quản lý tuyển dụng và nhân sự hiệu quả</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Recent Candidates */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ứng Viên Gần Đây</h2>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentCandidates.map((candidate) => (
                  <div key={candidate.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{candidate.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                          {candidate.position}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                          {candidate.experience}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {getStatusText(candidate.status)}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1 group-hover:text-primary-700 transition-colors duration-300">{candidate.interview}</p>
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
                        activity.type === 'interview' ? 'bg-primary-100 group-hover:bg-primary-200' :
                        activity.type === 'contract' ? 'bg-secondary-100 group-hover:bg-secondary-200' :
                        activity.type === 'cv' ? 'bg-accent-100 group-hover:bg-accent-200' :
                        'bg-warning-100 group-hover:bg-warning-200'
                      }`}>
                        {activity.type === 'interview' && <Calendar className="w-4 h-4 text-primary-600" />}
                        {activity.type === 'contract' && <FileText className="w-4 h-4 text-secondary-600" />}
                        {activity.type === 'cv' && <UserPlus className="w-4 h-4 text-accent-600" />}
                        {activity.type === 'request' && <Briefcase className="w-4 h-4 text-warning-600" />}
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
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Thêm CV Mới</span>
              </button>
              <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-3 rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-300 shadow-soft hover:shadow-glow-green transform hover:scale-105">
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Lịch Phỏng Vấn</span>
              </button>
              <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-6 py-3 rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-soft hover:shadow-glow-purple transform hover:scale-105">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Tạo Hợp Đồng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}