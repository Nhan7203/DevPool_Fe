import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCVService, type TalentCVCreate } from "../../../services/TalentCV";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  FileText, 
  Upload, 
  Briefcase,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function TalentCVEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentCVCreate>({
    talentId: 0,
    jobRoleId: 0,
    versionName: "",
    cvFileUrl: "",
    isActive: true,
    summary: "",
    isGeneratedFromTemplate: false,
    sourceTemplateId: undefined,
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent CV
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentCVService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          jobRoleId: data.jobRoleId,
          versionName: data.versionName,
          cvFileUrl: data.cvFileUrl,
          isActive: data.isActive,
          summary: data.summary,
          isGeneratedFromTemplate: data.isGeneratedFromTemplate,
          sourceTemplateId: data.sourceTemplateId,
        });
        setTalentId(data.talentId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin CV!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách Job Roles
  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const jobRoles = await jobRoleService.getAll({ excludeDeleted: true });
        setAllJobRoles(jobRoles);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách vị trí công việc:", err);
      }
    };
    fetchJobRoles();
  }, []);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === "jobRoleId" || name === "sourceTemplateId" ? Number(value) : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.jobRoleId || formData.jobRoleId === 0) {
      alert("⚠️ Vui lòng chọn vị trí công việc trước khi lưu!");
      return;
    }

    if (!formData.versionName.trim()) {
      alert("⚠️ Vui lòng nhập tên phiên bản CV!");
      return;
    }

    if (!formData.cvFileUrl.trim()) {
      alert("⚠️ Vui lòng nhập URL file CV!");
      return;
    }

    if (!formData.summary.trim()) {
      alert("⚠️ Vui lòng nhập tóm tắt CV!");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.cvFileUrl);
    } catch {
      alert("⚠️ URL file CV không hợp lệ!");
      return;
    }

    try {
      console.log("Payload gửi đi:", formData);
      await talentCVService.update(Number(id), formData);

      alert("✅ Cập nhật CV thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật CV!");
    }
  };

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
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
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết talent</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa CV</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin CV của talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa CV
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
                <h2 className="text-xl font-semibold text-gray-900">Thông tin CV</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Vị trí công việc */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Vị trí công việc
                </label>
                <div className="relative">
                  <select
                    name="jobRoleId"
                    value={formData.jobRoleId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="0">-- Chọn vị trí công việc --</option>
                    {allJobRoles.map(jobRole => (
                      <option key={jobRole.id} value={jobRole.id}>{jobRole.name}</option>
                    ))}
                  </select>
                </div>
                {formData.jobRoleId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allJobRoles.find(jr => jr.id === formData.jobRoleId)?.name || "Không xác định"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên phiên bản */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Tên phiên bản CV
                  </label>
                  <Input
                    name="versionName"
                    value={formData.versionName}
                    onChange={handleChange}
                    placeholder="VD: CV v1.0, CV Frontend Developer..."
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* URL file CV */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    URL file CV
                  </label>
                  <Input
                    name="cvFileUrl"
                    value={formData.cvFileUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/cv-file.pdf"
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Nhập URL đầy đủ của file CV (PDF)
                  </p>
                  {formData.cvFileUrl && (
                    <div className="mt-2">
                      <a
                        href={formData.cvFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem trước file CV
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Tóm tắt CV */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tóm tắt CV
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về nội dung CV, kinh nghiệm chính..."
                  rows={4}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trạng thái hoạt động */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trạng thái hoạt động
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Đánh dấu nếu CV này đang được sử dụng
                  </p>
                </div>

                {/* Được tạo từ template */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Được tạo từ template
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      name="isGeneratedFromTemplate"
                      checked={formData.isGeneratedFromTemplate}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.isGeneratedFromTemplate ? "Có" : "Không"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Đánh dấu nếu CV được tạo từ template
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
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
