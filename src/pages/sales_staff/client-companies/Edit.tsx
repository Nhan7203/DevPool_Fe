import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { clientCompanyService, type ClientCompany, type ClientCompanyPayload } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function ClientCompanyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [formData, setFormData] = useState<ClientCompanyPayload>({
    name: "",
    taxCode: "",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu công ty
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clientCompanyService.getById(Number(id));
        setCompany(data);
        setFormData({
          name: data.name,
          taxCode: data.taxCode ?? "",
          contactPerson: data.contactPerson,
          position: data.position ?? "",
          email: data.email,
          phone: data.phone ?? "",
          address: data.address ?? "",
        });
      } catch (err) {
        console.error("❌ Lỗi tải công ty:", err);
        alert("Không thể tải thông tin công ty!");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name.trim()) {
      alert("⚠️ Vui lòng nhập tên công ty!");
      return;
    }
    if (!formData.contactPerson.trim()) {
      alert("⚠️ Vui lòng nhập người liên hệ!");
      return;
    }
    if (!formData.email.trim()) {
      alert("⚠️ Vui lòng nhập email!");
      return;
    }

    try {
      await clientCompanyService.update(Number(id), formData);
      alert("✅ Cập nhật công ty thành công!");
      navigate(`/sales/clients/${id}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật công ty:", err);
      alert("Không thể cập nhật công ty!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu công ty...
      </div>
    );

  if (!company)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy công ty
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa công ty khách hàng</h1>
            <p className="text-neutral-600 mt-1">
              Cập nhật thông tin công ty khách hàng.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Tên công ty</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên công ty"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Mã số thuế</label>
              <Input
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                placeholder="Nhập mã số thuế"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Người liên hệ</label>
              <Input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Nhập người liên hệ"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Chức vụ</label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Nhập chức vụ"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Nhập email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Số điện thoại</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Địa chỉ</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
                className="w-full"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              to={`/sales/clients/${id}`}
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
