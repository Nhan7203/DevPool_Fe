import { useState } from "react";
import { Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { positionTypeService, type PositionTypeCreatePayload } from "../../../services/PositionType";

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

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Layers3 className="text-white font-bold text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Loại Vị Trí Mới
            </h1>
            <p className="text-neutral-600 mt-2">Định nghĩa loại vị trí tuyển dụng trong hệ thống DevPool</p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên loại vị trí */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Tên loại vị trí
                </label>
                <div className="relative group">
                  <Layers3 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    placeholder="Nhập tên loại vị trí (VD: Backend Developer, Data Analyst...)"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Mô tả
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-4 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all resize-none"
                    placeholder="Nhập mô tả chi tiết về loại vị trí (tùy chọn)"
                  />
                </div>
              </div>

              {/* Thông báo lỗi / thành công */}
              {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">✅ Tạo loại vị trí thành công! Đang chuyển hướng...</p>}

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    "Tạo loại vị trí"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
