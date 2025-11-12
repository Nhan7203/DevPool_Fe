import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { 
  FileText, 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  CalendarDays, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { clientContractService, type ClientContract } from '../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';
import { projectService, type Project } from '../../../services/Project';
import { talentService, type Talent } from '../../../services/Talent';

// ===== PAGE =====
export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<ClientContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientCompany, setClientCompany] = useState<ClientCompany | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [talent, setTalent] = useState<Talent | null>(null);

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
      case 'pending':
      case 'draft':
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
          </div>
        </div>

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
                  label="Nhân viên" 
                  value={talent?.fullName || '—'}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Trạng thái" 
                  value={statusConfig.label}
                  icon={<CheckCircle className="w-4 h-4" />}
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
