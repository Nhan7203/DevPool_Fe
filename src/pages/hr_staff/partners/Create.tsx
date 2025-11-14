import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerService, type PartnerPayload } from '../../../services/Partner';
import { ROUTES } from '../../../router/routes';

export default function CreatePartner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PartnerPayload>({
    companyName: '',
    taxCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    // Validate companyName
    if (name === 'companyName') {
      if (value && value.trim() !== '') {
        delete newErrors.companyName;
      }
    }

    // Validate taxCode
    if (name === 'taxCode') {
      if (value && value.trim() !== '') {
        delete newErrors.taxCode;
      }
    }

    // Validate contactPerson
    if (name === 'contactPerson') {
      if (value && value.trim() !== '') {
        delete newErrors.contactPerson;
      }
    }

    // Validate email
    if (name === 'email') {
      if (value && validateEmail(value)) {
        delete newErrors.email;
      } else if (value && !validateEmail(value)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    // Validate phone
    if (name === 'phone') {
      if (value && validatePhone(value)) {
        delete newErrors.phone;
      } else if (value && !validatePhone(value)) {
        newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số';
      }
    }

    setErrors(newErrors);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const newErrors: Record<string, string> = {};

    if (!formData.companyName || formData.companyName.trim() === '') {
      newErrors.companyName = 'Tên công ty là bắt buộc';
    }

    if (!formData.taxCode || formData.taxCode.trim() === '') {
      newErrors.taxCode = 'Mã số thuế là bắt buộc';
    }

    if (!formData.contactPerson || formData.contactPerson.trim() === '') {
      newErrors.contactPerson = 'Người liên hệ là bắt buộc';
    }

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone || !validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('⚠️ Vui lòng điền đầy đủ và chính xác các trường bắt buộc');
      return;
    }
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn tạo đối tác mới không?");
    if (!confirmed) {
      return;
    }
    
    setLoading(true);
    try {
      await partnerService.create(formData);
      alert('✅ Tạo đối tác thành công!');
      navigate(ROUTES.HR_STAFF.PARTNERS.LIST);
    } catch (error) {
      console.error(error);
      alert('❌ Lỗi khi tạo đối tác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Building2 className="text-white font-bold text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Đối Tác Mới
            </h1>
            <p className="text-neutral-600 mt-2">Thêm công ty đối tác mới vào hệ thống DevPool</p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên công ty */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all ${errors.companyName ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'}`}
                    placeholder="Tên công ty đối tác"
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                )}
              </div>

              {/* Grid: Mã số thuế + Người liên hệ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Mã số thuế <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                    <input
                      type="text"
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all ${errors.taxCode ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'}`}
                      placeholder="Nhập mã số thuế"
                    />
                  </div>
                  {errors.taxCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.taxCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all ${errors.contactPerson ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'}`}
                      placeholder="Tên người liên hệ"
                    />
                  </div>
                  {errors.contactPerson && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactPerson}</p>
                  )}
                </div>
              </div>

              {/* Grid: Email + Số điện thoại */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'}`}
                      placeholder="example@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'}`}
                      placeholder="0123456789"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    placeholder="Số nhà, đường, quận, thành phố"
                  />
                </div>
              </div>

              {/* Submit Button */}
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
                    'Tạo đối tác'
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
