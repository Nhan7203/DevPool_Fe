import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCertificateService, type TalentCertificateCreate, type TalentCertificate } from "../../../services/TalentCertificate";
import { certificateTypeService, type CertificateType } from "../../../services/CertificateType";
import { type ExtractedCertificate } from "../../../services/TalentCV";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Award, 
  Calendar, 
  Upload,
  CheckCircle,
  AlertCircle, 
  X,
  ExternalLink
} from "lucide-react";

function TalentCertificateCreatePage() {
  const [searchParams] = useSearchParams();
  const talentId = searchParams.get('talentId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TalentCertificateCreate>({
    talentId: talentId ? Number(talentId) : 0,
    certificateTypeId: 0,
    issuedDate: "",
    isVerified: false,
    imageUrl: "",
  });

  const [allCertificateTypes, setAllCertificateTypes] = useState<CertificateType[]>([]);
  const [existingCertificateTypeIds, setExistingCertificateTypeIds] = useState<number[]>([]);
  const [analysisCertificates, setAnalysisCertificates] = useState<ExtractedCertificate[]>([]);
  const analysisStorageKey = talentId ? `talent-analysis-prefill-certificates-${talentId}` : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certificateTypes = await certificateTypeService.getAll({ excludeDeleted: true });
        setAllCertificateTypes(certificateTypes);
      } catch (error) {
        console.error("❌ Error loading certificate types", error);
      }
    };
    fetchData();
  }, []);

  // Fetch existing certificates for this talent to disable them in dropdown
  useEffect(() => {
    const fetchExistingCertificates = async () => {
      if (!talentId) return;
      try {
        const existingCertificates = await talentCertificateService.getAll({ talentId: Number(talentId), excludeDeleted: true });
        const certificateTypeIds = (existingCertificates as TalentCertificate[])
          .map((certificate) => certificate.certificateTypeId ?? 0)
          .filter((certificateTypeId): certificateTypeId is number => certificateTypeId > 0);
        setExistingCertificateTypeIds(certificateTypeIds);
      } catch (error) {
        console.error("❌ Error loading existing certificates", error);
      }
    };
    fetchExistingCertificates();
  }, [talentId]);

  useEffect(() => {
    if (!analysisStorageKey) return;
    try {
      const raw = sessionStorage.getItem(analysisStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ExtractedCertificate[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAnalysisCertificates(parsed);
      }
    } catch (error) {
      console.error("❌ Không thể đọc gợi ý chứng chỉ từ phân tích CV", error);
    }
  }, [analysisStorageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === "certificateTypeId" ? Number(value) : value 
    }));
  };

  const normalizeDateInput = (value?: string | null) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
    if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return "";
  };

  const findCertificateType = (suggestion: ExtractedCertificate) => {
    if (!suggestion.certificateName) return undefined;
    const target = suggestion.certificateName.toLowerCase();
    return allCertificateTypes.find((type) => {
      const name = type.name.toLowerCase();
      return name.includes(target) || target.includes(name);
    });
  };

  const applyCertificateSuggestion = (suggestion: ExtractedCertificate) => {
    if (!suggestion) return;
    const matchedType = findCertificateType(suggestion);
    if (!matchedType) {
      setError(`⚠️ Không tìm thấy loại chứng chỉ phù hợp với "${suggestion.certificateName}". Vui lòng chọn thủ công.`);
      return;
    }
    setError("");
    setSuccess(false);
    setForm(prev => ({
      ...prev,
      certificateTypeId: matchedType.id,
      issuedDate: normalizeDateInput(suggestion.issuedDate) || prev.issuedDate,
      imageUrl: suggestion.imageUrl ?? prev.imageUrl,
      isVerified: prev.isVerified,
    }));
  };

  const clearCertificateSuggestions = () => {
    if (analysisStorageKey) {
      sessionStorage.removeItem(analysisStorageKey);
    }
    setAnalysisCertificates([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn thêm chứng chỉ cho nhân sự không?");
    if (!confirmed) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.certificateTypeId || form.certificateTypeId === 0) {
      setError("⚠️ Vui lòng chọn loại chứng chỉ trước khi tạo.");
      setLoading(false);
      return;
    }

    const imageUrl = form.imageUrl.trim();

    if (imageUrl) {
      try {
        const parsed = new URL(imageUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("invalid protocol");
        }
      } catch {
        setError("⚠️ URL hình ảnh không hợp lệ.");
        setLoading(false);
        return;
      }
    }

    try {
      await talentCertificateService.create({
        ...form,
        imageUrl: imageUrl || "",
        issuedDate: form.issuedDate ? form.issuedDate : undefined,
      });
      clearCertificateSuggestions();
      setSuccess(true);
      setTimeout(() => navigate(`/hr/developers/${talentId}`), 1500);
    } catch (err) {
      console.error("❌ Error creating Talent Certificate:", err);
      setError("Không thể tạo chứng chỉ cho nhân sự. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
              <span className="font-medium">Quay lại chi tiết nhân sự</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm chứng chỉ cho nhân sự</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm chứng chỉ mới cho nhân sự
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Thêm chứng chỉ mới
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {analysisCertificates.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-900">Gợi ý chứng chỉ từ CV</p>
                  <p className="text-xs text-rose-700 mt-1">
                    Chọn một chứng chỉ bên dưới để tự động điền thông tin vào biểu mẫu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCertificateSuggestions}
                  className="text-xs font-medium text-rose-800 hover:text-rose-900 underline"
                >
                  Bỏ gợi ý
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {analysisCertificates.map((certificate, index) => (
                  <div
                    key={`analysis-certificate-${index}`}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-sm font-semibold text-rose-900">{certificate.certificateName ?? "Chứng chỉ chưa rõ"}</p>
                      <p className="text-xs text-rose-700 mt-1">Ngày cấp: {certificate.issuedDate ?? "Chưa rõ"}</p>
                      {certificate.imageUrl && (
                        <a
                          href={certificate.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-rose-600 underline mt-1 inline-block"
                        >
                          Tệp đính kèm
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => applyCertificateSuggestion(certificate)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:from-rose-700 hover:to-rose-800"
                    >
                      <Plus className="w-4 h-4" />
                      Điền form
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <select
                  name="certificateTypeId"
                  value={form.certificateTypeId}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  required
                >
                  <option value="0">-- Chọn loại chứng chỉ --</option>
                  {allCertificateTypes.map(certType => {
                    const isDisabled = existingCertificateTypeIds.includes(certType.id);
                    return (
                      <option 
                        key={certType.id} 
                        value={certType.id}
                        disabled={isDisabled}
                        style={isDisabled ? { color: '#999', fontStyle: 'italic' } : {}}
                      >
                        {certType.name}{isDisabled ? ' (đã chọn)' : ''}
                      </option>
                    );
                  })}
                </select>
                {form.certificateTypeId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allCertificateTypes.find(ct => ct.id === form.certificateTypeId)?.name || "Không xác định"}
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
                  <input
                    type="date"
                    name="issuedDate"
                    value={form.issuedDate}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
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
                      checked={form.isVerified}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {form.isVerified ? "Đã xác thực" : "Chưa xác thực"}
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
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/certificate-image.jpg"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                />
                <p className="text-xs text-neutral-500 mt-1">
                Nhập URL nếu muốn đính kèm hình ảnh chứng chỉ
                </p>
                {form.imageUrl && (
                  <div className="mt-3">
                    <a
                      href={form.imageUrl}
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
                    ✅ Thêm chứng chỉ thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
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
                  Thêm chứng chỉ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TalentCertificateCreatePage;
