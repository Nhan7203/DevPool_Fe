import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService } from "../../../services/JobRequest";
import { skillService, type Skill } from "../../../services/Skill";
import { projectService, type Project } from "../../../services/Project";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { type ClientCompanyTemplate, clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";
import { ClipboardList } from "lucide-react";

export default function JobRequestCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectId: "",
    jobPositionId: "",
    clientCompanyCVTemplateId: 0,
    title: "",
    description: "",
    requirements: "",
    level: 0,
    quantity: 1,
    budgetPerMonth: "",
    status: 0,
    skillIds: [] as number[],
  });

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [clientTemplates, setClientTemplates] = useState<ClientCompanyTemplate[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skills, projectsData, jobPositionsData] = await Promise.all([
          skillService.getAll(),
          projectService.getAll(),
          jobPositionService.getAll(),
        ]);
        setAllSkills(skills);
        setProjects(projectsData);
        setJobPositions(jobPositionsData);
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
        jobPositionId: Number(form.jobPositionId),
        clientCompanyCVTemplateId: Number(form.clientCompanyCVTemplateId),
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        level: Number(form.level),
        quantity: Number(form.quantity),
        budgetPerMonth: form.budgetPerMonth ? Number(form.budgetPerMonth) : undefined,
        status: Number(form.status),
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

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <ClipboardList className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Yêu Cầu Tuyển Dụng Mới
            </h1>
            <p className="text-neutral-600 mt-2">
              Điền thông tin chi tiết để tạo yêu cầu tuyển dụng cho khách hàng
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid: Dự án - Vị trí - Level - Số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Dự án"
                  name="projectId"
                  value={form.projectId}
                  onChange={handleProjectChange}
                  options={[{ value: "", label: "-- Chọn dự án --" }, ...projects.map(p => ({ value: p.id.toString(), label: p.name }))]}
                  required
                />
                <SelectField
                  label="Vị trí tuyển dụng"
                  name="jobPositionId"
                  value={form.jobPositionId}
                  onChange={handleChange}
                  options={[{ value: "", label: "-- Chọn vị trí --" }, ...jobPositions.map(p => ({ value: p.id.toString(), label: p.name }))]}
                  required
                />
                <SelectField
                  label="Cấp độ"
                  name="level"
                  value={form.level.toString()}
                  onChange={handleChange}
                  options={[
                    { value: "0", label: "Junior" },
                    { value: "1", label: "Middle" },
                    { value: "2", label: "Senior" },
                    { value: "3", label: "Lead" },
                  ]}
                  required
                />
                <InputField
                  label="Số lượng cần tuyển"
                  name="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Grid: Ngân sách + Template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Ngân sách dự kiến (VNĐ/tháng)"
                  name="budgetPerMonth"
                  type="number"
                  value={form.budgetPerMonth}
                  onChange={handleChange}
                  required
                />
                {form.projectId && (
                  <SelectField
                    label="Mẫu CV của khách hàng"
                    name="clientCompanyCVTemplateId"
                    value={form.clientCompanyCVTemplateId.toString()}
                    onChange={handleChange}
                    required
                    options={[
                      { value: "0", label: clientTemplates.length > 0 ? "-- Chọn mẫu CV --" : "-- Không có mẫu CV khả dụng --" },
                      ...clientTemplates.map(t => ({ value: t.templateId.toString(), label: t.templateName })),
                    ]}
                  />
                )}
              </div>

              {/* Title */}
              <InputField
                label="Tiêu đề yêu cầu"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="VD: Senior Backend Developer cho dự án Fintech"
                required
              />

              {/* Description & Requirements */}
              <TextareaField
                label="Mô tả công việc"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
              <TextareaField
                label="Yêu cầu ứng viên"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
              />

              {/* Skills */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Kỹ năng yêu cầu</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                  {allSkills.map(skill => (
                    <label
                      key={skill.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition ${form.skillIds.includes(skill.id)
                          ? "bg-primary-50 border border-primary-400"
                          : "hover:bg-gray-50"
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
                        className="accent-primary-500"
                      />
                      <span className="text-gray-800">{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <SelectField
                label="Trạng thái"
                name="status"
                value={form.status.toString()}
                onChange={handleChange}
                options={[
                  { value: "0", label: "Chưa duyệt" },
                  { value: "1", label: "Đã duyệt" },
                  { value: "2", label: "Đã đóng" },
                ]}
                disabled
              />

              {/* Notifications */}
              {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">✅ Tạo yêu cầu thành công! Đang chuyển hướng...</p>}

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Đang lưu..." : "Tạo yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== COMPONENTS NHỎ ======
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-neutral-300 rounded-xl px-4 py-3.5 bg-white/50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:shadow-soft transition-all"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}
function SelectField({ label, name, value, onChange, options, required, disabled }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full border border-neutral-300 rounded-xl px-4 py-3.5 bg-white/50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:shadow-soft transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full border border-neutral-300 rounded-xl px-4 py-3.5 bg-white/50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:shadow-soft transition-all"
      />
    </div>
  );
}
