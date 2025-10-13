import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  UserCheck,
  Clock,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";

interface Contract {
  id: string;
  contractNumber: string;
  developerName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "completed" | "terminated";
  value: number;
  type: string;
}

export default function DevContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockContracts: Contract[] = [
      {
        id: "1",
        contractNumber: "CTR-2025-001",
        developerName: "Nguyễn Văn A",
        companyName: "Tech Solutions Inc.",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        status: "active",
        value: 50000000,
        type: "Full-time",
      },
      {
        id: "2",
        contractNumber: "CTR-2025-002",
        developerName: "Trần Thị B",
        companyName: "Digital Innovations Co.",
        startDate: "2025-02-01",
        endDate: "2025-07-31",
        status: "pending",
        value: 30000000,
        type: "Part-time",
      },
      // Add more mock contracts as needed
    ];

    setTimeout(() => {
      setContracts(mockContracts);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hiệu lực";
      case "pending":
        return "Chờ duyệt";
      case "completed":
        return "Đã hoàn thành";
      case "terminated":
        return "Đã chấm dứt";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh Sách Hợp Đồng
          </h1>
          <p className="text-neutral-600 mt-1">
            Quản lý và theo dõi các hợp đồng
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số hợp đồng, tên developer..."
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

          {/* <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Tạo Hợp Đồng Mới
                    </button> */}
        </div>

        {/* Contract Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách hợp đồng...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {contract.contractNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{contract.type}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      contract.status
                    )}`}
                  >
                    {getStatusText(contract.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserCheck className="w-4 h-4" />
                    <span>{contract.developerName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}{" "}
                      - {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatCurrency(contract.value)}/tháng</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <a
                      href={`/manager/contracts/developers/${contract.id}`}
                      className="inline-block text-sm font-medium text-primary-600 hover:text-primary-800"
                    >
                      <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        Chi tiết
                      </button>
                    </a>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
