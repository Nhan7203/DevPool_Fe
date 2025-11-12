import { useEffect, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  UserCheck,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";
import {
  partnerContractService,
  type PartnerContract,
} from "../../../../services/PartnerContract";
import { partnerService } from "../../../../services/Partner";
import { talentService } from "../../../../services/Talent";

// ===== TYPES =====
interface EnrichedContract extends PartnerContract {
  partnerName?: string;
  talentName?: string;
}

// ===== PAGE =====
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function DevDetailPage() {
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

        const contractData = await partnerContractService.getById(Number(id));
        const enriched: EnrichedContract = { ...contractData };

        // Fetch related data
        try {
          const partners = await partnerService.getAll();
          const partner = partners.find((p: any) => p.id === contractData.partnerId);
          enriched.partnerName = partner?.companyName || "N/A";
        } catch (err) {
          enriched.partnerName = "N/A";
        }

        try {
          const talent = await talentService.getById(contractData.talentId);
          enriched.talentName = talent.fullName;
        } catch (err) {
          enriched.talentName = "N/A";
        }

        setContract(enriched);
        setNewStatus(enriched.status);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin hợp đồng đối tác");
        console.error("❌ Lỗi tải hợp đồng:", err);
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
        partnerId: contract.partnerId,
        talentId: contract.talentId,
        devRate: contract.devRate || null,
        rateType: contract.rateType,
        contractNumber: contract.contractNumber,
        status: newStatus,
        startDate: contract.startDate,
        endDate: contract.endDate || null,
        contractFileUrl: contract.contractFileUrl || null,
      };

      await partnerContractService.update(Number(id), updatePayload);

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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return {
          label: "Chờ duyệt",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-yellow-50",
        };
      case "active":
        return {
          label: "Đang hiệu lực",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-50",
        };
      case "expired":
        return {
          label: "Đã hết hạn",
          color: "bg-blue-100 text-blue-800",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-blue-50",
        };
      case "terminated":
        return {
          label: "Đã chấm dứt",
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-red-50",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-gray-50",
        };
    }
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
            <p className="text-red-500 text-lg font-medium mb-2">{error || "Không tìm thấy hợp đồng"}</p>
            <Link
              to="/manager/contracts/developers"
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
              to="/manager/contracts/developers"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hợp đồng #{contract.contractNumber}</h1>
              <p className="text-neutral-600 mb-4">Thông tin chi tiết hợp đồng giữa DevPool và nhân sự</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor}`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
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
              <h2 className="text-xl font-semibold text-gray-900">Thông tin chung</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<FileText className="w-4 h-4" />} label="Mã hợp đồng" value={contract.contractNumber} />            
                <InfoItem icon={<UserCheck className="w-4 h-4" />} label="Nhân sự" value={contract.talentName || "N/A"} />
                <InfoItem icon={<Building2 className="w-4 h-4" />} label="Đối tác" value={contract.partnerName || "N/A"} />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Hình thức tính lương"
                  value={
                    contract.rateType === "Hourly"
                      ? "Theo giờ"
                      : contract.rateType === "Daily"
                      ? "Theo ngày"
                      : contract.rateType === "Monthly"
                      ? "Theo tháng"
                      : contract.rateType === "Fixed"
                      ? "Cố định"
                      : contract.rateType || "N/A"
                  }
                />               
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày bắt đầu"
                  value={new Date(contract.startDate).toLocaleDateString("vi-VN")}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày kết thúc"
                  value={contract.endDate ? new Date(contract.endDate).toLocaleDateString("vi-VN") : "Đang diễn ra"}
                />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Mức lương nhân sự"
                  value={formatCurrency(contract.devRate)}
                />
                {contract.contractFileUrl && (
                  <InfoItem
                    label="File hợp đồng"
                    value={
                      <a
                        href={contract.contractFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        Xem file
                      </a>
                    }
                    icon={<FileText className="w-4 h-4" />}
                  />
                )}
              </div>
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
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  const displayValue: ReactNode =
    value === null || value === undefined
      ? "—"
      : typeof value === "string" && value.trim() === ""
      ? "—"
      : value;

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
        {displayValue}
      </p>
    </div>
  );
}
