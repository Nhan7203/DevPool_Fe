import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Building2, 
  Briefcase,
  Filter, 
  Search, 
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { clientContractService, type ClientContract } from '../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';
import { projectService, type Project } from '../../../services/Project';
import { talentService, type Talent } from '../../../services/Talent';

export default function ListClientContracts() {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ClientContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statsPageSize = 4;
  const [statsStartIndex, setStatsStartIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
    
  // Store client company, project, and talent data for display
  const [clientsMap, setClientsMap] = useState<Map<number, ClientCompany>>(new Map());
  const [projectsMap, setProjectsMap] = useState<Map<number, Project>>(new Map());
  const [talentsMap, setTalentsMap] = useState<Map<number, Talent>>(new Map());
  
  // Filter states
  const [filterClientId, setFilterClientId] = useState<number | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null);
  const [clientSearch, setClientSearch] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  // Get arrays for filtering
  const clients = Array.from(clientsMap.values());
  const projects = Array.from(projectsMap.values());
  
  const filteredClients = clients.filter(c =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );
  
  // Filter projects by selected client if client filter is active
  const projectsByClient = filterClientId !== null
    ? projects.filter(p => p.clientCompanyId === filterClientId)
    : projects;
  
  const filteredProjects = projectsByClient.filter(p =>
    !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Stats data
  const normalizeStatus = (status?: string | null) => (status ?? '').toLowerCase();

  const matchesStatus = (
    statusValue: string | null | undefined,
    target: string
  ) => {
    const normalized = normalizeStatus(statusValue);
    if (target === 'expired') {
      return normalized === 'expired';
    }
    if (target === 'terminated') {
      return normalized === 'terminated';
    }
    if (target === 'pending') {
      return normalized === 'pending';
    }
    if (target === 'rejected') {
      return normalized === 'rejected';
    }
    return normalized === target;
  };

  const countStatus = (...statuses: string[]) =>
    contracts.filter((c) =>
      statuses.some((status) => matchesStatus(c.status, status))
    ).length;

  const stats = [
    {
      title: 'Tổng Hợp Đồng',
      value: contracts.length.toString(),
      color: 'blue',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Đang hoạt động',
      value: countStatus('active').toString(),
      color: 'green',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Chờ duyệt',
      value: countStatus('pending').toString(),
      color: 'orange',
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: 'Bản nháp',
      value: countStatus('draft').toString(),
      color: 'gray',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Đã hết hạn',
      value: countStatus('expired').toString(),
      color: 'blue',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: 'Đã chấm dứt',
      value: countStatus('terminated').toString(),
      color: 'red',
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      title: 'Đã từ chối',
      value: countStatus('rejected').toString(),
      color: 'rose',
      icon: <AlertCircle className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch contracts, client companies, projects, and talents in parallel
        const [contractsData, clientsData, projectsData, talentsData] = await Promise.all([
          clientContractService.getAll({ excludeDeleted: true }),
          clientCompanyService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true }),
          talentService.getAll({ excludeDeleted: true })
        ]);

        // Sort by ID descending (ID lớn hơn = mới hơn) hoặc startDate nếu có
        const sortedContracts = [...contractsData].sort((a, b) => {
          // Ưu tiên sort theo ID (mới nhất lên đầu)
          if (b.id !== a.id) {
            return b.id - a.id;
          }
          // Nếu ID bằng nhau, sort theo startDate
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        });

        setContracts(sortedContracts);
        setFilteredContracts(sortedContracts);

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

        const talentsMapData = new Map<number, Talent>();
        talentsData.forEach((t: Talent) => {
          talentsMapData.set(t.id, t);
        });
        setTalentsMap(talentsMapData);
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
        const talentName = talentsMap.get(c.talentId)?.fullName?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return contractNumber.includes(searchLower) ||
               projectName.includes(searchLower) ||
               clientName.includes(searchLower) ||
               talentName.includes(searchLower);
      });
    }
    if (filterStatus) {
      const normalizedFilter = filterStatus.toLowerCase();
      filtered = filtered.filter(c => matchesStatus(c.status, normalizedFilter));
    }
    if (filterClientId !== null) {
      filtered = filtered.filter(c => c.clientCompanyId === filterClientId);
    }
    if (filterProjectId !== null) {
      filtered = filtered.filter(c => c.projectId === filterProjectId);
    }
    
    // Sort lại để đảm bảo hợp đồng mới nhất lên đầu (theo ID hoặc startDate)
    filtered.sort((a, b) => {
      // Ưu tiên sort theo ID (mới nhất lên đầu)
      if (b.id !== a.id) {
        return b.id - a.id;
      }
      // Nếu ID bằng nhau, sort theo startDate
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA; // Mới nhất lên đầu
    });
    
    setFilteredContracts(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterClientId, filterProjectId, contracts, clientsMap, projectsMap, talentsMap]);
  
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);
  const startItem = filteredContracts.length > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, filteredContracts.length);

  const statsSlice = stats.slice(statsStartIndex, Math.min(statsStartIndex + statsPageSize, stats.length));
  const canShowStatsNav = stats.length > statsPageSize;
  const canGoPrevStats = statsStartIndex > 0;
  const canGoNextStats = statsStartIndex + statsPageSize < stats.length;

  const handlePrevStats = () => {
    setStatsStartIndex(prev => Math.max(0, prev - statsPageSize));
  };

  const handleNextStats = () => {
    setStatsStartIndex(prev => Math.min(stats.length - statsPageSize, prev + statsPageSize));
  };

  useEffect(() => {
    const maxIndex = Math.max(0, stats.length - statsPageSize);
    setStatsStartIndex(prev => Math.min(prev, maxIndex));
  }, [stats.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsClientDropdownOpen(false);
        setIsProjectDropdownOpen(false);
      }
    };

    if (isClientDropdownOpen || isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isClientDropdownOpen, isProjectDropdownOpen]);

  const getClientName = (clientCompanyId: number) => {
    return clientsMap.get(clientCompanyId)?.name || '—';
  };

  const getProjectName = (projectId: number) => {
    return projectsMap.get(projectId)?.name || '—';
  };

  const getTalentName = (talentId: number) => {
    return talentsMap.get(talentId)?.fullName || '—';
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
        case 'rejected':
            return 'bg-rose-100 text-rose-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

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
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status || '—';
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-x-hidden">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-4 sm:p-8 overflow-x-hidden max-w-full">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Hợp đồng</h1>
              <p className="text-neutral-600 mt-1">Quản lý và theo dõi các hợp đồng với khách hàng</p>
            </div>
            <Link to="/sales/contracts/create" className="flex-shrink-0">
              <button className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 w-full sm:w-auto">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="whitespace-nowrap">Tạo hợp đồng mới</span>
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 animate-fade-in">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsSlice.map((stat, index) => (
                  <div key={`${stat.title}-${statsStartIndex + index}`} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${
                        stat.color === 'blue'
                          ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                          : stat.color === 'green'
                            ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200'
                            : stat.color === 'purple'
                              ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200'
                              : stat.color === 'rose'
                                ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-200'
                                : stat.color === 'gray'
                                  ? 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                                  : stat.color === 'red'
                                    ? 'bg-red-100 text-red-600 group-hover:bg-red-200'
                                    : 'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                      } transition-all duration-300`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canShowStatsNav && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevStats}
                    disabled={!canGoPrevStats}
                    className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border transition-all duration-300 ${
                      canGoPrevStats
                        ? 'h-9 w-9 bg-white/90 backdrop-blur border-neutral-200 text-neutral-600 shadow-soft hover:text-primary-600 hover:border-primary-300'
                        : 'h-9 w-9 bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed'
                    }`}
                    aria-label="Xem thống kê phía trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStats}
                    disabled={!canGoNextStats}
                    className={`hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border transition-all duration-300 ${
                      canGoNextStats
                        ? 'h-9 w-9 bg-white/90 backdrop-blur border-neutral-200 text-neutral-600 shadow-soft hover:text-primary-600 hover:border-primary-300'
                        : 'h-9 w-9 bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed'
                    }`}
                    aria-label="Xem thống kê tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {canShowStatsNav && (
              <div className="mt-3 flex justify-end text-xs text-neutral-500 lg:hidden">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStats}
                    disabled={!canGoPrevStats}
                    className={`rounded-full border px-3 py-1 transition-all duration-300 ${
                      canGoPrevStats
                        ? 'bg-white border-neutral-200 text-neutral-600 hover:text-primary-600 hover:border-primary-300'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed'
                    }`}
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStats}
                    disabled={!canGoNextStats}
                    className={`rounded-full border px-3 py-1 transition-all duration-300 ${
                      canGoNextStats
                        ? 'bg-white border-neutral-200 text-neutral-600 hover:text-primary-600 hover:border-primary-300'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed'
                    }`}
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in relative z-30">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 w-full sm:min-w-0 sm:max-w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số hợp đồng, khách hàng, nhân sự, dự án..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Filter by Status */}
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="expired">Đã hết hạn</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="draft">Bản nháp</option>
                      <option value="terminated">Đã chấm dứt</option>
                      <option value="rejected">Đã từ chối</option>
                    </select>
                  </div>
                  
                  {/* Filter by Client */}
                  <div className="relative dropdown-container">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Khách hàng</label>
                    <button
                      type="button"
                      onClick={() => setIsClientDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-neutral-200 rounded-lg bg-white text-left focus:border-primary-500 focus:ring-primary-500 text-sm"
                    >
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span>
                          {filterClientId !== null
                            ? clients.find(c => c.id === filterClientId)?.name || "Chọn khách hàng"
                            : "Tất cả khách hàng"}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                    </button>
                    {isClientDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        <div className="p-3 border-b border-neutral-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <input
                              type="text"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              placeholder="Tìm khách hàng..."
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterClientId(null);
                              setClientSearch("");
                              setIsClientDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${
                              filterClientId === null
                                ? "bg-primary-50 text-primary-700"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            Tất cả khách hàng
                          </button>
                          {filteredClients.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy khách hàng phù hợp</p>
                          ) : (
                            filteredClients.map(c => (
                              <button
                                type="button"
                                key={c.id}
                                onClick={() => {
                                  setFilterClientId(c.id);
                                  setClientSearch("");
                                  setIsClientDropdownOpen(false);
                                  // Reset project filter if current project doesn't belong to selected client
                                  if (filterProjectId !== null) {
                                    const selectedProject = projects.find(p => p.id === filterProjectId);
                                    if (!selectedProject || selectedProject.clientCompanyId !== c.id) {
                                      setFilterProjectId(null);
                                    }
                                  }
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                  filterClientId === c.id
                                    ? "bg-primary-50 text-primary-700"
                                    : "hover:bg-neutral-50 text-neutral-700"
                                }`}
                              >
                                {c.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Filter by Project */}
                  <div className="relative dropdown-container">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Dự án</label>
                    <button
                      type="button"
                      onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-neutral-200 rounded-lg bg-white text-left focus:border-primary-500 focus:ring-primary-500 text-sm"
                    >
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Briefcase className="w-4 h-4 text-neutral-400" />
                        <span>
                          {filterProjectId !== null
                            ? projects.find(p => p.id === filterProjectId)?.name || "Chọn dự án"
                            : "Tất cả dự án"}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                    </button>
                    {isProjectDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        <div className="p-3 border-b border-neutral-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <input
                              type="text"
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              placeholder="Tìm dự án..."
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterProjectId(null);
                              setProjectSearch("");
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${
                              filterProjectId === null
                                ? "bg-primary-50 text-primary-700"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            Tất cả dự án
                          </button>
                          {filteredProjects.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy dự án phù hợp</p>
                          ) : (
                            filteredProjects.map(p => (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => {
                                  setFilterProjectId(p.id);
                                  setProjectSearch("");
                                  setIsProjectDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm ${
                                  filterProjectId === p.id
                                    ? "bg-primary-50 text-primary-700"
                                    : "hover:bg-neutral-50 text-neutral-700"
                                }`}
                              >
                                {p.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Reset Button */}
                  <button 
                    onClick={() => { 
                      setFilterStatus(''); 
                      setSearchTerm('');
                      setFilterClientId(null);
                      setFilterProjectId(null);
                      setClientSearch('');
                      setProjectSearch('');
                    }}
                    className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform self-end"
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
              <p className="text-neutral-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc tạo hợp đồng mới</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
            <div className="p-6 border-b border-neutral-200 sticky top-16 bg-white z-20 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Danh sách hợp đồng</h2>
                <div className="flex items-center gap-4">
                  {filteredContracts.length > 0 ? (
                    <>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                          currentPage === 1
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <span className="text-sm text-neutral-600">
                        {startItem}-{endItem} trong số {filteredContracts.length}
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                          currentPage === totalPages
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-600">Tổng: 0 hợp đồng</span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full">
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-neutral-50 to-primary-50 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Mã hợp đồng</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden md:table-cell">Khách hàng</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden lg:table-cell">Nhân sự</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden lg:table-cell">Dự án</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden xl:table-cell">Thời hạn</th>
                    <th className="py-3 px-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-3 px-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedContracts.map((contract, index) => (
                    <tr key={contract.id} className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300">
                      <td className="py-3 px-3 text-sm font-medium text-neutral-900">{startIndex + index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300 truncate" title={contract.contractNumber}>
                            {contract.contractNumber}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700 truncate" title={getClientName(contract.clientCompanyId)}>
                            {getClientName(contract.clientCompanyId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700 truncate" title={getTalentName(contract.talentId)}>
                            {getTalentName(contract.talentId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Briefcase className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700 truncate" title={getProjectName(contract.projectId)}>
                            {getProjectName(contract.projectId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700 break-words">
                            {new Date(contract.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            {contract.endDate ? ` - ${new Date(contract.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {getStatusText(contract.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          to={`/sales/contracts/${contract.id}`}
                          className="group inline-flex items-center gap-1 px-2 py-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-xs font-medium hidden sm:inline">Xem</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
