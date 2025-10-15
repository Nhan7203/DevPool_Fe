import { useState } from "react";
import { Globe2, Hash, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { marketService, type MarketPayload } from "../../../services/Market";

export default function MarketCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MarketPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.name.trim() || !form.code.trim()) {
      setError("⚠️ Vui lòng nhập đầy đủ tên và mã thị trường.");
      setLoading(false);
      return;
    }

    try {
      await marketService.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/sales/markets"), 1500);
    } catch (err) {
      console.error("❌ Lỗi khi tạo thị trường:", err);
      setError("Không thể tạo thị trường. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      {/* MAIN */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* HEADER */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Globe2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Thị Trường Mới
            </h1>
            <p className="text-neutral-600 mt-2">Thêm thị trường kinh doanh vào hệ thống DevPool</p>
          </div>

          {/* FORM */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên thị trường */}
              <InputField
                icon={<Globe2 className="w-5 h-5" />}
                label="Tên thị trường"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Thị trường Nhật Bản"
                required
              />

              {/* Mã thị trường */}
              <InputField
                icon={<Hash className="w-5 h-5" />}
                label="Mã thị trường"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="VD: JP, VN, US..."
                required
              />

              {/* Mô tả */}
              <TextareaField
                icon={<FileText className="w-5 h-5" />}
                label="Mô tả (tùy chọn)"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập mô tả thêm về thị trường..."
              />

              {/* THÔNG BÁO */}
              {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              {success && (
                <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  ✅ Tạo thị trường thành công! Đang chuyển hướng...
                </p>
              )}

              {/* NÚT SUBMIT */}
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
                    "Tạo thị trường"
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

// ======= COMPONENTS NHỎ ======= //
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}
function InputField({ label, icon, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
        />
      </div>
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon?: React.ReactNode;
}
function TextareaField({ label, icon, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-5 text-neutral-400 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <textarea
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
        />
      </div>
    </div>
  );
}
