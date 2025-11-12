
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Briefcase, Clock, Calendar, FileText, UserPlus, Building2, Target, Users, ClipboardList } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { talentService, type Talent } from '../../../services/Talent';
import { applyService, type Apply } from '../../../services/Apply';
import { applyActivityService, type ApplyActivity, ApplyActivityType } from '../../../services/ApplyActivity';
import { jobRequestService, type JobRequest, JobRequestStatus } from '../../../services/JobRequest';
import { talentCVService } from '../../../services/TalentCV';
import { partnerService, type Partner } from '../../../services/Partner';
import { partnerContractService, type PartnerContract } from '../../../services/PartnerContract';
import { projectService, type Project } from '../../../services/Project';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';

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
  scheduledDate: string;
}

interface RecentJobRequest {
  id: number;
  title: string;
  companyName: string;
  projectName: string;
  status: string;
  quantity: number;
  createdAt?: string;
}

interface RecentContract {
  id: number;
  contractNumber: string;
  partnerName: string;
  talentName: string;
  status: string;
  startDate: string;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [applications, setApplications] = useState<Apply[]>([]);
  const [, setActivities] = useState<ApplyActivity[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contracts, setContracts] = useState<PartnerContract[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentJobRequests, setRecentJobRequests] = useState<RecentJobRequest[]>([]);
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [talentsData, applicationsData, activitiesData, jobRequestsData, partnersData, contractsData, projectsData, clientCompaniesData] = await Promise.all([
          talentService.getAll({ excludeDeleted: true }),
          applyService.getAll(),
          applyActivityService.getAll({ excludeDeleted: true }),
          jobRequestService.getAll({ excludeDeleted: true }),
          partnerService.getAll(),
          partnerContractService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true }),
          clientCompanyService.getAll({ excludeDeleted: true })
        ]);

        setTalents(talentsData);
        setApplications(applicationsData);
        setActivities(activitiesData);
        setJobRequests(jobRequestsData);
        setPartners(partnersData);
        setContracts(contractsData);

        // Get recent applications with talent names
        const recentApps = applicationsData
          .sort((a: Apply, b: Apply) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
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
        const recentActivitiesData = activitiesData
          .filter(activity => activity.scheduledDate) // Chỉ lấy những activity có scheduledDate
          .sort((a: ApplyActivity, b: ApplyActivity) => {
            // Sort by scheduledDate (newest first)
            return new Date(b.scheduledDate!).getTime() - new Date(a.scheduledDate!).getTime();
          })
          .slice(0, 5)
          .map(activity => {
            const activityTypeNames = {
              [ApplyActivityType.Online]: 'Hoạt động trực tuyến',
              [ApplyActivityType.Offline]: 'Hoạt động trực tiếp'
            };

            // Map activityType to UI type string
            const getActivityTypeString = (activityType: ApplyActivityType): string => {
              switch (activityType) {
                case ApplyActivityType.Online: return 'online';
                case ApplyActivityType.Offline: return 'offline';
                default: return 'online';
              }
            };

            const activityDate = new Date(activity.scheduledDate!);
            const timeAgo = getTimeAgo(activityDate);

            return {
              type: getActivityTypeString(activity.activityType),
              message: `${activityTypeNames[activity.activityType] || 'Hoạt động'} được lên lịch`,
              time: timeAgo,
              scheduledDate: activity.scheduledDate!
            };
          });
        setRecentActivities(recentActivitiesData);

        // Get recent job requests
        const companyDict: Record<number, ClientCompany> = {};
        clientCompaniesData.forEach((c: ClientCompany) => (companyDict[c.id] = c));

        const projectDict: Record<number, Project> = {};
        projectsData.forEach((p: Project) => (projectDict[p.id] = p));

        const recentJobReqs = jobRequestsData
          .sort((a: JobRequest, b: JobRequest) => b.id - a.id)
          .slice(0, 5)
          .map((jr: JobRequest) => {
            const project = projectDict[jr.projectId];
            const company = project ? companyDict[project.clientCompanyId] : undefined;
            const statusLabels: Record<number, string> = {
              [JobRequestStatus.Pending]: 'Chờ duyệt',
              [JobRequestStatus.Approved]: 'Đã duyệt',
              [JobRequestStatus.Closed]: 'Đã đóng',
              [JobRequestStatus.Rejected]: 'Đã từ chối'
            };
            return {
              id: jr.id,
              title: jr.title,
              companyName: company?.name || 'N/A',
              projectName: project?.name || 'N/A',
              status: statusLabels[jr.status] || 'N/A',
              quantity: jr.quantity,
              createdAt: ''
            };
          });
        setRecentJobRequests(recentJobReqs);

        // Get recent contracts
        const recentContractsData = contractsData
          .sort((a: PartnerContract, b: PartnerContract) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5)
          .map(async (contract: PartnerContract) => {
            try {
              const [partner, talent] = await Promise.all([
                partnersData.find((p: Partner) => p.id === contract.partnerId),
                talentsData.find((t: Talent) => t.id === contract.talentId)
              ]);
              return {
                id: contract.id,
                contractNumber: contract.contractNumber,
                partnerName: partner?.companyName || 'N/A',
                talentName: talent?.fullName || 'N/A',
                status: contract.status,
                startDate: contract.startDate
              };
            } catch {
              return {
                id: contract.id,
                contractNumber: contract.contractNumber,
                partnerName: 'N/A',
                talentName: 'N/A',
                status: contract.status,
                startDate: contract.startDate
              };
            }
          });
        const resolvedContracts = await Promise.all(recentContractsData);
        setRecentContracts(resolvedContracts);
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
  const totalJobRequests = jobRequests.length;
  const totalPartners = partners.length;
  const totalContracts = contracts.length;

  const hiredCount = applications.filter(app => app.status === 'Hired').length;

  // Job Requests stats
  const pendingJobRequests = jobRequests.filter(jr => jr.status === JobRequestStatus.Pending).length;

  // Applications by status
  const interviewingCount = applications.filter(app => app.status === 'Interviewing').length;
  const offeredCount = applications.filter(app => app.status === 'Offered').length;
  const rejectedCount = applications.filter(app => app.status === 'Rejected').length;

  const stats = [
    {
      title: 'Nhân Sự',
      value: totalTalents.toString(),
      change: 'Tổng số trong hệ thống',
      trend: 'up',
      color: 'blue',
      icon: Users
    },
    {
      title: 'Đối Tác',
      value: totalPartners.toString(),
      change: `${totalContracts} hợp đồng`,
      trend: 'up',
      color: 'orange',
      icon: Building2
    },
    {
      title: 'Yêu Cầu Tuyển Dụng',
      value: totalJobRequests.toString(),
      change: `${pendingJobRequests} chờ duyệt`,
      trend: 'up',
      color: 'purple',
      icon: Briefcase
    },    
    {
      title: 'Hồ Sơ Ứng Tuyển',
      value: totalApplications.toString(),
      change: `${interviewingCount} đang phỏng vấn`,
      trend: 'up',
      color: 'green',
      icon: ClipboardList
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-sky-100 text-sky-800';
      case 'Interviewing': return 'bg-cyan-100 text-cyan-800';
      case 'Offered': return 'bg-teal-100 text-teal-800';
      case 'Hired': return 'bg-purple-100 text-purple-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Submitted': return 'Đã nộp hồ sơ';
      case 'Interviewing': return 'Đang xem xét phỏng vấn';
      case 'Offered': return 'Đã bàn bạc';
      case 'Hired': return 'Đã tuyển';
      case 'Rejected': return 'Đã từ chối';
      case 'Withdrawn': return 'Đã rút';
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
                  {stat.icon && <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />}
                </div>
              </div>
              <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in mb-8">
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${activity.type === 'online'
                            ? 'bg-primary-100 group-hover:bg-primary-200'
                            : activity.type === 'offline'
                              ? 'bg-secondary-100 group-hover:bg-secondary-200'
                              : 'bg-neutral-100 group-hover:bg-neutral-200'
                          }`}>
                          {activity.type === 'online' && <Calendar className="w-4 h-4 text-primary-600" />}
                          {activity.type === 'offline' && <Briefcase className="w-4 h-4 text-secondary-600" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{activity.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">
                            {new Date(activity.scheduledDate).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <span className="text-xs text-neutral-400">•</span>
                          <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications by Status */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-gray-900">Thống Kê Ứng Tuyển Theo Trạng Thái</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{interviewingCount}</div>
                <div className="text-sm text-blue-600 mt-1">Đang Phỏng Vấn</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                <div className="text-2xl font-bold text-teal-700">{offeredCount}</div>
                <div className="text-sm text-teal-600 mt-1">Đã Đề Xuất</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-700">{hiredCount}</div>
                <div className="text-sm text-purple-600 mt-1">Đã Tuyển</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="text-2xl font-bold text-red-700">{rejectedCount}</div>
                <div className="text-sm text-red-600 mt-1">Đã Từ Chối</div>
              </div>
            </div>
          </div>
        </div>


        {/* Job Requests & Contracts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in mb-8">
          {/* Recent Job Requests */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Yêu Cầu Tuyển Dụng Gần Đây</h2>
                <button
                  onClick={() => navigate('/hr/job-requests')}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentJobRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có yêu cầu nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobRequests.map((jr) => (
                    <div
                      key={jr.id}
                      onClick={() => navigate(`/hr/job-requests/${jr.id}`)}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{jr.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {jr.companyName}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {jr.quantity} vị trí
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${jr.status === 'Chờ duyệt' ? 'bg-orange-100 text-orange-800' :
                            jr.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                              jr.status === 'Đã đóng' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                          }`}>
                          {jr.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Contracts */}
          <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Hợp Đồng Gần Đây</h2>
                <button
                  onClick={() => navigate('/hr/contracts')}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentContracts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có hợp đồng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => navigate(`/hr/contracts/${contract.id}`)}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{contract.contractNumber}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {contract.partnerName}
                          </span>
                          <span className="flex items-center">
                            <UserPlus className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            {contract.talentName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${contract.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                            contract.status?.toLowerCase() === 'pending' || contract.status?.toLowerCase() === 'draft' ? 'bg-orange-100 text-orange-800' :
                              contract.status?.toLowerCase() === 'expired' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {contract.status || 'N/A'}
                        </span>
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
                onClick={() => navigate('/hr/developers/create')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Thêm nhân sự mới</span>
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
