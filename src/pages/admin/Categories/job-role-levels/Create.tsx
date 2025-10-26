import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Briefcase,
  Layers,
  ClipboardList,
  FileText,
  CheckCircle,
  ArrowLeft,
  Plus,
  Save,
  Target,
  Users,
  AlertCircle
} from "lucide-react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { jobRoleLevelService, type JobRoleLevelPayload } from "../../../../services/JobRoleLevel";
import { type JobRole, jobRoleService } from "../../../../services/JobRole";

export default function JobRoleLevelCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobRoleLevelPayload>({
    jobRoleId: 0,
    name: "",
    description: "",
    level: 0,
    minManMonthPrice: undefined,
    maxManMonthPrice: undefined,
  });

  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const selectedJobRoleName = jobRoles.find(j => j.id === formData.jobRoleId)?.name ?? "—";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const types = await jobRoleService.getAll() as JobRole[];
        setJobRoles(types);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["level", "jobRoleId"].includes(name)
          ? Number(value)
          : ["minManMonthPrice", "maxManMonthPrice"].includes(name)
          ? (value === "" ? undefined : Number(value))
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên vị trí.");
      setLoading(false);
      return;
    }

    try {
      await jobRoleLevelService.create(formData);
      setSuccess(true);
      setTimeout(() => navigate("/admin/categories/job-role-levels"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo vị trí:", err);
      setError("Không thể tạo vị trí. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/admin/categories/job-role-levels"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo vị trí tuyển dụng mới</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin vị trí tuyển dụng cho công ty khách hàng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Tạo vị trí tuyển dụng mới
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
                  <ClipboardList className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Tên vị trí */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Tên vị trí tuyển dụng
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Frontend Developer, Backend Engineer..."
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loại vị trí */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Loại vị trí
                  </label>
                  <div className="relative">
                    <select
                      name="jobRoleId"
                      value={formData.jobRoleId.toString()}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="0">-- Chọn loại vị trí --</option>
                      {jobRoles.map((t) => (
                        <option key={t.id} value={t.id.toString()}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">Tên vai trò đã chọn: <span className="font-medium text-neutral-800">{selectedJobRoleName}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Target className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Chi tiết công việc</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cấp độ */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Cấp độ
                  </label>
                  <div className="relative">
                    <select
                      name="level"
                      value={formData.level.toString()}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="0">Junior</option>
                      <option value="1">Middle</option>
                      <option value="2">Senior</option>
                      <option value="3">Lead</option>
                    </select>
                  </div>
                </div>
                {/* Đơn giá tối thiểu/tháng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Đơn giá tối thiểu (man-month)
                  </label>
                  <input
                    name="minManMonthPrice"
                    type="number"
                    step="0.01"
                    value={formData.minManMonthPrice?.toString() ?? ""}
                    onChange={handleChange}
                    placeholder="VD: 1000"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Đơn giá tối đa/tháng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Đơn giá tối đa (man-month)
                  </label>
                  <input
                    name="maxManMonthPrice"
                    type="number"
                    step="0.01"
                    value={formData.maxManMonthPrice?.toString() ?? ""}
                    onChange={handleChange}
                    placeholder="VD: 3000"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <FileText className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mô tả công việc</h3>
              </div>
            </div>
            <div className="p-6">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Nhập mô tả chi tiết về công việc, yêu cầu, quyền lợi..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
              />
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
                    ✅ Tạo vị trí thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/admin/categories/job-role-levels"
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
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
                  Tạo vị trí
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
