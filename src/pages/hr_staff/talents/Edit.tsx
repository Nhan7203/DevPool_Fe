import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentService, type TalentCreate } from "../../../services/Talent";
import { locationService, type Location } from "../../../services/location";
import { partnerService, type Partner } from "../../../services/Partner";
import { userService, type User as UserType } from "../../../services/User";
import { WorkingMode } from "../../../types/WorkingMode";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Globe, 
  FileText, 
  AlertCircle,
  Briefcase,
  Github,
  ExternalLink,
  Building2
} from "lucide-react";

// Mapping WorkingMode values to Vietnamese names (for future use)
// const workingModeLabels: Record<number, string> = {
//   [WorkingMode.None]: "Không xác định",
//   [WorkingMode.Onsite]: "Tại văn phòng",
//   [WorkingMode.Remote]: "Làm việc từ xa",
//   [WorkingMode.Hybrid]: "Kết hợp",
//   [WorkingMode.Flexible]: "Linh hoạt",
// };

export default function TalentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [formData, setFormData] = useState<TalentCreate>({
    currentPartnerId: 1, // Default partner ID
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    locationId: undefined,
    workingMode: WorkingMode.None,
    githubUrl: "",
    portfolioUrl: "",
    status: "Available",
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentService.getById(Number(id));

        setFormData({
          currentPartnerId: data.currentPartnerId,
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth || "",
          locationId: data.locationId,
          workingMode: data.workingMode,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          status: data.status,
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin Talent!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await locationService.getAll({ excludeDeleted: true });
        setLocations(locationsData);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách địa điểm:", err);
      }
    };
    fetchLocations();
  }, []);

  // 🧭 Load danh sách Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getAll({ excludeDeleted: true });
        setUsers(usersData.items);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách người dùng:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🧭 Load danh sách Partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersData = await partnerService.getAll();
        setPartners(partnersData);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách công ty:", err);
      }
    };
    fetchPartners();
  }, []);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "workingMode" || name === "locationId" || name === "currentPartnerId"
        ? Number(value) || undefined
        : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.fullName.trim()) {
      alert("⚠️ Vui lòng nhập họ tên!");
      return;
    }

    if (!formData.email.trim()) {
      alert("⚠️ Vui lòng nhập email!");
      return;
    }

    if (!formData.phone.trim()) {
      alert("⚠️ Vui lòng nhập số điện thoại!");
      return;
    }

    try {
      // Format dateOfBirth to UTC ISO string if it exists
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth 
          ? new Date(formData.dateOfBirth + 'T00:00:00.000Z').toISOString()
          : undefined
      };
      
      console.log("Payload gửi đi:", payload);
      await talentService.update(Number(id), payload);

      alert("✅ Cập nhật talent thành công!");
      navigate(`/hr/developers/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật talent!");
    }
  };

  if (loading)
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/hr/developers/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa talent</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin talent trong hệ thống DevPool
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa thông tin talent
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
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Công ty */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Công ty
                  </label>
                  <div className="relative">
                    <select
                      name="currentPartnerId"
                      value={formData.currentPartnerId}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn công ty --</option>
                      {partners.map(partner => (
                        <option key={partner.id} value={partner.id}>
                          {partner.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Người dùng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người dùng
                  </label>
                  <div className="relative">
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Họ tên */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên..."
                  required
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email..."
                    required
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
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngày sinh */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* Khu vực */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Khu vực làm việc
                  </label>
                  <div className="relative">
                    <select
                      name="locationId"
                      value={formData.locationId || ""}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn khu vực --</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin nghề nghiệp</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chế độ làm việc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Chế độ làm việc
                  </label>
                  <div className="relative">
                    <select
                      name="workingMode"
                      value={formData.workingMode}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value={WorkingMode.None}>Không xác định</option>
                      <option value={WorkingMode.Onsite}>Tại văn phòng</option>
                      <option value={WorkingMode.Remote}>Làm việc từ xa</option>
                      <option value={WorkingMode.Hybrid}>Kết hợp</option>
                      <option value={WorkingMode.Flexible}>Linh hoạt</option>
                    </select>
                  </div>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <ExternalLink className="w-5 h-5 text-warning-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Liên kết portfolio</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub URL
                  </label>
                  <Input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* Portfolio */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Portfolio URL
                  </label>
                  <Input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://portfolio.example.com"
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${id}`}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
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