import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { applyProcessStepService } from "../../../services/ApplyProcessStep";
import { applyProcessTemplateService } from "../../../services/ApplyProcessTemplate";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Hash,
  Building2,
  AlertCircle,
} from "lucide-react";

interface ApplyProcessStepDetail {
  id: number;
  templateId: number;
  templateName?: string;
  stepOrder: number;
  stepName: string;
  description: string;
}

export default function SalesApplyProcessStepDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget =
    (location.state as { fromTemplate?: string } | null)?.fromTemplate ??
    "/sales/apply-process-steps";
  const [step, setStep] = useState<ApplyProcessStepDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stepData = await applyProcessStepService.getById(Number(id));

        let templateName = "—";
        try {
          const template = await applyProcessTemplateService.getById(stepData.templateId);
          templateName = template.name;
        } catch {}

        setStep({ ...stepData, templateName });
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
      navigate(backTarget);
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa bước quy trình!");
    }
  };

  const handleEdit = () => {
    const state =
      backTarget !== "/sales/apply-process-steps" ? { fromTemplate: backTarget } : undefined;
    navigate(`/sales/apply-process-steps/edit/${id}`, { state });
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
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
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy bước quy trình</p>
            <Link
              to="/sales/apply-process-steps"
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
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to={backTarget}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">
                {backTarget !== "/sales/apply-process-steps" ? "Quay lại mẫu quy trình" : "Quay lại danh sách"}
              </span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{step.stepName}</h1>
              <p className="text-neutral-600 mb-4">Thông tin chi tiết bước quy trình tuyển dụng</p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Hash className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">Bước {step.stepOrder}</span>
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
              <InfoItem label="Tên bước" value={step.stepName} icon={<FileText className="w-4 h-4" />} />
              <InfoItem
                label="Mẫu quy trình"
                value={step.templateName ?? "—"}
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

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
