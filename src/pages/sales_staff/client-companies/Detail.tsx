import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";

export default function ClientCompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const data = await clientCompanyService.getById(Number(id));
        setCompany(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết công ty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa công ty này?");
    if (!confirmDelete) return;

    try {
      await clientCompanyService.delete(Number(id));
      alert("✅ Xóa công ty thành công!");
      navigate("/sales/clients");
    } catch (err) {
      console.error("❌ Lỗi khi xóa công ty:", err);
      alert("Không thể xóa công ty!");
    }
  };

  const handleEdit = () => {
    navigate(`/sales/clients/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu công ty...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy công ty
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-neutral-600 mt-1">Chi tiết thông tin công ty khách hàng.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              className="px-6 py-2.5 rounded-xl font-medium bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            >
              Sửa
            </Button>
            <Button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Xóa
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">Thông tin công ty</h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Tên công ty" value={company.name} />
            <InfoItem label="Mã số thuế" value={company.taxCode ?? "—"} />
            <InfoItem label="Người liên hệ" value={company.contactPerson} />
            <InfoItem label="Chức vụ" value={company.position ?? "—"} />
            <InfoItem label="Email" value={company.email} />
            <InfoItem label="Số điện thoại" value={company.phone ?? "—"} />
            <InfoItem label="Địa chỉ" value={company.address ?? "—"} />
            <InfoItem label="Ngày tạo" value={new Date(company.createdAt).toLocaleDateString()} />
            <InfoItem label="Cập nhật lần cuối" value={company.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : "—"} />
            <InfoItem label="Đã xóa" value={company.isDeleted ? "Có" : "Không"} />
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/sales/clients"
            className="text-primary-600 hover:underline text-sm"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
