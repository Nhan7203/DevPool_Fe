import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { marketService, type MarketPayload } from "../../../services/Market";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";

export default function MarketCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MarketPayload>({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✍️ Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.name || !form.code) {
      setError("Vui lòng điền đầy đủ tên và mã thị trường.");
      setLoading(false);
      return;
    }

    try {
      await marketService.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/sales/markets"), 1500);
    } catch (err) {
      console.error("❌ Error creating Market:", err);
      setError("Không thể tạo thị trường. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Thị Trường Mới</h1>
          <p className="text-neutral-600 mt-1">Nhập thông tin thị trường mới</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl space-y-6"
        >
          {/* Tên thị trường */}
          <InputField
            label="Tên thị trường"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="VD: Thị trường chứng khoán"
            required
          />

          {/* Mã thị trường */}
          <InputField
            label="Mã thị trường"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="VD: STOCK"
            required
          />

          {/* Mô tả */}
          <TextareaField
            label="Mô tả (tùy chọn)"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          {/* Error / Success */}
          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && (
            <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              Tạo thị trường thành công! Đang chuyển hướng...
            </p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${
                loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {loading ? "Đang lưu..." : "Tạo thị trường"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== COMPONENTS NHỎ ======
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <Input
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
      <Textarea
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
