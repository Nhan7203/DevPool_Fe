import { useEffect, useState, type ReactNode } from "react";
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, Target, Handshake, FileText,
  TrendingUp, Clock, Briefcase, AlertCircle, XCircle
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import { sidebarItems } from "../../components/sales_staff/SidebarItems";
import { jobRequestService, type JobRequest, JobRequestStatus } from "../../services/JobRequest";
import { talentApplicationService, type TalentApplication } from "../../services/TalentApplication";
import { clientCompanyService, type ClientCompany } from "../../services/ClientCompany";
import { projectService, type Project } from "../../services/Project";

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [applications, setApplications] = useState<TalentApplication[]>([]);
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const ensureArray = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: T[] }).data;
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobRequestsData, applicationsData, clientCompaniesData, projectsData] = await Promise.all([
          jobRequestService.getAll({ excludeDeleted: true }),
          talentApplicationService.getAll({ excludeDeleted: true }),
          clientCompanyService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true })
        ]);

        setJobRequests(ensureArray<JobRequest>(jobRequestsData));
        setApplications(ensureArray<TalentApplication>(applicationsData));
        setClientCompanies(ensureArray<ClientCompany>(clientCompaniesData));
        setProjects(ensureArray<Project>(projectsData));
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu dashboard Sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalJobRequests = jobRequests.length;
  const approvedJobRequests = jobRequests.filter(jr => jr.status === JobRequestStatus.Approved).length;
  const pendingJobRequests = jobRequests.filter(jr => jr.status === JobRequestStatus.Pending).length;
  const closedJobRequests = jobRequests.filter(jr => jr.status === JobRequestStatus.Closed).length;

  const totalApplications = applications.length;
  const interviewScheduledApplications = applications.filter(app => app.status === "Interviewing").length;
  const interviewingApplications = applications.filter(app => app.status === "Interviewing").length;
  const hiredApplications = applications.filter(app => app.status === "Hired").length;
  const rejectedApplications = applications.filter(app => app.status === "Rejected").length;
  const withdrawnApplications = applications.filter(app => app.status === "Withdrawn").length;

  const activeClientCompanies = clientCompanies.filter(company => !company.isDeleted).length;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const newClientsThisMonth = clientCompanies.filter(company => {
    if (!company.createdAt) return false;
    const createdDate = new Date(company.createdAt);
    if (Number.isNaN(createdDate.getTime())) return false;
    return createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
  }).length;

  const totalProjects = projects.length;
  const activeProjects = projects.filter(project => project.status?.toLowerCase() === "active").length;

  const monthlyPipelineData = (() => {
    const map = new Map<string, { pipeline: number; won: number }>();

    applications.forEach(app => {
      const createdDate = new Date(app.createdAt);
      if (Number.isNaN(createdDate.getTime())) return;
      const key = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, { pipeline: 0, won: 0 });
      }
      const entry = map.get(key)!;
      entry.pipeline += 1;
      if (app.status === "Hired") {
        entry.won += 1;
      }
    });

    const results: { month: string; pipeline: number; won: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = `T${date.getMonth() + 1}`;
      const entry = map.get(key) ?? { pipeline: 0, won: 0 };
      results.push({ month: label, pipeline: entry.pipeline, won: entry.won });
    }

    return results;
  })();

  const stageFunnelData = [
    { stage: "Đã lên lịch", count: interviewScheduledApplications },
    { stage: "Phỏng vấn", count: interviewingApplications },
    { stage: "Đã tuyển", count: hiredApplications },
    { stage: "Từ chối", count: rejectedApplications },
    { stage: "Đã rút", count: withdrawnApplications }
  ].filter(item => item.count > 0);

  const stageFunnelChartData = stageFunnelData.length > 0
    ? stageFunnelData
    : [{ stage: "Chưa có dữ liệu", count: 0 }];

  const primaryStats = [
    {
      title: "Yêu cầu tuyển dụng",
      value: totalJobRequests.toString(),
      description: `${approvedJobRequests} yêu cầu đã duyệt`,
      icon: Target,
      color: "primary"
    },
    {
      title: "Hồ sơ ứng tuyển",
      value: totalApplications.toString(),
      description: `${interviewingApplications} hồ sơ đang xử lý`,
      icon: FileText,
      color: "secondary"
    },
    {
      title: "Công ty khách hàng",
      value: activeClientCompanies.toString(),
      description: `${newClientsThisMonth} công ty mới trong tháng`,
      icon: Users,
      color: "accent"
    },
    {
      title: "Dự án đang theo dõi",
      value: totalProjects.toString(),
      description: `${activeProjects} dự án đang hoạt động`,
      icon: Briefcase,
      color: "purple"
    }
  ];

  const secondaryStats = [
    {
      title: "Hồ sơ đã tuyển",
      value: hiredApplications.toString(),
      description: "Ứng viên đã nhận offer",
      icon: Handshake,
      color: "green"
    },
    {
      title: "Hồ sơ đã rút",
      value: withdrawnApplications.toString(),
      description: "Ứng viên đã rời khỏi quy trình",
      icon: XCircle,
      color: "orange"
    },
    {
      title: "Hồ sơ bị từ chối",
      value: rejectedApplications.toString(),
      description: "Ứng viên không phù hợp",
      icon: AlertCircle,
      color: "red"
    },
    {
      title: "YC chờ duyệt",
      value: pendingJobRequests.toString(),
      description: `${closedJobRequests} yêu cầu đã đóng`,
      icon: Clock,
      color: "warning"
    }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-neutral-600">Theo dõi hiệu suất và pipeline bán hàng</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
              {primaryStats.map((stat, index) => (
                <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color === 'primary' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                      stat.color === 'secondary' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                        stat.color === 'accent' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                          stat.color === 'purple' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' :
                            'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                      } transition-all duration-300`}>
                      {stat.icon && <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />}
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                    <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
              {secondaryStats.map((stat, index) => (
                <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color === 'green' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' :
                      stat.color === 'orange' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-200' :
                        stat.color === 'red' ? 'bg-red-100 text-red-600 group-hover:bg-red-200' :
                          stat.color === 'warning' ? 'bg-warning-100 text-warning-600 group-hover:bg-warning-200' :
                            'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                      } transition-all duration-300`}>
                      {stat.icon && <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />}
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                    <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Pipeline theo tháng">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPipelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => value.toString()} />
                    <Legend />
                    <Line type="monotone" dataKey="pipeline" name="Hồ sơ mới" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="won" name="Đã tuyển" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Phễu tuyển dụng">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageFunnelChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
