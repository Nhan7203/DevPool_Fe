import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type Project } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Lấy dự án
        const proj = await projectService.getById(Number(id));
        setProject(proj);

        // Lấy công ty khách hàng
        const comp = await clientCompanyService.getById(proj.clientCompanyId);
        setCompany(comp);

        // Lấy Market
        const mk = await marketService.getById(proj.marketId);
        setMarket(mk);

        // Lấy Industry
        const ind = await industryService.getById(proj.industryId);
        setIndustry(ind);

      } catch (err) {
        console.error("❌ Lỗi tải chi tiết dự án:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa dự án này?");
    if (!confirmDelete) return;

    try {
      await projectService.delete(Number(id));
      alert("✅ Đã xóa dự án thành công!");
      navigate("/sales/projects");
    } catch (err) {
      console.error("❌ Lỗi khi xóa dự án:", err);
      alert("Không thể xóa dự án!");
    }
  };

  const handleEdit = () => {
    navigate(`/sales/projects/edit/${id}`);
  };

  const statusLabels: Record<string, string> = {
  Planned: "Đã lên kế hoạch",
  Ongoing: "Đang thực hiện",
  Completed: "Đã hoàn thành",
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu dự án...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy dự án
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-neutral-600 mt-1">Thông tin chi tiết dự án khách hàng.</p>
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

        {/* Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">Thông tin chung</h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Công ty khách hàng" value={company?.name || "—"} />
            <InfoItem label="Mô tả" value={project.description || "—"} />
            <InfoItem label="Thị trường" value={market?.name || "—"} />
            <InfoItem label="Ngành" value={industry?.name || "—"} />
            <InfoItem label="Ngày bắt đầu" value={project.startDate} />
            <InfoItem label="Ngày kết thúc" value={project.endDate || "—"} />
            <InfoItem label="Trạng thái" value={statusLabels[project.status] || "—"} />
          </div>
        </div>

        <div className="mt-8">
          <Link to="/sales/projects" className="text-primary-600 hover:underline text-sm">
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
