import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobRequestService } from "../../../services/JobRequest";
import { skillService, type Skill } from "../../../services/Skill";
import { projectService, type Project } from "../../../services/Project";
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { type ClientCompanyTemplate, clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";

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

  // Load skills, projects, and job positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skills, projectsData, jobPositionsData] = await Promise.all([
          skillService.getAll(),
          projectService.getAll(),
          jobPositionService.getAll()
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

  // Update form field values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value; // giữ nguyên chuỗi
    setForm(prev => ({ ...prev, projectId: value }));

    const project = projects.find(p => p.id.toString() === value);
    setSelectedClientId(project ? project.clientCompanyId : 0);

    // reset template
    setForm(prev => ({ ...prev, clientCompanyCVTemplateId: 0 }));
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // ✅ Check bắt buộc chọn mẫu CV khách hàng
    if (!form.clientCompanyCVTemplateId || form.clientCompanyCVTemplateId === 0) {
      setError("Vui lòng chọn mẫu CV của khách hàng trước khi tạo yêu cầu.");
      setLoading(false);
      return;
    }

    try {
      // Convert level and status to numbers
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

      console.log("🚀 Creating Job Request with payload:", payload);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Yêu Cầu Tuyển Dụng Mới</h1>
          <p className="text-neutral-600 mt-1">Nhập thông tin yêu cầu tuyển dụng từ khách hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Dự án"
              name="projectId"
              value={form.projectId}
              onChange={handleProjectChange} // thay vì handleChange chung
              options={[
                { value: "", label: "-- Chọn dự án --" },
                ...projects.map(p => ({ value: p.id.toString(), label: p.name })),
              ]}
              required
            />
            <SelectField
              label="Vị trí tuyển dụng"
              name="jobPositionId"
              value={form.jobPositionId}
              onChange={handleChange}
              options={[
                { value: "", label: "-- Chọn vị trí --" },
                ...jobPositions.map(p => ({ value: p.id.toString(), label: p.name })),
              ]}
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

          {/* Ngân sách và CV Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  ...clientTemplates.map(t => ({
                    value: t.templateId.toString(),
                    label: t.templateName,
                  })),
                ]}
              />
            )}
          </div>

          {/* Tiêu đề */}
          <InputField
            label="Tiêu đề yêu cầu"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VD: Senior Backend Developer cho dự án Fintech"
            required
          />

          {/* Mô tả công việc */}
          <TextareaField
            label="Mô tả công việc"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          {/* Yêu cầu ứng viên */}
          <TextareaField
            label="Yêu cầu ứng viên"
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
          />

          {/* Trạng thái */}
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

          {/* Skills */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kỹ năng yêu cầu</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto">
              {allSkills.map(skill => (
                <label
                  key={skill.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition 
        ${form.skillIds.includes(skill.id)
                      ? "bg-primary-50 border border-primary-400"
                      : "hover:bg-gray-50"}`}
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
                          : prev.skillIds.filter(id => id !== value)
                      }));
                    }}
                    className="accent-primary-500"
                  />
                  <span className="text-gray-800">{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error / Success Message */}
          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">Tạo yêu cầu thành công! Đang chuyển hướng...</p>}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
            >
              {loading ? "Đang lưu..." : "Tạo yêu cầu"}
            </button>
          </div>
        </form>
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
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
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
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  disabled
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-xl px-4 py-2"
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

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
