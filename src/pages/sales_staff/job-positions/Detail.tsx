import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";
import { positionTypeService } from "../../../services/PositionType";

export default function JobPositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobPosition, setJobPosition] = useState<JobPosition | null>(null);
  const [positionTypeName, setPositionTypeName] = useState<string>("—");
  const [companyName, setCompanyName] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  const levelLabels: Record<number, string> = {
    0: "Junior",
    1: "Middle",
    2: "Senior",
    3: "Lead",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const positionData = await jobPositionService.getById(Number(id)) as JobPosition;
        const company = await clientCompanyService.getById(positionData.clientCompanyId) as ClientCompany;

        setJobPosition(positionData);
        setCompanyName(company?.name || "—");

        // ✅ Lấy tên PositionType
        const typeData = await positionTypeService.getById(positionData.positionTypeId);
        setPositionTypeName(typeData.name);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết vị trí:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa vị trí tuyển dụng này?");
    if (!confirmDelete) return;

    try {
      await jobPositionService.delete(Number(id));
      alert("✅ Xóa vị trí tuyển dụng thành công!");
      navigate("/sales/job-positions");
    } catch (err) {
      console.error("❌ Lỗi khi xóa vị trí:", err);
      alert("Không thể xóa vị trí!");
    }
  };

  const handleEdit = () => {
    navigate(`/sales/job-positions/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu vị trí tuyển dụng...
      </div>
    );
  }

  if (!jobPosition) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy vị trí tuyển dụng
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{jobPosition.name}</h1>
            <p className="text-neutral-600 mt-1">
              Thông tin chi tiết vị trí tuyển dụng của khách hàng.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              className="px-6 py-2.5 rounded-xl font-medium bg-primary-600 hover:bg-primary-700 text-white"
            >
              Sửa
            </Button>
            <Button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa
            </Button>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">Thông tin chung</h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Công ty khách hàng" value={companyName} />
            <InfoItem label="Loại vị trí" value={positionTypeName} />
            <InfoItem label="Cấp độ" value={levelLabels[jobPosition.level] || "—"} />
            <InfoItem label="Trạng thái" value={jobPosition.isActive ? "Hoạt động" : "Không hoạt động"} />
            <InfoItem label="Mô tả" value={jobPosition.description || "Chưa có mô tả"} />
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/sales/job-positions"
            className="text-primary-600 hover:underline text-sm"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
