import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { jobRoleLevelService, type JobRoleLevel, type JobRoleLevelPayload } from "../../../../services/JobRoleLevel";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { jobRoleService, type JobRole } from "../../../../services/JobRole";
import { Layers3, Users, Briefcase, FileText } from "lucide-react";

export default function JobRoleLevelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobRoleLevel, setJobRoleLevel] = useState<JobRoleLevel | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<JobRoleLevelPayload>({
    jobRoleId: 0,
    name: "",
    description: "",
    level: 0,
    minManMonthPrice: undefined,
    maxManMonthPrice: undefined,
  });

  const levelLabels: Record<number, string> = {
    0: "Junior",
    1: "Middle",
    2: "Senior",
    3: "Lead",
  };

  const formatPrice = (value?: number | null) =>
    value === undefined || value === null ? "—" : Number(value).toLocaleString("vi-VN");

  // 🧭 Load dữ liệu chi tiết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const [positionData, types] = await Promise.all([
          jobRoleLevelService.getById(Number(id)) as Promise<JobRoleLevel>,
          jobRoleService.getAll() as Promise<JobRole[]>,
        ]);

        setJobRoleLevel(positionData);
        setJobRoles(types);

        setFormData({
          jobRoleId: positionData.jobRoleId,
          name: positionData.name,
          description: positionData.description ?? "",
          level: positionData.level,
          minManMonthPrice: positionData.minManMonthPrice,
          maxManMonthPrice: positionData.maxManMonthPrice,
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin vị trí tuyển dụng!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✍️ Cập nhật form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : ["level", "jobRoleId"].includes(name) ? Number(value) : ["minManMonthPrice","maxManMonthPrice"].includes(name) ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  // 💾 Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await jobRoleLevelService.update(Number(id), formData);
      alert("✅ Cập nhật vị trí tuyển dụng thành công!");
      navigate(`/sales/job-role-levels/${id}`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      alert("Không thể cập nhật vị trí tuyển dụng!");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-500">Đang tải dữ liệu...</div>;

  if (!jobRoleLevel) return <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy vị trí tuyển dụng</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />

      <div className="flex-1 p-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/admin/categories/job-role-levels/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa vị trí tuyển dụng</h1>
              <p className="text-neutral-600 mb-4">Cập nhật thông tin vị trí tuyển dụng</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: Form */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-soft p-8 border border-neutral-100 space-y-6">
            {/* Section: Thông tin cơ bản */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Layers3 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên vị trí */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Tên vị trí</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Frontend Developer, Backend Engineer..."
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">Tên rõ ràng giúp HR/khách hàng dễ nhận biết.</p>
                </div>

                {/* Loại vị trí */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Loại vị trí</label>
                  <select
                    name="jobRoleId"
                    value={formData.jobRoleId}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    required
                  >
                    <option value={0}>-- Chọn loại vị trí --</option>
                    {jobRoles.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">Chọn nhóm vai trò tương ứng.</p>
                </div>

                {/* Cấp độ */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Cấp độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  >
                    <option value={0}>Junior</option>
                    <option value={1}>Middle</option>
                    <option value={2}>Senior</option>
                    <option value={3}>Lead</option>
                  </select>
                </div>

                {/* Đơn giá tối thiểu (man-month) */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Đơn giá tối thiểu (man-month)</label>
                  <Input
                    name="minManMonthPrice"
                    value={formData.minManMonthPrice?.toString() ?? ""}
                    onChange={handleChange}
                    placeholder="VD: 1,000"
                  />
                </div>

                {/* Đơn giá tối đa (man-month) */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Đơn giá tối đa (man-month)</label>
                  <Input
                    name="maxManMonthPrice"
                    value={formData.maxManMonthPrice?.toString() ?? ""}
                    onChange={handleChange}
                    placeholder="VD: 3,000"
                  />
                </div>

                {/* Mô tả */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về yêu cầu, kỹ năng, phạm vi công việc..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                to={`/admin/categories/job-role-levels/${id}`}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </Link>
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100 h-max">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-neutral-700">
                <Layers3 className="w-4 h-4 text-neutral-400" />
                <span className="font-medium">{formData.name || "Tên vị trí"}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Users className="w-4 h-4 text-neutral-400" />
                <span>{levelLabels[formData.level]}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                <span>{formatPrice(formData.minManMonthPrice)} - {formatPrice(formData.maxManMonthPrice)} / mm</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700">
                <FileText className="w-4 h-4 text-neutral-400 mt-0.5" />
                <p className="text-sm leading-6 whitespace-pre-wrap break-words">{formData.description || "Mô tả sẽ hiển thị ở đây..."}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
