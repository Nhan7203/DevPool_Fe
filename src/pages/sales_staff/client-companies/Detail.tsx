import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Briefcase, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";

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
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu công ty...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy công ty</p>
            <Link 
              to="/sales/clients"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách
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
              to="/sales/clients"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết công ty khách hàng
              </p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 ${
                company.isDeleted ? "bg-red-50" : "bg-green-50"
              }`}>
                {company.isDeleted ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                <span className={`text-sm font-medium ${
                  company.isDeleted ? "text-red-800" : "text-green-800"
                }`}>
                  {company.isDeleted ? "Đã xóa" : "Đang hoạt động"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <StatCard
            title="Ngày tạo"
            value={new Date(company.createdAt).toLocaleDateString('vi-VN')}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
            change="Tài khoản mới"
          />
          <StatCard
            title="Cập nhật cuối"
            value={company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('vi-VN') : "Chưa có"}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            change="Hoạt động gần đây"
          />
          <StatCard
            title="Trạng thái"
            value={company.isDeleted ? "Đã xóa" : "Hoạt động"}
            icon={company.isDeleted ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            color={company.isDeleted ? "red" : "green"}
            change="Trạng thái hiện tại"
          />
          <StatCard
            title="Thông tin"
            value={`${company.taxCode ? 'Có MST' : 'Chưa có MST'}`}
            icon={<FileText className="w-6 h-6" />}
            color="purple"
            change="Mức độ hoàn thiện"
          />
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin công ty</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                label="Tên công ty" 
                value={company.name} 
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoItem 
                label="Mã số thuế" 
                value={company.taxCode ?? "—"} 
                icon={<Briefcase className="w-4 h-4" />}
              />
              <InfoItem 
                label="Người liên hệ" 
                value={company.contactPerson} 
                icon={<User className="w-4 h-4" />}
              />
              <InfoItem 
                label="Chức vụ" 
                value={company.position ?? "—"} 
                icon={<Briefcase className="w-4 h-4" />}
              />
              <InfoItem 
                label="Email" 
                value={company.email} 
                icon={<Mail className="w-4 h-4" />}
              />
              <InfoItem 
                label="Số điện thoại" 
                value={company.phone ?? "—"} 
                icon={<Phone className="w-4 h-4" />}
              />
              <InfoItem 
                label="Địa chỉ" 
                value={company.address ?? "—"} 
                icon={<MapPin className="w-4 h-4" />}
                className="col-span-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, change }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string; 
  change: string; 
}) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-primary-100 text-primary-600 group-hover:bg-primary-200';
      case 'green':
        return 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200';
      case 'purple':
        return 'bg-accent-100 text-accent-600 group-hover:bg-accent-200';
      case 'red':
        return 'bg-red-100 text-red-600 group-hover:bg-red-200';
      default:
        return 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${getColorClasses(color)} transition-all duration-300`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
        <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
        {change}
      </p>
    </div>
  );
}

function InfoItem({ label, value, icon, className }: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`group ${className || ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
        {value || "—"}
      </p>
    </div>
  );
}
