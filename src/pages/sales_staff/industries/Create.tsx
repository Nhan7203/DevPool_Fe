import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, FileText } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { industryService, type IndustryPayload } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";

export default function CreateIndustry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<IndustryPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🔁 Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim() || !form.code.trim()) {
      setMessage({ type: "error", text: "⚠️ Vui lòng nhập đầy đủ Tên và Mã lĩnh vực!" });
      return;
    }

    try {
      setLoading(true);
      await industryService.create(form);
      setMessage({ type: "success", text: "✅ Tạo lĩnh vực thành công! Đang chuyển hướng..." });
      setTimeout(() => navigate("/sales/industries"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo lĩnh vực:", err);
      setMessage({ type: "error", text: "Không thể tạo lĩnh vực. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/40 to-secondary-50/40">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Briefcase className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Lĩnh Vực Mới
            </h1>
            <p className="text-neutral-600 mt-2">
              Thêm lĩnh vực kinh doanh mới cho hệ thống DevPool
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên lĩnh vực */}
              <FormGroup
                label="Tên lĩnh vực"
                name="name"
                placeholder="VD: Công nghệ thông tin, Tài chính..."
                icon={<Briefcase className="text-neutral-400 group-focus-within:text-primary-500" />}
                value={form.name}
                onChange={handleChange}
                required
              />

              {/* Mã lĩnh vực */}
              <FormGroup
                label="Mã lĩnh vực"
                name="code"
                placeholder="VD: IT, FIN, EDU..."
                icon={<FileText className="text-neutral-400 group-focus-within:text-primary-500" />}
                value={form.code}
                onChange={handleChange}
                required
              />

              {/* Mô tả */}
              <TextareaGroup
                label="Mô tả (tùy chọn)"
                name="description"
                placeholder="Nhập mô tả ngắn về lĩnh vực..."
                value={form.description}
                onChange={handleChange}
              />

              {/* Thông báo */}
              {message && (
                <p
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    message.type === "success"
                      ? "text-green-700 bg-green-50 border border-green-200"
                      : "text-red-700 bg-red-50 border border-red-200"
                  }`}
                >
                  {message.text}
                </p>
              )}

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:from-primary-700 hover:to-secondary-700 shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    "Tạo lĩnh vực"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENT NHỎ =====
interface FormGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}
function FormGroup({ label, icon, ...props }: FormGroupProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">{icon}</div>
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all"
        />
      </div>
    </div>
  );
}

interface TextareaGroupProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function TextareaGroup({ label, ...props }: TextareaGroupProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full pl-4 pr-4 py-3 border rounded-xl bg-white/50 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all"
      />
    </div>
  );
}
