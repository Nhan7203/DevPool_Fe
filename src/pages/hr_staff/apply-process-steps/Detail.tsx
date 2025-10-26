import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  Hash,
  Building2,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";

interface ApplyProcessStepDetail {
  id: number;
  templateId: number;
  templateName?: string;
  stepOrder: number;
  stepName: string;
  description: string;
  estimatedDays: number;
}

export default function ApplyProcessStepDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<ApplyProcessStepDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stepData = await applyProcessStepService.getById(Number(id));
        
        // Fetch template name
        let templateName = "—";
        try {
          const template = await applyProcessTemplateService.getById(stepData.templateId);
          templateName = template.name;
        } catch {}

        const stepWithExtra: ApplyProcessStepDetail = {
          ...stepData,
          templateName,
        };

        setStep(stepWithExtra);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Apply Process Step:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa bước quy trình này?");
    if (!confirm) return;

    try {
      await applyProcessStepService.deleteById(Number(id));
      alert("✅ Đã xóa bước quy trình thành công!");
      navigate("/hr/apply-process-steps");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa bước quy trình!");
    }
  };

  const handleEdit = () => {
    navigate(`/hr/apply-process-steps/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu bước quy trình...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy bước quy trình</p>
            <Link 
              to="/hr/apply-process-steps"
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
              to="/hr/apply-process-steps"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{step.stepName}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết bước quy trình tuyển dụng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Hash className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Bước {step.stepOrder}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <StatCard
            title="Thứ tự"
            value={`Bước ${step.stepOrder}`}
            icon={<Hash className="w-6 h-6" />}
            color="blue"
            change="Thứ tự trong quy trình"
          />
          <StatCard
            title="Ngày ước tính"
            value={`${step.estimatedDays} ngày`}
            icon={<Calendar className="w-6 h-6" />}
            color="green"
            change="Thời gian dự kiến"
          />
          <StatCard
            title="Mẫu quy trình"
            value={step.templateName ?? "—"}
            icon={<Building2 className="w-6 h-6" />}
            color="orange"
            change="Thuộc quy trình"
          />
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
                label="Tên bước" 
                value={step.stepName} 
                icon={<FileText className="w-4 h-4" />}
              />
              <InfoItem 
                label="Mẫu quy trình" 
                value={step.templateName ?? "—"} 
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoItem 
                label="Thứ tự" 
                value={`${step.stepOrder}`} 
                icon={<Hash className="w-4 h-4" />}
              />
              <InfoItem 
                label="Ngày ước tính" 
                value={`${step.estimatedDays} ngày`} 
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <FileText className="w-5 h-5 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mô tả</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {step.description || "Chưa có mô tả cho bước này"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, change }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string; 
  change: string; 
}) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-primary-100 text-primary-600 group-hover:bg-primary-200';
      case 'green':
        return 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200';
      case 'purple':
        return 'bg-accent-100 text-accent-600 group-hover:bg-accent-200';
      case 'orange':
        return 'bg-warning-100 text-warning-600 group-hover:bg-warning-200';
      default:
        return 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${getColorClasses(color)} transition-all duration-300`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
        <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
        {change}
      </p>
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
