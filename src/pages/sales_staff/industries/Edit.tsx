import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { industryService, type Industry, type IndustryPayload } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export default function IndustryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [formData, setFormData] = useState<IndustryPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Industry
  useEffect(() => {
    const fetchIndustry = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await industryService.getById(Number(id));
        setIndustry(data);
        setFormData({
          name: data.name,
          code: data.code,
          description: data.description || "",
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu lĩnh vực:", err);
        alert("Không thể tải thông tin lĩnh vực!");
      } finally {
        setLoading(false);
      }
    };
    fetchIndustry();
  }, [id]);

  // ✍️ Cập nhật form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name.trim() || !formData.code.trim()) {
      alert("⚠️ Vui lòng điền đầy đủ tên và mã lĩnh vực!");
      return;
    }

    try {
      await industryService.update(Number(id), formData);
      alert("✅ Cập nhật lĩnh vực thành công!");
      navigate(`/sales/industries/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật lĩnh vực:", err);
      alert("Không thể cập nhật lĩnh vực!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu lĩnh vực...
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy lĩnh vực
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa lĩnh vực</h1>
          <p className="text-neutral-600 mt-1">
            Cập nhật thông tin lĩnh vực.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          {/* Tên lĩnh vực */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tên lĩnh vực</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên lĩnh vực"
              required
            />
          </div>

          {/* Mã lĩnh vực */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mã lĩnh vực</label>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã lĩnh vực"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả lĩnh vực..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/industries/${id}`}
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
