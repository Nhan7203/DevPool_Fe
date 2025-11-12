import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { partnerService, type Partner } from "../../../services/Partner";
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
  XCircle,
  FileText,
} from "lucide-react";
import { ROUTES } from "../../../router/routes";

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setLoading(true);
        const data = await partnerService.getAll();
        const foundPartner = data.find((p: Partner) => p.id === Number(id));
        if (foundPartner) {
          setPartner(foundPartner);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết đối tác:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !partner) return;
    const confirmDelete = window.confirm(`⚠️ Bạn có chắc muốn xóa đối tác ${partner.companyName}?`);
    if (!confirmDelete) return;

    try {
      await partnerService.deleteById(Number(id));
      alert("✅ Xóa đối tác thành công!");
      navigate(ROUTES.HR_STAFF.PARTNERS.LIST);
    } catch (err) {
      console.error("❌ Lỗi khi xóa đối tác:", err);
      alert("Không thể xóa đối tác!");
    }
  };

  const handleEdit = () => {
    navigate(`${ROUTES.HR_STAFF.PARTNERS.LIST}/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu đối tác...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy đối tác</p>
            <Link 
              to={ROUTES.HR_STAFF.PARTNERS.LIST}
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
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={ROUTES.HR_STAFF.PARTNERS.LIST}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đối tác</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết về đối tác trong hệ thống DevPool
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleEdit}
                className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={handleDelete}
                className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 animate-fade-in">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Tên công ty
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{partner.companyName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mã số thuế
                  </label>
                  <p className="text-lg text-gray-900">{partner.taxCode || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người liên hệ
                  </label>
                  <p className="text-lg text-gray-900">{partner.contactPerson || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg text-gray-900">{partner.email || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </label>
                  <p className="text-lg text-gray-900">{partner.phone || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </label>
                  <p className="text-lg text-gray-900">{partner.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

