import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService, WorkingMode, JobRequestStatus } from "../../../services/JobRequest";
import { skillService, type Skill } from "../../../services/Skill";
import { projectService, type Project } from "../../../services/Project";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import { type ClientCompanyTemplate, clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";
import { locationService, type Location } from "../../../services/location";
import { applyProcessTemplateService, type ApplyProcessTemplate } from "../../../services/ApplyProcessTemplate";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Briefcase, 
  Users, 
  DollarSign, 
  Target, 
  FileText, 
  CheckSquare, 
  Building2, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  X
} from "lucide-react";

export default function JobRequestCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectId: "",
    jobRoleLevelId: "",
    clientCompanyCVTemplateId: 0,
    applyProcessTemplateId: "",
    title: "",
    description: "",
    requirements: "",
    quantity: 1,
    budgetPerMonth: "",
    status: JobRequestStatus.Pending as number,
    workingMode: WorkingMode.None as number,
    locationId: "",
    skillIds: [] as number[],
  });

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<number>(0);
  const [clientTemplates, setClientTemplates] = useState<ClientCompanyTemplate[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [applyTemplates, setApplyTemplates] = useState<ApplyProcessTemplate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skills, projectsData, jobRoleLevelsData, jobRolesData, locs, apts] = await Promise.all([
          skillService.getAll(),
          projectService.getAll(),
          jobRoleLevelService.getAll(),
          jobRoleService.getAll(),
          locationService.getAll(),
          applyProcessTemplateService.getAll(),
        ]);
        setAllSkills(skills);
        setProjects(projectsData);
        setJobRoleLevels(jobRoleLevelsData);
        setJobRoles(jobRolesData);
        setLocations(locs);
        setApplyTemplates(apts);
      } catch (error) {
        console.error("❌ Error loading data", error);
      }
    };
    fetchData();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "jobRoleLevelId") {
      const lvl = jobRoleLevels.find(j => j.id.toString() === value);
      if (lvl) setSelectedJobRoleId(lvl.jobRoleId);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, projectId: value }));
    const project = projects.find(p => p.id.toString() === value);
    setSelectedClientId(project ? project.clientCompanyId : 0);
    setForm(prev => ({ ...prev, clientCompanyCVTemplateId: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.clientCompanyCVTemplateId || form.clientCompanyCVTemplateId === 0) {
      setError("⚠️ Vui lòng chọn mẫu CV của khách hàng trước khi tạo yêu cầu.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        projectId: Number(form.projectId),
        jobRoleLevelId: Number(form.jobRoleLevelId),
        applyProcessTemplateId: form.applyProcessTemplateId ? Number(form.applyProcessTemplateId) : undefined,
        clientCompanyCVTemplateId: Number(form.clientCompanyCVTemplateId),
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        quantity: Number(form.quantity),
        budgetPerMonth: form.budgetPerMonth ? Number(form.budgetPerMonth) : undefined,
        locationId: form.locationId ? Number(form.locationId) : undefined,
        workingMode: Number(form.workingMode) as WorkingMode,
        status: Number(form.status) as JobRequestStatus,
        skillIds: form.skillIds,
      };

      await jobRequestService.create(payload);
      setSuccess(true);
      setTimeout(() => navigate("/sales/job-requests"), 1500);
    } catch (err) {
      console.error("❌ Error creating Job Request:", err);
      setError("Không thể tạo yêu cầu tuyển dụng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo yêu cầu tuyển dụng mới</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để tạo yêu cầu tuyển dụng cho khách hàng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Tạo yêu cầu tuyển dụng mới
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
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="VD: Senior Backend Developer cho dự án Fintech"
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dự án */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Dự án
                  </label>
                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleProjectChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Vị trí tuyển dụng (Job Role Level) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Vị trí tuyển dụng
                  </label>
                  <select
                    name="jobRoleLevelId"
                    value={form.jobRoleLevelId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {jobRoleLevels.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Job Role (chỉ hiển thị khi đã chọn Job Role Level) */}
                {form.jobRoleLevelId && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Kiểu vị trí tuyển dụng
                    </label>
                    <select
                      name="jobRoleId"
                      value={selectedJobRoleId ? selectedJobRoleId.toString() : ""}
                      onChange={(e) => setSelectedJobRoleId(e.target.value ? Number(e.target.value) : 0)}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn Job Role --</option>
                      {jobRoles.map(r => (
                        <option key={r.id} value={r.id.toString()}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          {form.projectId && (
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
                    <select
                      name="clientCompanyCVTemplateId"
                      value={form.clientCompanyCVTemplateId.toString()}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="0">
                        {clientTemplates.length > 0 ? "-- Chọn mẫu CV --" : "-- Không có mẫu CV khả dụng --"}
                      </option>
                      {clientTemplates.map(t => (
                        <option key={t.templateId} value={t.templateId.toString()}>{t.templateName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chế độ làm việc */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Chế độ làm việc
                    </label>
                    <select
                      name="workingMode"
                      value={form.workingMode}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value={WorkingMode.None}>Không xác định</option>
                      <option value={WorkingMode.Onsite}>Onsite</option>
                      <option value={WorkingMode.Remote}>Remote</option>
                      <option value={WorkingMode.Hybrid}>Hybrid</option>
                      <option value={WorkingMode.Flexible}>Linh hoạt</option>
                    </select>
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
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
                </div>

                {/* Địa điểm */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Địa điểm
                  </label>
                  <select
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id.toString()}>{l.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quy trình Apply */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Quy trình Apply
                  </label>
                  <select
                    name="applyProcessTemplateId"
                    value={form.applyProcessTemplateId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn quy trình --</option>
                    {applyTemplates.map(t => (
                      <option key={t.id} value={t.id.toString()}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ngân sách */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ngân sách/tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="budgetPerMonth"
                    value={form.budgetPerMonth}
                    onChange={handleChange}
                    placeholder="Nhập ngân sách..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
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
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Nhập mô tả chi tiết về công việc..."
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
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
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Nhập yêu cầu cụ thể cho ứng viên..."
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
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
                    Đã chọn: {form.skillIds.length} kỹ năng
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
                      form.skillIds.includes(skill.id)
                        ? "bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300 text-primary-800"
                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={skill.id}
                      checked={form.skillIds.includes(skill.id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm(prev => ({
                          ...prev,
                          skillIds: e.target.checked
                            ? [...prev.skillIds, value]
                            : prev.skillIds.filter(id => id !== value),
                        }));
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

          {/* Notifications */}
          {(error || success) && (
            <div className="animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Tạo yêu cầu thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/sales/job-requests"
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Tạo yêu cầu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

