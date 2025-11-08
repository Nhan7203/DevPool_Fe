import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentWorkExperienceService, type TalentWorkExperienceCreate } from "../../../services/TalentWorkExperience";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Workflow, 
  Building2, 
  Calendar, 
  FileText,
  AlertCircle, 
  CheckCircle,
  X
} from "lucide-react";

export default function TalentWorkExperienceCreatePage() {
  const [searchParams] = useSearchParams();
  const talentId = searchParams.get('talentId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TalentWorkExperienceCreate>({
    talentId: talentId ? Number(talentId) : 0,
    talentCVId: 0,
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [talentCVs, setTalentCVs] = useState<TalentCV[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (talentId) {
          const cvs = await talentCVService.getAll({ talentId: Number(talentId), excludeDeleted: true });
          setTalentCVs(cvs);
        }
      } catch (error) {
        console.error("❌ Error loading talent CVs", error);
      }
    };
    fetchData();
  }, [talentId]);

  // Validate start date similar to talents/Create.tsx
  const validateStartDate = (date: string): boolean => {
    if (!date) return false;
    const startDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (startDate > today) return false;
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    return startDate >= hundredYearsAgo;
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // realtime validation for dates
    if (name === 'startDate') {
      const newErrors = { ...fieldErrors };
      if (value && !validateStartDate(value)) {
        newErrors.startDate = 'Ngày bắt đầu không hợp lệ (không sau hiện tại, không quá 100 năm trước)';
      } else {
        delete newErrors.startDate;
        // if endDate exists, ensure end > start
        if (form.endDate) {
          if (new Date(form.endDate) <= new Date(value)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
          } else {
            delete newErrors.endDate;
          }
        }
      }
      setFieldErrors(newErrors);
    }

    if (name === 'endDate') {
      const newErrors = { ...fieldErrors };
      if (value && form.startDate) {
        if (new Date(value) <= new Date(form.startDate)) {
          newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        } else {
          delete newErrors.endDate;
        }
      } else {
        delete newErrors.endDate;
      }
      setFieldErrors(newErrors);
    }

    setForm(prev => ({ 
      ...prev, 
      [name]: name === "talentCVId" ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn thêm kinh nghiệm làm việc cho talent không?");
    if (!confirmed) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.talentCVId || form.talentCVId === 0) {
      setError("⚠️ Vui lòng chọn CV trước khi tạo.");
      setLoading(false);
      return;
    }

    if (!form.company.trim()) {
      setError("⚠️ Vui lòng nhập tên công ty.");
      setLoading(false);
      return;
    }

    if (!form.position.trim()) {
      setError("⚠️ Vui lòng nhập vị trí làm việc.");
      setLoading(false);
      return;
    }

    if (!form.startDate) {
      setError("⚠️ Vui lòng chọn ngày bắt đầu.");
      setLoading(false);
      return;
    }
    if (!validateStartDate(form.startDate)) {
      setError("⚠️ Ngày bắt đầu không hợp lệ (không sau hiện tại, không quá 100 năm trước).");
      setLoading(false);
      return;
    }

    if (!form.description.trim()) {
      setError("⚠️ Vui lòng nhập mô tả công việc.");
      setLoading(false);
      return;
    }

    // Validate date logic
    if (form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      setError("⚠️ Ngày kết thúc phải sau ngày bắt đầu.");
      setLoading(false);
      return;
    }

    try {
      // Convert date strings to UTC ISO strings for PostgreSQL
      const formData = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      
      await talentWorkExperienceService.create(formData);
      setSuccess(true);
      setTimeout(() => navigate(`/hr/developers/${talentId}`), 1500);
    } catch (err) {
      console.error("❌ Error creating Talent Work Experience:", err);
      setError("Không thể tạo kinh nghiệm làm việc cho talent. Vui lòng thử lại.");
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
              <span className="font-medium">Quay lại chi tiết talent</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm kinh nghiệm làm việc cho talent</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm kinh nghiệm làm việc mới cho talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Thêm kinh nghiệm làm việc mới
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
                  <Workflow className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin kinh nghiệm làm việc</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* CV của Talent */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV của Talent <span className="text-red-500">*</span>
                </label>
                <select
                  name="talentCVId"
                  value={form.talentCVId}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  required
                >
                  <option value="0">-- Chọn CV --</option>
                  {talentCVs.map(cv => (
                    <option key={cv.id} value={cv.id}>{cv.versionName}</option>
                  ))}
                </select>
                {form.talentCVId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Tóm tắt: <span className="font-medium text-neutral-700">
                      {talentCVs.find(cv => cv.id === form.talentCVId)?.summary || "Không có tóm tắt"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Công ty */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="VD: Google, Microsoft, Facebook..."
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Vị trí */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="VD: Software Engineer, Product Manager..."
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      fieldErrors.startDate ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.startDate}</p>
                  )}
                </div>

                {/* Ngày kết thúc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày kết thúc (tùy chọn)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      fieldErrors.endDate ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.endDate}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    Để trống nếu vẫn đang làm việc
                  </p>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm và thành tựu..."
                  rows={4}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                />
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
                    ✅ Thêm kinh nghiệm làm việc thành công! Đang chuyển hướng...
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
                  Thêm kinh nghiệm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}