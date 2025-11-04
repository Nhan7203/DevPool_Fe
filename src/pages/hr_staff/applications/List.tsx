import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentApplicationService, type TalentApplication } from "../../../services/TalentApplication";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { userService, type User } from "../../../services/User";
import { 
  Search, 
  Filter, 
  Eye, 
  Briefcase, 
  Calendar,
  FileText,
  User as UserIcon,
  CheckCircle,
  XCircle,
  X,
  Send
} from "lucide-react";

type AugmentedTalentApplication = TalentApplication & {
  jobRequest?: {
    id: number;
    title: string;
    projectName?: string;
    clientCompanyName?: string;
  };
  talentCV?: {
    id: number;
    versionName: string;
    cvFileUrl: string;
  };
  submitterName?: string;
};

const statusLabels: Record<string, string> = {
  "Rejected": "Đã từ chối",
  "Interview": "Phỏng vấn",
  "InterviewScheduled": "Đã lên lịch phỏng vấn",
  "Submitted": "Đã lên lịch phỏng vấn",
  "Interviewing": "Đang xem xét phỏng vấn",
  "Offered": "Đã đề xuất",
  "Hired": "Đã tuyển",
  "Withdrawn": "Đã rút",
};

const statusColors: Record<string, string> = {
  "Rejected": "bg-red-100 text-red-800",
  "Interview": "bg-blue-100 text-blue-800",
  "InterviewScheduled": "bg-indigo-100 text-indigo-800",
  "Submitted": "bg-indigo-100 text-indigo-800",
  "Interviewing": "bg-cyan-100 text-cyan-800",
  "Hired": "bg-purple-100 text-purple-800",
  "Withdrawn": "bg-gray-100 text-gray-800",
  "Offered": "bg-teal-100 text-teal-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  "Rejected": <XCircle className="w-4 h-4" />,
  "Interview": <Calendar className="w-4 h-4" />,
  "InterviewScheduled": <Calendar className="w-4 h-4" />,
  "Submitted": <Calendar className="w-4 h-4" />,
  "Interviewing": <Eye className="w-4 h-4" />,
  "Hired": <CheckCircle className="w-4 h-4" />,
  "Withdrawn": <X className="w-4 h-4" />,
  "Offered": <Send className="w-4 h-4" />,
};

export default function TalentCVApplicationPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<AugmentedTalentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<AugmentedTalentApplication[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Stats data
  const stats = [
    {
      title: 'Tổng Hồ Sơ',
      value: applications.length.toString(),
      color: 'blue',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Đã Lên Lịch PV',
      value: applications.filter(a => a.status === 'InterviewScheduled').length.toString(),
      color: 'green',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: 'Đã Tuyển',
      value: applications.filter(a => a.status === 'Hired').length.toString(),
      color: 'orange',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Đang PV',
      value: applications.filter(a => a.status === 'Interview').length.toString(),
      color: 'purple',
      icon: <Calendar className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all applications
        const applicationsData = await talentApplicationService.getAll({ excludeDeleted: true });
        
        // Ensure applicationsData is an array
        if (!Array.isArray(applicationsData)) {
          console.error("❌ Response không phải là mảng:", applicationsData);
          setApplications([]);
          setFilteredApplications([]);
          return;
        }
        
        // Get unique IDs
        const jobRequestIds = [...new Set(applicationsData.map(a => a.jobRequestId))];
        const cvIds = [...new Set(applicationsData.map(a => a.cvId))];
        const userIds = [...new Set(applicationsData.map(a => a.submittedBy))];
        
        // Fetch job requests, CVs, and users in parallel
        const [jobRequestsData, cvsData, usersData] = await Promise.all([
          Promise.all(jobRequestIds.map(id => jobRequestService.getById(id))),
          Promise.all(cvIds.map(id => talentCVService.getById(id))),
          Promise.all(userIds.map(id => {
            try {
              return userService.getById(id);
            } catch {
              return null;
            }
          }))
        ]);

        // Create lookup maps
        const jobRequestMap = new Map(jobRequestsData.map((jr: JobRequest) => [jr.id, jr]));
        const cvMap = new Map(cvsData.map((cv: TalentCV) => [cv.id, cv]));
        const userMap = new Map(usersData.filter((u): u is User => u !== null).map((u: User) => [u.id, u]));

        // Augment applications with related data
        const augmented: AugmentedTalentApplication[] = applicationsData.map(app => {
          const jobRequest = jobRequestMap.get(app.jobRequestId);
          const talentCV = cvMap.get(app.cvId);
          const submitter = userMap.get(app.submittedBy);
          
          return {
            ...app,
            jobRequest: jobRequest ? {
              id: jobRequest.id,
              title: jobRequest.title,
            } : undefined,
            talentCV: talentCV ? {
              id: talentCV.id,
              versionName: talentCV.versionName,
              cvFileUrl: talentCV.cvFileUrl,
            } : undefined,
            submitterName: submitter?.fullName || app.submittedBy,
          };
        });

        setApplications(augmented);
        setFilteredApplications(augmented);
      } catch (err: unknown) {
        console.error("❌ Lỗi khi tải danh sách Applications:", err);
        if (err && typeof err === 'object' && 'message' in err) {
          console.error("❌ Chi tiết lỗi:", {
            message: (err as { message?: string }).message,
            response: (err as { response?: { data?: unknown; status?: number } }).response?.data,
            status: (err as { response?: { status?: number } }).response?.status,
            url: (err as { config?: { url?: string } }).config?.url
          });
        }
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...applications];
    if (searchTerm) {
      filtered = filtered.filter((a) => 
        a.jobRequest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.submitterName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus) filtered = filtered.filter((a) => a.status === filterStatus);
    setFilteredApplications(filtered);
  }, [searchTerm, filterStatus, applications]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
  };

  if (loading)
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý hồ sơ ứng tuyển</h1>
              <p className="text-neutral-600 mt-1">Danh sách các hồ sơ ứng viên đã nộp</p>
            </div>
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
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, tiêu đề yêu cầu..."
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-neutral-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 bg-white"
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">{showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Rejected">Đã từ chối</option>
                    <option value="Interview">Phỏng vấn</option>
                    <option value="InterviewScheduled">Đã lên lịch phỏng vấn</option>
                    <option value="Interviewing">Đang phỏng vấn</option>
                    <option value="Hired">Đã tuyển</option>
                    <option value="Withdrawn">Đã rút</option>
                    <option value="Offered">Đã đề xuất</option>
                  </select>
                  <button
                    onClick={handleResetFilters}
                    className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform"
                  >
                    <span className="font-medium">Đặt lại</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách hồ sơ</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Tổng: {filteredApplications.length} hồ sơ</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Người nộp</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Yêu cầu tuyển dụng</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Phiên bản CV</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Ngày nộp</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">Không có hồ sơ nào phù hợp</p>
                        <p className="text-neutral-400 text-sm mt-1">Thử thay đổi bộ lọc tìm kiếm</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app, i) => (
                    <tr
                      key={app.id}
                      className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">{app.submitterName || app.submittedBy}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-primary-700 font-medium">{app.jobRequest?.title ?? "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-neutral-700">{app.talentCV?.versionName ?? "—"}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status] ?? 'bg-gray-100 text-gray-800'}`}>
                          {statusIcons[app.status]}
                          {statusLabels[app.status] ?? app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm text-neutral-700">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/hr/applications/${app.id}`}
                          className="group inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium">Xem</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}