import { useEffect, useState } from "react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Search, Filter } from "lucide-react";

export default function ClientCompanyListPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ClientCompany[]>([]);

  // Filter & search
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterContactPerson, setFilterContactPerson] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await clientCompanyService.getAll();
        setCompanies(res);
        setFilteredCompanies(res);
      } catch (err) {
        console.error("❌ Lỗi khi load danh sách công ty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...companies];

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterEmail) {
      filtered = filtered.filter((c) =>
        c.email.toLowerCase().includes(filterEmail.toLowerCase())
      );
    }
    if (filterContactPerson) {
      filtered = filtered.filter((c) =>
        c.contactPerson.toLowerCase().includes(filterContactPerson.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, filterEmail, filterContactPerson, companies]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterEmail("");
    setFilterContactPerson("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách công ty khách hàng...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Công ty KH</h1>
            <p className="text-neutral-600 mt-1">Tổng hợp các công ty khách hàng.</p>
          </div>
          <Link to="/sales/client-companies/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">+ Thêm công ty mới</Button>
          </Link>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên công ty..."
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
            <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder="Email công ty..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                <input
                  type="text"
                  value={filterContactPerson}
                  onChange={(e) => setFilterContactPerson(e.target.value)}
                  placeholder="Tên người liên hệ..."
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
                <th className="text-left py-2 px-4">Tên công ty</th>
                <th className="text-left py-2 px-4">Người liên hệ</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Số điện thoại</th>
                <th className="text-left py-2 px-4">Địa chỉ</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c, i) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">{c.name}</td>
                  <td className="py-2 px-4">{c.contactPerson}</td>
                  <td className="py-2 px-4">{c.email}</td>
                  <td className="py-2 px-4">{c.phone ?? "—"}</td>
                  <td className="py-2 px-4">{c.address ?? "—"}</td>
                  <td className="py-2 px-4">
                    <Link to={`/sales/clients/${c.id}`} className="text-blue-600 hover:underline">
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
