import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService, type JobRequestPayload } from "../../../services/JobRequest";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { skillService, type Skill } from "../../../services/Skill";
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
  Briefcase, 
  Users, 
  DollarSign, 
  Target, 
  FileText, 
  CheckSquare,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { WorkingMode } from "../../../types/WorkingMode";

export default function JobRequestEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]); // To store selected skills
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [clientTemplates, setClientTemplates] = useState<ClientCompanyTemplate[]>([]);
  const [, setLocations] = useState<Location[]>([]);
  const [applyTemplates, setApplyTemplates] = useState<ApplyProcessTemplate[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [formData, setFormData] = useState<JobRequestPayload>({
    projectId: 0,
    jobRoleLevelId: 0,
    applyProcessTemplateId: undefined,
    clientCompanyCVTemplateId: 0,
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

  const [loading, setLoading] = useState(true);

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
          clientCompanyCVTemplateId: data.clientCompanyCVTemplateId,
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

  // 🧭 Load danh sách Projects, Job Role Levels, Locations, Apply Templates, Job Roles
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [projectsData, jobPosData, locs, apts, roles] = await Promise.all([
          projectService.getAll(),
          jobRoleLevelService.getAll(),
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

  // 🧭 Load danh sách Client Templates khi selectedClientId thay đổi
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = Number(e.target.value);
    setFormData(prev => ({ ...prev, projectId, clientCompanyCVTemplateId: 0 }));

    const project = projects.find(p => p.id === projectId);
    setSelectedClientId(project ? project.clientCompanyId : 0);
  };

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" || name === "workingMode"
        ? Number(value)
        : ["quantity","budgetPerMonth","projectId","jobRoleLevelId","clientCompanyCVTemplateId","locationId","applyProcessTemplateId"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Xác nhận trước khi lưu
    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
    if (!confirmed) {
      return;
    }

    if (!Number(formData.projectId)) {
      alert("⚠️ Vui lòng chọn Dự án trước khi lưu!");
      return;
    }

    // ⚠️ Kiểm tra bắt buộc chọn mẫu CV khách hàng
    if (!Number(formData.clientCompanyCVTemplateId)) {
      alert("⚠️ Vui lòng chọn Mẫu CV khách hàng trước khi lưu!");
      return;
    }

    if (!Number(formData.jobRoleLevelId)) {
      alert("⚠️ Vui lòng chọn Vị trí tuyển dụng trước khi lưu!");
      return;
    }

    try {
      // Gộp selectedSkills vào payload
      const payload: JobRequestPayload = {
        ...formData,
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

          <div className="flex justify-between items-start">
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
                  Tiêu đề yêu cầu
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
                {/* Dự án */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Dự án
                  </label>
                  <div className="relative">
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleProjectChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="0">-- Chọn dự án --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vị trí tuyển dụng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Vị trí tuyển dụng
                  </label>
                  <div className="relative">
                    <select
                      name="jobRoleLevelId"
                      value={formData.jobRoleLevelId}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="0">-- Chọn vị trí --</option>
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
              </div>
            </div>
          </div>

          {/* Project Details */}
          {formData.projectId !== 0 && (
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-secondary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết dự án</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mẫu CV khách hàng */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Mẫu CV khách hàng
                    </label>
                    <div className="relative">
                      <select
                        name="clientCompanyCVTemplateId"
                        value={formData.clientCompanyCVTemplateId}
                        onChange={handleChange}
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      >
                        <option value="0">
                          {clientTemplates.length > 0 ? "-- Chọn mẫu CV --" : "-- Không có mẫu CV khả dụng --"}
                        </option>
                        {clientTemplates.map(t => (
                          <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quy trình Apply */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Quy trình Apply
                    </label>
                    <div className="relative">
                      <select
                        name="applyProcessTemplateId"
                        value={formData.applyProcessTemplateId ?? 0}
                        onChange={handleChange}
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      >
                        <option value={0}>-- Chọn quy trình --</option>
                        {applyTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Chi tiết công việc</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Số lượng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Số lượng
                  </label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min={1}
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* Ngân sách */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ngân sách/tháng (VNĐ)
                  </label>
                  <Input
                    type="number"
                    name="budgetPerMonth"
                    value={formData.budgetPerMonth ?? ""}
                    onChange={handleChange}
                    placeholder="Nhập ngân sách..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* Chế độ làm việc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Chế độ làm việc
                  </label>
                  <div className="relative">
                    <select
                      name="workingMode"
                      value={formData.workingMode}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value={0}>Không xác định</option>
                      <option value={1}>Tại công ty</option>
                      <option value={2}>Từ xa</option>
                      <option value={4}>Kết hợp</option>
                      <option value={8}>Linh hoạt</option>
                    </select>
                  </div>
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
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Nhập mô tả chi tiết về công việc..."
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl resize-none"
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
                <Textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Nhập yêu cầu cụ thể cho ứng viên..."
                  className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl resize-none"
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
                <h3 className="text-lg font-semibold text-gray-900">Kỹ năng yêu cầu</h3>
                <div className="ml-auto">
                  <span className="text-sm text-neutral-500">
                    Đã chọn: {selectedSkills.length} kỹ năng
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {allSkills.map(skill => (
                  <label
                    key={skill.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedSkills.includes(skill.id)
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
