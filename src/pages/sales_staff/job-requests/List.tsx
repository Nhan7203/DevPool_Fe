import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { jobRequestService, type JobRequest, JobRequestStatus } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Briefcase, 
  DollarSign,
  Calendar,
  Building2,
  Target
} from "lucide-react";

type AugmentedJobRequest = JobRequest & {
  projectName: string;
  clientCompanyName: string;
};

const statusLabels: Record<number, string> = {
  0: "Chờ duyệt",
  1: "Đã duyệt",
  2: "Đã đóng",
  3: "Bị từ chối",
};

const statusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-gray-200 text-gray-700",
  3: "bg-red-100 text-red-800",
};

export default function JobRequestListPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AugmentedJobRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AugmentedJobRequest[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterJobRoleLevel, setFilterJobRoleLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Stats data
  const stats = [
    {
      title: 'Tổng Yêu Cầu',
      value: requests.length.toString(),
      color: 'blue',
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      title: 'Đã Duyệt',
      value: requests.filter(r => r.status === JobRequestStatus.Approved).length.toString(),
      color: 'green',
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'Chờ Duyệt',
      value: requests.filter(r => r.status === JobRequestStatus.Pending).length.toString(),
      color: 'orange',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: 'Tổng Ngân Sách',
      value: requests.reduce((sum, r) => sum + (r.budgetPerMonth || 0), 0).toLocaleString('vi-VN'),
      color: 'purple',
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqRes, companyRes, projectRes, positionRes] = await Promise.all([
          jobRequestService.getAll() as Promise<JobRequest[]>,
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          projectService.getAll() as Promise<Project[]>,
          jobRoleLevelService.getAll() as Promise<JobRoleLevel[]>,
        ]);

        const companyDict: Record<number, string> = {};
        companyRes.forEach((c) => (companyDict[c.id] = c.name));

        const projectDict: Record<number, { name: string; clientCompanyId: number }> = {};
        projectRes.forEach((p) => {
          projectDict[p.id] = { name: p.name, clientCompanyId: p.clientCompanyId };
        });
        
        const merged: AugmentedJobRequest[] = reqRes.map((r) => {
          const projectInfo = projectDict[r.projectId];
          const clientCompanyName = projectInfo ? companyDict[projectInfo.clientCompanyId] ?? "—" : "—";
          return {
            ...r,
            projectName: projectInfo?.name ?? "—",
            clientCompanyName,
          };
        });

        setRequests(merged);
        setFilteredRequests(merged);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách Job Requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...requests];
    if (searchTerm) filtered = filtered.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterCompany) filtered = filtered.filter((r) => r.clientCompanyName.toLowerCase().includes(filterCompany.toLowerCase()));
    if (filterProject) filtered = filtered.filter((r) => r.projectName.toLowerCase().includes(filterProject.toLowerCase()));
    if (filterStatus) filtered = filtered.filter((r) => r.status === Number(filterStatus));
    setFilteredRequests(filtered);
  }, [searchTerm, filterCompany, filterProject, filterJobRoleLevel, filterStatus, requests]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
    setFilterProject("");
    setFilterJobRoleLevel("");
    setFilterStatus("");
  };

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
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
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yêu cầu tuyển dụng</h1>
              <p className="text-neutral-600 mt-1">Quản lý và theo dõi các yêu cầu từ công ty khách hàng</p>
            </div>
            <Link to="/sales/job-requests/create">
              <Button className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 py-3 shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Tạo yêu cầu mới
              </Button>
            </Link>
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
                  placeholder="Tìm kiếm theo tiêu đề, công ty, dự án..."
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
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Công ty khách hàng"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Dự án"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="0">Chưa duyệt</option>
                    <option value="1">Đã duyệt</option>
                    <option value="2">Đã đóng</option>
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
              <h2 className="text-lg font-semibold text-gray-900">Danh sách yêu cầu</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Tổng: {filteredRequests.length} yêu cầu</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tiêu đề</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Công ty KH</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Dự án</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Số lượng</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Ngân sách</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <Briefcase className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">Không có yêu cầu nào phù hợp</p>
                        <p className="text-neutral-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo yêu cầu mới</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r, i) => (
                    <tr
                      key={r.id}
                      className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                          {r.title}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{r.clientCompanyName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{r.projectName}</span>
                        </div>
                      </td>                    
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-medium text-neutral-700">{r.quantity}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">
                            {r.budgetPerMonth?.toLocaleString("vi-VN") ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/sales/job-requests/${r.id}`}
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
