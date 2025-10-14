import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { skillService, type Skill } from "../../../services/Skill";
import { Button } from "../../../components/ui/button";
import { jobSkillService, type JobSkill } from "../../../services/JobSkill";
import { clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";

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
  const [loading, setLoading] = useState(true);

  // Mappings for level and status
  const levelLabels: Record<number, string> = {
    0: "Junior",
    1: "Middle",
    2: "Senior",
    3: "Lead",
  };

  const statusLabels: Record<number, string> = {
    0: "Chờ duyệt",
    1: "Chưa duyệt",
    2: "Đã đóng",
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
          jobPositionService.getAll() as Promise<JobPosition[]>,
          skillService.getAll() as Promise<Skill[]>,
        ]);

        const project = allProjects.find((p) => p.id === jobReqData.projectId);
        const clientCompany = project
          ? allCompanies.find((c) => c.id === project.clientCompanyId)
          : null;
        const position = allPositions.find(
          (pos) => pos.id === jobReqData.jobPositionId
        );

        // 🧩 Gọi danh sách template hiệu lực của khách hàng
        let templateName = "—";
        if (clientCompany) {
          const templates = await clientCompanyCVTemplateService.listEffectiveTemplates(clientCompany.id);
          const matched = templates.find(t => t.templateId === jobReqData.clientCompanyCVTemplateId);
          templateName = matched ? matched.templateName : "—";
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
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu yêu cầu tuyển dụng...
      </div>
    );
  }

  if (!jobRequest) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy yêu cầu tuyển dụng
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* 🏷 Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{jobRequest.title}</h1>
            <p className="text-neutral-600 mt-1">
              Thông tin chi tiết yêu cầu tuyển dụng của khách hàng.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              disabled={Number(jobRequest.status) === 1 || Number(jobRequest.status) === 2}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${Number(jobRequest.status) === 1 || Number(jobRequest.status) === 2
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md"
                }`}
            >
              Sửa
            </Button>
            <Button
              onClick={handleDelete}
              disabled={Number(jobRequest.status) === 1 || Number(jobRequest.status) === 2}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${Number(jobRequest.status) === 1 || Number(jobRequest.status) === 2
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white hover:shadow-md"
                }`}
            >
              Xóa
            </Button>
          </div>
        </div>

        {/* 📋 Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">
            Thông tin chung
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Công ty khách hàng" value={jobRequest.clientCompanyName ?? "—"} />
            <InfoItem label="Dự án" value={jobRequest.projectName ?? "—"} />
            <InfoItem label="Vị trí" value={jobRequest.jobPositionName ?? "—"} />
            <InfoItem label="Cấp độ" value={levelLabels[parseInt(jobRequest.level)]} />
            <InfoItem label="Số lượng cần tuyển" value={String(jobRequest.quantity)} />
            <InfoItem
              label="Ngân sách (VNĐ/tháng)"
              value={
                jobRequest.budgetPerMonth
                  ? jobRequest.budgetPerMonth.toLocaleString("vi-VN")
                  : "—"
              }
            />
            <InfoItem label="Trạng thái" value={statusLabels[parseInt(jobRequest.status)]} />
            <InfoItem
              label="CV Template khách hàng"
              value={jobRequest.clientCompanyCVTemplateName ?? "—"}
            />
          </div>
        </div>

        {/* 🧾 Mô tả & Yêu cầu & Kỹ năng */}
        <div className="bg-white rounded-2xl shadow-soft p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Mô tả công việc
            </h3>
            <p className="whitespace-pre-line text-gray-800">
              {jobRequest.description || "Chưa có mô tả"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Yêu cầu ứng viên
            </h3>
            <p className="whitespace-pre-line text-gray-800">
              {jobRequest.requirements || "Chưa có yêu cầu cụ thể"}
            </p>
          </div>

          {/* 🧠 Kỹ năng yêu cầu */}
          <div>
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Kỹ năng yêu cầu
            </h3>
            {jobSkills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {jobSkills.map((skill) => (
                  <li
                    key={skill.id}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800">Chưa có kỹ năng yêu cầu</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/sales/job-requests"
            className="text-primary-600 hover:underline text-sm"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
