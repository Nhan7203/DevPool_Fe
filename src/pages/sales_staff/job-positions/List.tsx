import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";

export default function JobPositionListPage() {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<JobPosition[]>([]);

  // Filter & search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState<number | "">("");

  const [companies, setCompanies] = useState<ClientCompany[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [positionRes, companyRes] = await Promise.all([
          jobPositionService.getAll({ excludeDeleted: true }) as Promise<JobPosition[]>,
          clientCompanyService.getAll({ excludeDeleted: true }) as Promise<ClientCompany[]>
        ]);

        setPositions(positionRes);
        setFilteredPositions(positionRes);
        setCompanies(companyRes);
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

    if (filterCompany) {
      filtered = filtered.filter(p => p.clientCompanyId === Number(filterCompany));
    }

    setFilteredPositions(filtered);
  }, [searchTerm, filterCompany, positions]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
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
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Vị trí Tuyển dụng</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các vị trí tuyển dụng từ các công ty khách hàng.</p>
          </div>
          <Button
            className="bg-primary-600 hover:bg-primary-700 text-white"
            onClick={() => window.location.href = "/sales/job-positions/create"}
          >
            + Tạo vị trí mới
          </Button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên vị trí..."
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-xl border border-gray-200"
            value={filterCompany}
            onChange={(e) => setFilterCompany(Number(e.target.value))}
          >
            <option value="">Tất cả công ty</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
            onClick={handleResetFilters}
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
                <th className="text-left py-2 px-4">Tên vị trí</th>
                <th className="text-left py-2 px-4">Công ty KH</th>
                <th className="text-left py-2 px-4">Cấp độ</th>
                <th className="text-left py-2 px-4">Trạng thái</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((p, i) => {
                const company = companies.find(c => c.id === p.clientCompanyId);
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4">{i + 1}</td>
                    <td className="py-2 px-4 font-medium text-primary-700">{p.name}</td>
                    <td className="py-2 px-4">{company?.name ?? "—"}</td>
                    <td className="py-2 px-4">{["Junior","Middle","Senior","Lead"][p.level] ?? "—"}</td>
                    <td className="py-2 px-4">{p.isActive ? "Hoạt động" : "Không hoạt động"}</td>
                    <td className="py-2 px-4">
                      <Button
                        className="text-blue-600 hover:underline"
                        onClick={() => window.location.href = `/sales/job-positions/${p.id}`}
                      >
                        Xem chi tiết
                      </Button>
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
