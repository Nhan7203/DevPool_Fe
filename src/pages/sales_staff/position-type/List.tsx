import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { positionTypeService, type PositionType } from "../../../services/PositionType";
import { Search } from "lucide-react";

export default function PositionTypeListPage() {
  const [loading, setLoading] = useState(true);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [filteredPositionTypes, setFilteredPositionTypes] = useState<PositionType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await positionTypeService.getAll();
        setPositionTypes(data);
        setFilteredPositionTypes(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách Position Type:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter theo search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPositionTypes(positionTypes);
      return;
    }

    const filtered = positionTypes.filter((pt) =>
      pt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPositionTypes(filtered);
  }, [searchTerm, positionTypes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách loại vị trí...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Kiểu Vị Trí</h1>
            <p className="text-neutral-600 mt-1">Quản lý các loại vị trí tuyển dụng.</p>
          </div>
          <Link to="/sales/position-type/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo kiểu vị trí mới</Button>
          </Link>
        </div>

        {/* 🔍 Search */}
        <div className="mb-6 w-full md:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🧾 Bảng danh sách */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tên loại vị trí</th>
                <th className="text-left py-2 px-4">Mô tả</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositionTypes.map((pt, i) => (
                <tr key={pt.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">{pt.name}</td>
                  <td className="py-2 px-4">{pt.description || "—"}</td>
                  <td className="py-2 px-4">
                    <Link
                      to={`/sales/position-type/${pt.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredPositionTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    Không có loại vị trí nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
