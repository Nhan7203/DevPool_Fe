import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { Search, Filter } from "lucide-react";

type AugmentedJobRequest = JobRequest & {
  projectName: string;
  clientCompanyName: string;
  jobPositionName: string;
};

// Mappings for level and status
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

export default function JobRequestListPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AugmentedJobRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AugmentedJobRequest[]>([]);

  // Bộ lọc
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
          } as AugmentedJobRequest;
        });

        setRequests(merged);
        setFilteredRequests(merged);
      } catch (err) {
        console.error("❌ Lỗi khi load Job Requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Lọc dữ liệu
  useEffect(() => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCompany) {
      filtered = filtered.filter((r) =>
        r.clientCompanyName.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }
    if (filterProject) {
      filtered = filtered.filter((r) =>
        r.projectName.toLowerCase().includes(filterProject.toLowerCase())
      );
    }
    if (filterPosition) {
      filtered = filtered.filter((r) =>
        r.jobPositionName.toLowerCase().includes(filterPosition.toLowerCase())
      );
    }
    if (filterStatus) {
      filtered = filtered.filter(
        (r) => r.status === Number(filterStatus) 
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, filterCompany, filterProject, filterPosition, filterStatus, requests]);


  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
    setFilterProject("");
    setFilterPosition("");
    setFilterStatus("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách yêu cầu tuyển dụng...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Yêu cầu Tuyển dụng</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các yêu cầu tuyển dụng từ các công ty khách hàng.</p>
          </div>
          <Link to="/sales/job-requests/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo yêu cầu mới</Button>
          </Link>
        </div>

        {/* 🔍 Search & Filter UI */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề yêu cầu..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>

          {showFilters && (
            <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Công ty KH</label>
                <input
                  type="text"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  placeholder="Tên công ty..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
                <input
                  type="text"
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  placeholder="Tên dự án..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                <input
                  type="text"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  placeholder="Tên vị trí..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="0">Chưa duyệt</option>
                  <option value="1">Đã duyệt</option>
                  <option value="2">Đã đóng</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🧾 Bảng danh sách */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tiêu đề</th>
                <th className="text-left py-2 px-4">Công ty KH</th>
                <th className="text-left py-2 px-4">Dự án</th>
                <th className="text-left py-2 px-4">Vị trí</th>
                <th className="text-left py-2 px-4">Cấp độ</th>
                <th className="text-left py-2 px-4">Số lượng</th>
                <th className="text-left py-2 px-4">Ngân sách (VNĐ/tháng)</th>
                <th className="text-left py-2 px-4">Trạng thái</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">{r.title}</td>
                  <td className="py-2 px-4">{r.clientCompanyName}</td>
                  <td className="py-2 px-4">{r.projectName}</td>
                  <td className="py-2 px-4">{r.jobPositionName}</td>
                  <td className="py-2 px-4">{levelLabels[r.level]}</td>
                  <td className="py-2 px-4 text-center">{r.quantity}</td>
                  <td className="py-2 px-4">
                    {typeof r.budgetPerMonth === "number" ? r.budgetPerMonth.toLocaleString("vi-VN") : "—"}
                  </td>
                  <td className="py-2 px-4">
                    {statusLabels[r.status]}
                  </td>
                  <td className="py-2 px-4">
                    <Link to={`/sales/job-requests/${r.id}`} className="text-blue-600 hover:underline">
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
