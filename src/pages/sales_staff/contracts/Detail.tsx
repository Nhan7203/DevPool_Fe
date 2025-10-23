import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { 
  FileText, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  Briefcase, 
  CalendarDays, 
  DollarSign, 
  Users, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

// ===== TYPES =====
interface Contract {
  id: number | string;
  contractNumber: string;
  clientCompany: string;
  project: string;
  partner: string;
  totalClientRatePerMonth: number;
  totalDevRatePerMonth: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface ContractDetail {
  id: number;
  talent: string;
  applyId: number;
  allocatedClientRate: number;
  allocatedDevRate: number;
  notes: string;
}

// ===== PAGE =====
export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [details, setDetails] = useState<ContractDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      setContract({
        id: id ?? 0,
        contractNumber: 'CTR-2025-010',
        clientCompany: 'Công ty TNHH ABC',
        project: 'Website E-Commerce',
        partner: 'DevPool Co., Ltd.',
        totalClientRatePerMonth: 95_000_000,
        totalDevRatePerMonth: 80_000_000,
        status: 'Active',
        startDate: '2025-03-01',
        endDate: '2025-12-31',
      });

      setDetails([
        {
          id: 1,
          talent: 'Nguyễn Văn A',
          applyId: 21,
          allocatedClientRate: 50_000_000,
          allocatedDevRate: 40_000_000,
          notes: 'Full-time Senior Dev',
        },
        {
          id: 2,
          talent: 'Trần Thị B',
          applyId: 22,
          allocatedClientRate: 45_000_000,
          allocatedDevRate: 40_000_000,
          notes: 'Part-time QA',
        },
      ]);

      setLoading(false);
    };

    fetchContract();
  }, [id]);

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

  if (!contract) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy hợp đồng</p>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {contract.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="group flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Chỉnh sửa
              </button>
              <button className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </button>
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
                  value={contract.clientCompany}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Dự án" 
                  value={contract.project}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Đối tác" 
                  value={contract.partner}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Trạng thái" 
                  value={contract.status}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày bắt đầu" 
                  value={contract.startDate}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày kết thúc" 
                  value={contract.endDate}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin tài chính</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem 
                  label="Tổng giá trị khách hàng (VNĐ/tháng)" 
                  value={contract.totalClientRatePerMonth.toLocaleString('vi-VN')}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Tổng giá trị trả Dev (VNĐ/tháng)" 
                  value={contract.totalDevRatePerMonth.toLocaleString('vi-VN')}
                  icon={<DollarSign className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Personnel Details */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Users className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Danh sách nhân sự trong hợp đồng</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                    <tr>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tên nhân sự</th>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Apply ID</th>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rate khách hàng</th>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rate Dev</th>
                      <th className="py-4 px-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {details.map((d, i) => (
                      <tr 
                        key={d.id} 
                        className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                      >
                        <td className="py-4 px-4 text-sm font-medium text-neutral-900">{i + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <span className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                              {d.talent}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700 font-mono bg-neutral-100 px-2 py-1 rounded">{d.applyId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700 font-medium">{d.allocatedClientRate.toLocaleString('vi-VN')}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700 font-medium">{d.allocatedDevRate.toLocaleString('vi-VN')}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700">{d.notes}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
