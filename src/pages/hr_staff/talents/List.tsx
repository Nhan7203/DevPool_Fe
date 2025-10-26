import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Users,
  Briefcase,
  MapPin,
  Globe,
  Eye,
  Plus,
} from "lucide-react";

import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { talentService, type Talent } from "../../../services/Talent";
import { WorkingMode } from "../../../types/WorkingMode";

// Mapping WorkingMode values to Vietnamese names
const workingModeLabels: Record<number, string> = {
  [WorkingMode.None]: "Không xác định",
  [WorkingMode.Onsite]: "Tại văn phòng",
  [WorkingMode.Remote]: "Làm việc từ xa",
  [WorkingMode.Hybrid]: "Kết hợp",
  [WorkingMode.Flexible]: "Linh hoạt",
};
import { locationService, type Location } from "../../../services/location";

export default function ListDev() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Bộ lọc
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWorkingMode, setFilterWorkingMode] = useState("");

  // Thống kê
  const stats = [
    {
      title: "Tổng Talent",
      value: talents.length.toString(),
      color: "blue",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Đang rảnh (Available)",
      value: talents.filter((t) => t.status === "Available").length.toString(),
      color: "green",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      title: "Đang bận (Busy)",
      value: talents.filter((t) => t.status === "Busy").length.toString(),
      color: "orange",
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      title: "Làm việc từ xa (Remote)",
      value: talents
        .filter((t) => t.workingMode === WorkingMode.Remote)
        .length.toString(),
      color: "purple",
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  // Lấy dữ liệu talent + location
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [talentData, locationData] = await Promise.all([
          talentService.getAll(),
          locationService.getAll({ excludeDeleted: true }),
        ]);
        setTalents(talentData);
        setFilteredTalents(talentData);
        setLocations(locationData);
      } catch (err) {
        console.error("❌ Không thể tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc dữ liệu
  useEffect(() => {
    let filtered = [...talents];

    if (searchTerm)
      filtered = filtered.filter((t) =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (filterLocation)
      filtered = filtered.filter((t) => {
        const locationName =
          locations.find((loc) => loc.id === t.locationId)?.name || "";
        return locationName
          .toLowerCase()
          .includes(filterLocation.toLowerCase());
      });

    if (filterStatus)
      filtered = filtered.filter((t) => t.status === filterStatus);

    if (filterWorkingMode)
      filtered = filtered.filter(
        (t) => t.workingMode === Number(filterWorkingMode)
      );

    setFilteredTalents(filtered);
  }, [searchTerm, filterLocation, filterStatus, filterWorkingMode, talents, locations]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLocation("");
    setFilterStatus("");
    setFilterWorkingMode("");
  };

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Tiêu đề */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Danh Sách Talent
              </h1>
              <p className="text-neutral-600 mt-1">
                Quản lý và theo dõi developer trong hệ thống DevPool
              </p>
            </div>
            <Link to="/hr/developers/create">
              <Button className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 py-3 shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Tạo Talent mới
              </Button>
            </Link>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                      stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                        stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                          'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                    } transition-all duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên Talent..."
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-neutral-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 bg-white"
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">
                  {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Tên khu vực làm việc..."
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <select
                    value={filterWorkingMode}
                    onChange={(e) => setFilterWorkingMode(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white"
                  >
                    <option value="">Tất cả hình thức làm việc</option>
                    <option value={WorkingMode.Remote.toString()}>Làm việc từ xa</option>
                    <option value={WorkingMode.Onsite.toString()}>Tại văn phòng</option>
                    <option value={WorkingMode.Hybrid.toString()}>Kết hợp</option>
                    <option value={WorkingMode.Flexible.toString()}>Linh hoạt</option>
                  </select>
                  <button
                    onClick={handleResetFilters}
                    className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách Talent</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Tổng: {filteredTalents.length} người</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase">
                    #
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase">
                    Họ và tên
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase">
                    Khu vực làm việc
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase">
                    Hình thức làm việc
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredTalents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">Không có talent nào phù hợp</p>
                        <p className="text-neutral-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo talent mới</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTalents.map((t, i) => {
                    const locationName =
                      locations.find((loc) => loc.id === t.locationId)?.name ||
                      "—";
                    return (
                      <tr
                        key={t.id}
                        className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                            {t.fullName}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700">{t.email || "—"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700">{locationName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Globe className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700">{workingModeLabels[t.workingMode] || "Không xác định"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              t.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : t.status === "Busy"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            to={`/hr/developers/${t.id}`}
                            className="group inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm font-medium">Xem</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
