import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Filter,
    Users,
    ChevronRight,
    GraduationCap,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { jobRequestService, type JobRequest, JobRequestStatus } from "../../../services/JobRequest";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { jobSkillService, type JobSkill } from "../../../services/JobSkill";
import { skillService, type Skill } from "../../../services/Skill";

interface HRJobRequest {
    id: number;
    title: string;
    companyName: string;
    projectName: string;
    positionName: string;
    quantity: number;
    budget?: number | null;
    workingMode: string;
    status: string;
    skills: string[];
}

const workingModeLabels: Record<number, string> = {
    0: "None",
    1: "Onsite", 
    2: "Remote",
    4: "Hybrid",
    8: "Flexible"
};

const statusLabels: Record<number, string> = {
    0: "Pending",
    1: "Approved", 
    2: "Closed",
    3: "Rejected"
};

export default function HRJobRequestList() {
    const [requests, setRequests] = useState<HRJobRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<HRJobRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Search + Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filterCompany, setFilterCompany] = useState("");
    const [filterProject, setFilterProject] = useState("");
    const [filterPosition, setFilterPosition] = useState("");
    const [filterWorkingMode, setFilterWorkingMode] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobReqs, companies, projects, positions, jobSkills, skills] =
                    await Promise.all([
                        jobRequestService.getAll() as Promise<JobRequest[]>,
                        clientCompanyService.getAll() as Promise<ClientCompany[]>,
                        projectService.getAll() as Promise<Project[]>,
                        jobRoleLevelService.getAll() as Promise<JobRoleLevel[]>,
                        jobSkillService.getAll() as Promise<JobSkill[]>,
                        skillService.getAll() as Promise<Skill[]>,
                    ]);

                // Chỉ lấy yêu cầu chưa duyệt (Pending)
                const filteredReqs = jobReqs.filter((r) => r.status === JobRequestStatus.Pending);

                const projectDict: Record<number, Project> = {};
                projects.forEach((p) => (projectDict[p.id] = p));

                const companyDict: Record<number, ClientCompany> = {};
                companies.forEach((c) => (companyDict[c.id] = c));

                const positionDict: Record<number, JobRoleLevel> = {};
                positions.forEach((p) => (positionDict[p.id] = p));

                const skillDict: Record<number, string> = {};
                skills.forEach((s) => (skillDict[s.id] = s.name));

                const groupedJobSkills: Record<number, string[]> = {};
                jobSkills.forEach((js) => {
                    if (!groupedJobSkills[js.jobRequestId])
                        groupedJobSkills[js.jobRequestId] = [];
                    groupedJobSkills[js.jobRequestId].push(skillDict[js.skillsId] || "—");
                });

                const mapped: HRJobRequest[] = filteredReqs.map((r) => {
                    const project = projectDict[r.projectId];
                    const company = project ? companyDict[project.clientCompanyId] : undefined;
                    const position = positionDict[r.jobRoleLevelId];
                    return {
                        id: r.id,
                        title: r.title,
                        companyName: company?.name ?? "—",
                        projectName: project?.name ?? "—",
                        positionName: position?.name ?? "—",
                        quantity: r.quantity,
                        budget: r.budgetPerMonth,
                        workingMode: workingModeLabels[r.workingMode] ?? "—",
                        status: statusLabels[r.status] ?? "—",
                        skills: groupedJobSkills[r.id] ?? [],
                    };
                });

                setRequests(mapped);
                setFilteredRequests(mapped);
            } catch (err) {
                console.error("❌ Lỗi tải danh sách yêu cầu HR:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 🧮 Lọc dữ liệu theo điều kiện
    useEffect(() => {
        let filtered = [...requests];

        if (searchTerm) {
            filtered = filtered.filter(
                (r) =>
                    r.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterCompany)
            filtered = filtered.filter((r) =>
                r.companyName.toLowerCase().includes(filterCompany.toLowerCase())
            );
        if (filterProject)
            filtered = filtered.filter((r) =>
                r.projectName.toLowerCase().includes(filterProject.toLowerCase())
            );
        if (filterPosition)
            filtered = filtered.filter((r) =>
                r.positionName.toLowerCase().includes(filterPosition.toLowerCase())
            );
        if (filterWorkingMode)
            filtered = filtered.filter((r) => r.workingMode === filterWorkingMode);

        setFilteredRequests(filtered);
    }, [searchTerm, filterCompany, filterProject, filterPosition, filterWorkingMode, requests]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setFilterCompany("");
        setFilterProject("");
        setFilterPosition("");
        setFilterWorkingMode("");
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Tuyển Dụng Chưa Duyệt</h1>
                    <p className="text-neutral-600 mt-1">Danh sách yêu cầu từ Sales cần HR xử lý.</p>
                </div>

                {/* 🔍 Search & Filter */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề"
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
                    >
                        <Filter className="w-5 h-5" />
                        {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                    </button>
                </div>

                {showFilters && (
                    <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Công ty KH</label>
                            <input
                                type="text"
                                value={filterCompany}
                                onChange={(e) => setFilterCompany(e.target.value)}
                                placeholder="Tên công ty..."
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
                            <input
                                type="text"
                                value={filterProject}
                                onChange={(e) => setFilterProject(e.target.value)}
                                placeholder="Tên dự án..."
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                            <input
                                type="text"
                                value={filterPosition}
                                onChange={(e) => setFilterPosition(e.target.value)}
                                placeholder="Tên vị trí..."
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chế độ làm việc</label>
                            <select
                                value={filterWorkingMode}
                                onChange={(e) => setFilterWorkingMode(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="None">None</option>
                                <option value="Onsite">Onsite</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleResetFilters}
                                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách yêu cầu...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-primary-700">
                                        {req.title || "(Chưa có tiêu đề)"}
                                    </h3>
                                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 font-medium">
                                        Chưa duyệt
                                    </span>
                                </div>

                                {/* ✅ Thông tin vị trí và công ty */}
                                <div>
                                    <p className="font-medium text-gray-900">{req.positionName}</p>
                                    <p className="text-sm text-gray-600">{req.companyName}</p>
                                </div>

                                <p className="text-gray-700 mb-2 text-sm">
                                    Dự án: <span className="font-medium">{req.projectName}</span>
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {req.skills.length > 0 ? (
                                        req.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">Chưa có kỹ năng</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{req.quantity} ứng viên</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>Chế độ: {req.workingMode}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <Link
                                        to={`/hr/job-requests/${req.id}`}
                                        className="text-primary-600 hover:underline text-sm font-medium flex items-center gap-1"
                                    >
                                        Chi tiết <ChevronRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/hr/job-requests/${req.id}/matching`}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm transition"
                                    >
                                        Matching CV
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
