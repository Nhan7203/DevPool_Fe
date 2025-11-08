import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Building2, 
  Briefcase, 
  Link2, 
  Filter, 
  Search, 
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { clientContractService, type ClientContract } from '../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';
import { projectService, type Project } from '../../../services/Project';

export default function ListClientContracts() {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ClientContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    
  // Store client company and project data for display
  const [clientsMap, setClientsMap] = useState<Map<number, ClientCompany>>(new Map());
  const [projectsMap, setProjectsMap] = useState<Map<number, Project>>(new Map());

  // Stats data
  const stats = [
    {
      title: 'Tổng Hợp Đồng',
      value: contracts.length.toString(),
      color: 'blue',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Đang Hoạt Động',
      value: contracts.filter(c => c.status?.toLowerCase() === 'active').length.toString(),
      color: 'green',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Đã Hoàn Thành',
      value: contracts.filter(c => c.status?.toLowerCase() === 'completed').length.toString(),
      color: 'purple',
      icon: <Building2 className="w-6 h-6" />
    },
    {
      title: 'Chờ Duyệt',
      value: contracts.filter(c => c.status?.toLowerCase() === 'pending' || c.status?.toLowerCase() === 'draft').length.toString(),
      color: 'orange',
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch contracts, client companies, and projects in parallel
        const [contractsData, clientsData, projectsData] = await Promise.all([
          clientContractService.getAll({ excludeDeleted: true }),
          clientCompanyService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true })
        ]);

        setContracts(contractsData);
        setFilteredContracts(contractsData);

        // Create maps for quick lookup
        const clientsMapData = new Map<number, ClientCompany>();
        clientsData.forEach((c: ClientCompany) => {
          clientsMapData.set(c.id, c);
        });
        setClientsMap(clientsMapData);

        const projectsMapData = new Map<number, Project>();
        projectsData.forEach((p: Project) => {
          projectsMapData.set(p.id, p);
        });
        setProjectsMap(projectsMapData);
      } catch (err: any) {
        console.error("❌ Lỗi tải danh sách hợp đồng:", err);
        setError(err.message || "Không thể tải danh sách hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...contracts];
    if (searchTerm) {
      filtered = filtered.filter(c => {
        const contractNumber = c.contractNumber?.toLowerCase() || '';
        const projectName = projectsMap.get(c.projectId)?.name?.toLowerCase() || '';
        const clientName = clientsMap.get(c.clientCompanyId)?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return contractNumber.includes(searchLower) ||
               projectName.includes(searchLower) ||
               clientName.includes(searchLower);
      });
    }
    if (filterStatus) {
      filtered = filtered.filter(c => c.status.toLowerCase() === filterStatus.toLowerCase());
    }
    setFilteredContracts(filtered);
  }, [searchTerm, filterStatus, contracts, clientsMap, projectsMap]);
  

  const getClientName = (clientCompanyId: number) => {
    return clientsMap.get(clientCompanyId)?.name || '—';
  };

  const getProjectName = (projectId: number) => {
    return projectsMap.get(projectId)?.name || '—';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'terminated':
        return 'bg-red-100 text-red-700';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hợp đồng</h1>
              <p className="text-neutral-600 mt-1">Quản lý và theo dõi các hợp đồng với khách hàng</p>
            </div>
            <Link to="/sales/contracts/upload">
              <button className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 py-3 shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Upload hợp đồng mới
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                      stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                        stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                          'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                    } transition-all duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số hợp đồng, dự án..."
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-neutral-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 bg-white"
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">{showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="draft">Nháp</option>
                      <option value="terminated">Đã chấm dứt</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => { setFilterStatus(''); setSearchTerm(''); }}
                    className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform"
                  >
                    <span className="font-medium">Đặt lại</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải hợp đồng...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-500 text-lg font-medium mb-2">Lỗi tải dữ liệu</p>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-lg font-medium">Không có hợp đồng nào</p>
              <p className="text-neutral-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc upload hợp đồng mới</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-neutral-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-300">{contract.contractNumber}</h3>
                        <p className="text-sm text-neutral-600">{getProjectName(contract.projectId)}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status || '—'}
                    </span>
                  </div>

                  <div className="space-y-3 text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm">{getProjectName(contract.projectId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm">{getClientName(contract.clientCompanyId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm">
                        {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                        {contract.endDate ? ` - ${new Date(contract.endDate).toLocaleDateString('vi-VN')}` : ''}
                      </span>
                    </div>
                    {contract.contractFileUrl && (
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-neutral-400" />
                        <a
                          href={contract.contractFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm transition-colors duration-300"
                        >
                          Xem file hợp đồng
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/sales/contracts/${contract.id}`}
                      className="group flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors duration-300"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm font-medium">Xem chi tiết</span>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
