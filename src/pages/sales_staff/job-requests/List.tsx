import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { Search, Filter, Eye } from "lucide-react";

type AugmentedJobRequest = JobRequest & {
  projectName: string;
  clientCompanyName: string;
  jobPositionName: string;
};

const levelLabels: Record<number, string> = {
  0: "Junior",
  1: "Middle",
  2: "Senior",
  3: "Lead",
};

const statusLabels: Record<number, string> = {
  0: "Chưa duyệt",
  1: "Đã duyệt",
  2: "Đã đóng",
};

const statusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-gray-200 text-gray-700",
};

export default function JobRequestListPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AugmentedJobRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AugmentedJobRequest[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqRes, companyRes, projectRes, positionRes] = await Promise.all([
          jobRequestService.getAll() as Promise<JobRequest[]>,
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          projectService.getAll() as Promise<Project[]>,
          jobPositionService.getAll() as Promise<JobPosition[]>,
        ]);

        const companyDict: Record<number, string> = {};
        companyRes.forEach((c) => (companyDict[c.id] = c.name));

        const projectDict: Record<number, { name: string; clientCompanyId: number }> = {};
        projectRes.forEach((p) => {
          projectDict[p.id] = { name: p.name, clientCompanyId: p.clientCompanyId };
        });

        const positionDict: Record<number, string> = {};
        positionRes.forEach((p) => (positionDict[p.id] = p.name));

        const merged: AugmentedJobRequest[] = reqRes.map((r) => {
          const projectInfo = projectDict[r.projectId];
          const clientCompanyName = projectInfo ? companyDict[projectInfo.clientCompanyId] ?? "—" : "—";
          return {
            ...r,
            projectName: projectInfo?.name ?? "—",
            clientCompanyName,
            jobPositionName: positionDict[r.jobPositionId] ?? "—",
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
    if (filterPosition) filtered = filtered.filter((r) => r.jobPositionName.toLowerCase().includes(filterPosition.toLowerCase()));
    if (filterStatus) filtered = filtered.filter((r) => r.status === Number(filterStatus));
    setFilteredRequests(filtered);
  }, [searchTerm, filterCompany, filterProject, filterPosition, filterStatus, requests]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
    setFilterProject("");
    setFilterPosition("");
    setFilterStatus("");
  };

  if (loading)
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yêu cầu tuyển dụng</h1>
            <p className="text-gray-600 mt-1">Danh sách các yêu cầu từ công ty khách hàng</p>
          </div>
          <Link to="/sales/job-requests/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5">
              + Tạo yêu cầu mới
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              <input
                type="text"
                placeholder="Công ty khách hàng"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              />
              <input
                type="text"
                placeholder="Dự án"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              />
              <input
                type="text"
                placeholder="Vị trí"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Trạng thái</option>
                <option value="0">Chưa duyệt</option>
                <option value="1">Đã duyệt</option>
                <option value="2">Đã đóng</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                Đặt lại
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Công ty KH</th>
                <th className="py-3 px-4 text-left">Dự án</th>
                <th className="py-3 px-4 text-left">Vị trí</th>
                <th className="py-3 px-4 text-left">Cấp độ</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4 text-right">Ngân sách (VNĐ)</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-6">
                    Không có yêu cầu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-primary-700">{r.title}</td>
                    <td className="py-3 px-4">{r.clientCompanyName}</td>
                    <td className="py-3 px-4">{r.projectName}</td>
                    <td className="py-3 px-4">{r.jobPositionName}</td>
                    <td className="py-3 px-4">{levelLabels[r.level]}</td>
                    <td className="py-3 px-4 text-center">{r.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      {r.budgetPerMonth?.toLocaleString("vi-VN") ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}
                      >
                        {statusLabels[r.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/sales/job-requests/${r.id}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Xem
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
  );
}
