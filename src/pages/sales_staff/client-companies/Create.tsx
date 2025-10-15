import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { clientCompanyService, type ClientCompanyPayload } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";

export default function ClientCompanyCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ClientCompanyPayload>({
    name: "",
    taxCode: "",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    address: "",
  });

  // ✍️ Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // ✅ Validate required fields
    if (!form.name.trim()) {
      setError("Tên công ty không được để trống.");
      setLoading(false);
      return;
    }
    if (!form.contactPerson.trim()) {
      setError("Người liên hệ không được để trống.");
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError("Email không được để trống.");
      setLoading(false);
      return;
    }

    try {
      await clientCompanyService.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/sales/clients"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo công ty:", err);
      setError("Không thể tạo công ty. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Công Ty Khách Hàng Mới</h1>
          <p className="text-neutral-600 mt-1">Nhập thông tin công ty khách hàng để tạo mới</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-2xl p-8 max-w-3xl space-y-6">
          <InputField
            label="Tên công ty"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Mã số thuế"
            name="taxCode"
            value={form.taxCode}
            onChange={handleChange}
          />
          <InputField
            label="Người liên hệ"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            required
          />
          <InputField
            label="Chức vụ"
            name="position"
            value={form.position}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <InputField
            label="Địa chỉ"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          {/* Error / Success Message */}
          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">Tạo công ty thành công! Đang chuyển hướng...</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={`${loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"} px-6 py-2 rounded-xl text-white font-medium transition-colors`}
            >
              {loading ? "Đang lưu..." : "Tạo công ty"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Component InputField nhỏ gọn =====
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
