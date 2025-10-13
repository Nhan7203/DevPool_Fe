import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Link2,
  Filter,
  Search,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";

interface ClientContract {
  id: number;
  contractNumber: string;
  projectName: string;
  partnerName: string;
  totalClientRatePerMonth?: number;
  startDate: string;
  endDate: string;
  status: string;
  clientContractFileUrl?: string;
}

export default function ClientContracts() {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data – replace with API call later
  useEffect(() => {
    const mock: ClientContract[] = [
      {
        id: 1,
        contractNumber: "CL-2025-001",
        projectName: "Dự án FinTech Pro",
        partnerName: "DevPool Việt Nam",
        totalClientRatePerMonth: 120_000_000,
        startDate: "2025-02-01",
        endDate: "2025-12-31",
        status: "Active",
        clientContractFileUrl: "https://example.com/contract1.pdf",
      },
      {
        id: 2,
        contractNumber: "CL-2025-002",
        projectName: "Hệ thống ERP Cloud",
        partnerName: "DevPool Việt Nam",
        totalClientRatePerMonth: 85_000_000,
        startDate: "2025-03-15",
        endDate: "2025-09-30",
        status: "Completed",
        clientContractFileUrl: "https://example.com/contract2.pdf",
      },
    ];

    setTimeout(() => {
      setContracts(mock);
      setLoading(false);
    }, 800);
  }, []);

  const formatCurrency = (v?: number) =>
    v
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "-";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "terminated":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hợp Đồng Với DevPool
          </h1>
          <p className="text-neutral-600 mt-1">
            Danh sách hợp đồng giữa công ty khách hàng và đối tác DevPool
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số hợp đồng, dự án..."
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
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải hợp đồng...</p>
          </div>
        ) : contracts.length === 0 ? (
          <p className="text-center text-gray-600">Không có hợp đồng nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts
              .filter(
                (c) =>
                  c.contractNumber
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  c.projectName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {contract.contractNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {contract.projectName}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span>Dự án: {contract.projectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>Đối tác: {contract.partnerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(contract.startDate).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        -{" "}
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>
                        {formatCurrency(contract.totalClientRatePerMonth)}/tháng
                      </span>
                    </div>
                    {contract.clientContractFileUrl && (
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-500" />
                        <a
                          href={contract.clientContractFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Xem file hợp đồng
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-right items-center gap-1 text-primary-600 hover:text-primary-800 transition">
                    <a
                      href={`/manager/contracts/clients/${contract.id}`}
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
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
