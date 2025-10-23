import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type Project } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";
import { 
  Briefcase, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  CalendarDays, 
  Building2, 
  Globe2, 
  Factory, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

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
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy dự án</p>
            <Link 
              to="/sales/projects"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/sales/projects"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết dự án khách hàng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {statusLabels[project.status] || "Đang hoạt động"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="group flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Project Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin dự án</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem 
                  label="Tên dự án" 
                  value={project.name}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Mô tả" 
                  value={project.description || "Không có mô tả"}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày bắt đầu" 
                  value={project.startDate}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày kết thúc" 
                  value={project.endDate || "Chưa xác định"}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Client & Market Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin khách hàng & thị trường</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem 
                  label="Công ty khách hàng" 
                  value={company?.name || "—"}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Thị trường" 
                  value={market?.name || "—"}
                  icon={<Globe2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngành" 
                  value={industry?.name || "—"}
                  icon={<Factory className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Trạng thái" 
                  value={statusLabels[project.status] || "—"}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className="text-neutral-400 group-hover:text-primary-600 transition-colors duration-300">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
          {label}
        </p>
      </div>
      <p className="text-gray-900 font-semibold text-lg group-hover:text-primary-700 transition-colors duration-300">
        {value}
      </p>
    </div>
  );
}
