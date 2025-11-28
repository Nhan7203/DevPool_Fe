import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  Briefcase,
  User,
  FileText,
  DollarSign,
  FileCheck,
  StickyNote,
  XCircle,
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/accountant_staff/SidebarItems";
import {
  clientContractPaymentService,
  type ClientContractPaymentModel,
} from "../../../../services/ClientContractPayment";
import { projectPeriodService, type ProjectPeriodModel } from "../../../../services/ProjectPeriod";
import { talentAssignmentService, type TalentAssignmentModel } from "../../../../services/TalentAssignment";
import { projectService } from "../../../../services/Project";
import { clientCompanyService } from "../../../../services/ClientCompany";
import { partnerService } from "../../../../services/Partner";
import { talentService } from "../../../../services/Talent";

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const contractStatusConfigMap: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ReactNode;
  }
> = {
  Draft: {
    label: "Nháp",
    color: "text-gray-800",
    bgColor: "bg-gray-50 border border-gray-200",
    icon: <FileText className="w-4 h-4" />,
  },
  NeedMoreInformation: {
    label: "Cần thêm thông tin",
    color: "text-yellow-800",
    bgColor: "bg-yellow-50 border border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
  },
  Submitted: {
    label: "Đã gửi",
    color: "text-blue-800",
    bgColor: "bg-blue-50 border border-blue-200",
    icon: <FileCheck className="w-4 h-4" />,
  },
  Verified: {
    label: "Đã xác minh",
    color: "text-purple-800",
    bgColor: "bg-purple-50 border border-purple-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  Approved: {
    label: "Đã duyệt",
    color: "text-green-800",
    bgColor: "bg-green-50 border border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  Rejected: {
    label: "Từ chối",
    color: "text-red-800",
    bgColor: "bg-red-50 border border-red-200",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const paymentStatusConfigMap: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  Pending: {
    label: "Chờ thanh toán",
    color: "text-gray-800",
    bgColor: "bg-gray-50 border border-gray-200",
  },
  Processing: {
    label: "Đang xử lý",
    color: "text-yellow-800",
    bgColor: "bg-yellow-50 border border-yellow-200",
  },
  Invoiced: {
    label: "Đã xuất hóa đơn",
    color: "text-blue-800",
    bgColor: "bg-blue-50 border border-blue-200",
  },
  PartiallyPaid: {
    label: "Đã thanh toán một phần",
    color: "text-orange-800",
    bgColor: "bg-orange-50 border border-orange-200",
  },
  Paid: {
    label: "Đã thanh toán",
    color: "text-green-800",
    bgColor: "bg-green-50 border border-green-200",
  },
};

const getContractStatusConfig = (status: string) => {
  return (
    contractStatusConfigMap[status] ?? {
      label: status,
      color: "text-neutral-700",
      bgColor: "bg-neutral-100 border border-neutral-200",
      icon: <AlertCircle className="w-4 h-4" />,
    }
  );
};

const getPaymentStatusConfig = (status: string) => {
  return (
    paymentStatusConfigMap[status] ?? {
      label: status,
      color: "text-neutral-700",
      bgColor: "bg-neutral-100 border border-neutral-200",
    }
  );
};

export default function ClientContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contractPayment, setContractPayment] = useState<ClientContractPaymentModel | null>(null);
  const [projectPeriod, setProjectPeriod] = useState<ProjectPeriodModel | null>(null);
  const [talentAssignment, setTalentAssignment] = useState<TalentAssignmentModel | null>(null);
  const [projectName, setProjectName] = useState<string>("—");
  const [clientCompanyName, setClientCompanyName] = useState<string>("—");
  const [partnerName, setPartnerName] = useState<string>("—");
  const [talentName, setTalentName] = useState<string>("—");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("ID hợp đồng không hợp lệ");
          setLoading(false);
          return;
        }

        // Fetch contract payment
        const paymentData = await clientContractPaymentService.getById(Number(id));
        setContractPayment(paymentData);

        // Fetch related data in parallel
        const [periodData, assignmentData] = await Promise.all([
          projectPeriodService.getById(paymentData.projectPeriodId).catch(() => null),
          talentAssignmentService.getById(paymentData.talentAssignmentId).catch(() => null),
        ]);

        setProjectPeriod(periodData);
        setTalentAssignment(assignmentData);

        // Fetch project info
        if (assignmentData) {
          try {
            const project = await projectService.getById(assignmentData.projectId);
            setProjectName(project?.name || paymentData.projectName || "—");
          } catch {
            setProjectName(paymentData.projectName || "—");
          }

          // Fetch client company info
          try {
            const project = await projectService.getById(assignmentData.projectId);
            if (project?.clientCompanyId) {
              const company = await clientCompanyService.getById(project.clientCompanyId);
              setClientCompanyName(company?.name || paymentData.clientCompanyName || "—");
            } else {
              setClientCompanyName(paymentData.clientCompanyName || "—");
            }
          } catch {
            setClientCompanyName(paymentData.clientCompanyName || "—");
          }

          // Fetch partner info
          try {
            const partner = await partnerService.getById(assignmentData.partnerId);
            setPartnerName(partner?.companyName || paymentData.partnerName || "—");
          } catch {
            setPartnerName(paymentData.partnerName || "—");
          }

          // Fetch talent info
          try {
            const talent = await talentService.getById(assignmentData.talentId);
            setTalentName(talent?.fullName || paymentData.talentName || "—");
          } catch {
            setTalentName(paymentData.talentName || "—");
          }
        } else {
          // Fallback to navigation properties if assignment not found
          setProjectName(paymentData.projectName || "—");
          setClientCompanyName(paymentData.clientCompanyName || "—");
          setPartnerName(paymentData.partnerName || "—");
          setTalentName(paymentData.talentName || "—");
        }
      } catch (err: unknown) {
        console.error("❌ Lỗi tải thông tin hợp đồng thanh toán khách hàng:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin hợp đồng thanh toán khách hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Accountant Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải thông tin hợp đồng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contractPayment) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Accountant Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium mb-2">
              {error || "Không tìm thấy hợp đồng"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contractStatusConfig = getContractStatusConfig(contractPayment.contractStatus);
  const paymentStatusConfig = getPaymentStatusConfig(contractPayment.paymentStatus);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Accountant Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>

          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hợp đồng #{contractPayment.contractNumber}
              </h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết hợp đồng thanh toán khách hàng
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${contractStatusConfig.bgColor}`}
                >
                  {contractStatusConfig.icon}
                  <span className={`text-sm font-medium ${contractStatusConfig.color}`}>
                    {contractStatusConfig.label}
                  </span>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${paymentStatusConfig.bgColor}`}
                >
                  <span className={`text-sm font-medium ${paymentStatusConfig.color}`}>
                    {paymentStatusConfig.label}
                  </span>
                </div>
                {contractPayment.isFinished && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Đã hoàn thành</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Thông tin hợp đồng */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-3">
            <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin hợp đồng
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Số hợp đồng"
                  value={contractPayment.contractNumber}
                />
                <InfoItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Trạng thái hợp đồng"
                  value={
                    <span className={`px-2 py-1 rounded text-xs font-medium ${contractStatusConfig.bgColor} ${contractStatusConfig.color}`}>
                      {contractStatusConfig.label}
                    </span>
                  }
                />
                <InfoItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Trạng thái thanh toán"
                  value={
                    <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusConfig.bgColor} ${paymentStatusConfig.color}`}>
                      {paymentStatusConfig.label}
                    </span>
                  }
                />
                {contractPayment.isFinished && (
                  <InfoItem
                    icon={<CheckCircle className="w-4 h-4" />}
                    label="Trạng thái hoàn thành"
                    value={
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                        Đã hoàn thành
                      </span>
                    }
                  />
                )}
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày bắt đầu hợp đồng"
                  value={formatDate(contractPayment.contractStartDate)}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày kết thúc hợp đồng"
                  value={formatDate(contractPayment.contractEndDate)}
                />
              </div>
            </div>
          </div>

          {/* Thông tin chung */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-3">
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
                  value={clientCompanyName}
                />
                <InfoItem
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Dự án"
                  value={projectName}
                />
                <InfoItem
                  icon={<User className="w-4 h-4" />}
                  label="Nhân sự"
                  value={talentName}
                />
                <InfoItem
                  icon={<Building2 className="w-4 h-4" />}
                  label="Đối tác"
                  value={partnerName}
                />
                {projectPeriod && (
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Chu kỳ thanh toán"
                    value={`Tháng ${projectPeriod.periodMonth}/${projectPeriod.periodYear}`}
                  />
                )}
                {talentAssignment && (
                  <>
                    <InfoItem
                      icon={<Calendar className="w-4 h-4" />}
                      label="Ngày bắt đầu assignment"
                      value={formatDate(talentAssignment.startDate)}
                    />
                    <InfoItem
                      icon={<Calendar className="w-4 h-4" />}
                      label="Ngày kết thúc assignment"
                      value={talentAssignment.endDate ? formatDate(talentAssignment.endDate) : "Đang hiệu lực"}
                    />
                  </>
                )}
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ngày tạo"
                  value={formatDate(contractPayment.createdAt)}
                />
                {contractPayment.updatedAt && (
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Ngày cập nhật"
                    value={formatDate(contractPayment.updatedAt)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Thông tin tiền tệ và tỷ giá */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-3">
            <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin tiền tệ và tỷ giá
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Đơn giá ngoại tệ"
                  value={`${contractPayment.unitPriceForeignCurrency.toLocaleString("vi-VN")} ${contractPayment.currencyCode}`}
                />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Tỷ giá"
                  value={contractPayment.exchangeRate.toLocaleString("vi-VN")}
                />
                <InfoItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Phương pháp tính"
                  value={contractPayment.calculationMethod === "Percentage" ? "Theo phần trăm" : "Số tiền cố định"}
                />
                {contractPayment.calculationMethod === "Percentage" && contractPayment.percentageValue !== null && contractPayment.percentageValue !== undefined && (
                  <InfoItem
                    icon={<FileText className="w-4 h-4" />}
                    label="Giá trị phần trăm"
                    value={`${contractPayment.percentageValue}%`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 lg:col-span-3">
            <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin thanh toán
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Mức lương/tháng (Legacy)"
                  value={formatCurrency(contractPayment.monthlyRate)}
                />
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Số giờ tiêu chuẩn"
                  value={`${contractPayment.standardHours} giờ`}
                />
                {contractPayment.reportedHours !== null && contractPayment.reportedHours !== undefined && (
                  <InfoItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Số giờ đã báo cáo"
                    value={`${contractPayment.reportedHours} giờ`}
                  />
                )}
                {contractPayment.billableHours !== null && contractPayment.billableHours !== undefined && (
                  <InfoItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Số giờ có thể thanh toán"
                    value={`${contractPayment.billableHours} giờ`}
                  />
                )}
                {contractPayment.manMonthCoefficient !== null && contractPayment.manMonthCoefficient !== undefined && (
                  <InfoItem
                    icon={<FileText className="w-4 h-4" />}
                    label="Hệ số man-month"
                    value={contractPayment.manMonthCoefficient.toFixed(4)}
                  />
                )}
                {contractPayment.plannedAmount !== null && contractPayment.plannedAmount !== undefined && (
                  <InfoItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Số tiền dự kiến"
                    value={formatCurrency(contractPayment.plannedAmount)}
                  />
                )}
                {contractPayment.finalAmountVND !== null && contractPayment.finalAmountVND !== undefined && (
                  <InfoItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Số tiền cuối cùng (VND)"
                    value={formatCurrency(contractPayment.finalAmountVND)}
                  />
                )}
                {contractPayment.finalAmount !== null && contractPayment.finalAmount !== undefined && (
                  <InfoItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Số tiền cuối cùng"
                    value={formatCurrency(contractPayment.finalAmount)}
                  />
                )}
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Tổng đã thanh toán"
                  value={formatCurrency(contractPayment.totalPaidAmount)}
                />
                {contractPayment.invoiceNumber && (
                  <InfoItem
                    icon={<FileCheck className="w-4 h-4" />}
                    label="Số hóa đơn"
                    value={contractPayment.invoiceNumber}
                  />
                )}
                {contractPayment.invoiceDate && (
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Ngày hóa đơn"
                    value={formatDate(contractPayment.invoiceDate)}
                  />
                )}
                {contractPayment.lastPaymentDate && (
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Ngày thanh toán gần nhất"
                    value={formatDate(contractPayment.lastPaymentDate)}
                  />
                )}
              </div>

              {contractPayment.sowDescription && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-600">Mô tả SOW</p>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.sowDescription}</p>
                </div>
              )}

              {contractPayment.rejectionReason && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm font-medium text-red-600">Lý do từ chối</p>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.rejectionReason}</p>
                </div>
              )}

              {contractPayment.notes && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-600">Ghi chú</p>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{contractPayment.notes}</p>
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
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      {typeof value === "string" ? (
        <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
          {value || "—"}
        </p>
      ) : (
        <div className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
          {value}
        </div>
      )}
    </div>
  );
}
