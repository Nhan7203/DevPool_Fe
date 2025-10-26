import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCertificateService, type TalentCertificateCreate } from "../../../services/TalentCertificate";
import { certificateTypeService, type CertificateType } from "../../../services/CertificateType";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Award, 
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function TalentCertificateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allCertificateTypes, setAllCertificateTypes] = useState<CertificateType[]>([]);
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentCertificateCreate>({
    talentId: 0,
    certificateTypeId: 0,
    issuedDate: "",
    isVerified: false,
    imageUrl: "",
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent Certificate
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentCertificateService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          certificateTypeId: data.certificateTypeId,
          issuedDate: data.issuedDate ? data.issuedDate.split('T')[0] : "", // Convert to date format
          isVerified: data.isVerified,
          imageUrl: data.imageUrl,
        });
        setTalentId(data.talentId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin chứng chỉ!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách Certificate Types
  useEffect(() => {
    const fetchCertificateTypes = async () => {
      try {
        const certificateTypes = await certificateTypeService.getAll({ excludeDeleted: true });
        setAllCertificateTypes(certificateTypes);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách loại chứng chỉ:", err);
      }
    };
    fetchCertificateTypes();
  }, []);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === "certificateTypeId" ? Number(value) : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.certificateTypeId || formData.certificateTypeId === 0) {
      alert("⚠️ Vui lòng chọn loại chứng chỉ trước khi lưu!");
      return;
    }

    if (!formData.imageUrl.trim()) {
      alert("⚠️ Vui lòng nhập URL hình ảnh chứng chỉ!");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.imageUrl);
    } catch {
      alert("⚠️ URL hình ảnh không hợp lệ!");
      return;
    }

    try {
      console.log("Payload gửi đi:", formData);
      await talentCertificateService.update(Number(id), formData);

      alert("✅ Cập nhật chứng chỉ thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật chứng chỉ!");
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
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết talent</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa chứng chỉ</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin chứng chỉ của talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa chứng chỉ
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
                  <Award className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin chứng chỉ</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Loại chứng chỉ */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Loại chứng chỉ
                </label>
                <div className="relative">
                  <select
                    name="certificateTypeId"
                    value={formData.certificateTypeId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="0">-- Chọn loại chứng chỉ --</option>
                    {allCertificateTypes.map(certType => (
                      <option key={certType.id} value={certType.id}>{certType.name}</option>
                    ))}
                  </select>
                </div>
                {formData.certificateTypeId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allCertificateTypes.find(ct => ct.id === formData.certificateTypeId)?.name || "Không xác định"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngày cấp */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày cấp (tùy chọn)
                  </label>
                  <Input
                    type="date"
                    name="issuedDate"
                    value={formData.issuedDate}
                    onChange={handleChange}
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Để trống nếu chưa có ngày cấp cụ thể
                  </p>
                </div>

                {/* Trạng thái xác thực */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trạng thái xác thực
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Đánh dấu nếu chứng chỉ đã được xác thực
                  </p>
                </div>
              </div>

              {/* URL hình ảnh */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  URL hình ảnh chứng chỉ
                </label>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/certificate-image.jpg"
                  required
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Nhập URL đầy đủ của hình ảnh chứng chỉ
                </p>
                {formData.imageUrl && (
                  <div className="mt-3">
                    <a
                      href={formData.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem trước hình ảnh
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
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
