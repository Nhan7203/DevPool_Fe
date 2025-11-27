import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type ProjectDetailedModel } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  UserCheck,
  Clock,
  Download,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Layers
} from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailedModel | null>(null);
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('info');
  
  // Job Requests search, filter, pagination
  const [jobRequestSearch, setJobRequestSearch] = useState("");
  const [jobRequestStatusFilter, setJobRequestStatusFilter] = useState<string>("");
  const [jobRequestPage, setJobRequestPage] = useState(1);
  const jobRequestPageSize = 5;
  
  // Contracts search, filter, pagination
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState<string>("");
  const [contractPage, setContractPage] = useState(1);
  const contractPageSize = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Lấy thông tin chi tiết dự án
        const detailedProject = await projectService.getDetailedById(Number(id));
        setProject(detailedProject);

        // Lấy thông tin công ty khách hàng nếu có
        if (detailedProject.clientCompanyId) {
          try {
            const comp = await clientCompanyService.getById(detailedProject.clientCompanyId);
        setCompany(comp);
          } catch (err) {
            console.error("❌ Lỗi tải thông tin công ty:", err);
          }
        }
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

  const formatViDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatViDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const statusLabels: Record<string, string> = {
  Planned: "Đã lên kế hoạch",
  Ongoing: "Đang thực hiện",
  Completed: "Đã hoàn thành",
};

  const jobRequestStatusLabels: Record<string, string> = {
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
    Closed: "Đã đóng",
  };

  const contractStatusLabels: Record<string, string> = {
    Draft: "Nháp",
    Pending: "Chờ duyệt",
    Active: "Đang hoạt động",
    Expired: "Hết hạn",
    Terminated: "Đã chấm dứt",
  };

  const staffAssignmentStatusLabels: Record<string, string> = {
    Active: "Đang hoạt động",
    Inactive: "Không hoạt động",
  };

  // Filter và paginate Job Requests
  const filteredJobRequests = (project?.jobRequests || []).filter((jr: any) => {
    const matchesSearch = !jobRequestSearch || 
      (jr.title?.toLowerCase().includes(jobRequestSearch.toLowerCase()) ||
       jr.jobPositionName?.toLowerCase().includes(jobRequestSearch.toLowerCase()));
    const matchesStatus = !jobRequestStatusFilter || jr.status === jobRequestStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedJobRequests = filteredJobRequests.slice(
    (jobRequestPage - 1) * jobRequestPageSize,
    jobRequestPage * jobRequestPageSize
  );
  const totalJobRequestPages = Math.ceil(filteredJobRequests.length / jobRequestPageSize);

  // Filter và paginate Contracts
  const filteredContracts = (project?.clientContracts || []).filter((contract: any) => {
    const matchesSearch = !contractSearch || 
      (contract.contractNumber?.toLowerCase().includes(contractSearch.toLowerCase()) ||
       contract.talentName?.toLowerCase().includes(contractSearch.toLowerCase()));
    const matchesStatus = !contractStatusFilter || contract.status === contractStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedContracts = filteredContracts.slice(
    (contractPage - 1) * contractPageSize,
    contractPage * contractPageSize
  );
  const totalContractPages = Math.ceil(filteredContracts.length / contractPageSize);

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
          <Breadcrumb
            items={[
              { label: "Dự án", to: "/sales/projects" },
              { label: project ? project.name : "Chi tiết dự án" }
            ]}
          />

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
                  {project.status ? statusLabels[project.status] || project.status : "Đang hoạt động"}
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

        {/* Content with Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          {/* Tab Headers */}
          <div className="border-b border-neutral-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'info'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Thông tin dự án
              </button>
              <button
                onClick={() => setActiveTab('job-requests')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'job-requests'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Yêu cầu tuyển dụng
                {project.jobRequests && project.jobRequests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.jobRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'contracts'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Hợp đồng khách hàng
                {project.clientContracts && project.clientContracts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.clientContracts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Nhân sự tham gia
                {project.staffAssignments && project.staffAssignments.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.staffAssignments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'timeline'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Dòng thời gian
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab: Thông tin dự án */}
            {activeTab === 'info' && (
              <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Tên dự án" 
                  value={project.name}
                  icon={<FileText className="w-4 h-4" />}
                />
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors duration-300" />
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                      Công ty khách hàng
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCompanyInfo(true)}
                    className="text-gray-900 font-semibold text-lg hover:text-primary-700 transition-colors duration-300 cursor-pointer text-left"
                  >
                    {project.clientCompanyName || company?.name || "—"}
                  </button>
                </div>
                <InfoItem 
                  label="Thị trường" 
                  value={project.marketName || "—"}
                  icon={<Globe2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngành nghề" 
                  value={
                    project.industryNames && project.industryNames.length > 0
                      ? project.industryNames.join(", ")
                      : "—"
                  }
                  icon={<Factory className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày bắt đầu" 
                  value={formatViDateTime(project.startDate)}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày kết thúc" 
                  value={project.endDate ? formatViDateTime(project.endDate) : "Chưa xác định"}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              </div>

              {/* Mô tả với nút xem/ẩn */}
              {project.description && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-3"
                  >
                    {showDescription ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ẩn mô tả
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Xem mô tả
                      </>
                    )}
                  </button>
                  {showDescription && (
                    <div className="prose max-w-none text-neutral-700 bg-neutral-50 rounded-xl p-4">
                      <div dangerouslySetInnerHTML={{ __html: project.description }} />
                    </div>
                  )}
                </div>
              )}
              </div>
            )}

            {/* Tab: Yêu cầu tuyển dụng */}
            {activeTab === 'job-requests' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách yêu cầu tuyển dụng</h3>
                  <span className="text-sm text-neutral-500">
                    ({filteredJobRequests.length} / {project.jobRequests?.length || 0} yêu cầu)
                  </span>
                </div>
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={jobRequestSearch}
                    onChange={(e) => {
                      setJobRequestSearch(e.target.value);
                      setJobRequestPage(1);
                    }}
                    placeholder="Tìm kiếm theo tiêu đề, vị trí..."
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                  {jobRequestSearch && (
                    <button
                      onClick={() => setJobRequestSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={jobRequestStatusFilter}
                    onChange={(e) => {
                      setJobRequestStatusFilter(e.target.value);
                      setJobRequestPage(1);
                    }}
                    className="pl-9 pr-8 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Approved">Đã duyệt</option>
                    <option value="Rejected">Từ chối</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </div>
              </div>

              {paginatedJobRequests.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tiêu đề</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Vị trí</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Số lượng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Quy trình</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngân sách</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedJobRequests.map((jr: any) => (
                          <tr
                            key={jr.id}
                            onClick={() => navigate(`/sales/job-requests/${jr.id}`)}
                            className="border-b border-neutral-100 hover:bg-primary-50 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{jr.title || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">{jr.jobPositionName || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">{jr.quantity || 0}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">{jr.applyProcessTemplateName || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {jr.budgetPerMonth ? `${jr.budgetPerMonth.toLocaleString('vi-VN')} VNĐ` : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                jr.status === "Approved" ? "bg-green-100 text-green-800" :
                                jr.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                jr.status === "Rejected" ? "bg-red-100 text-red-800" :
                                "bg-neutral-100 text-neutral-800"
                              }`}>
                                {jobRequestStatusLabels[jr.status] || jr.status || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {jr.createdAt ? formatViDate(jr.createdAt) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalJobRequestPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-neutral-600">
                        Trang {jobRequestPage} / {totalJobRequestPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setJobRequestPage(prev => Math.max(1, prev - 1))}
                          disabled={jobRequestPage === 1}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setJobRequestPage(prev => Math.min(totalJobRequestPages, prev + 1))}
                          disabled={jobRequestPage === totalJobRequestPages}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>{filteredJobRequests.length === 0 && (jobRequestSearch || jobRequestStatusFilter) ? "Không tìm thấy kết quả" : "Chưa có yêu cầu tuyển dụng nào"}</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Hợp đồng khách hàng */}
            {activeTab === 'contracts' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách hợp đồng khách hàng</h3>
                  <span className="text-sm text-neutral-500">
                    ({filteredContracts.length} / {project.clientContracts?.length || 0} hợp đồng)
                  </span>
                </div>
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={contractSearch}
                    onChange={(e) => {
                      setContractSearch(e.target.value);
                      setContractPage(1);
                    }}
                    placeholder="Tìm kiếm theo mã hợp đồng, ứng viên..."
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                  {contractSearch && (
                    <button
                      onClick={() => setContractSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={contractStatusFilter}
                    onChange={(e) => {
                      setContractStatusFilter(e.target.value);
                      setContractPage(1);
                    }}
                    className="pl-9 pr-8 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Draft">Nháp</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Active">Đang hoạt động</option>
                    <option value="Expired">Hết hạn</option>
                    <option value="Terminated">Đã chấm dứt</option>
                  </select>
                </div>
              </div>

              {paginatedContracts.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Mã hợp đồng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ứng viên</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Thời gian</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tệp</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Đơn ứng tuyển</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedContracts.map((contract: any) => (
                          <tr key={contract.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{contract.contractNumber || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">{contract.talentName || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {contract.startDate && contract.endDate 
                                ? `${formatViDate(contract.startDate)} - ${formatViDate(contract.endDate)}`
                                : contract.startDate 
                                  ? `Từ ${formatViDate(contract.startDate)}`
                                  : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                contract.status === "Active" ? "bg-green-100 text-green-800" :
                                contract.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                contract.status === "Expired" ? "bg-red-100 text-red-800" :
                                "bg-neutral-100 text-neutral-800"
                              }`}>
                                {contractStatusLabels[contract.status] || contract.status || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {contract.contractFileUrl ? (
                                <a
                                  href={contract.contractFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="text-sm">Tải xuống</span>
                                </a>
                              ) : (
                                <span className="text-sm text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {contract.talentApplicationId ? (
                                <Link
                                  to={`/sales/applications/${contract.talentApplicationId}`}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Xem chi tiết
                                </Link>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalContractPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-neutral-600">
                        Trang {contractPage} / {totalContractPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setContractPage(prev => Math.max(1, prev - 1))}
                          disabled={contractPage === 1}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setContractPage(prev => Math.min(totalContractPages, prev + 1))}
                          disabled={contractPage === totalContractPages}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>{filteredContracts.length === 0 && (contractSearch || contractStatusFilter) ? "Không tìm thấy kết quả" : "Chưa có hợp đồng nào"}</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Nhân sự tham gia */}
            {activeTab === 'staff' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách nhân sự tham gia</h3>
                  <span className="text-sm text-neutral-500">
                    ({project.staffAssignments?.length || 0} nhân sự)
                  </span>
                </div>
              {project.staffAssignments && project.staffAssignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Người dùng</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ứng viên</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Vai trò</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trách nhiệm</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày bắt đầu</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày kết thúc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.staffAssignments.map((assignment: any) => (
                        <tr key={assignment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{assignment.userName || "—"}</td>
                          <td className="py-3 px-4 text-sm text-neutral-700">{assignment.talentName || "—"}</td>
                          <td className="py-3 px-4 text-sm text-neutral-700">{assignment.role || "—"}</td>
                          <td className="py-3 px-4 text-sm text-neutral-700">{assignment.responsibility || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                              assignment.status === "Active" ? "bg-green-100 text-green-800" :
                              assignment.status === "Inactive" ? "bg-gray-100 text-gray-800" :
                              "bg-neutral-100 text-neutral-800"
                            }`}>
                              {staffAssignmentStatusLabels[assignment.status] || assignment.status || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-700">
                            {assignment.startDate ? formatViDate(assignment.startDate) : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-700">
                            {assignment.endDate ? formatViDate(assignment.endDate) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>Chưa có nhân sự nào được gán</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Dòng thời gian */}
            {activeTab === 'timeline' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dòng thời gian hoạt động</h3>
                <div className="space-y-4">
                  {/* Tạo dự án */}
                  <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-600">
                        {formatViDateTime(project.createdAt)} - Tạo dự án
                      </p>
                    </div>
                  </div>

                  {/* Cập nhật dự án */}
                  {project.updatedAt && project.updatedAt !== project.createdAt && (
                    <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">
                          {formatViDateTime(project.updatedAt)} - Cập nhật dự án
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Các hoạt động khác có thể thêm sau */}
                  {(!project.updatedAt || project.updatedAt === project.createdAt) && (
                    <div className="text-center py-4 text-neutral-400 text-sm">
                      Chưa có hoạt động nào khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Info Popover */}
      {showCompanyInfo && company && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCompanyInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Thông tin khách hàng
              </h3>
              <button
                onClick={() => setShowCompanyInfo(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Tên công ty</p>
                <p className="text-gray-900 font-semibold">{company.name}</p>
              </div>
              {company.contactPerson && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Người liên hệ</p>
                  <p className="text-gray-900">{company.contactPerson}</p>
                </div>
              )}
              {company.email && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Email</p>
                  <p className="text-gray-900">{company.email}</p>
                </div>
              )}
              {company.phone && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Điện thoại</p>
                  <p className="text-gray-900">{company.phone}</p>
                </div>
              )}
              {company.address && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Địa chỉ</p>
                  <p className="text-gray-900">{company.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
