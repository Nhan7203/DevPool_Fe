import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { partnerService, type Partner, type PartnerPayload } from "../../../services/Partner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  FileText,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "../../../router/routes";

export default function PartnerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerPayload>({
    companyName: "",
    taxCode: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu đối tác
  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await partnerService.getAll();
        const foundPartner = data.find((p: Partner) => p.id === Number(id));
        if (foundPartner) {
          setPartner(foundPartner);
          setFormData({
            companyName: foundPartner.companyName,
            taxCode: foundPartner.taxCode ?? "",
            contactPerson: foundPartner.contactPerson ?? "",
            email: foundPartner.email ?? "",
            phone: foundPartner.phone ?? "",
            address: foundPartner.address ?? "",
          });
        }
      } catch (err) {
        console.error("❌ Lỗi tải đối tác:", err);
        alert("Không thể tải thông tin đối tác!");
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    if (!id) return;

    // Xác nhận trước khi lưu
    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
    if (!confirmed) {
      return;
    }

    if (!formData.companyName.trim()) {
      alert("⚠️ Vui lòng nhập tên công ty!");
      return;
    }

    try {
      await partnerService.update(Number(id), formData);
      alert("✅ Cập nhật đối tác thành công!");
      navigate(`${ROUTES.HR_STAFF.PARTNERS.LIST}/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật đối tác:", err);
      alert("Không thể cập nhật đối tác!");
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy đối tác</p>
            <Link 
              to={ROUTES.HR_STAFF.PARTNERS.LIST}
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`${ROUTES.HR_STAFF.PARTNERS.LIST}/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa đối tác</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin đối tác trong hệ thống DevPool
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa thông tin đối tác
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
                <Input
            name="companyName"
                  value={formData.companyName}
            onChange={handleChange}
                  placeholder="Nhập tên công ty..."
                  required
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
          />
        </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã số thuế */}
        <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mã số thuế
                  </label>
                  <Input
            name="taxCode"
                    value={formData.taxCode}
            onChange={handleChange}
                    placeholder="Nhập mã số thuế..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
          />
        </div>

                {/* Người liên hệ */}
        <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người liên hệ
                  </label>
                  <Input
            name="contactPerson"
                    value={formData.contactPerson}
            onChange={handleChange}
                    placeholder="Nhập người liên hệ..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
          />
        </div>

                {/* Email */}
        <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
            name="email"
            type="email"
                    value={formData.email}
            onChange={handleChange}
                    placeholder="Nhập email..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
          />
        </div>

                {/* Số điện thoại */}
        <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </label>
                  <Input
            name="phone"
                    value={formData.phone}
            onChange={handleChange}
                    placeholder="Nhập số điện thoại..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
          />
                </div>
        </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ
                </label>
          <textarea
            name="address"
                  value={formData.address}
            onChange={handleChange}
            rows={3}
                  placeholder="Nhập địa chỉ..."
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 resize-none"
          />
              </div>
        </div>
      </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              to={`${ROUTES.HR_STAFF.PARTNERS.LIST}/${id}`}
              className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 font-medium transition-all duration-300"
            >
              Hủy
            </Link>
            <Button
          type="submit"
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
        >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
