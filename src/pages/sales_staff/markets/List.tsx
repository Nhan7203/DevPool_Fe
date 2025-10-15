import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { marketService, type Market } from "../../../services/Market";

export default function MarketListPage() {
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load dữ liệu
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data = await marketService.getAll({ excludeDeleted: true });
        setMarkets(data);
        setFilteredMarkets(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách thị trường:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = markets.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMarkets(filtered);
  }, [searchTerm, markets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách thị trường...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Thị trường</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các thị trường đang quản lý.</p>
          </div>
          <Link to="/sales/markets/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Tạo mới</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã thị trường..."
            className="w-full max-w-sm border rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tên</th>
                <th className="text-left py-2 px-4">Mã</th>
                <th className="text-left py-2 px-4">Mô tả</th>
                <th className="text-left py-2 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.map((m, i) => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">{m.name}</td>
                  <td className="py-2 px-4">{m.code}</td>
                  <td className="py-2 px-4">{m.description ?? "—"}</td>
                  <td className="py-2 px-4 space-x-2">
                    <Link
                      to={`/sales/markets/${m.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem
                    </Link>
                    <Link
                      to={`/sales/markets/edit/${m.id}`}
                      className="text-green-600 hover:underline"
                    >
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredMarkets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    Không có dữ liệu
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
