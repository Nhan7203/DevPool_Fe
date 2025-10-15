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
  const [filterCode, setFilterCode] = useState("");

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoading(true);
        const data = await industryService.getAll({ excludeDeleted: true });
        setIndustries(data);
        setFilteredIndustries(data);
      } catch (err) {
        console.error("❌ Lỗi khi load danh sách lĩnh vực:", err);
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

    if (filterCode) {
      filtered = filtered.filter((i) =>
        i.code.toLowerCase().includes(filterCode.toLowerCase())
      );
    }

    setFilteredIndustries(filtered);
  }, [searchTerm, filterCode, industries]);

  const handleResetFilters = () => {
  setSearchTerm("");
  setFilterCode("");
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách lĩnh vực...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách lĩnh vực</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các lĩnh vực có trong hệ thống.</p>
          </div>
          <Link to="/sales/industries/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo lĩnh vực mới</Button>
          </Link>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên lĩnh vực..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã lĩnh vực</label>
                <input
                  type="text"
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  placeholder="Nhập mã lĩnh vực..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
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
                <th className="text-left py-2 px-4">Tên lĩnh vực</th>
                <th className="text-left py-2 px-4">Mã</th>
                <th className="text-left py-2 px-4">Mô tả</th>
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
