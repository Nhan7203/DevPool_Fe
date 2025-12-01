import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService, type JobRequestPayload } from "../../../services/JobRequest";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { skillService, type Skill } from "../../../services/Skill";
import { skillGroupService, type SkillGroup } from "../../../services/SkillGroup";
import { clientCompanyCVTemplateService, type ClientCompanyTemplate } from "../../../services/ClientCompanyTemplate";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { projectService, type Project } from "../../../services/Project";
import { locationService, type Location } from "../../../services/location";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import {
  ArrowLeft,
  Save,
  X,
  Users,
  DollarSign,
  Target,
  FileText,
  CheckSquare,
  Building2,
  AlertCircle,
  Search,
  Filter,
  Layers,
} from "lucide-react";
import { WorkingMode } from "../../../types/WorkingMode";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";

export default function JobRequestEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]); // To store selected skills
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [clientTemplates, setClientTemplates] = useState<ClientCompanyTemplate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [applyTemplates, setApplyTemplates] = useState<ApplyProcessTemplate[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [skillGroupQuery, setSkillGroupQuery] = useState("");
  const [isSkillGroupDropdownOpen, setIsSkillGroupDropdownOpen] = useState(false);
  const [selectedSkillGroupId, setSelectedSkillGroupId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<JobRequestPayload>({
    projectId: 0,
    jobRoleLevelId: 0,
    applyProcessTemplateId: undefined,
    clientCompanyCVTemplateId: null,
    title: "",
    description: "",
    requirements: "",
    quantity: 1,
    budgetPerMonth: undefined,
    locationId: undefined,
    workingMode: WorkingMode.None,
    status: 0,
    skillIds: [], // To store skill ids
  });

  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [companySearch, setCompanySearch] = useState<string>("");
  const filteredCompanies = companies.filter(c =>
    !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const [projectSearch, setProjectSearch] = useState<string>("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = !skillSearchQuery || skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
    const matchesGroup = !selectedSkillGroupId || skill.skillGroupId === selectedSkillGroupId;
    return matchesSearch && matchesGroup;
  });
  const filteredSkillGroups = skillGroups.filter(group =>
    group.name.toLowerCase().includes(skillGroupQuery.toLowerCase())
  );

  const handleSkillGroupSelect = (groupId?: number) => {
    setSelectedSkillGroupId(groupId);
    setIsSkillGroupDropdownOpen(false);
    setSkillGroupQuery(groupId ? (skillGroups.find(group => group.id === groupId)?.name ?? "") : "");
  };

  const handleRichTextChange = (field: "description" | "requirements", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function để format số tiền
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value && value !== 0) return "";
    const numValue = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
    if (isNaN(numValue)) return "";
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // 🧭 Load dữ liệu Job Request
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await jobRequestService.getById(Number(id));

        const extractedSkillIds = data.jobSkills?.map((jobSkill: { skillsId: number }) => jobSkill.skillsId) || [];

        setFormData({
          projectId: data.projectId,
          jobRoleLevelId: data.jobRoleLevelId,
          applyProcessTemplateId: (data as any).applyProcessTemplateId ?? undefined,
          clientCompanyCVTemplateId: data.clientCompanyCVTemplateId ?? null,
          title: data.title,
          description: data.description ?? "",
          requirements: data.requirements ?? "",
          quantity: data.quantity,
          budgetPerMonth: data.budgetPerMonth ?? undefined,
          locationId: (data as any).locationId ?? undefined,
          workingMode: (data as any).workingMode ?? WorkingMode.None,
          status: data.status,
          skillIds: extractedSkillIds,
        });

        setSelectedSkills(extractedSkillIds);

        // Lấy clientCompanyId từ project tương ứng
        const project = projects.find(p => p.id === data.projectId);
        if (project) setSelectedClientId(project.clientCompanyId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin Job Request!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, projects]);

  // 🧭 Load danh sách Skills
  useEffect(() => {
    const fetchSkills = async () => {
      const skills = await skillService.getAll() as Skill[];
      setAllSkills(skills); // Save all skills
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchSkillGroups = async () => {
      try {
        const response = await skillGroupService.getAll({ excludeDeleted: true });
        const groups = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.items)
            ? (response as any).items
            : Array.isArray((response as any)?.data)
              ? (response as any).data
              : [];
        setSkillGroups(groups);
      } catch (err) {
        console.error("❌ Lỗi tải nhóm kỹ năng:", err);
        setSkillGroups([]);
      }
    };
    fetchSkillGroups();
  }, []);

  // 🧭 Load danh sách Projects, Job Role Levels, Locations, Apply Templates, Job Roles
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [projectsData, jobPosData, locs, apts, roles] = await Promise.all([
          projectService.getAll(),
          jobRoleLevelService.getAll({ distinctByName: true }),
          locationService.getAll(),
          applyProcessTemplateService.getAll(),
          jobRoleService.getAll(),
        ]);
        setProjects(projectsData);
        setJobRoleLevels(jobPosData);
        setLocations(locs);
        setApplyTemplates(apts);
        setJobRoles(roles);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu tham chiếu:", err);
      }
    };
    fetchRefs();
  }, []);

  // 🧭 Load danh sách Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await clientCompanyService.getAll({ excludeDeleted: true });
        const list = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.items)
            ? (result as any).items
            : Array.isArray((result as any)?.data)
              ? (result as any).data
              : [];
        setCompanies(list as ClientCompany[]);
      } catch (err) {
        console.error("❌ Lỗi tải công ty khách hàng:", err);
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  // 🧭 Load danh sách Client Templates khi selectedClientId thay đổi
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedClientId) return;
      try {
        const templates = await clientCompanyCVTemplateService.listAssignedTemplates(selectedClientId);
        setClientTemplates(templates);
      } catch (err) {
        console.error("❌ Lỗi tải template khách hàng:", err);
        setClientTemplates([]);
      }
    };
    fetchTemplates();
  }, [selectedClientId]);

  // chọn Company/Project được xử lý trực tiếp trong popover, không dùng handler <select>

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho budgetPerMonth - lưu số, format chỉ để hiển thị
    if (name === "budgetPerMonth") {
      // Chỉ cho phép nhập số (loại bỏ tất cả ký tự không phải số)
      const cleaned = value.replace(/\D/g, "");
      // Nếu rỗng, set về undefined
      if (cleaned === "") {
        setFormData((prev) => ({ ...prev, [name]: undefined }));
        return;
      }
      // Lưu số vào state (không format)
      const numValue = parseInt(cleaned, 10);
      if (!isNaN(numValue)) {
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      }
      return;
    }

    const numericFields = ["quantity", "projectId", "jobRoleLevelId", "clientCompanyCVTemplateId", "locationId", "applyProcessTemplateId"];
    const optionalNumeric = ["clientCompanyCVTemplateId", "locationId", "applyProcessTemplateId"];

    setFormData((prev) => {
      if (name === "status" || name === "workingMode") {
        return { ...prev, [name]: Number(value) };
      }

      if (numericFields.includes(name)) {
        if (optionalNumeric.includes(name) && value === "") {
          return { ...prev, [name]: name === "clientCompanyCVTemplateId" ? null : undefined };
        }
        return { ...prev, [name]: Number(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  const projectsFiltered = selectedClientId
    ? projects.filter(p => p.clientCompanyId === selectedClientId)
    : projects;
  const projectsFilteredBySearch = projectsFiltered.filter(p =>
    !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Xác nhận trước khi lưu
    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
    if (!confirmed) {
      return;
    }

    // Validate các trường bắt buộc
    if (!formData.title || formData.title.trim() === "") {
      alert("⚠️ Vui lòng nhập tiêu đề yêu cầu!");
      return;
    }

    if (!Number(formData.projectId)) {
      alert("⚠️ Vui lòng chọn Dự án trước khi lưu!");
      return;
    }

    if (!Number(formData.jobRoleLevelId)) {
      alert("⚠️ Vui lòng chọn Vị trí tuyển dụng trước khi lưu!");
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      alert("⚠️ Vui lòng nhập số lượng (phải lớn hơn 0)!");
      return;
    }

    if (!formData.workingMode || Number(formData.workingMode) === 0) {
      alert("⚠️ Vui lòng chọn chế độ làm việc!");
      return;
    }

    if (!Number(formData.applyProcessTemplateId)) {
      alert("⚠️ Vui lòng chọn Quy trình Apply trước khi lưu!");
      return;
    }

    if (selectedSkills.length === 0) {
      alert("⚠️ Vui lòng chọn ít nhất một kỹ năng!");
      return;
    }

    try {
      // Gộp selectedSkills vào payload
      const payload: JobRequestPayload = {
        ...formData,
        clientCompanyCVTemplateId: formData.clientCompanyCVTemplateId ?? undefined,
        budgetPerMonth: formData.budgetPerMonth ?? undefined,
        skillIds: selectedSkills, // Include selected skills in payload
      };
      console.log("Payload gửi đi:", payload);
      await jobRequestService.update(Number(id), payload);

      alert("✅ Cập nhật yêu cầu tuyển dụng thành công!");
      navigate(`/sales/job-requests/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật yêu cầu tuyển dụng!");
    }
  };

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
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
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to={`/sales/job-requests/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify_between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa yêu cầu tuyển dụng</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin yêu cầu tuyển dụng của khách hàng
              </p>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa yêu cầu tuyển dụng
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
              {/* Tiêu đề */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tiêu đề yêu cầu <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề yêu cầu tuyển dụng..."
                  required
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Công ty khách hàng (popover) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Công ty khách hàng
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCompanyDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                    >
                      <div className="flex items-center gap-2 text-sm text-neutral-700">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span>
                          {selectedClientId
                            ? companies.find(c => c.id === selectedClientId)?.name || "Chọn công ty"
                            : "Chọn công ty"}
                        </span>
                      </div>
                    </button>
                    {isCompanyDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        <div className="p-3 border-b border-neutral-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <Input
                              value={companySearch}
                              onChange={(e) => setCompanySearch(e.target.value)}
                              placeholder="Tìm công ty..."
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientId(0);
                              setCompanySearch("");
                              setClientTemplates([]);
                              setFormData(prev => ({ ...prev, projectId: 0, clientCompanyCVTemplateId: null }));
                              setIsCompanyDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${
                              selectedClientId === 0
                                ? "bg-primary-50 text-primary-700"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            Tất cả công ty
                          </button>
                          {filteredCompanies.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy công ty phù hợp</p>
                          ) : (
                            filteredCompanies.map(c => (
                              <button
                                type="button"
                                key={c.id}
                                onClick={() => {
                                  setSelectedClientId(c.id);
                                  setFormData(prev => ({ ...prev, projectId: 0, clientCompanyCVTemplateId: null }));
                                  setIsCompanyDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                  selectedClientId === c.id
                                    ? "bg-primary-50 text-primary-700"
                                    : "hover:bg-neutral-50 text-neutral-700"
                                }`}
                              >
                                {c.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    {/* Mẫu CV khách hàng theo Công ty */}
                    {selectedClientId ? (
                      <div className="mt-3">
                        <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Mẫu CV khách hàng
                        </label>
                        <div className="relative">
                          <select
                            name="clientCompanyCVTemplateId"
                            value={formData.clientCompanyCVTemplateId ? formData.clientCompanyCVTemplateId.toString() : ""}
                            onChange={handleChange}
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                          >
                            <option value="">
                              {clientTemplates.length > 0 ? "-- Chọn mẫu CV --" : "-- Không có mẫu CV khả dụng --"}
                            </option>
                            {clientTemplates.map(t => (
                              <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Dự án (popover) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Dự án <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                    >
                      <div className="flex items-center gap-2 text-sm text-neutral-700">
                        <Layers className="w-4 h-4 text-neutral-400" />
                        <span>
                          {formData.projectId
                            ? projects.find(p => p.id === formData.projectId)?.name || "Chọn dự án"
                            : "Chọn dự án"}
                        </span>
                      </div>
                    </button>
                    {isProjectDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        <div className="p-3 border-b border-neutral-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <Input
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              placeholder="Tìm dự án..."
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, projectId: 0 }));
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${
                              !formData.projectId
                                ? "bg-primary-50 text-primary-700"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            Tất cả dự án
                          </button>
                          {projectsFilteredBySearch.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy dự án phù hợp</p>
                          ) : (
                            projectsFilteredBySearch.map(p => {
                              // Chỉ cho phép chọn dự án nếu status là "Ongoing" hoặc là dự án đã chọn trước đó
                              const isDisabled = p.status !== "Ongoing" && p.id !== formData.projectId;
                              
                              // Map status sang tiếng Việt
                              const statusLabels: Record<string, string> = {
                                "Ongoing": "Đang thực hiện",
                                "OnHold": "Tạm dừng",
                                "Completed": "Hoàn thành",
                                "Planned": "Đã lập kế hoạch",
                                "Planning": "Lập kế hoạch",
                                "Cancelled": "Đã hủy"
                              };
                              const statusLabel = statusLabels[p.status] || "Không xác định";
                              
                              return (
                                <button
                                  type="button"
                                  key={p.id}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      setFormData(prev => ({ ...prev, projectId: p.id, clientCompanyCVTemplateId: null }));
                                      setSelectedClientId(p.clientCompanyId);
                                      setIsProjectDropdownOpen(false);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`w-full text-left px-4 py-2.5 text-sm ${
                                    isDisabled
                                      ? "opacity-50 cursor-not-allowed text-neutral-400"
                                      : formData.projectId === p.id
                                        ? "bg-primary-50 text-primary-700"
                                        : "hover:bg-neutral-50 text-neutral-700"
                                  }`}
                                  title={isDisabled && p.id !== formData.projectId ? `Dự án này đang ở trạng thái "${statusLabel}" nên không thể chọn. Chỉ có thể chọn dự án đang thực hiện.` : ""}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{p.name}</span>
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                      p.status === "Ongoing" 
                                        ? "bg-green-100 text-green-700"
                                        : p.status === "OnHold"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : p.status === "Completed"
                                        ? "bg-blue-100 text-blue-700"
                                        : p.status === "Planned" || p.status === "Planning"
                                        ? "bg-purple-100 text-purple-700"
                                        : p.status === "Cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-neutral-100 text-neutral-700"
                                    }`}>
                                      {statusLabel}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Company info readonly when project selected */}
                  {selectedClientId ? (
                    <div className="mt-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                      <p className="text-xs font-semibold text-neutral-600 mb-1">Công ty liên kết</p>
                      {(() => {
                        const company = companies.find(c => c.id === selectedClientId);
                        return company ? (
                          <div className="text-sm text-neutral-800 space-y-0.5">
                            <div><span className="font-medium">Tên:</span> {company.name}</div>
                            {company.contactPerson && (
                              <div><span className="font-medium">Liên hệ:</span> {company.contactPerson}</div>
                            )}
                            {company.email && (
                              <div><span className="font-medium">Email:</span> {company.email}</div>
                            )}
                            {company.phone && (
                              <div><span className="font-medium">Điện thoại:</span> {company.phone}</div>
                            )}
                            {company.address && (
                              <div><span className="font-medium">Địa chỉ:</span> {company.address}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-500">Không tìm thấy thông tin công ty.</div>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                {/* (đã di chuyển Vị trí tuyển dụng xuống Chi tiết yêu cầu) */}
              </div>
            </div>
          </div>

          {/* Project Details (đã bỏ) */}
          {/* (đã bỏ Chi tiết dự án; Mẫu CV được đưa vào Thông tin cơ bản) */}

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Chi tiết yêu cầu</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Số lượng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min={1}
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                    required
                  />
                </div>

                {/* Chế độ làm việc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Chế độ làm việc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="workingMode"
                      value={formData.workingMode}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value={0}>Không xác định</option>
                      <option value={1}>Tại văn phòng</option>
                      <option value={2}>Từ xa</option>
                      <option value={4}>Kết hợp</option>
                      <option value={8}>Linh hoạt</option>
                    </select>
                  </div>
                </div>

                {/* Khu vực làm việc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Khu vực làm việc
                  </label>
                  <div className="relative">
                    <select
                      name="locationId"
                      value={formData.locationId ? formData.locationId.toString() : ""}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn khu vực làm việc --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vị trí tuyển dụng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Vị trí tuyển dụng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="jobRoleLevelId"
                      value={formData.jobRoleLevelId ? formData.jobRoleLevelId.toString() : ""}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="">-- Chọn vị trí --</option>
                      {jobRoleLevels.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.jobRoleLevelId ? (
                    <p className="text-xs text-neutral-500 mt-2">
                      Loại vị trí: <span className="font-medium text-neutral-700">{(() => {
                        const lvl = jobRoleLevels.find(j => j.id === formData.jobRoleLevelId);
                        const roleName = lvl ? (jobRoles.find(r => r.id === lvl.jobRoleId)?.name ?? "—") : "—";
                        return roleName;
                      })()}</span>
                    </p>
                  ) : null}
                </div>

                {/* Mẫu quy trình ứng tuyển */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mẫu quy trình ứng tuyển <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="applyProcessTemplateId"
                      value={formData.applyProcessTemplateId ? formData.applyProcessTemplateId.toString() : ""}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="">-- Chọn quy trình --</option>
                      {applyTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ngân sách */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ngân sách/tháng
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="budgetPerMonth"
                      value={formData.budgetPerMonth ? formatCurrency(formData.budgetPerMonth) : ""}
                      onChange={handleChange}
                      placeholder="VD: 5.000.000"
                      className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium pointer-events-none">
                      VNĐ
                    </span>
                  </div>
                  {formData.budgetPerMonth && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Số tiền: {formatCurrency(formData.budgetPerMonth)} VNĐ
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <RichTextEditor
                  value={formData.description ?? ""}
                  onChange={(val) => handleRichTextChange("description", val)}
                  placeholder="Nhập mô tả chi tiết về công việc..."
                />
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
                <RichTextEditor
                  value={formData.requirements ?? ""}
                  onChange={(val) => handleRichTextChange("requirements", val)}
                  placeholder="Nhập yêu cầu cụ thể cho ứng viên..."
                />
              </div>
            </div>
          </div>

          {/* Skills Selection */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-warning-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Kỹ năng yêu cầu <span className="text-red-500">*</span></h3>
                <div className="ml-auto">
                  <span className="text-sm text-neutral-500">
                    Đã chọn: {selectedSkills.length} kỹ năng
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm kỹ năng..."
                    className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                  {skillSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSkillSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      aria-label="Xoá tìm kiếm kỹ năng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative w-full lg:w-72">
                  <button
                    type="button"
                    onClick={() => setIsSkillGroupDropdownOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Filter className="w-4 h-4 text-neutral-400" />
                      <span>
                        {selectedSkillGroupId
                          ? skillGroups.find(group => group.id === selectedSkillGroupId)?.name || "Nhóm kỹ năng"
                          : "Tất cả nhóm kỹ năng"}
                      </span>
                    </div>
                  </button>
                  {isSkillGroupDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      <div className="p-3 border-b border-neutral-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            value={skillGroupQuery}
                            onChange={(e) => setSkillGroupQuery(e.target.value)}
                            placeholder="Tìm nhóm kỹ năng..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleSkillGroupSelect(undefined)}
                          className={`w-full text-left px-4 py-2.5 text-sm ${selectedSkillGroupId === undefined
                            ? "bg-primary-50 text-primary-700"
                            : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                        >
                          Tất cả nhóm kỹ năng
                        </button>
                        {skillGroups.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-neutral-500">Đang tải nhóm kỹ năng...</p>
                        ) : filteredSkillGroups.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-neutral-500">Không có nhóm phù hợp</p>
                        ) : (
                          filteredSkillGroups.map(group => (
                            <button
                              type="button"
                              key={group.id}
                              onClick={() => handleSkillGroupSelect(group.id)}
                              className={`w-full text-left px-4 py-2.5 text-sm ${selectedSkillGroupId === group.id
                                ? "bg-primary-50 text-primary-700"
                                : "hover:bg-neutral-50 text-neutral-700"
                                }`}
                            >
                              {group.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {filteredSkills.map(skill => (
                  <label
                    key={skill.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${selectedSkills.includes(skill.id)
                      ? "bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300 text-primary-800"
                      : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      value={skill.id}
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setSelectedSkills(prev =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter(id => id !== value)
                        );
                      }}
                      className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-300">
                      {skill.name}
                    </span>
                  </label>
                ))}
              </div>

              {allSkills.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Không có kỹ năng nào</p>
                  <p className="text-neutral-400 text-sm mt-1">Liên hệ admin để thêm kỹ năng mới</p>
                </div>
              )}
              {allSkills.length > 0 && filteredSkills.length === 0 && (
                <div className="text-center py-6 text-sm text-neutral-500">
                  Không tìm thấy kỹ năng phù hợp với bộ lọc hiện tại.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/sales/job-requests/${id}`}
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
