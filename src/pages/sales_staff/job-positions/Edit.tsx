import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobPositionService, type JobPosition, type JobPositionPayload } from "../../../services/JobPosition";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { positionTypeService, type PositionType } from "../../../services/PositionType";

export default function JobPositionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobPosition, setJobPosition] = useState<JobPosition | null>(null);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<JobPositionPayload>({
    clientCompanyId: 0,
    positionTypeId: 0,
    name: "",
    description: "",
    level: 0,
    isActive: true,
  });

  // 🧭 Load dữ liệu chi tiết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const [positionData, companies, types] = await Promise.all([
          jobPositionService.getById(Number(id)) as Promise<JobPosition>,
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          positionTypeService.getAll() as Promise<PositionType[]>,
        ]);

        setJobPosition(positionData);
        setPositionTypes(types);
        setClientCompanies(companies);

        setFormData({
          clientCompanyId: positionData.clientCompanyId,
          positionTypeId: positionData.positionTypeId,
          name: positionData.name,
          description: positionData.description ?? "",
          level: positionData.level,
          isActive: positionData.isActive,
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
      [name]: type === "checkbox" ? checked : ["level", "clientCompanyId", "positionTypeId"].includes(name) ? Number(value) : value,
    }));
  };

  // 💾 Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await jobPositionService.update(Number(id), formData);
      alert("✅ Cập nhật vị trí tuyển dụng thành công!");
      navigate(`/sales/job-positions/${id}`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      alert("Không thể cập nhật vị trí tuyển dụng!");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-500">Đang tải dữ liệu...</div>;

  if (!jobPosition) return <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy vị trí tuyển dụng</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa vị trí tuyển dụng</h1>
          <p className="text-neutral-600 mt-1">Cập nhật thông tin vị trí tuyển dụng.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Tên vị trí */}
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Tên vị trí</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên vị trí"
                required
              />
            </div>

            {/* Công ty khách hàng */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Công ty khách hàng</label>
              <select
                name="clientCompanyId"
                value={formData.clientCompanyId}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value={0}>-- Chọn công ty --</option>
                {clientCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Loại vị trí */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Loại vị trí</label>
              <select
                name="positionTypeId"
                value={formData.positionTypeId}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              >
                <option value={0}>-- Chọn loại vị trí --</option>
                {positionTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Cấp độ */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Cấp độ</label>
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

            {/* Trạng thái */}
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="accent-primary-500 mr-2"
              />
              <label className="text-gray-700 font-medium">Hoạt động</label>
            </div>

            {/* Mô tả */}
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Nhập mô tả..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/job-positions/${id}`}
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
