import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  XCircle,
  AlertCircle,
  Plus,
  ListTodo
} from "lucide-react";

export default function ApplyProcessTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ApplyProcessTemplate | null>(null);
  const [steps, setSteps] = useState<ApplyProcessStep[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!id) return;

        const templateData = await applyProcessTemplateService.getById(Number(id));
        setTemplate(templateData);

        // Fetch steps for this template
        try {
          const stepsData = await applyProcessStepService.getAll({ templateId: Number(id) });
          setSteps(stepsData);
        } catch (err) {
          console.error("❌ Lỗi tải steps:", err);
          setSteps([]);
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Apply Process Template:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa template này?");
    if (!confirm) return;

    try {
      await applyProcessTemplateService.delete(Number(id));
      alert("✅ Đã xóa template thành công!");
      navigate("/hr/apply-process-templates");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa template!");
    }
  };

  const handleDeleteSelectedSteps = async () => {
    if (selectedSteps.length === 0) {
      alert("⚠️ Vui lòng chọn ít nhất một bước để xóa!");
      return;
    }

    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedSteps.length} bước đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedSteps.map(stepId => applyProcessStepService.deleteById(stepId)));
      alert("✅ Đã xóa các bước thành công!");
      setSteps(steps.filter(step => !selectedSteps.includes(step.id)));
      setSelectedSteps([]);
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa các bước!");
    }
  };

  const toggleStepSelection = (stepId: number) => {
    setSelectedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleEdit = () => {
    navigate(`/hr/apply-process-templates/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy template</p>
            <Link 
              to="/hr/apply-process-templates"
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
              to="/hr/apply-process-templates"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết template quy trình tuyển dụng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <FileText className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Template #{template.id}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin chung</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                label="Tên Template" 
                value={template.name} 
                icon={<FileText className="w-4 h-4" />}
              />
              {template.description && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <p className="text-neutral-500 text-sm font-medium">Mô tả</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{template.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách các bước quy trình */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <ListTodo className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Các bước quy trình</h2>
                {selectedSteps.length > 0 && (
                  <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Đã chọn: {selectedSteps.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedSteps.length > 0 && (
                  <button
                    onClick={handleDeleteSelectedSteps}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Xóa đã chọn
                  </button>
                )}
                <Link
                  to={`/hr/apply-process-steps/create?templateId=${template.id}`}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Thêm bước
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            {steps.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-lg font-medium">Chưa có bước nào</p>
                <p className="text-neutral-400 text-sm mt-1">Thêm bước để tạo quy trình</p>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.sort((a, b) => a.stepOrder - b.stepOrder).map((step) => (
                  <div key={step.id} className={`p-5 border rounded-xl transition-all duration-300 bg-gradient-to-br from-white to-neutral-50 ${
                    selectedSteps.includes(step.id) 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-neutral-200 hover:border-secondary-300'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSteps.includes(step.id)}
                          onChange={() => toggleStepSelection(step.id)}
                          className="w-5 h-5 text-secondary-600 bg-white border-neutral-300 rounded focus:ring-secondary-500 focus:ring-2 cursor-pointer"
                        />
                        <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 font-bold">
                          {step.stepOrder}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.stepName}</h3>
                          <p className="text-sm text-neutral-500">
                            Ước tính: {step.estimatedDays} ngày
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/hr/apply-process-steps/${step.id}`}
                        className="group inline-flex items-center gap-1 px-3 py-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                      >
                        <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-sm font-medium">Chi tiết</span>
                      </Link>
                    </div>
                    {step.description && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <p className="text-sm text-neutral-700 leading-relaxed">{step.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
        {value || "—"}
      </p>
    </div>
  );
}

