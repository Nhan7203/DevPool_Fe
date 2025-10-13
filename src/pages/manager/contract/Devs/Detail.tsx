import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/manager/SidebarItems";
import { FileText, Calendar, Building2, UserCheck, DollarSign, Clock } from "lucide-react";

// ===== TYPES =====
interface DevContract {
  id: string;
  contractNumber: string;
  developerName: string;
  companyName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "completed" | "terminated";
  rate: number;
  paymentType: string;
  role: string;
  note?: string;
}

export default function DevDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<DevContract | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock fetch API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      // Mock data
      setContract({
        id: id ?? "1",
        contractNumber: "CTR-2025-001",
        developerName: "Nguyễn Văn A",
        companyName: "Tech Solutions Inc.",
        projectName: "Hệ thống quản lý nhân sự",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        status: "active",
        rate: 50_000_000,
        paymentType: "Full-time",
        role: "Frontend Developer",
        note: "Làm việc hybrid tại TP.HCM",
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu hợp đồng...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy hợp đồng.
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hợp đồng #{contract.contractNumber}
            </h1>
            <p className="text-neutral-600 mt-1">
              Chi tiết hợp đồng của {contract.developerName}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              contract.status
            )}`}
          >
            {getStatusText(contract.status)}
          </span>
        </div>

        {/* Thông tin hợp đồng */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary-700 mb-4">
            Thông tin chung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Tên Developer" value={contract.developerName} icon={<UserCheck />} />
            <InfoItem label="Vai trò" value={contract.role} icon={<FileText />} />
            <InfoItem label="Loại hình làm việc" value={contract.paymentType} icon={<Clock />} />
            <InfoItem
              label="Giá trị hợp đồng (VNĐ/tháng)"
              value={contract.rate.toLocaleString("vi-VN")}
              icon={<DollarSign />}
            />
            <InfoItem label="Ngày bắt đầu" value={contract.startDate} icon={<Calendar />} />
            <InfoItem label="Ngày kết thúc" value={contract.endDate} icon={<Calendar />} />
          </div>
        </div>

        {/* Thông tin dự án */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-primary-700 mb-4">
            Thông tin dự án và khách hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Tên dự án" value={contract.projectName} icon={<FileText />} />
            <InfoItem label="Công ty khách hàng" value={contract.companyName} icon={<Building2 />} />
            <InfoItem label="Ghi chú" value={contract.note || "-"} icon={<FileText />} />
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
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-primary-600">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-gray-900 font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}
