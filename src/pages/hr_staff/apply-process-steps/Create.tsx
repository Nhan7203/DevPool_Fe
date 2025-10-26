import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyProcessStepService, type ApplyProcessStepCreate } from "../../../services/ApplyProcessStep";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X,
  Calendar,
  Hash,
  Building2
} from "lucide-react";

export default function ApplyProcessStepCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<ApplyProcessTemplate[]>([]);
  
  const [form, setForm] = useState({
    templateId: templateIdFromUrl ? Number(templateIdFromUrl) : 0,
    stepOrder: 1,
    stepName: "",
    description: "",
    estimatedDays: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templatesData = await applyProcessTemplateService.getAll();
        setTemplates(templatesData);
      } catch (error) {
        console.error("❌ Error loading data", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.templateId || form.templateId === 0) {
      setError("⚠️ Vui lòng chọn mẫu quy trình.");
      setLoading(false);
      return;
    }

    if (!form.stepName.trim()) {
      setError("⚠️ Vui lòng nhập tên bước.");
      setLoading(false);
      return;
    }

    try {
      const payload: ApplyProcessStepCreate = {
        templateId: Number(form.templateId),
        stepOrder: Number(form.stepOrder),
        stepName: form.stepName,
        description: form.description,
        estimatedDays: Number(form.estimatedDays),
      };

      await applyProcessStepService.create(payload);
      setSuccess(true);
      const redirectPath = form.templateId 
        ? `/hr/apply-process-templates/${form.templateId}` 
        : "/hr/apply-process-steps";
      setTimeout(() => navigate(redirectPath), 1500);
    } catch (err) {
      console.error("❌ Error creating Apply Process Step:", err);
      setError("Không thể tạo bước quy trình. Vui lòng thử lại.");
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
              to={form.templateId ? `/hr/apply-process-templates/${form.templateId}` : "/hr/apply-process-steps"}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{form.templateId ? "Quay lại chi tiết template" : "Quay lại danh sách"}</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo bước quy trình mới</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để tạo bước quy trình tuyển dụng mới
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Tạo bước quy trình mới
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
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Mẫu quy trình */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Mẫu quy trình <span className="text-red-500">*</span>
                </label>
                <select
                  name="templateId"
                  value={form.templateId}
                  onChange={handleChange}
                  disabled={!!templateIdFromUrl}
                  className={`w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 ${
                    templateIdFromUrl ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  required
                >
                  <option value="0">-- Chọn mẫu quy trình --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id.toString()}>{t.name}</option>
                  ))}
                </select>
                {templateIdFromUrl && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Template đã được chọn từ trang chi tiết
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên bước */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Tên bước <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="stepName"
                    value={form.stepName}
                    onChange={handleChange}
                    placeholder="VD: Sàng lọc CV ban đầu"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
                </div>

                {/* Thứ tự */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Thứ tự <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stepOrder"
                    value={form.stepOrder}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
                </div>

                {/* Ngày ước tính */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày ước tính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="estimatedDays"
                    value={form.estimatedDays}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-secondary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mô tả</h3>
              </div>
            </div>
            <div className="p-6">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Nhập mô tả chi tiết về bước quy trình này..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
              />
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
                    ✅ Tạo bước quy trình thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={form.templateId ? `/hr/apply-process-templates/${form.templateId}` : "/hr/apply-process-steps"}
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
                  Tạo bước quy trình
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
