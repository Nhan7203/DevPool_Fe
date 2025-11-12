import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  User,
  FileText,
  Link2,
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

interface EnrichedContract extends ClientContract {
  clientCompanyName: string;
  projectName: string;
  talentName: string;
}

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

const statusConfigMap: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ReactNode;
  }
> = {
  draft: {
    label: "Chờ duyệt",
    color: "text-yellow-800",
    bgColor: "bg-yellow-50 border border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
  },
  pending: {
    label: "Chờ duyệt",
    color: "text-yellow-800",
    bgColor: "bg-yellow-50 border border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
  },
  active: {
    label: "Đang hiệu lực",
    color: "text-green-800",
    bgColor: "bg-green-50 border border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  expired: {
    label: "Đã hết hạn",
    color: "text-blue-800",
    bgColor: "bg-blue-50 border border-blue-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  terminated: {
    label: "Đã chấm dứt",
    color: "text-red-800",
    bgColor: "bg-red-50 border border-red-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

const getStatusConfig = (status: string) => {
  const key = status.toLowerCase();
  return (
    statusConfigMap[key] ?? {
      label: status,
      color: "text-neutral-700",
      bgColor: "bg-neutral-100 border border-neutral-200",
      icon: <AlertCircle className="w-4 h-4" />,
    }
  );
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<EnrichedContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("ID hợp đồng không hợp lệ");
          setLoading(false);
          return;
        }

        const contractData = await clientContractService.getById(Number(id));
        const enriched: EnrichedContract = {
          ...contractData,
          clientCompanyName: "—",
          projectName: "—",
          talentName: "—",
        };

        try {
          const company = await clientCompanyService.getById(
            contractData.clientCompanyId
          );
          enriched.clientCompanyName = company?.name ?? "—";
        } catch {
          enriched.clientCompanyName = "—";
        }

        try {
          const project = await projectService.getById(contractData.projectId);
          enriched.projectName = project?.name ?? "—";
        } catch {
          enriched.projectName = "—";
        }

        try {
          const talent = await talentService.getById(contractData.talentId);
          enriched.talentName = talent?.fullName ?? "—";
        } catch {
          enriched.talentName = "—";
        }

        setContract(enriched);
        setNewStatus(enriched.status);
      } catch (err: any) {
        console.error("❌ Lỗi tải thông tin hợp đồng khách hàng:", err);
        setError(
          err?.message || "Không thể tải thông tin hợp đồng khách hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!contract || !id) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const updatePayload = {
        id: contract.id,
        clientCompanyId: contract.clientCompanyId,
        talentId: contract.talentId,
        projectId: contract.projectId,
        contractNumber: contract.contractNumber,
        status: newStatus,
        startDate: contract.startDate,
        endDate: contract.endDate ?? null,
        contractFileUrl: contract.contractFileUrl ?? null,
      };

      await clientContractService.update(Number(id), updatePayload);

      setContract({ ...contract, status: newStatus });
      setIsEditingStatus(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Object.values(err.errors).flat().join(", ")
          : err?.message || err?.title || "Không thể cập nhật trạng thái hợp đồng";
      setUpdateError(message);
      console.error("❌ Lỗi cập nhật trạng thái hợp đồng:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (contract) {
      setNewStatus(contract.status);
    }
    setIsEditingStatus(false);
    setUpdateError(null);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Manager" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải thông tin hợp đồng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Manager" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium mb-2">
              {error || "Không tìm thấy hợp đồng"}
            </p>
            <Link
              to="/manager/contracts/clients"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/manager/contracts/clients"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hợp đồng #{contract.contractNumber}
              </h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết hợp đồng giữa DevPool và khách hàng
              </p>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor}`}
              >
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            ✅ Cập nhật trạng thái hợp đồng thành công!
          </div>
        )}
        {updateError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {updateError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Thông tin chung */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-2">
            <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin chung
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<Building2 className="w-4 h-4" />}
                  label="Công ty khách hàng"
                  value={contract.clientCompanyName}
                />
                <InfoItem
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Dự án"
                  value={contract.projectName}
                />
                <InfoItem
                  icon={<User className="w-4 h-4" />}
                  label="Talent"
                  value={contract.talentName}
                />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Mức phí"
                  value="—"
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày bắt đầu"
                  value={formatDate(contract.startDate)}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày kết thúc"
                  value={
                    contract.endDate
                      ? formatDate(contract.endDate)
                      : "Đang hiệu lực"
                  }
                />
              </div>

              {contract.contractFileUrl && (
                <div className="mt-6">
                  <p className="text-neutral-500 text-sm font-medium mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    File hợp đồng
                  </p>
                  <a
                    href={contract.contractFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium transition"
                  >
                    <span>Xem file hợp đồng</span>
                    →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Trạng thái & thao tác */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-secondary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Trạng thái hợp đồng
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                <p className="text-sm text-neutral-500 mb-1">
                  Trạng thái hiện tại
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium">
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
              </div>

              {isEditingStatus ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      Chọn trạng thái mới
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition disabled:opacity-50"
                    >
                      <option value="Draft">Chờ duyệt</option>
                      <option value="Active">Đang hiệu lực</option>
                      <option value="Expired">Đã hết hạn</option>
                      <option value="Terminated">Đã chấm dứt</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? "Đang lưu..." : "Lưu trạng thái"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-primary-300 text-primary-600 hover:bg-primary-50 transition font-medium"
                >
                  Thay đổi trạng thái
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
        {value || "—"}
      </p>
    </div>
  );
}

