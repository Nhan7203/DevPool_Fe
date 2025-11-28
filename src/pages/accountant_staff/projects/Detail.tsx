import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/accountant_staff/SidebarItems";
import { projectService, type ProjectDetailedModel } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectPeriodService, type ProjectPeriodModel, type ProjectPeriodCreateModel } from "../../../services/ProjectPeriod";
import { clientContractPaymentService, type ClientContractPaymentModel } from "../../../services/ClientContractPayment";
import { partnerContractPaymentService, type PartnerContractPaymentModel } from "../../../services/PartnerContractPayment";
import { talentAssignmentService, type TalentAssignmentModel } from "../../../services/TalentAssignment";
import { 
  Briefcase, 
  CalendarDays, 
  Building2, 
  CheckCircle,
  AlertCircle,
  FileCheck,
  Plus,
  X,
  Eye,
  Layers,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AccountantProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailedModel | null>(null);
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('contracts');
  
  // ProjectPeriod states
  const [projectPeriods, setProjectPeriods] = useState<ProjectPeriodModel[]>([]);
  const [filteredPeriods, setFilteredPeriods] = useState<ProjectPeriodModel[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false);
  const [creatingPeriod, setCreatingPeriod] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [previewPeriods, setPreviewPeriods] = useState<Array<{ month: number; year: number }>>([]);

  // Contract Payments states
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [clientContractPayments, setClientContractPayments] = useState<ClientContractPaymentModel[]>([]);
  const [partnerContractPayments, setPartnerContractPayments] = useState<PartnerContractPaymentModel[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [projectData, periodsData] = await Promise.all([
          projectService.getDetailedById(Number(id)),
          projectPeriodService.getAll({ projectId: Number(id), excludeDeleted: true }),
        ]);

        setProject(projectData);
        const sortedPeriods = [...periodsData].sort((a, b) => {
          if (a.periodYear !== b.periodYear) {
            return a.periodYear - b.periodYear; // Năm tăng dần
          }
          return a.periodMonth - b.periodMonth; // Tháng tăng dần
        });
        setProjectPeriods(sortedPeriods);
        setFilteredPeriods(sortedPeriods);

        // Tự động chọn chu kỳ mới nhất (cuối cùng) nếu có
        if (sortedPeriods.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(sortedPeriods[sortedPeriods.length - 1].id);
        }

        if (projectData.clientCompanyId) {
          try {
            const companyData = await clientCompanyService.getById(projectData.clientCompanyId);
            setCompany(companyData);
          } catch (err) {
            console.error("Lỗi tải thông tin công ty:", err);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu dự án:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedPeriodId) {
      fetchContractPayments(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  // Filter periods by year
  useEffect(() => {
    if (yearFilter === null) {
      setFilteredPeriods(projectPeriods);
    } else {
      setFilteredPeriods(projectPeriods.filter(p => p.periodYear === yearFilter));
    }
  }, [yearFilter, projectPeriods]);

  const fetchContractPayments = async (periodId: number) => {
    try {
      setLoadingPayments(true);
      const [clientPayments, partnerPayments] = await Promise.all([
        clientContractPaymentService.getAll({ projectPeriodId: periodId, excludeDeleted: true }),
        partnerContractPaymentService.getAll({ projectPeriodId: periodId, excludeDeleted: true }),
      ]);
      setClientContractPayments(clientPayments);
      setPartnerContractPayments(partnerPayments);
    } catch (err) {
      console.error("❌ Lỗi tải hợp đồng thanh toán:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Tính toán các tháng cần tạo dựa trên TalentAssignment Active
  const calculatePeriodsToCreate = async () => {
    if (!id) return [];

    try {
      // Lấy tất cả TalentAssignment có Status = "Active"
      const assignments = await talentAssignmentService.getAll({
        projectId: Number(id),
        status: "Active",
        excludeDeleted: true,
      });

      if (assignments.length === 0) {
        return [];
      }

      // Tập hợp các tháng cần tạo (dạng "YYYY-MM")
      const periodsSet = new Set<string>();

      assignments.forEach((assignment: TalentAssignmentModel) => {
        if (!assignment.startDate) return;

        const startDate = new Date(assignment.startDate);
        const endDate = assignment.endDate ? new Date(assignment.endDate) : new Date(); // Nếu không có endDate, dùng ngày hiện tại

        // Duyệt qua tất cả các tháng từ startDate đến endDate
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

        while (currentDate <= finalDate) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          periodsSet.add(`${year}-${month}`);
          
          // Chuyển sang tháng tiếp theo
          currentDate = new Date(year, month, 1);
        }
      });

      // Chuyển đổi Set thành mảng và sắp xếp
      const periods = Array.from(periodsSet)
        .map(key => {
          const [year, month] = key.split('-').map(Number);
          return { month, year };
        })
        .sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        });

      return periods;
    } catch (err) {
      console.error("❌ Lỗi tính toán chu kỳ:", err);
      return [];
    }
  };

  const handleCreatePeriod = async () => {
    if (!id) return;

    try {
      setCreatingPeriod(true);

      // Tính toán các chu kỳ cần tạo
      const periodsToCreate = await calculatePeriodsToCreate();

      if (periodsToCreate.length === 0) {
        alert("Không có TalentAssignment nào có Status = 'Active' để tạo chu kỳ thanh toán.");
        return;
      }

      // Lấy danh sách các chu kỳ đã tồn tại
      const existingPeriods = projectPeriods.map(p => `${p.periodYear}-${p.periodMonth}`);
      
      // Lọc ra các chu kỳ chưa tồn tại
      const newPeriods = periodsToCreate.filter(
        p => !existingPeriods.includes(`${p.year}-${p.month}`)
      );

      if (newPeriods.length === 0) {
        alert("Tất cả các chu kỳ cần thiết đã được tạo.");
        return;
      }

      // Tạo tất cả các chu kỳ mới
      const createdPeriods: ProjectPeriodModel[] = [];
      
      for (const period of newPeriods) {
        const startDate = new Date(period.year, period.month - 1, 1);
        const endDate = new Date(period.year, period.month, 0); // Ngày cuối cùng của tháng

        const payload: ProjectPeriodCreateModel = {
          projectId: Number(id),
          periodMonth: period.month,
          periodYear: period.year,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };

        try {
          const newPeriod = await projectPeriodService.create(payload);
          createdPeriods.push(newPeriod);
        } catch (err: any) {
          console.error(`❌ Lỗi tạo chu kỳ ${period.month}/${period.year}:`, err);
          // Tiếp tục tạo các chu kỳ khác
        }
      }

      if (createdPeriods.length === 0) {
        alert("Không thể tạo chu kỳ thanh toán. Vui lòng thử lại.");
        return;
      }

      // Cập nhật danh sách chu kỳ
      const updatedPeriods = [...projectPeriods, ...createdPeriods].sort((a, b) => {
        if (a.periodYear !== b.periodYear) {
          return a.periodYear - b.periodYear; // Năm tăng dần
        }
        return a.periodMonth - b.periodMonth; // Tháng tăng dần
      });
      setProjectPeriods(updatedPeriods);

      // Tự động chọn chu kỳ đầu tiên được tạo
      if (createdPeriods.length > 0) {
        setSelectedPeriodId(createdPeriods[0].id);
      }

      setShowCreatePeriodModal(false);
      setPreviewPeriods([]);

      alert(`Tạo thành công ${createdPeriods.length} chu kỳ thanh toán! Hệ thống đã tự động tạo các hợp đồng cho các TalentAssignment Active.`);
    } catch (err: any) {
      console.error("❌ Lỗi tạo chu kỳ thanh toán:", err);
      alert(err?.message || "Không thể tạo chu kỳ thanh toán");
    } finally {
      setCreatingPeriod(false);
    }
  };

  const handlePreviewPeriods = async () => {
    const periods = await calculatePeriodsToCreate();
    setPreviewPeriods(periods);
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

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statusLabels: Record<string, string> = {
    Planned: "Đã lên kế hoạch",
    Ongoing: "Đang thực hiện",
    Completed: "Đã hoàn thành",
  };

  const contractStatusLabels: Record<string, string> = {
    Draft: "Nháp",
    NeedMoreInformation: "Cần thêm thông tin",
    Submitted: "Đã gửi",
    Verified: "Đã xác minh",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
  };

  const paymentStatusLabels: Record<string, string> = {
    Pending: "Chờ thanh toán",
    Processing: "Đang xử lý",
    Invoiced: "Đã xuất hóa đơn",
    PartiallyPaid: "Đã thanh toán một phần",
    Paid: "Đã thanh toán",
  };

  const contractStatusColors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-800",
    NeedMoreInformation: "bg-yellow-100 text-yellow-800",
    Submitted: "bg-blue-100 text-blue-800",
    Verified: "bg-purple-100 text-purple-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const paymentStatusColors: Record<string, string> = {
    Pending: "bg-gray-100 text-gray-800",
    Processing: "bg-yellow-100 text-yellow-800",
    Invoiced: "bg-blue-100 text-blue-800",
    PartiallyPaid: "bg-orange-100 text-orange-800",
    Paid: "bg-green-100 text-green-800",
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Accountant Staff" />
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
        <Sidebar items={sidebarItems} title="Accountant Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy dự án</p>
            <Link 
              to="/accountant/projects"
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
      <Sidebar items={sidebarItems} title="Accountant Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Breadcrumb
            items={[
              { label: "Dự án", to: "/accountant/projects" },
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
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          {/* Tab Headers */}
          <div className="border-b border-neutral-200">
            <div className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('contracts')}
                className={`px-6 py-4 font-medium text-sm transition-all duration-300 relative ${
                  activeTab === 'contracts'
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Hợp đồng
                {activeTab === 'contracts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'contracts' && (
              <div className="space-y-6">
                {/* Header với nút tạo chu kỳ và filter năm */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Chu kỳ thanh toán</h2>
                  <div className="flex items-center gap-3">
                    {/* Filter theo năm */}
                    <select
                      value={yearFilter || ""}
                      onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                      className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Tất cả các năm</option>
                      {Array.from(new Set(projectPeriods.map(p => p.periodYear)))
                        .sort((a, b) => b - a)
                        .map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                      onClick={() => setShowCreatePeriodModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Tạo chu kỳ thanh toán
                    </button>
                  </div>
                </div>

                {/* Tabs ngang cho các chu kỳ */}
                {filteredPeriods.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl">
                    <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Chưa có chu kỳ thanh toán nào</p>
                    <p className="text-neutral-400 text-sm mt-1">Nhấn nút "Tạo chu kỳ thanh toán" để bắt đầu</p>
                  </div>
                ) : (
                  <div>
                    {/* Tab Navigation - Horizontal Scroll */}
                    <div className="border-b border-neutral-200 mb-6 overflow-x-auto">
                      <div className="flex space-x-1 min-w-max">
                        {filteredPeriods.map((period) => (
                          <button
                            key={period.id}
                            onClick={() => setSelectedPeriodId(period.id)}
                            className={`px-6 py-3 font-medium text-sm transition-all duration-300 whitespace-nowrap relative ${
                              selectedPeriodId === period.id
                                ? 'text-primary-600'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            Tháng {period.periodMonth}/{period.periodYear}
                            {selectedPeriodId === period.id && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content của chu kỳ được chọn */}
                    {selectedPeriodId && (
                      <div className="animate-fade-in">
                        {loadingPayments ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Đang tải hợp đồng...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Client Contract Payments */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <Building2 className="w-5 h-5 text-primary-600" />
                                  Hợp đồng khách hàng
                                </h3>
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                  {clientContractPayments.length} hợp đồng
                                </span>
                              </div>
                              {clientContractPayments.length === 0 ? (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <FileCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                  <p className="text-sm text-neutral-500">Chưa có hợp đồng khách hàng</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {clientContractPayments.map((payment) => (
                                    <div key={payment.id} className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 mb-1">{payment.contractNumber}</p>
                                          <p className="text-sm text-neutral-600">{payment.talentName || "—"}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${contractStatusColors[payment.contractStatus] || 'bg-gray-100 text-gray-800'}`}>
                                            {contractStatusLabels[payment.contractStatus] || payment.contractStatus}
                                          </span>
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusColors[payment.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                                            {paymentStatusLabels[payment.paymentStatus] || payment.paymentStatus}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                                        <div>
                                          <p className="text-xs text-neutral-600 mb-1">Số tiền</p>
                                          <p className="font-semibold text-gray-900">{formatCurrency(payment.finalAmountVND || payment.finalAmount)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-neutral-600 mb-1">Đã thanh toán</p>
                                          <p className="font-semibold text-gray-900">{formatCurrency(payment.totalPaidAmount)}</p>
                                        </div>
                                      </div>
                                      {payment.billableHours && (
                                        <div className="mt-3 pt-3 border-t border-neutral-100">
                                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <Clock className="w-4 h-4" />
                                            <span>Giờ billable: {payment.billableHours}h</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Partner Contract Payments */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <FileCheck className="w-5 h-5 text-secondary-600" />
                                  Hợp đồng đối tác
                                </h3>
                                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
                                  {partnerContractPayments.length} hợp đồng
                                </span>
                              </div>
                              {partnerContractPayments.length === 0 ? (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <FileCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                  <p className="text-sm text-neutral-500">Chưa có hợp đồng đối tác</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {partnerContractPayments.map((payment) => (
                                    <div key={payment.id} className="border border-neutral-200 rounded-lg p-4 hover:border-secondary-300 hover:shadow-sm transition-all">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 mb-1">{payment.contractNumber}</p>
                                          <p className="text-sm text-neutral-600">Talent Assignment ID: {payment.talentAssignmentId}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            payment.contractStatus === 'Approved' 
                                              ? 'bg-green-100 text-green-800'
                                              : payment.contractStatus === 'Verified'
                                              ? 'bg-purple-100 text-purple-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {contractStatusLabels[payment.contractStatus] || payment.contractStatus}
                                          </span>
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            payment.paymentStatus === 'Paid' 
                                              ? 'bg-green-100 text-green-800'
                                              : payment.paymentStatus === 'Processing'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {payment.paymentStatus === 'Paid' ? 'Đã thanh toán' : payment.paymentStatus === 'Processing' ? 'Đang xử lý' : 'Chờ thanh toán'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                                        <div>
                                          <p className="text-xs text-neutral-600 mb-1">Số tiền</p>
                                          <p className="font-semibold text-gray-900">{formatCurrency(payment.finalAmount)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-neutral-600 mb-1">Đã thanh toán</p>
                                          <p className="font-semibold text-gray-900">{formatCurrency(payment.totalPaidAmount)}</p>
                                        </div>
                                      </div>
                                      {payment.reportedHours && (
                                        <div className="mt-3 pt-3 border-t border-neutral-100">
                                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <Clock className="w-4 h-4" />
                                            <span>Giờ làm việc: {payment.reportedHours}h</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal tạo ProjectPeriod */}
      {showCreatePeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Tạo chu kỳ thanh toán</h3>
                <button
                  onClick={() => setShowCreatePeriodModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Lưu ý:</strong> Hệ thống sẽ tự động:
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Tìm tất cả TalentAssignment có Status = "Active" (bỏ qua Draft)</li>
                  <li>Tính toán tất cả các tháng cần tạo dựa trên startDate và endDate của mỗi TalentAssignment</li>
                  <li>Tạo ProjectPeriod cho mỗi tháng cần thiết</li>
                  <li>Tự động tạo ClientContractPayment và PartnerContractPayment với ContractStatus = "Draft", PaymentStatus = "Pending"</li>
                </ul>
              </div>

              <div>
                <button
                  onClick={handlePreviewPeriods}
                  className="w-full px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-medium transition-colors border border-primary-200"
                >
                  Xem trước các chu kỳ sẽ được tạo
                </button>
              </div>

              {previewPeriods.length > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Các chu kỳ sẽ được tạo ({previewPeriods.length} chu kỳ):
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {previewPeriods.map((p, idx) => (
                        <div key={idx} className="text-sm text-neutral-600 bg-white px-2 py-1 rounded border border-neutral-200">
                          Tháng {p.month}/{p.year}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreatePeriodModal(false)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePeriod}
                disabled={creatingPeriod}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPeriod ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
