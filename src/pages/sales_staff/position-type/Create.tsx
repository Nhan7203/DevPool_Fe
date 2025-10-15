import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { positionTypeService, type PositionTypeCreatePayload } from "../../../services/PositionType";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";

export default function PositionTypeCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PositionTypeCreatePayload>({
    name: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.name.trim()) {
      setError("⚠️ Vui lòng nhập tên loại vị trí.");
      setLoading(false);
      return;
    }

    try {
      await positionTypeService.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/sales/position-type"), 1500);
    } catch (err) {
      console.error("❌ Lỗi khi tạo loại vị trí:", err);
      setError("Không thể tạo loại vị trí. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Loại Vị Trí Mới</h1>
          <p className="text-neutral-600 mt-1">
            Nhập thông tin loại vị trí tuyển dụng để tạo mới.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-2xl p-8 max-w-3xl space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tên loại vị trí</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên loại vị trí"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả (tùy chọn)"
            />
          </div>

          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">Tạo loại vị trí thành công! Đang chuyển hướng...</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
            >
              {loading ? "Đang tạo..." : "Tạo loại vị trí"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
