import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { 
  FileText, 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  CalendarDays, 
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  Edit,
  Trash2,
  Send,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { clientContractService, type ClientContract } from '../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';
import { projectService, type Project } from '../../../services/Project';
import { talentService, type Talent } from '../../../services/Talent';
import { notificationService, NotificationPriority, NotificationType } from '../../../services/Notification';
import { userService } from '../../../services/User';
import { decodeJWT } from '../../../services/Auth';
import { useAuth } from '../../../contexts/AuthContext';

// ===== PAGE =====
export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState<ClientContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientCompany, setClientCompany] = useState<ClientCompany | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch contract detail
        const contractData = await clientContractService.getById(Number(id));
        setContract(contractData);
        // Fetch related data
        try {
          const [clientData, projectData, talentData] = await Promise.all([
            clientCompanyService.getById(contractData.clientCompanyId),
            projectService.getById(contractData.projectId),
            talentService.getById(contractData.talentId)
          ]);
          setClientCompany(clientData);
          setProject(projectData);
          setTalent(talentData);
        } catch (err) {
          console.error("⚠️ Lỗi tải thông tin liên quan:", err);
        }
      } catch (err: any) {
        console.error("❌ Lỗi tải chi tiết hợp đồng:", err);
        setError(err.message || "Không thể tải thông tin hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          label: 'Đang hoạt động',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-50'
        };
      case 'draft':
        return {
          label: 'Bản nháp',
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className="w-4 h-4" />,
          bgColor: 'bg-gray-50'
        };
      case 'pending':
        return {
          label: 'Chờ duyệt',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <ClockIcon className="w-4 h-4" />,
          bgColor: 'bg-yellow-50'
        };
      case 'expired':
        return {
          label: 'Đã hết hạn',
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-blue-50'
        };
      case 'terminated':
        return {
          label: 'Đã chấm dứt',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-red-50'
        };
      case 'rejected':
        return {
          label: 'Đã từ chối',
          color: 'bg-rose-100 text-rose-800',
          icon: <XCircle className="w-4 h-4" />,
          bgColor: 'bg-rose-50'
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-gray-50'
        };
    }
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

  if (error || !contract) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-500 text-lg font-medium">
              {error || "Không tìm thấy hợp đồng"}
            </p>
            <Link 
              to="/sales/contracts"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!id || !contract) return;
    const confirmDelete = window.confirm(`⚠️ Bạn có chắc muốn xóa hợp đồng "${contract.contractNumber}"?`);
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await clientContractService.delete(Number(id));
      alert('✅ Xóa hợp đồng thành công!');
      navigate('/sales/contracts');
    } catch (err: any) {
      console.error('❌ Lỗi xóa hợp đồng:', err);
      alert(err?.message || 'Không thể xóa hợp đồng. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!id || !contract) return;

    const confirmSend = window.confirm(
      `Bạn có chắc muốn gửi yêu cầu duyệt hợp đồng "${contract.contractNumber}"?\n\nHợp đồng sẽ chuyển sang trạng thái "Chờ duyệt" và Manager sẽ nhận được thông báo.`
    );
    if (!confirmSend) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const decoded = token ? decodeJWT(token) : null;
      const updatedBy = user?.name || decoded?.unique_name || decoded?.email || 'Sales Staff';

      const result = await clientContractService.changeStatus(Number(id), {
        newStatus: 'Pending',
        notes: `Gửi yêu cầu duyệt hợp đồng ${contract.contractNumber}`,
        updatedBy
      });

      const nextStatus = result.success && result.newStatus ? result.newStatus : 'Pending';
      setContract({ ...contract, status: nextStatus });
      setUpdateSuccess(true);
      setSuccessMessage('✅ Đã gửi yêu cầu duyệt thành công! Manager đã nhận được thông báo.');

      try {
        const managersResponse = await userService.getAll({
          role: 'Manager',
          excludeDeleted: true,
          pageNumber: 1,
          pageSize: 100
        });

        const managerIds =
          (managersResponse.items || [])
            .map((manager) => manager.id)
            .filter((managerId): managerId is string => Boolean(managerId));

        if (managerIds.length > 0) {
          await notificationService.create({
            title: 'Hợp đồng khách hàng chờ duyệt',
            message: `${updatedBy} vừa gửi yêu cầu duyệt hợp đồng khách hàng ${contract.contractNumber}.`,
            type: NotificationType.ContractPendingApproval,
            priority: NotificationPriority.Medium,
            userIds: managerIds,
            entityType: 'ClientContract',
            entityId: contract.id,
            actionUrl: `/manager/contracts/clients/${contract.id}`,
            metaData: {
              contractNumber: contract.contractNumber,
              status: 'Pending'
            }
          });
        }
      } catch (notifyError) {
        console.error('⚠️ Không thể gửi thông báo tới Manager:', notifyError);
      }

      setTimeout(() => {
        setUpdateSuccess(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Object.values(err.errors).flat().join(', ')
          : err?.message || err?.title || 'Không thể gửi yêu cầu duyệt';
      setUpdateError(message);
      console.error('❌ Lỗi gửi yêu cầu duyệt:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRestoreToDraft = async () => {
    if (!id || !contract || contract.status?.toLowerCase() !== 'rejected') return;

    const confirmRestore = window.confirm(
      `Bạn có chắc muốn chuyển hợp đồng "${contract.contractNumber}" về trạng thái Bản nháp?`
    );
    if (!confirmRestore) return;

    try {
      setIsRestoring(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const decoded = token ? decodeJWT(token) : null;
      const updatedBy = user?.name || decoded?.unique_name || decoded?.email || 'Sales Staff';

      const result = await clientContractService.changeStatus(Number(id), {
        newStatus: 'Draft',
        notes: `Khôi phục hợp đồng ${contract.contractNumber} về trạng thái nháp`,
        updatedBy
      });

      const nextStatus = result.success && result.newStatus ? result.newStatus : 'Draft';
      setContract({ ...contract, status: nextStatus });
      setUpdateSuccess(true);
      setSuccessMessage(null);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err?.errors != null
          ? Object.values(err.errors).flat().join(', ')
          : err?.message || err?.title || 'Không thể khôi phục hợp đồng về bản nháp';
      setUpdateError(message);
      console.error('❌ Lỗi khôi phục hợp đồng:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const statusConfig = getStatusConfig(contract.status);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/sales/contracts"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hợp đồng #{contract.contractNumber}
              </h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết của hợp đồng giữa DevPool và khách hàng
              </p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
            {contract.status?.toLowerCase() === 'draft' && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/sales/contracts/edit/${id}`)}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                >
                  <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            )}
            {contract.status?.toLowerCase() === 'rejected' && (
              <button
                onClick={handleRestoreToDraft}
                disabled={isRestoring}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {isRestoring ? 'Đang khôi phục...' : 'Chuyển về Bản nháp'}
              </button>
            )}
          </div>
        </div>

        {updateSuccess && successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {updateError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{updateError}</p>
          </div>
        )}

        {contract.status?.toLowerCase() === 'draft' && (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Send className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Gửi yêu cầu duyệt</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-neutral-600">
                Gửi hợp đồng này đến Manager để được phê duyệt. Sau khi gửi, hợp đồng sẽ chuyển sang trạng thái "Chờ duyệt" và Manager sẽ nhận được thông báo.
              </p>
              <button
                onClick={handleSendForApproval}
                disabled={isUpdating}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {isUpdating ? 'Đang gửi...' : 'Gửi yêu cầu duyệt'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Contract Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin hợp đồng</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem 
                  label="Công ty khách hàng" 
                  value={clientCompany?.name || '—'}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Dự án" 
                  value={project?.name || '—'}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Nhân sự" 
                  value={talent?.fullName || '—'}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày bắt đầu" 
                  value={new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày kết thúc" 
                  value={contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                {contract.contractFileUrl && (
                  <InfoItem 
                    label="File hợp đồng" 
                    value={
                      <a 
                        href={contract.contractFileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        Xem file
                      </a>
                    }
                    icon={<FileText className="w-4 h-4" />}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
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
