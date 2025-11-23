import { useEffect, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  UserCheck,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  PowerOff,
  FileCheck,
  StickyNote,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";
import {
  partnerContractService,
  type PartnerContract,
} from "../../../../services/PartnerContract";
import { partnerService } from "../../../../services/Partner";
import { talentService } from "../../../../services/Talent";
import { decodeJWT } from "../../../../services/Auth";
import { useAuth } from "../../../../contexts/AuthContext";
import { userService } from "../../../../services/User";
import {
  notificationService,
  NotificationPriority,
  NotificationType,
} from "../../../../services/Notification";

// ===== TYPES =====
interface EnrichedContract extends PartnerContract {
  partnerName?: string;
  talentName?: string;
}

// ===== PAGE =====
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "—";
  return new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";
};

export default function DevDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [contract, setContract] = useState<EnrichedContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  
  const quickRejectNotes = [
    "Thông tin hợp đồng chưa đầy đủ hoặc không chính xác.",
    "Điều khoản hợp đồng không phù hợp với chính sách công ty.",
    "Thiếu các tài liệu cần thiết hoặc chữ ký.",
    "Ngân sách hoặc điều kiện không phù hợp.",
  ];
  const [isRejecting, setIsRejecting] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

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
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin hợp đồng đối tác");
        console.error("❌ Lỗi tải hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleTerminate = async () => {
    if (!contract || !id || contract.status !== "Active") return;

    const confirmTerminate = window.confirm(
      `⚠️ Bạn có chắc muốn chấm dứt hợp đồng "${contract.contractNumber}"?\n\nHành động này sẽ chuyển hợp đồng sang trạng thái "Đã chấm dứt" và không thể hoàn tác.`
    );
    if (!confirmTerminate) return;

    try {
      setIsTerminating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const decoded = token ? decodeJWT(token) : null;
      const updatedBy =
        user?.name || decoded?.unique_name || decoded?.email || "Manager";

      const result = await partnerContractService.changeStatus(Number(id), {
        newStatus: "Terminated",
        notes: `Chấm dứt hợp đồng ${contract.contractNumber}`,
        updatedBy,
      });

      const nextStatus =
        result.success && result.newStatus ? result.newStatus : "Terminated";
      setContract({ ...contract, status: nextStatus });
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Array.isArray(err.errors)
            ? err.errors.join(", ")
            : Object.values(err.errors).flat().join(", ")
          : err?.message || err?.title || "Không thể chấm dứt hợp đồng";
      setUpdateError(message);
      console.error("❌ Lỗi chấm dứt hợp đồng:", err);
    } finally {
      setIsTerminating(false);
    }
  };

  const handleQuickApprove = async () => {
    if (!contract || !id || contract.status !== "Pending") return;

    const confirmApprove = window.confirm(
      `Bạn có chắc muốn duyệt hợp đồng "${contract.contractNumber}"?\n\nHợp đồng sẽ chuyển sang trạng thái "Đang hiệu lực".`
    );
    if (!confirmApprove) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const decoded = token ? decodeJWT(token) : null;
      const updatedBy =
        user?.name || decoded?.unique_name || decoded?.email || "Manager";

      const result = await partnerContractService.changeStatus(Number(id), {
        newStatus: "Active",
        notes: `Phê duyệt hợp đồng ${contract.contractNumber}`,
        updatedBy,
      });

      const nextStatus =
        result.success && result.newStatus ? result.newStatus : "Active";
      setContract({ ...contract, status: nextStatus });
      setUpdateSuccess(true);
      setShowRejectForm(false);
      setRejectReason("");

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Array.isArray(err.errors)
            ? err.errors.join(", ")
            : Object.values(err.errors).flat().join(", ")
          : err?.message || err?.title || "Không thể duyệt hợp đồng";
      setUpdateError(message);
      console.error("❌ Lỗi duyệt hợp đồng:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartReject = () => {
    if (contract?.status !== "Pending" || isRejecting) return;
    setShowRejectForm(true);
    setRejectReason("");
    setRejectError(null);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectReason("");
    setRejectError(null);
  };

  const handleConfirmReject = async () => {
    if (!contract || !id) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setRejectError("Vui lòng nhập lý do từ chối");
      return;
    }

    const confirmReject = window.confirm(
      `⚠️ Bạn có chắc muốn từ chối hợp đồng "${contract.contractNumber}"?\n\nLý do: ${trimmedReason}\n\nHành động này sẽ chuyển hợp đồng sang trạng thái "Đã từ chối" và HR sẽ nhận được thông báo.`
    );
    if (!confirmReject) return;

    try {
      setIsRejecting(true);
      setRejectError(null);
      setUpdateError(null);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const decoded = token ? decodeJWT(token) : null;
      const updatedBy =
        user?.name || decoded?.unique_name || decoded?.email || "Manager";

      const result = await partnerContractService.changeStatus(Number(id), {
        newStatus: "Rejected",
        notes: trimmedReason,
        reason: trimmedReason,
        updatedBy,
      });

    const nextStatus = result.success && result.newStatus ? result.newStatus : "Rejected";
    setContract({ ...contract, status: nextStatus });
      setShowRejectForm(false);
      setRejectReason("");
      setUpdateSuccess(true);

      try {
        const hrResponse = await userService.getAll({
          role: "HR",
          excludeDeleted: true,
          pageNumber: 1,
          pageSize: 100,
        });

        const hrIds =
          (hrResponse.items || [])
            .map((hr) => hr.id)
            .filter((hrId): hrId is string => Boolean(hrId));

        if (hrIds.length > 0) {
          await notificationService.create({
            title: "Hợp đồng nhân sự bị từ chối",
            message: `${updatedBy} đã từ chối hợp đồng ${contract.contractNumber}. Lý do: ${trimmedReason}.`,
            type: NotificationType.ContractRejected,
            priority: NotificationPriority.Medium,
            userIds: hrIds,
            entityType: "PartnerContract",
            entityId: contract.id,
            actionUrl: `/hr/contracts/${contract.id}`,
            metaData: {
              contractNumber: contract.contractNumber,
              reason: trimmedReason,
              status: "Rejected",
            },
          });
        }
      } catch (notifyError) {
        console.error("⚠️ Không thể gửi thông báo tới HR:", notifyError);
      }

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Array.isArray(err.errors)
            ? err.errors.join(", ")
            : Object.values(err.errors).flat().join(", ")
          : err?.message || err?.title || "Không thể từ chối hợp đồng";
      setUpdateError(message);
      console.error("❌ Lỗi từ chối hợp đồng:", err);
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
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
      case "rejected":
        return {
          label: "Đã từ chối",
          color: "bg-rose-100 text-rose-800",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-rose-50",
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

          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hợp đồng #{contract.contractNumber}</h1>
              <p className="text-neutral-600 mb-4">Thông tin chi tiết hợp đồng giữa DevPool và nhân sự</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor}`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {contract.status === "Active" && (
                <button
                  type="button"
                  onClick={handleTerminate}
                  disabled={isTerminating}
                  className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                    isTerminating
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  }`}
                >
                  <PowerOff className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  {isTerminating ? "Đang chấm dứt..." : "Chấm dứt hợp đồng"}
                </button>
              )}

              {contract.status === "Pending" && (
                <>
                  <button
                    type="button"
                    onClick={handleQuickApprove}
                    disabled={
                      contract.status !== "Pending" || isUpdating || isRejecting
                    }
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                      contract.status !== "Pending" || isUpdating || isRejecting
                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={handleStartReject}
                    disabled={
                      contract.status !== "Pending" || isRejecting || showRejectForm
                    }
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                      contract.status !== "Pending" || isRejecting || showRejectForm
                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                  >
                    <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Từ chối
                  </button>
                </>
              )}
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

        {showRejectForm && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isRejecting) {
                handleCancelReject();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ghi rõ lý do từ chối hợp đồng</h3>
                <button
                  onClick={handleCancelReject}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Đóng"
                  disabled={isRejecting}
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <p className="text-sm text-neutral-600">
                  Vui lòng nhập lý do để các bộ phận liên quan dễ dàng xử lý và điều chỉnh thông tin hợp đồng.
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickRejectNotes.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setRejectReason((prev) => (prev ? `${prev}\n${note}` : note))}
                      disabled={isRejecting}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {note}
                    </button>
                  ))}
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                  disabled={isRejecting}
                />
                {rejectError && (
                  <p className="text-sm text-red-500">{rejectError}</p>
                )}
              </div>
              <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelReject}
                  disabled={isRejecting}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isRejecting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRejecting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-3">
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
                {contract.talentApplicationId && (
                  <InfoItem
                    icon={<FileCheck className="w-4 h-4" />}
                    label="Đơn ứng tuyển"
                    value={
                      <Link
                        to={`/hr/applications/${contract.talentApplicationId}`}
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        Xem đơn #{contract.talentApplicationId}
                      </Link>
                    }
                  />
                )}
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
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Số giờ tiêu chuẩn/tháng"
                  value={
                    contract.standardHoursPerMonth
                      ? `${contract.standardHoursPerMonth} giờ`
                      : "—"
                  }
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

              {contract.notes && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-600">Ghi chú</p>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
                </div>
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
      {typeof displayValue === "string" ? (
        <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
          {displayValue}
        </p>
      ) : (
        <div className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
          {displayValue}
        </div>
      )}
    </div>
  );
}
