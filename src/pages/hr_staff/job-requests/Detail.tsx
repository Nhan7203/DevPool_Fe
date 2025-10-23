import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { jobRequestService } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { skillService, type Skill } from "../../../services/Skill";
import { Button } from "../../../components/ui/button";
import { jobSkillService, type JobSkill } from "../../../services/JobSkill";
import { clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";

interface JobRequestDetail {
    id: number;
    jobRoleLevelId: number;
    projectId: number;
    clientCompanyCVTemplateId: number;
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

export default function JobRequestDetailHRPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [jobRequest, setJobRequest] = useState<JobRequestDetail | null>(null);
    const [jobSkills, setJobSkills] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const levelLabels: Record<number, string> = {
        0: "Junior",
        1: "Middle",
        2: "Senior",
        3: "Lead",
    };

    const statusLabels: Record<number, string> = {
        0: "Chờ duyệt",
        1: "Đã duyệt",
        2: "Đã từ chối",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobReqData, allProjects, allCompanies, allPositions, allSkills] =
                    await Promise.all([
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

                let templateName = "—";
                if (clientCompany) {
                    const templates =
                        await clientCompanyCVTemplateService.listEffectiveTemplates(
                            clientCompany.id
                        );
                    const matched = templates.find(
                        (t) => t.templateId === jobReqData.clientCompanyCVTemplateId
                    );
                    templateName = matched ? matched.templateName : "—";
                }

                const jobReqWithExtra: JobRequestDetail = {
                    ...jobReqData,
                    projectName: project?.name || "—",
                    clientCompanyName: clientCompany?.name || "—",
                    jobPositionName: position?.name || "—",
                    clientCompanyCVTemplateName: templateName,
                };

                const jobSkillData = (await jobSkillService.getAll({
                    jobRequestId: Number(id),
                })) as JobSkill[];

                const skills = jobSkillData.map((js) => {
                    const found = allSkills.find((s) => s.id === js.skillsId);
                    return { id: js.skillsId, name: found?.name || "Không xác định" };
                });

                setJobRequest(jobReqWithExtra);
                setJobSkills(skills);
            } catch (err) {
                console.error("❌ Lỗi tải chi tiết Job Request:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleApprove = async (status: number) => {
        if (!id || !jobRequest) return;

        // 🧩 Kiểm tra bắt buộc trước khi cập nhật
        if (
            !jobRequest.title?.trim() ||
            !jobRequest.description?.trim() ||
            !jobRequest.requirements?.trim() ||
            jobSkills.length === 0
        ) {
            alert(
                "⚠️ Không thể cập nhật trạng thái!\n\n" +
                "Vui lòng đảm bảo các trường sau không bị trống:\n" +
                "• Tiêu đề (Title)\n" +
                "• Mô tả công việc (Description)\n" +
                "• Yêu cầu ứng viên (Requirements)\n" +
                "• Danh sách kỹ năng (SkillIds)"
            );
            return;
        }

        setUpdating(true);
        try {
            await jobRequestService.update(Number(id), {
                jobRoleLevelId: jobRequest.jobRoleLevelId,
                projectId: jobRequest.projectId,
                clientCompanyCVTemplateId: jobRequest.clientCompanyCVTemplateId,
                title: jobRequest.title,
                description: jobRequest.description ?? "",
                requirements: jobRequest.requirements ?? "",
                skillIds: jobSkills.map((s) => s.id),
                status,
            });
            alert("✅ Cập nhật trạng thái thành công!");
            navigate("/hr/job-requests");
        } catch (err) {
            console.error("❌ Lỗi cập nhật trạng thái:", err);
            alert("Không thể cập nhật trạng thái!");
        } finally {
            setUpdating(false);
        }
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
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* 🏷 Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {jobRequest.title}
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Thông tin chi tiết yêu cầu tuyển dụng (HR xem & duyệt).
                        </p>
                    </div>

                    {/* ✅ Nút chỉ cho phép duyệt / từ chối */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleApprove(1)}
                            disabled={updating || Number(jobRequest.status) === 1}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${Number(jobRequest.status) === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                        >
                            Duyệt
                        </Button>
                        <Button
                            onClick={() => handleApprove(2)}
                            disabled={updating || Number(jobRequest.status) === 2}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${Number(jobRequest.status) === 2
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            Từ chối
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
                        <InfoItem
                            label="Trạng thái"
                            value={statusLabels[parseInt(jobRequest.status)]}
                        />
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
                        to="/hr/job-requests"
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
