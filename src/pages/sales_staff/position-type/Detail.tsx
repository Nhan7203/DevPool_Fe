import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { positionTypeService, type PositionType } from "../../../services/PositionType";

export default function PositionTypeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [positionType, setPositionType] = useState<PositionType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu chi tiết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const data = await positionTypeService.getById(Number(id));
        setPositionType(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết PositionType:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Xóa position type
  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa loại vị trí này?");
    if (!confirmDelete) return;

    try {
      await positionTypeService.delete(Number(id));
      alert("✅ Đã xóa loại vị trí thành công!");
      navigate("/sales/position-type");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa loại vị trí!");
    }
  };

  // Chuyển sang trang edit
  const handleEdit = () => {
    navigate(`/sales/position-type/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu loại vị trí...
      </div>
    );
  }

  if (!positionType) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy loại vị trí
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
            <h1 className="text-3xl font-bold text-gray-900">{positionType.name}</h1>
            <p className="text-neutral-600 mt-1">
              Thông tin chi tiết về loại vị trí tuyển dụng.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              className="px-6 py-2.5 rounded-xl font-medium bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            >
              Sửa
            </Button>
            <Button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Xóa
            </Button>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">
            Thông tin loại vị trí
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Tên loại vị trí" value={positionType.name} />
            <InfoItem label="Mô tả" value={positionType.description || "—"} />
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/sales/position-type"
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
