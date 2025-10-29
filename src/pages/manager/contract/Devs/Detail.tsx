import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";
import {
  partnerContractService,
  type PartnerContract,
} from "../../../../services/PartnerContract";
import { partnerService } from "../../../../services/Partner";
import { talentService } from "../../../../services/Talent";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import { FileText, Calendar, Building2, UserCheck, DollarSign, Clock } from "lucide-react";

// ===== TYPES =====
interface EnrichedContract extends PartnerContract {
  partnerName?: string;
  talentName?: string;
}

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
        setError(
          err.message || "Không thể tải thông tin hợp đồng đối tác"
        );
        console.error("Error fetching contract:", err);
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

      // Gửi toàn bộ object với status đã được cập nhật
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

      // Update local state
      setContract({ ...contract, status: newStatus });
      setIsEditingStatus(false);
      setUpdateSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err?.errors
        ? Object.values(err.errors).flat().join(", ")
        : err?.message || err?.title || "Không thể cập nhật trạng thái hợp đồng";
      setUpdateError(errorMessage);
      console.error("Error updating status:", err);
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

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "Chờ duyệt";
      case "active":
        return "Đang hoạt động";
      case "completed":
        return "Đã hoàn thành";
      case "terminateds":
        return "Đã chấm dứt";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Manager" />
        <div className="flex-1 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Manager" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">
              {error || "Không tìm thấy hợp đồng"}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hợp đồng #{contract.contractNumber}
          </h1>
          <p className="text-neutral-600 mt-1">
            Thông tin chi tiết hợp đồng giữa DevPool và đối tác
          </p>
        </div>

        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            Cập nhật trạng thái thành công!
          </div>
        )}
        {updateError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {updateError}
          </div>
        )}

        {/* Thông tin hợp đồng */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">
            Thông tin chung
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem
              label="Mã hợp đồng"
              value={contract.contractNumber}
            />
            <InfoItem
              label="Trạng thái"
              value={
                isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      disabled={isUpdating}
                    >
                      <option value="Draft">Chờ duyệt</option>
                      <option value="Active">Đang hoạt động</option>
                      <option value="Completed">Đã hoàn thành</option>
                      <option value="Terminateds">Đã chấm dứt</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {getStatusText(contract.status)}
                    </span>
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Thay đổi
                    </button>
                  </div>
                )
              }
            />
            <InfoItem
              label="Talent"
              value={contract.talentName || "N/A"}
            />
            <InfoItem
              label="Đối tác"
              value={contract.partnerName || "N/A"}
            />
            <InfoItem
              label="Loại rate"
              value={contract.rateType || "N/A"}
            />
            <InfoItem
              label="Dev Rate"
              value={
                contract.devRate
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(contract.devRate)
                  : "N/A"
              }
            />
            <InfoItem
              label="Ngày bắt đầu"
              value={new Date(contract.startDate).toLocaleDateString("vi-VN")}
            />
            <InfoItem
              label="Ngày kết thúc"
              value={
                contract.endDate
                  ? new Date(contract.endDate).toLocaleDateString("vi-VN")
                  : "Đang diễn ra"
              }
            />
            {contract.contractFileUrl && (
              <div className="col-span-2">
                <p className="text-gray-500 text-sm mb-1">File hợp đồng</p>
                <a
                  href={contract.contractFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline font-medium"
                >
                  Xem file hợp đồng →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <div className="text-gray-900 font-medium">{value || "-"}</div>
    </div>
  );
}
