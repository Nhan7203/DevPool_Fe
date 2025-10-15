import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { industryService, type IndustryPayload } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";

export default function IndustryCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<IndustryPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.name.trim() || !form.code.trim()) {
      setError("⚠️ Vui lòng nhập tên và mã ngành nghề!");
      return;
    }

    try {
      setLoading(true);
      await industryService.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/sales/industries"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo ngành nghề:", err);
      setError("Không thể tạo ngành nghề. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Ngành Nghề Mới</h1>
          <p className="text-neutral-600 mt-1">Nhập thông tin ngành nghề để tạo mới</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl space-y-6">
          <InputField
            label="Tên ngành nghề"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <InputField
            label="Mã ngành nghề"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
          />

          <TextareaField
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">Tạo ngành nghề thành công! Đang chuyển hướng...</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
            >
              {loading ? "Đang tạo..." : "Tạo ngành nghề"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== COMPONENT NHỎ =====

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
