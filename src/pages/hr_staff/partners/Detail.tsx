import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { partnerService, type PartnerDetailedModel, type PartnerTalentModel } from "../../../services/Partner";
import { talentService, type Talent } from "../../../services/Talent";
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
  FileCheck,
  Users,
  Calendar,
  DollarSign,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "../../../router/routes";

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerDetailedModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [talentDetails, setTalentDetails] = useState<Record<number, Talent>>({});
  
  // Pagination states
  const [pageContracts, setPageContracts] = useState(1);
  const [pageTalents, setPageTalents] = useState(1);
  const itemsPerPageContracts = 3;
  const itemsPerPageTalents = 2;

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await partnerService.getDetailedById(Number(id));
        // Handle response structure: { success: true, data: {...} } or direct data
        const partnerData = response?.data || response;
        if (partnerData) {
          setPartner(partnerData);
          
          // Fetch talent details for each talent
          if (partnerData.talents && partnerData.talents.length > 0) {
            const talentPromises = partnerData.talents.map(async (talent: PartnerTalentModel) => {
              try {
                const talentData = await talentService.getById(talent.talentId);
                return { talentId: talent.talentId, data: talentData };
              } catch (err) {
                console.error(`❌ Lỗi khi tải thông tin talent ${talent.talentId}:`, err);
                return null;
              }
            });
            
            const talentResults = await Promise.all(talentPromises);
            const talentMap: Record<number, Talent> = {};
            talentResults.forEach((result) => {
              if (result) {
                talentMap[result.talentId] = result.data;
              }
            });
            setTalentDetails(talentMap);
          }
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

  // Helper functions để chuyển đổi trạng thái hợp đồng sang tiếng Việt
  const normalizeStatus = (status?: string | null) => (status ?? '').toLowerCase();

  const getStatusText = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'active':
        return 'Đang hiệu lực';
      case 'pending':
        return 'Chờ duyệt';
      case 'draft':
        return 'Bản nháp';
      case 'expired':
        return 'Đã hết hạn';
      case 'terminated':
        return 'Đã chấm dứt';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

                {partner.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-600 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghi chú
                    </label>
                    <p className="text-lg text-gray-900">{partner.notes}</p>
                  </div>
                )}

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
                  <p className="text-lg text-gray-900">{partner.phoneNumber || '—'}</p>
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

          {/* Hợp đồng */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Hợp đồng {partner.contracts && partner.contracts.length > 0 ? `(${partner.contracts.length})` : ''}
                  </h2>
                </div>
                {partner.contracts && partner.contracts.length > 0 && partner.contracts.some(c => c.contractFileUrl) && (
                  <a
                    href={partner.contracts.find(c => c.contractFileUrl)?.contractFileUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>Xem file hợp đồng</span>
                  </a>
                )}
              </div>
            </div>
            <div className="p-6">
              {partner.contracts && partner.contracts.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {(() => {
                      const startIndex = (pageContracts - 1) * itemsPerPageContracts;
                      const endIndex = startIndex + itemsPerPageContracts;
                      const paginatedContracts = partner.contracts.slice(startIndex, endIndex);
                      
                      return paginatedContracts.map((contract) => (
                        <div key={contract.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral-600">Mã hợp đồng</p>
                              <p className="text-base font-semibold text-gray-900">{contract.contractNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-600">Trạng thái</p>
                              <span className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-600">Mức giá</p>
                              <p className="text-base font-semibold text-gray-900">
                                {contract.devRate ? `${contract.devRate.toLocaleString('vi-VN')} ${contract.rateType}` : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-600">Thời gian</p>
                              <p className="text-base font-semibold text-gray-900">
                                {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Đang hoạt động'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  <SectionPagination
                    currentPage={pageContracts}
                    totalItems={partner.contracts.length}
                    itemsPerPage={itemsPerPageContracts}
                    onPageChange={setPageContracts}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-lg font-medium">Không có hợp đồng</p>
                </div>
              )}
            </div>
          </div>

          {/* Nhân sự */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Nhân sự {partner.talents && partner.talents.length > 0 ? `(${partner.talents.length})` : ''}
                </h2>
              </div>
            </div>
            <div className="p-6">
              {partner.talents && partner.talents.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {(() => {
                      const startIndex = (pageTalents - 1) * itemsPerPageTalents;
                      const endIndex = startIndex + itemsPerPageTalents;
                      const paginatedTalents = partner.talents.slice(startIndex, endIndex);
                      
                      return paginatedTalents.map((talent) => {
                        const talentInfo = talentDetails[talent.talentId];
                        return (
                          <div key={talent.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Họ và tên
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-base font-semibold text-gray-900">
                                    {talentInfo?.fullName || `Talent #${talent.talentId}`}
                                  </p>
                                  {talentInfo && (
                                    <Link
                                      to={`/hr/developers/${talent.talentId}`}
                                      className="text-primary-600 hover:text-primary-800 transition-colors"
                                      title="Xem chi tiết"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {talentInfo?.email || '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Số điện thoại
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {talentInfo?.phone || '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Trạng thái hợp đồng
                                </p>
                                {talent.status ? (
                                  <span className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(talent.status)}`}>
                                    {getStatusText(talent.status)}
                                  </span>
                                ) : (
                                  <p className="text-base font-semibold text-gray-900">—</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Ngày bắt đầu
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {new Date(talent.startDate).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Ngày kết thúc
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {talent.endDate ? new Date(talent.endDate).toLocaleDateString('vi-VN') : 'Đang hoạt động'}
                                </p>
                              </div>
                              {talent.notes && (
                                <div className="md:col-span-2">
                                  <p className="text-sm text-neutral-600">Ghi chú</p>
                                  <p className="text-base text-gray-900">{talent.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <SectionPagination
                    currentPage={pageTalents}
                    totalItems={partner.talents.length}
                    itemsPerPage={itemsPerPageTalents}
                    onPageChange={setPageTalents}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-lg font-medium">Không có nhân sự</p>
                </div>
              )}
            </div>
          </div>

          {/* Kỳ thanh toán */}
          {partner.paymentPeriods && partner.paymentPeriods.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Kỳ thanh toán ({partner.paymentPeriods.length})</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partner.paymentPeriods.map((period) => (
                    <div key={period.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <p className="text-base font-semibold text-gray-900">
                          {period.periodMonth}/{period.periodYear}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600">Trạng thái</p>
                      <p className="text-base font-semibold text-gray-900">{period.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component phân trang
function SectionPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const startItem = totalItems > 0 ? startIndex + 1 : 0;
  const endItem = endIndex;

  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
      <p className="text-sm text-neutral-600">
        {startItem}-{endItem} của {totalItems} mục
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-primary-600"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-primary-600"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
