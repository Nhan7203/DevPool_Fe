import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Link2,
  Filter,
  Search,
  User,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";
import {
  clientContractService,
  type ClientContract,
} from "../../../../services/ClientContract";
import { clientCompanyService } from "../../../../services/ClientCompany";
import { projectService } from "../../../../services/Project";
import { talentService } from "../../../../services/Talent";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

interface EnrichedClientContract extends ClientContract {
  clientCompanyName?: string;
  projectName?: string;
  talentName?: string;
}

export default function ClientContracts() {
  const [contracts, setContracts] = useState<EnrichedClientContract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        const filter: any = { excludeDeleted: true };
        if (statusFilter) {
          filter.status = statusFilter;
        }

        const contractsData = await clientContractService.getAll(filter);

        // Enrich contracts with related data
        const enrichedContracts = await Promise.all(
          contractsData.map(async (contract: ClientContract) => {
            const enriched: EnrichedClientContract = { ...contract };

            try {
              const clientCompany = await clientCompanyService.getById(
                contract.clientCompanyId
              );
              enriched.clientCompanyName = clientCompany.name;
            } catch (err) {
              enriched.clientCompanyName = "N/A";
            }

            try {
              const project = await projectService.getById(contract.projectId);
              enriched.projectName = project.name;
            } catch (err) {
              enriched.projectName = "N/A";
            }

            try {
              const talent = await talentService.getById(contract.talentId);
              enriched.talentName = talent.fullName;
            } catch (err) {
              enriched.talentName = "N/A";
            }

            return enriched;
          })
        );

        setContracts(enrichedContracts);
      } catch (err: any) {
        setError(
          err.message || "Không thể tải danh sách hợp đồng khách hàng"
        );
        console.error("Error fetching contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [statusFilter]);

  const formatCurrency = (v?: number) =>
    v
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "-";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "terminateds":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />

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
                placeholder="Tìm kiếm theo số hợp đồng, dự án, talent..."
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

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Terminateds">Terminateds</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : contracts.length === 0 ? (
          <p className="text-center text-gray-600 py-12">
            Không có hợp đồng nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts
              .filter(
                (c) =>
                  c.contractNumber
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  c.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.talentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.clientCompanyName?.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Công ty: {contract.clientCompanyName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Dự án: {contract.projectName || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Talent: {contract.talentName || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(contract.startDate).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        {contract.endDate
                          ? `- ${new Date(contract.endDate).toLocaleDateString("vi-VN")}`
                          : "- Đang diễn ra"}
                      </span>
                    </div>
                    {contract.contractFileUrl && (
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-500" />
                        <a
                          href={contract.contractFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Xem file hợp đồng
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Link
                      to={`/manager/contracts/clients/${contract.id}`}
                      className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
