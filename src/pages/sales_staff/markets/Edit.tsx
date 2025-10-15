import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { marketService, type Market, type MarketPayload } from "../../../services/Market";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export default function MarketEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [formData, setFormData] = useState<MarketPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Market
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await marketService.getById(Number(id));
        setMarket(data);
        setFormData({
          name: data.name,
          code: data.code,
          description: data.description || "",
        });
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu Market:", err);
        alert("Không thể tải dữ liệu thị trường!");
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [id]);

  // ✍️ Cập nhật form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name || !formData.code) {
      alert("⚠️ Vui lòng điền đầy đủ tên và mã thị trường!");
      return;
    }

    try {
      await marketService.update(Number(id), formData);
      alert("✅ Cập nhật thị trường thành công!");
      navigate(`/sales/markets/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật thị trường!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu...
      </div>
    );

  if (!market)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy thị trường
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thị trường</h1>
          <p className="text-neutral-600 mt-1">Cập nhật thông tin thị trường.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          {/* Tên */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tên thị trường</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thị trường"
              required
              className="w-full"
            />
          </div>

          {/* Mã */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mã thị trường</label>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã thị trường"
              required
              className="w-full"
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
              placeholder="Nhập mô tả thị trường"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/markets/${id}`}
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
