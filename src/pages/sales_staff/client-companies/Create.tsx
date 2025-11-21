import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Briefcase,
  ArrowLeft,
  Plus,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { clientCompanyService, type ClientCompanyPayload } from "../../../services/ClientCompany";

export default function ClientCompanyCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  }>({});
  const [form, setForm] = useState<ClientCompanyPayload>({
    name: "",
    taxCode: "",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    address: "",
  });

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneDigits = phone.replace(/\D/g, ""); // Remove non-digits
    return phoneDigits.length === 10;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Chỉ cho phép số cho phone
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setForm((prev) => ({ ...prev, [name]: digitsOnly }));
        // Clear error khi user đang nhập
        if (formErrors.phone) {
          setFormErrors((prev) => ({ ...prev, phone: undefined }));
        }
      }
      return;
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error khi user đang nhập
    if (name === "name" && formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
    if (name === "contactPerson" && formErrors.contactPerson) {
      setFormErrors((prev) => ({ ...prev, contactPerson: undefined }));
    }
    if (name === "email" && formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: { name?: string; contactPerson?: string; email?: string; phone?: string } = {};
    
    // Validate tên công ty (bắt buộc)
    if (!form.name || form.name.trim() === "") {
      errors.name = "Tên công ty là bắt buộc";
    }
    
    // Validate người liên hệ (bắt buộc)
    if (!form.contactPerson || form.contactPerson.trim() === "") {
      errors.contactPerson = "Người liên hệ là bắt buộc";
    }
    
    // Validate email (bắt buộc)
    if (!form.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!validateEmail(form.email)) {
      errors.email = "Email không hợp lệ";
    }
    
    // Validate phone (không bắt buộc nhưng nếu có thì phải đúng format)
    if (form.phone && !validatePhone(form.phone)) {
      errors.phone = "Số điện thoại phải có đúng 10 chữ số";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn tạo công ty mới không?");
    if (!confirmed) {
      return;
    }
    
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
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/sales/clients"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo công ty khách hàng mới</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm công ty khách hàng vào hệ thống
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Tạo công ty khách hàng mới
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Tên công ty */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên công ty..."
                  required
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    formErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-200 focus:border-primary-500"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã số thuế */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Mã số thuế
                  </label>
                  <input
                    name="taxCode"
                    value={form.taxCode}
                    onChange={handleChange}
                    placeholder="Nhập mã số thuế..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Người liên hệ */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Nhập người liên hệ..."
                    required
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      formErrors.contactPerson
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  />
                  {formErrors.contactPerson && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.contactPerson}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Mail className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin liên hệ</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chức vụ */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Chức vụ
                  </label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Nhập chức vụ..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Nhập email..."
                    required
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      formErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại (10 chữ số)..."
                    maxLength={10}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      formErrors.phone
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {(error || success) && (
            <div className="animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Tạo công ty thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/sales/clients"
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Tạo công ty
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}