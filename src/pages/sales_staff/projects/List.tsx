import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type Project } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";

export default function ProjectListPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<ClientCompany[]>([]);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectRes, companyRes] = await Promise.all([
          projectService.getAll({ excludeDeleted: true }),
          clientCompanyService.getAll({ excludeDeleted: true }),
        ]);

        setProjects(projectRes);
        setFilteredProjects(projectRes);
        setCompanies(companyRes);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách dự án:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCompany) {
      filtered = filtered.filter((p) => {
        const company = companies.find(c => c.id === p.clientCompanyId);
        return company?.name.toLowerCase().includes(filterCompany.toLowerCase());
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, filterCompany, filterStatus, projects, companies]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
    setFilterStatus("");
  };

  const statusLabels: Record<string, string> = {
  Planned: "Đã lên kế hoạch",
  Ongoing: "Đang thực hiện",
  Completed: "Đã hoàn thành",
};

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Đang tải danh sách dự án...</div>;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Dự án</h1>
            <p className="text-neutral-600 mt-1">Quản lý các dự án của khách hàng.</p>
          </div>
          <Link to="/sales/projects/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo dự án mới</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên dự án..."
            className="flex-1 border rounded-xl px-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tên công ty..."
            className="border rounded-xl px-4 py-2"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tên dự án</th>
                <th className="text-left py-2 px-4">Công ty KH</th>
                <th className="text-left py-2 px-4">Ngày bắt đầu</th>
                <th className="text-left py-2 px-4">Ngày kết thúc</th>
                <th className="text-left py-2 px-4">Trạng thái</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p, i) => {
                const company = companies.find(c => c.id === p.clientCompanyId);
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4">{i + 1}</td>
                    <td className="py-2 px-4 font-medium text-primary-700">{p.name}</td>
                    <td className="py-2 px-4">{company?.name ?? "—"}</td>
                    <td className="py-2 px-4">{p.startDate}</td>
                    <td className="py-2 px-4">{p.endDate ?? "—"}</td>
                    <td className="py-2 px-4">{statusLabels[p.status] || "—"}</td>
                    <td className="py-2 px-4">
                      <Link to={`/sales/projects/${p.id}`} className="text-blue-600 hover:underline">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
