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
  Link2,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/accountant_staff/SidebarItems";
import {
  partnerContractService,
  type PartnerContract,
} from "../../../services/PartnerContract";
import { partnerService } from "../../../services/Partner";
import { talentService } from "../../../services/Talent";

interface EnrichedContract extends PartnerContract {
  partnerName?: string;
  talentName?: string;
}

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

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
    label: "Bản nháp",
    color: "text-gray-800",
    bgColor: "bg-gray-50 border border-gray-200",
    icon: <FileText className="w-4 h-4" />,
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
  rejected: {
    label: "Bị từ chối",
    color: "text-rose-800",
    bgColor: "bg-rose-50 border border-rose-200",
    icon: <XCircle className="w-4 h-4" />,
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

export default function PartnerContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<EnrichedContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          enriched.partnerName = partner?.companyName || "—";
        } catch (err) {
          enriched.partnerName = "—";
        }

        try {
          const talent = await talentService.getById(contractData.talentId);
          enriched.talentName = talent.fullName || "—";
        } catch (err) {
          enriched.talentName = "—";
        }

        setContract(enriched);
      } catch (err: unknown) {
        console.error("❌ Lỗi tải hợp đồng:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin hợp đồng đối tác"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
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

  if (error || !contract) {
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
            <Link
              to="/accountant/payment-periods/partners"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Accountant Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/accountant/payment-periods/partners"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại</span>
            </Link>
          </div>

          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hợp đồng #{contract.contractNumber}
              </h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết hợp đồng giữa DevPool và đối tác
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
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
                  label="Đối tác"
                  value={contract.partnerName || "—"}
                />
                <InfoItem
                  icon={<UserCheck className="w-4 h-4" />}
                  label="Nhân sự"
                  value={contract.talentName || "—"}
                />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Mức lương"
                  value={formatCurrency(contract.devRate)}
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

