import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyProcessStepService, type ApplyProcessStepCreate } from "../../../services/ApplyProcessStep";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  X, 
  FileText, 
  Calendar, 
  Hash,
  Building2,
  AlertCircle
} from "lucide-react";

export default function ApplyProcessStepEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ApplyProcessTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ApplyProcessStepCreate>({
    templateId: 0,
    stepOrder: 1,
    stepName: "",
    description: "",
    estimatedDays: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await applyProcessStepService.getById(Number(id));

        setFormData({
          templateId: data.templateId,
          stepOrder: data.stepOrder,
          stepName: data.stepName,
          description: data.description,
          estimatedDays: data.estimatedDays,
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin bước quy trình!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await applyProcessTemplateService.getAll();
        setTemplates(templatesData);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["templateId", "stepOrder", "estimatedDays"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.templateId || formData.templateId === 0) {
      alert("⚠️ Vui lòng chọn mẫu quy trình trước khi lưu!");
      return;
    }

    if (!formData.stepName.trim()) {
      alert("⚠️ Vui lòng nhập tên bước trước khi lưu!");
      return;
    }

    try {
      await applyProcessStepService.update(Number(id), formData);
      alert("✅ Cập nhật bước quy trình thành công!");
      navigate(`/hr/apply-process-steps/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật bước quy trình!");
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
              to={`/hr/apply-process-steps/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa bước quy trình</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin bước quy trình tuyển dụng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa bước quy trình
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
                  Mẫu quy trình
                </label>
                <div className="relative">
                  <select
                    name="templateId"
                    value={formData.templateId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="0">-- Chọn mẫu quy trình --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên bước */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Tên bước
                  </label>
                  <input
                    name="stepName"
                    value={formData.stepName}
                    onChange={handleChange}
                    placeholder="Nhập tên bước..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Thứ tự */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    name="stepOrder"
                    value={formData.stepOrder}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Ngày ước tính */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày ước tính
                  </label>
                  <input
                    type="number"
                    name="estimatedDays"
                    value={formData.estimatedDays}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
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
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Nhập mô tả chi tiết về bước quy trình..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/apply-process-steps/${id}`}
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
