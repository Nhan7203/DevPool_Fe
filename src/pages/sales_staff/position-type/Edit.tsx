import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { positionTypeService, type PositionType } from "../../../services/PositionType";

export default function PositionTypeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [positionType, setPositionType] = useState<PositionType | null>(null);
  const [formData, setFormData] = useState<{ name: string; description?: string }>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu PositionType
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await positionTypeService.getById(Number(id));
        setPositionType(data);
        setFormData({ name: data.name, description: data.description ?? "" });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin loại vị trí!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✍️ Handle change form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name.trim()) {
      alert("⚠️ Vui lòng nhập tên loại vị trí!");
      return;
    }

    try {
      const payload = { ...formData };
      await positionTypeService.update(Number(id), payload);
      alert("✅ Cập nhật loại vị trí thành công!");
      navigate(`/sales/position-type/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật loại vị trí!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu...
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa loại vị trí</h1>
          <p className="text-neutral-600 mt-1">
            Cập nhật thông tin loại vị trí tuyển dụng.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tên loại vị trí</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên loại vị trí"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả (tùy chọn)"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/position-type/${id}`}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Hủy
            </Link>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
