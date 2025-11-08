import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { jobRoleService } from "../../../services/JobRole";
import { skillService, type Skill } from "../../../services/Skill";
import { locationService } from "../../../services/location";
import { applyProcessTemplateService } from "../../../services/ApplyProcessTemplate";
import { Button } from "../../../components/ui/button";
import { jobSkillService, type JobSkill } from "../../../services/JobSkill";
import { clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Target,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";

interface JobRequestDetail {
  id: number;
  title: string;
  projectName?: string;
  clientCompanyName?: string;
  jobPositionName?: string;
  level: string;
  quantity: number;
  budgetPerMonth?: number | null;
  status: string;
  workingMode?: number;
  locationId?: number | null;
  description?: string;
  requirements?: string;
  clientCompanyCVTemplateName?: string;
  jobSkills?: { id: number; name: string }[];
}

export default function JobRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobRequest, setJobRequest] = useState<JobRequestDetail | null>(null);
  const [jobSkills, setJobSkills] = useState<{ id: number; name: string }[]>([]);
  const [jobRoleName, setJobRoleName] = useState<string>("—");
  const [locationName, setLocationName] = useState<string>("—");
  const [applyProcessTemplateName, setApplyProcessTemplateName] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  // Status and labels


  const workingModeLabels: Record<number, string> = {
    0: "Không xác định",
    1: "Tại công ty",
    2: "Từ xa",
    4: "Kết hợp",
    8: "Linh hoạt",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          jobReqData,
          allProjects,
          allCompanies,
          allPositions,
          allSkills,
        ] = await Promise.all([
          jobRequestService.getById(Number(id)),
          projectService.getAll() as Promise<Project[]>,
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          jobRoleLevelService.getAll() as Promise<JobRoleLevel[]>,
          skillService.getAll() as Promise<Skill[]>,
        ]);

        const project = allProjects.find((p) => p.id === jobReqData.projectId);
        const clientCompany = project
          ? allCompanies.find((c) => c.id === project.clientCompanyId)
          : null;
        const position = allPositions.find(
          (pos) => pos.id === jobReqData.jobRoleLevelId
        );

        // 🧩 Gọi danh sách template hiệu lực của khách hàng
        let templateName = "—";
        if (clientCompany) {
          const templates = await clientCompanyCVTemplateService.listEffectiveTemplates(clientCompany.id);
          const matched = templates.find(t => t.templateId === jobReqData.clientCompanyCVTemplateId);
          templateName = matched ? matched.templateName : "—";
        }
        if (position) {
          try {
            const role = await jobRoleService.getById(position.jobRoleId);
            setJobRoleName(role?.name ?? "—");
          } catch {}
        }

        // Resolve names for related entities
        if (jobReqData.locationId) {
          try {
            const loc = await locationService.getById(jobReqData.locationId);
            setLocationName(loc?.name ?? "—");
          } catch {}
        }
        if (jobReqData.applyProcessTemplateId) {
          try {
            const apt = await applyProcessTemplateService.getById(jobReqData.applyProcessTemplateId);
            setApplyProcessTemplateName(apt?.name ?? "—");
          } catch {}
        }

        const jobReqWithExtra: JobRequestDetail = {
          ...jobReqData,
          projectName: project?.name || "—",
          clientCompanyName: clientCompany?.name || "—",
          jobPositionName: position?.name || "—",
          clientCompanyCVTemplateName: templateName,
        };

        const jobSkillData = await jobSkillService.getAll({
          jobRequestId: Number(id),
        }) as JobSkill[];

        const skills = jobSkillData.map((js) => {
          const found = allSkills.find((s) => s.id === js.skillsId);
          return { id: js.skillsId, name: found?.name || "Không xác định" };
        });

        setJobRequest(jobReqWithExtra);
        console.log("Job Request chi tiết:", jobReqWithExtra);
        setJobSkills(skills);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Job Request:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🗑️ Xóa yêu cầu tuyển dụng
  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa yêu cầu tuyển dụng này?");
    if (!confirm) return;

    try {
      await jobRequestService.delete(Number(id));
      alert("✅ Đã xóa yêu cầu tuyển dụng thành công!");
      navigate("/sales/job-requests");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa yêu cầu tuyển dụng!");
    }
  };

  // ✏️ Chuyển sang trang sửa
  const handleEdit = () => {
    navigate(`/sales/job-requests/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu yêu cầu tuyển dụng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jobRequest) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy yêu cầu tuyển dụng</p>
            <Link 
              to="/sales/job-requests"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status configuration
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 0:
        return {
          label: "Chờ duyệt",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-yellow-50"
        };
      case 1:
        return {
          label: "Đã duyệt",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-50"
        };
      case 2:
        return {
          label: "Đã đóng",
          color: "bg-gray-100 text-gray-800",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-gray-50"
        };
      case 3:
        return {
          label: "Bị từ chối",
          color: "bg-red-100 text-red-800",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-red-50"
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-gray-50"
        };
    }
  };

  const statusConfig = getStatusConfig(Number(jobRequest.status));
  const isDisabled = [1, 2, 3].includes(Number(jobRequest.status));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/sales/job-requests"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobRequest.title}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết yêu cầu tuyển dụng của khách hàng
              </p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                disabled={isDisabled}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                  isDisabled
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                }`}
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDisabled}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                  isDisabled
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                }`}
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
                label="Công ty khách hàng" 
                value={jobRequest.clientCompanyName ?? "—"} 
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoItem 
                label="Dự án" 
                value={jobRequest.projectName ?? "—"} 
                icon={<Briefcase className="w-4 h-4" />}
              />
              <InfoItem 
                label="Vị trí tuyển dụng" 
                value={jobRoleName} 
                icon={<Users className="w-4 h-4" />}
              />
              <InfoItem 
                label="Cấp độ chuyên môn" 
                value={jobRequest.jobPositionName ?? "—"} 
                icon={<Users className="w-4 h-4" />}
              />            
              <InfoItem 
                label="Số lượng tuyển dụng" 
                value={jobRequest.quantity?.toString() || "—"} 
                icon={<Users className="w-4 h-4" />}
              />
              <InfoItem 
                label="Ngân sách/tháng" 
                value={jobRequest.budgetPerMonth ? `${jobRequest.budgetPerMonth.toLocaleString("vi-VN")} VNĐ` : "—"} 
                icon={<DollarSign className="w-4 h-4" />}
              />
              <InfoItem 
                label="Khu vực làm việc" 
                value={locationName} 
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoItem 
                label="Chế độ làm việc" 
                value={workingModeLabels[Number(jobRequest.workingMode ?? 0)] ?? "—"} 
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem 
                label="Mẫu CV khách hàng" 
                value={jobRequest.clientCompanyCVTemplateName ?? "—"} 
                icon={<FileText className="w-4 h-4" />}
              />
              <InfoItem 
                label="Quy trình Apply" 
                value={applyProcessTemplateName} 
                icon={<FileText className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Mô tả & Yêu cầu & Kỹ năng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Mô tả công việc */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-secondary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mô tả công việc</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {jobRequest.description || "Chưa có mô tả công việc cụ thể"}
                </p>
              </div>
            </div>
          </div>

          {/* Yêu cầu ứng viên */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Target className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Yêu cầu ứng viên</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {jobRequest.requirements || "Chưa có yêu cầu cụ thể cho ứng viên"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kỹ năng yêu cầu */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mt-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kỹ năng yêu cầu</h3>
            </div>
          </div>
          <div className="p-6">
            {jobSkills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {jobSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 px-4 py-2 rounded-xl text-sm font-medium border border-primary-200 hover:from-primary-200 hover:to-primary-300 transition-all duration-300 hover:scale-105 transform"
                  >
                    <Target className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-lg font-medium">Chưa có kỹ năng yêu cầu</p>
                <p className="text-neutral-400 text-sm mt-1">Thêm kỹ năng để tìm ứng viên phù hợp</p>
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
