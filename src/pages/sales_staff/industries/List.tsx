import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { industryService, type Industry } from "../../../services/Industry";
import { Search, Filter } from "lucide-react";

export default function IndustryListPage() {
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [filteredIndustries, setFilteredIndustries] = useState<Industry[]>([]);

  // Bộ lọc
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState("");

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoading(true);
        const data = await industryService.getAll({ excludeDeleted: false });
        setIndustries(data);
        setFilteredIndustries(data);
      } catch (err) {
        console.error("❌ Lỗi khi load danh sách ngành nghề:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // 🔍 Lọc dữ liệu
  useEffect(() => {
    let filtered = [...industries];

    if (searchTerm) {
      filtered = filtered.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDeleted) {
      const isDeleted = filterDeleted === "true";
      filtered = filtered.filter((i) => i.isDeleted === isDeleted);
    }

    setFilteredIndustries(filtered);
  }, [searchTerm, filterDeleted, industries]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterDeleted("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách ngành nghề...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Ngành nghề</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các ngành nghề có trong hệ thống.</p>
          </div>
          <Link to="/sales/industries/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo ngành nghề mới</Button>
          </Link>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên ngành nghề..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>

          {showFilters && (
            <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={filterDeleted}
                  onChange={(e) => setFilterDeleted(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="false">Đang sử dụng</option>
                  <option value="true">Đã xóa</option>
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
                <th className="text-left py-2 px-4">Tên ngành nghề</th>
                <th className="text-left py-2 px-4">Mã</th>
                <th className="text-left py-2 px-4">Mô tả</th>
                <th className="text-left py-2 px-4">Trạng thái</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndustries.map((i, idx) => (
                <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">{i.name}</td>
                  <td className="py-2 px-4">{i.code}</td>
                  <td className="py-2 px-4">{i.description || "—"}</td>
                  <td className="py-2 px-4">{i.isDeleted ? "Đã xóa" : "Đang sử dụng"}</td>
                  <td className="py-2 px-4">
                    <Link to={`/sales/industries/${i.id}`} className="text-blue-600 hover:underline">
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
