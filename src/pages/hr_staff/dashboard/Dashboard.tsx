
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Briefcase, Clock, Calendar, FileText, UserPlus } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { talentService, type Talent } from '../../../services/Talent';
import { applyService, type Apply } from '../../../services/Apply';
import { applyActivityService, type ApplyActivity, ApplyActivityType } from '../../../services/ApplyActivity';
import { jobRequestService } from '../../../services/JobRequest';
import { talentCVService } from '../../../services/TalentCV';

interface RecentApplication {
  id: number;
  talentName: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

interface RecentActivity {
  type: string;
  message: string;
  time: string;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [applications, setApplications] = useState<Apply[]>([]);
  const [activities, setActivities] = useState<ApplyActivity[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [talentsData, applicationsData, activitiesData] = await Promise.all([
          talentService.getAll({ excludeDeleted: true }),
          applyService.getAll(),
          applyActivityService.getAll({ excludeDeleted: true })
        ]);

        setTalents(talentsData);
        setApplications(applicationsData);
        setActivities(activitiesData);

        // Get recent applications with talent names
        const recentApps = applicationsData.slice(0, 5);
        const recentAppsWithDetails = await Promise.all(
          recentApps.map(async (app) => {
            try {
              const [cv, jobRequest] = await Promise.all([
                talentCVService.getById(app.cvId),
                jobRequestService.getById(app.jobRequestId)
              ]);
              
              const talent = talentsData.find((t: Talent) => t.id === cv.talentId);
              
              return {
                id: app.id,
                talentName: talent?.fullName || 'N/A',
                jobTitle: jobRequest.title,
                status: app.status,
                createdAt: app.createdAt
              };
            } catch {
              return {
                id: app.id,
                talentName: 'N/A',
                jobTitle: 'N/A',
                status: app.status,
                createdAt: app.createdAt
              };
            }
          })
        );
        setRecentApplications(recentAppsWithDetails);

        // Get recent activities
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentActivitiesData = activitiesData
          .filter(activity => new Date(activity.scheduledDate || '') >= lastWeek)
          .slice(0, 5)
          .map(activity => {
            const activityTypeNames = {
              [ApplyActivityType.Interview]: 'Phỏng vấn',
              [ApplyActivityType.Test]: 'Kiểm tra',
              [ApplyActivityType.Meeting]: 'Cuộc họp',
              [ApplyActivityType.Review]: 'Đánh giá'
            };
            
            const timeAgo = getTimeAgo(new Date(activity.scheduledDate || ''));
            
            return {
              type: 'interview',
              message: `${activityTypeNames[activity.activityType]} được lên lịch`,
              time: timeAgo
            };
          });
        setRecentActivities(recentActivitiesData);
      } catch (err) {
        console.error('❌ Lỗi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return 'Hơn 1 tuần trước';
  };

  // Calculate stats
  const totalTalents = talents.length;
  const totalApplications = applications.length;
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActivities = activities.filter(
    activity => new Date(activity.scheduledDate || '') >= lastWeek
  ).length;
  
  const hiredCount = applications.filter(app => app.status === 'Hired').length;
  const successRate = totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;

  const stats = [
    {
      title: 'Tổng Số Talents',
      value: totalTalents.toString(),
      change: 'Tổng số trong hệ thống',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'Tổng Ứng Tuyển',
      value: totalApplications.toString(),
      change: 'Ứng viên đã ứng tuyển',
      trend: 'up',
      color: 'green'
    },
    {
      title: 'Hoạt Động Tuần Này',
      value: weeklyActivities.toString(),
      change: 'Hoạt động trong 7 ngày',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Tỷ Lệ Thành Công',
      value: `${successRate}%`,
      change: `${hiredCount} người đã tuyển`,
      trend: 'up',
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Interview': return 'bg-blue-100 text-blue-800';
      case 'InterviewScheduled': return 'bg-indigo-100 text-indigo-800';
      case 'Submitted': return 'bg-indigo-100 text-indigo-800';
      case 'Interviewing': return 'bg-cyan-100 text-cyan-800';
      case 'Hired': return 'bg-purple-100 text-purple-800';
      case 'Withdrawn': return 'bg-gray-100 text-gray-800';
      case 'Offered': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Rejected': return 'Đã từ chối';
      case 'Interview': return 'Phỏng vấn';
      case 'InterviewScheduled': return 'Đã lên lịch PV';
      case 'Submitted': return 'Đã lên lịch PV';
      case 'Interviewing': return 'Đang phỏng vấn';
      case 'Hired': return 'Đã tuyển';
      case 'Withdrawn': return 'Đã rút';
      case 'Offered': return 'Đã đề xuất';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ứng Tuyển Gần Đây</h2>
                <button 
                  onClick={() => navigate('/hr/applications')}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có ứng tuyển nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => navigate(`/hr/applications/${app.id}`)}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{app.talentName}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {app.jobTitle}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Hoạt Động Gần Đây</h2>
                <button 
                  onClick={() => navigate('/hr/applications')}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có hoạt động nào</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 border border-neutral-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/hr/talents/create')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Thêm Talent Mới</span>
              </button>
              <button 
                onClick={() => navigate('/hr/applications')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-3 rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-300 shadow-soft hover:shadow-glow-green transform hover:scale-105"
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Xem Ứng Tuyển</span>
              </button>
              <button 
                onClick={() => navigate('/hr/job-requests')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-6 py-3 rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-soft hover:shadow-glow-purple transform hover:scale-105"
              >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Yêu Cầu Tuyển Dụng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
