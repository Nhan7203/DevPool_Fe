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
import { jobPositionService, type JobPosition } from "../../../services/JobPosition";
import { projectService, type Project } from "../../../services/Project";

export default function JobRequestEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]); // To store selected skills
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [clientTemplates, setClientTemplates] = useState<ClientCompanyTemplate[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [formData, setFormData] = useState<JobRequestPayload>({
    projectId: 0,
    jobPositionId: 0,
    clientCompanyCVTemplateId: 0,
    title: "",
    description: "",
    requirements: "",
    level: 0,
    quantity: 1,
    budgetPerMonth: undefined,
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
          jobPositionId: data.jobPositionId,
          clientCompanyCVTemplateId: data.clientCompanyCVTemplateId,
          title: data.title,
          description: data.description ?? "",
          requirements: data.requirements ?? "",
          level: data.level,
          quantity: data.quantity,
          budgetPerMonth: data.budgetPerMonth ?? undefined,
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

  // 🧭 Load danh sách Projects và Job Positions
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [projectsData, jobPosData] = await Promise.all([
          projectService.getAll(),
          jobPositionService.getAll()
        ]);
        setProjects(projectsData);
        setJobPositions(jobPosData);
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
      [name]: name === "level" || name === "status"
        ? Number(value) // Convert 'level' and 'status' to numbers
        : name === "quantity" || name === "budgetPerMonth"
          ? Number(value) // For 'quantity' and 'budgetPerMonth' as well
          : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!Number(formData.projectId)) {
      alert("⚠️ Vui lòng chọn Dự án trước khi lưu!");
      return;
    }

    // ⚠️ Kiểm tra bắt buộc chọn mẫu CV khách hàng
    if (!Number(formData.clientCompanyCVTemplateId)) {
      alert("⚠️ Vui lòng chọn Mẫu CV khách hàng trước khi lưu!");
      return;
    }

    if (!Number(formData.jobPositionId)) {
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
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa yêu cầu tuyển dụng</h1>
            <p className="text-neutral-600 mt-1">
              Cập nhật thông tin yêu cầu tuyển dụng của khách hàng.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Tiêu đề */}
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Tiêu đề</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề job"
                required
                className="w-full"
              />
            </div>

            {/* Dự án */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Dự án</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleProjectChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="0">-- Chọn dự án --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Mẫu CV khách hàng */}
            {formData.projectId !== 0 && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Mẫu CV của khách hàng</label>
                <select
                  name="clientCompanyCVTemplateId"
                  value={formData.clientCompanyCVTemplateId}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                >
                  <option value="0">
                    {clientTemplates.length > 0 ? "-- Chọn mẫu CV --" : "-- Không có mẫu CV khả dụng --"}
                  </option>
                  {clientTemplates.map(t => (
                    <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Vị trí tuyển dụng */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Vị trí tuyển dụng</label>
              <select
                name="jobPositionId"
                value={formData.jobPositionId}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              >
                <option value="0">-- Chọn vị trí --</option>
                {jobPositions.map(pos => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cấp độ */}
            <div className="col-span-1 max-w-[200px]">
              <label className="block text-gray-700 font-medium mb-1">Cấp độ</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="0">Junior</option>
                <option value="1">Middle</option>
                <option value="2">Senior</option>
                <option value="3">Lead</option>
              </select>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Số lượng</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
              />
            </div>

            {/* Ngân sách */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Ngân sách (VNĐ/tháng)
              </label>
              <Input
                type="number"
                name="budgetPerMonth"
                value={formData.budgetPerMonth ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Trạng thái</label>
              <input
                type="text"
                value="Chờ duyệt"
                readOnly
                className="border border-gray-300 rounded-md px-3 py-2 w-52 bg-gray-100 text-gray-600 cursor-default"
              />
            </div>

          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mô tả công việc</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả công việc..."
            />
          </div>

          {/* Yêu cầu */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Yêu cầu ứng viên</label>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập yêu cầu cụ thể..."
            />
          </div>

          {/* Kỹ năng */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kỹ năng yêu cầu</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto">
              {allSkills.map(skill => (
                <label
                  key={skill.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition 
        ${selectedSkills.includes(skill.id)
                      ? "bg-primary-50 border border-primary-400"
                      : "hover:bg-gray-50"}`}
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
                    className="accent-primary-500"
                  />
                  <span className="text-gray-800">{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/job-requests/${id}`}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Hủy
            </Link>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
