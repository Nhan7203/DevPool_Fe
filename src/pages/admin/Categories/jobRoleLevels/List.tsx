import { useEffect, useState } from "react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { Button } from "../../../../components/ui/button";
import { jobRoleLevelService, type JobRoleLevel } from "../../../../services/JobRoleLevel";
import { jobRoleService, type JobRole } from "../../../../services/JobRole";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function JobRoleLevelListPage() {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<JobRoleLevel[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<JobRoleLevel[]>([]);

  // Filter & search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<number | "">("");

  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [positionRes, roles] = await Promise.all([
          jobRoleLevelService.getAll({ excludeDeleted: true }) as Promise<JobRoleLevel[]>,
          jobRoleService.getAll({ excludeDeleted: true }) as Promise<JobRole[]>
        ]);

        setPositions(positionRes);
        setFilteredPositions(positionRes);
        setJobRoles(roles);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu vị trí tuyển dụng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter effect
  useEffect(() => {
    let filtered = [...positions];

    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterRole) {
      filtered = filtered.filter(p => p.jobRoleId === Number(filterRole));
    }

    setFilteredPositions(filtered);
  }, [searchTerm, filterRole, positions]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRole("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách vị trí tuyển dụng...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />
      <div className="flex-1 p-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Vị trí Tuyển dụng</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các vị trí tuyển dụng từ các công ty khách hàng.</p>
          </div>
          <Button
            className="bg-primary-600 hover:bg-primary-700 text-white"
            onClick={() => window.location.href = "/admin/categories/job-role-levels/create"}
          >
            + Tạo vị trí mới
          </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
          <div className="p-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vị trí..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-xl border border-gray-200"
            value={filterRole}
            onChange={(e) => setFilterRole(Number(e.target.value))}
          >
            <option value="">Tất cả loại vị trí</option>
            {jobRoles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
            onClick={handleResetFilters}
          >
            Reset
          </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách vị trí</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Tổng: {filteredPositions.length} vị trí</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tên vị trí</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Loại vị trí</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Cấp độ</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Giá min</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Giá max</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredPositions.map((p, i) => {
                  const role = jobRoles.find(r => r.id === p.jobRoleId);
                  return (
                    <tr key={p.id} className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300">
                      <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                          {p.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-neutral-700">{role?.name ?? "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {"Junior,Middle,Senior,Lead".split(",")[p.level] ?? "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">{p.minManMonthPrice ?? "—"}</td>
                      <td className="py-4 px-6">{p.maxManMonthPrice ?? "—"}</td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/admin/categories/job-role-levels/${p.id}`}
                          className="group inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                        >
                          <span className="text-sm font-medium">Xem</span>
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
    </div>
  );
}
