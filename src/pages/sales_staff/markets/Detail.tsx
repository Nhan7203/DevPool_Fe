import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { marketService, type Market } from "../../../services/Market";
import { Button } from "../../../components/ui/button";

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const data = await marketService.getById(Number(id));
        setMarket(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết thị trường:", err);
        setMarket(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa thị trường này?");
    if (!confirmDelete) return;

    try {
      await marketService.delete(Number(id));
      alert("✅ Xóa thị trường thành công!");
      navigate("/sales/markets");
    } catch (err) {
      console.error("❌ Lỗi khi xóa thị trường:", err);
      alert("Không thể xóa thị trường!");
    }
  };

  const handleEdit = () => {
    navigate(`/sales/markets/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu thị trường...
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy thị trường
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{market.name}</h1>
            <p className="text-neutral-600 mt-1">Chi tiết thông tin thị trường</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleEdit} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium">
              Sửa
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium">
              Xóa
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <InfoItem label="Tên thị trường" value={market.name} />
          <InfoItem label="Mã thị trường" value={market.code} />
          <InfoItem label="Mô tả" value={market.description || "—"} />
        </div>

        <div className="mt-8">
          <Link to="/sales/markets" className="text-primary-600 hover:underline text-sm">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
