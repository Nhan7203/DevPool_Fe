import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, MapPin, User, Briefcase } from "lucide-react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

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

      {/* Content */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30 p-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">
            Tạo Công Ty Khách Hàng Mới
          </h1>
          <p className="text-neutral-600 mt-2">
            Nhập thông tin chi tiết để thêm công ty khách hàng vào hệ thống DevPool
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 max-w-3xl mx-auto border border-neutral-200/50 animate-fade-in-up space-y-6"
        >
          <InputField label="Tên công ty" name="name" value={form.name} onChange={handleChange} required icon={<Building2 />} />
          <InputField label="Mã số thuế" name="taxCode" value={form.taxCode} onChange={handleChange} icon={<Briefcase />} />
          <InputField label="Người liên hệ" name="contactPerson" value={form.contactPerson} onChange={handleChange} required icon={<User />} />
          <InputField label="Chức vụ" name="position" value={form.position} onChange={handleChange} icon={<Briefcase />} />
          <InputField label="Email" type="email" name="email" value={form.email} onChange={handleChange} required icon={<Mail />} />
          <InputField label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} icon={<Phone />} />
          <InputField label="Địa chỉ" name="address" value={form.address} onChange={handleChange} icon={<MapPin />} />

          {/* Messages */}
          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">✅ Tạo công ty thành công! Đang chuyển hướng...</p>}

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-glow 
                ${loading
                  ? "bg-primary-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 hover:scale-[1.02]"}`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </div>
              ) : (
                "Tạo công ty"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 🧩 Input Field Component
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
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3 border rounded-xl bg-white/60 border-neutral-300 
          focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
          hover:shadow-soft transition-all duration-200"
        />
      </div>
    </div>
  );
}
