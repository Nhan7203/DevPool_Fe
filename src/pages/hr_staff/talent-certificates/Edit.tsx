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
  ExternalLink,
  FileText,
  Search
} from "lucide-react";

function TalentCertificateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allCertificateTypes, setAllCertificateTypes] = useState<CertificateType[]>([]);
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentCertificateCreate>({
    talentId: 0,
    certificateTypeId: 0,
    certificateName: "",
    certificateDescription: "",
    issuedDate: "",
    isVerified: false,
    imageUrl: "",
  });

  const [loading, setLoading] = useState(true);

  // State cho certificate type dropdown
  const [isCertificateTypeDropdownOpen, setIsCertificateTypeDropdownOpen] = useState(false);
  const [certificateTypeSearch, setCertificateTypeSearch] = useState("");

  // 🧭 Load dữ liệu Talent Certificate
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentCertificateService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          certificateTypeId: data.certificateTypeId,
          certificateName: data.certificateName || "",
          certificateDescription: data.certificateDescription || "",
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

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isCertificateTypeDropdownOpen && !target.closest('.certificate-type-dropdown-container')) {
        setIsCertificateTypeDropdownOpen(false);
      }
    };

    if (isCertificateTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isCertificateTypeDropdownOpen]);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    // Xác nhận trước khi lưu
    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
    if (!confirmed) {
      return;
    }

    if (!formData.certificateTypeId || formData.certificateTypeId === 0) {
      alert("⚠️ Vui lòng chọn loại chứng chỉ trước khi lưu!");
      return;
    }

    if (!formData.certificateName || formData.certificateName.trim() === "") {
      alert("⚠️ Vui lòng nhập tên chứng chỉ trước khi lưu!");
      return;
    }

    if (formData.certificateName.length > 255) {
      alert("⚠️ Tên chứng chỉ không được vượt quá 255 ký tự!");
      return;
    }

    if (formData.certificateDescription && formData.certificateDescription.length > 1000) {
      alert("⚠️ Mô tả chứng chỉ không được vượt quá 1000 ký tự!");
      return;
    }

    const imageUrl = formData.imageUrl.trim();

    if (imageUrl) {
      try {
        const parsed = new URL(imageUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("invalid protocol");
        }
      } catch {
        alert("⚠️ URL hình ảnh không hợp lệ!");
        return;
      }
    }

    try {
      console.log("Payload gửi đi:", formData);
      await talentCertificateService.update(Number(id), {
        ...formData,
        imageUrl: imageUrl || "",
        issuedDate: formData.issuedDate ? formData.issuedDate : undefined,
      });

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
                  Loại chứng chỉ <span className="text-red-500">*</span>
                </label>
                <div className="relative certificate-type-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsCertificateTypeDropdownOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Award className="w-4 h-4 text-neutral-400" />
                      <span className={formData.certificateTypeId ? "text-neutral-800" : "text-neutral-500"}>
                        {formData.certificateTypeId
                          ? allCertificateTypes.find(ct => ct.id === formData.certificateTypeId)?.name || "Chọn loại chứng chỉ"
                          : "Chọn loại chứng chỉ"}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                  </button>
                  {isCertificateTypeDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      <div className="p-3 border-b border-neutral-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            value={certificateTypeSearch}
                            onChange={(e) => setCertificateTypeSearch(e.target.value)}
                            placeholder="Tìm loại chứng chỉ..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {(() => {
                          const filtered = certificateTypeSearch
                            ? allCertificateTypes.filter(ct =>
                              ct.name.toLowerCase().includes(certificateTypeSearch.toLowerCase())
                            )
                            : allCertificateTypes;

                          if (filtered.length === 0) {
                            return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy loại chứng chỉ phù hợp</p>;
                          }

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, certificateTypeId: 0 }));
                                  setCertificateTypeSearch("");
                                  setIsCertificateTypeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                  !formData.certificateTypeId
                                    ? "bg-primary-50 text-primary-700"
                                    : "hover:bg-neutral-50 text-neutral-700"
                                }`}
                              >
                                Chọn loại chứng chỉ
                              </button>
                              {filtered.map(certType => (
                                <button
                                  type="button"
                                  key={certType.id}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, certificateTypeId: certType.id }));
                                    setCertificateTypeSearch("");
                                    setIsCertificateTypeDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm ${
                                    formData.certificateTypeId === certType.id
                                      ? "bg-primary-50 text-primary-700"
                                      : "hover:bg-neutral-50 text-neutral-700"
                                  }`}
                                >
                                  {certType.name}
                                </button>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                {formData.certificateTypeId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allCertificateTypes.find(ct => ct.id === formData.certificateTypeId)?.name || "Không xác định"}
                    </span>
                  </p>
                )}
              </div>

              {/* Tên chứng chỉ */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tên chứng chỉ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="certificateName"
                  value={formData.certificateName}
                  onChange={handleChange}
                  maxLength={255}
                  required
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  placeholder="Nhập tên chứng chỉ"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Tối đa 255 ký tự
                </p>
              </div>

              {/* Mô tả chứng chỉ */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả chứng chỉ (tùy chọn)
                </label>
                <textarea
                  name="certificateDescription"
                  value={formData.certificateDescription || ""}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={4}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                  placeholder="Nhập mô tả về chứng chỉ..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Tối đa 1000 ký tự
                </p>
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
                  URL hình ảnh chứng chỉ (tùy chọn)
                </label>
                <Input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/certificate-image.jpg"
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Nhập URL nếu muốn đính kèm hình ảnh chứng chỉ
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

export default TalentCertificateEditPage;
