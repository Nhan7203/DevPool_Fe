import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { industryService, type Industry } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";

export default function IndustryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const data = await industryService.getById(Number(id));
        setIndustry(data);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết ngành nghề:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIndustry();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !industry) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa ngành nghề này?");
    if (!confirm) return;

    try {
      await industryService.delete(Number(id));
      alert("✅ Đã xóa ngành nghề thành công!");
      navigate("/sales/industries");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa ngành nghề!");
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/sales/industries/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu ngành nghề...
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy ngành nghề
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{industry.name}</h1>
            <p className="text-neutral-600 mt-1">Thông tin chi tiết ngành nghề.</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleEdit} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl">
              Sửa
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl">
              Xóa
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <InfoItem label="Tên ngành nghề" value={industry.name} />
          <InfoItem label="Mã ngành nghề" value={industry.code} />
          <InfoItem label="Mô tả" value={industry.description || "—"} />
          <InfoItem label="Ngày tạo" value={new Date(industry.createdAt).toLocaleString("vi-VN")} />
          <InfoItem label="Cập nhật gần nhất" value={industry.updatedAt ? new Date(industry.updatedAt).toLocaleString("vi-VN") : "—"} />
          <InfoItem label="Trạng thái" value={industry.isDeleted ? "Đã xóa" : "Hiện hoạt động"} />
        </div>

        <div className="mt-8">
          <Link to="/sales/industries" className="text-primary-600 hover:underline text-sm">
            ← Quay lại danh sách ngành nghề
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
