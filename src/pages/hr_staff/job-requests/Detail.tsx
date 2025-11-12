import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { jobRequestService, type JobRequestStatus } from "../../../services/JobRequest";
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
import { talentApplicationService, TalentApplicationStatusConstants } from "../../../services/TalentApplication";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Target,
  Clock,
  AlertCircle,
  Sparkles,
  Star
} from "lucide-react";
import { notificationService, NotificationPriority, NotificationType } from "../../../services/Notification";
import { userService } from "../../../services/User";
import { decodeJWT } from "../../../services/Auth";

interface JobRequestDetail {
    id: number;
    jobRoleLevelId: number;
    projectId: number;
    applyProcessTemplateId?: number | null;
    clientCompanyCVTemplateId: number;
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

export default function JobRequestDetailHRPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [jobRequest, setJobRequest] = useState<JobRequestDetail | null>(null);
    const [jobSkills, setJobSkills] = useState<{ id: number; name: string }[]>([]);
    const [jobRoleName, setJobRoleName] = useState<string>("—");
    const [locationName, setLocationName] = useState<string>("—");
    const [applyProcessTemplateName, setApplyProcessTemplateName] = useState<string>("—");
    const [hiredCount, setHiredCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectNote, setRejectNote] = useState("");

    const workingModeLabels: Record<number, string> = {
        0: "Không xác định",
        1: "Tại văn phòng",
        2: "Từ xa",
        4: "Kết hợp",
        8: "Linh hoạt",
    };

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

            if (position) {
                try {
                    const role = await jobRoleService.getById(position.jobRoleId);
                    setJobRoleName(role?.name ?? "—");
                } catch {}
            }

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

            const jobSkillData = (await jobSkillService.getAll({
                jobRequestId: Number(id),
            })) as JobSkill[];

            const skills = jobSkillData.map((js) => {
                const found = allSkills.find((s) => s.id === js.skillsId);
                return { id: js.skillsId, name: found?.name || "Không xác định" };
            });

            setJobRequest(jobReqWithExtra);
            setJobSkills(skills);

            // Fetch số lượng hồ sơ ở trạng thái "Hired" cho job request này
            try {
                const applications = await talentApplicationService.getAll({ 
                    jobRequestId: Number(id),
                    status: TalentApplicationStatusConstants.Hired,
                    excludeDeleted: true 
                });
                const applicationsArray = Array.isArray(applications) ? applications : [];
                setHiredCount(applicationsArray.length);
            } catch (err) {
                console.error("❌ Lỗi tải số lượng hồ sơ đã tuyển:", err);
                setHiredCount(0);
            }
        } catch (err) {
            console.error("❌ Lỗi tải chi tiết Job Request:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const statusCodeToName: Record<JobRequestStatus, string> = {
        0: "Pending",
        1: "Approved",
        2: "Closed",
        3: "Rejected",
    };

    const handleApprove = async (status: JobRequestStatus, options: { notes?: string } = {}) => {
        if (!id || !jobRequest) return;

        const trimmedNote = options.notes?.trim();
        if (status === 3 && !trimmedNote) {
            alert("⚠️ Vui lòng nhập lý do từ chối");
            return;
        }

        setUpdating(true);
        try {
            await jobRequestService.changeStatus(Number(id), {
                newStatus: statusCodeToName[status] ?? "Pending",
                ...(status === 3 ? { notes: trimmedNote } : {}),
            });
            const statusMessage = status === 1 ? 'Đã duyệt' : status === 3 ? 'Đã từ chối' : status === 2 ? 'Đã đóng' : 'Cập nhật';
            alert(`✅ ${statusMessage} yêu cầu tuyển dụng thành công!`);
            // Reload dữ liệu để cập nhật trạng thái mới
            await fetchData();
        } catch (err) {
            console.error("❌ Lỗi cập nhật trạng thái:", err);
            alert("Không thể cập nhật trạng thái!");
        } finally {
            setUpdating(false);
        }
    };

    const handleApproveWithConfirm = () => {
        if (!jobRequest) return;
        const confirmApprove = window.confirm(`✅ Bạn có chắc muốn duyệt yêu cầu tuyển dụng "${jobRequest.title}"?`);
        if (!confirmApprove) return;
        void handleApprove(1);
    };

    const quickRejectNotes = [
        "Mô tả công việc chưa đầy đủ thông tin.",
        "Yêu cầu kỹ năng chưa rõ ràng, cần bổ sung.",
        "Thiếu danh sách kỹ năng bắt buộc cho vị trí này.",
        "Chưa có thông tin ngân sách hoặc quyền lợi cụ thể.",
    ];

    const sendRejectionNotification = useCallback(async (note: string) => {
        if (!jobRequest) return;
        try {
            const salesUsers = await userService.getAll({ role: "Sale", excludeDeleted: true, pageNumber: 1, pageSize: 100 });
            const salesUserIds = (salesUsers.items || [])
                .filter((u) => (u.roles || []).some((role) => role === "Sale" || role === "Staff Sales"))
                .map((u) => u.id)
                .filter(Boolean);

            if (!salesUserIds.length) return;

            const token = localStorage.getItem("accessToken");
            const decoded = token ? decodeJWT(token) : null;
            const hrName = decoded?.unique_name || decoded?.email || decoded?.name || "HR Staff";

            await notificationService.create({
                title: `Yêu cầu tuyển dụng bị từ chối`,
                message: note || `Yêu cầu "${jobRequest.title}" đã bị từ chối bởi ${hrName}.`,
                type: NotificationType.JobStatusChanged,
                priority: NotificationPriority.High,
                userIds: salesUserIds as string[],
                entityType: "JobRequest",
                entityId: jobRequest.id,
                actionUrl: `/sales/job-requests/${jobRequest.id}`,
                metaData: {
                    jobTitle: jobRequest.title,
                    status: "Rejected",
                    rejectedBy: hrName,
                },
            });
        } catch (error) {
            console.error("Không thể gửi thông báo tới Sales:", error);
        }
    }, [jobRequest]);

    const handleOpenRejectDialog = () => {
        if (updating || Number(jobRequest?.status) === 3 || Number(jobRequest?.status) === 1) return;
        setRejectNote("");
        setShowRejectDialog(true);
    };

    const handleConfirmReject = async () => {
        const note = rejectNote.trim();
        if (!note) {
            alert("⚠️ Vui lòng ghi rõ lý do từ chối");
            return;
        }
        await handleApprove(3, { notes: note });
        await sendRejectionNotification(note);
        setShowRejectDialog(false);
        setRejectNote("");
    };

    const handleCancelReject = () => {
        setShowRejectDialog(false);
        setRejectNote("");
    };

    const handleMatchingCV = () => {
        navigate(`/hr/job-requests/matching-cv?jobRequestId=${id}`);
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="HR Staff" />
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
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium">Không tìm thấy yêu cầu tuyển dụng</p>
                        <Link 
                            to="/hr/job-requests"
                            className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
                        >
                            ← Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                    icon: <AlertCircle className="w-4 h-4" />,
                    bgColor: "bg-gray-50"
                };
            case 3:
                return {
                    label: "Đã từ chối",
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

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link 
                            to="/hr/job-requests"
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
                                Thông tin chi tiết yêu cầu tuyển dụng (HR xem & duyệt)
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
                    onClick={handleMatchingCV}
                                disabled={Number(jobRequest.status) !== 1 || hiredCount >= jobRequest.quantity}
                                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                                    Number(jobRequest.status) !== 1 || hiredCount >= jobRequest.quantity
                                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                                }`}
                                title={
                                    Number(jobRequest.status) !== 1 
                                        ? "Cần duyệt yêu cầu trước khi matching CV" 
                                        : hiredCount >= jobRequest.quantity
                                        ? `Đã đủ số lượng tuyển dụng (${hiredCount}/${jobRequest.quantity})`
                                        : ""
                                }
                            >
                                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Matching CV AI
                            </Button>
                            <Button
                    onClick={handleApproveWithConfirm}
                                disabled={
                                    updating ||
                                    Number(jobRequest.status) === 1 ||
                                    Number(jobRequest.status) === 3
                                }
                                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                                    updating ||
                                    Number(jobRequest.status) === 1 ||
                                    Number(jobRequest.status) === 3
                                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                                }`}
                            >
                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Duyệt
                            </Button>
                            <Button
                                onClick={handleOpenRejectDialog}
                                disabled={updating || Number(jobRequest.status) === 3 || Number(jobRequest.status) === 1}
                                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                                    updating || Number(jobRequest.status) === 3 || Number(jobRequest.status) === 1
                                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                                }`}
                            >
                                <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Từ chối
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

                {/* Mô tả & Yêu cầu */}
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
                                <Star className="w-5 h-5 text-warning-600" />
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
            {showRejectDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-200">
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Ghi rõ lý do từ chối yêu cầu tuyển dụng</h3>
                            <button
                                onClick={handleCancelReject}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <p className="text-sm text-neutral-600">
                                Vui lòng nhập lý do để các bộ phận liên quan dễ dàng xử lý và điều chỉnh thông tin job request.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {quickRejectNotes.map((note) => (
                                    <button
                                        key={note}
                                        type="button"
                                        onClick={() => setRejectNote((prev) => (prev ? `${prev}\n${note}` : note))}
                                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                                    >
                                        {note}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                rows={4}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelReject}
                                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
