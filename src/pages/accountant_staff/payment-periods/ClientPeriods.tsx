import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clientPaymentPeriodService } from "../../../services/ClientPaymentPeriod";
import type { ClientPaymentPeriod } from "../../../services/ClientPaymentPeriod";
import { clientContractPaymentService } from "../../../services/ClientContractPayment";
import type { ClientContractPayment } from "../../../services/ClientContractPayment";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { clientContractService, type ClientContract } from "../../../services/ClientContract";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/accountant_staff/SidebarItems";
import { Building2, Plus, Calendar, X, Save, CheckCircle, Calculator, FileText, Download, Eye } from "lucide-react";
import { clientDocumentService, type ClientDocument } from "../../../services/ClientDocument";
import { documentTypeService, type DocumentType } from "../../../services/DocumentType";

const AccountantClientPeriods: React.FC = () => {
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  
  const [periods, setPeriods] = useState<ClientPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [creatingPeriods, setCreatingPeriods] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<ClientContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');
  
  // Map contract ID to contract number for display
  const [contractsMap, setContractsMap] = useState<Map<number, ClientContract>>(new Map());

  // Modal tạo payment
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState<string | null>(null);
  const [createPaymentSuccess, setCreatePaymentSuccess] = useState(false);

  // Trạng thái cập nhật
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Tính toán (Calculate)
  const [calculating, setCalculating] = useState(false);
  const [calculateError, setCalculateError] = useState<string | null>(null);
  const [calculateSuccess, setCalculateSuccess] = useState(false);
  
  // Modal hiển thị tài liệu
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedPaymentForDocuments, setSelectedPaymentForDocuments] = useState<ClientContractPayment | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());
  
  // Form data
  const [formData, setFormData] = useState({
    clientPeriodId: 0,
    clientContractId: 0,
    billableHours: 0,
    calculatedAmount: 0,
    invoicedAmount: 0,
    receivedAmount: 0,
    invoiceNumber: "",
    invoiceDate: "",
    paymentDate: "",
    status: "PendingCalculation",
    notes: ""
  });

  // Lấy danh sách công ty có hợp đồng
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        // Lấy tất cả hợp đồng
        const contracts = await clientContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        
        // Tạo map contract ID -> contract
        const contractMap = new Map<number, ClientContract>();
        contractsData.forEach((c: ClientContract) => {
          contractMap.set(c.id, c);
        });
        setContractsMap(contractMap);
        
        // Lấy danh sách các clientCompanyId duy nhất
        const companyIds = [...new Set(contractsData.map((c: ClientContract) => c.clientCompanyId))];
        
        // Lấy thông tin các công ty
        const companiesData = await Promise.all(
          companyIds.map(async (id: unknown) => {
            try {
              return await clientCompanyService.getById(id as number);
            } catch (e) {
              console.error(`Error loading company ${id}:`, e);
              return null;
            }
          })
        );
        
        setCompanies(companiesData.filter((c): c is ClientCompany => c !== null));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Load document types
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const data = await documentTypeService.getAll({ excludeDeleted: true });
        const types = Array.isArray(data) ? data : (data?.items || []);
        const typesMap = new Map<number, DocumentType>();
        types.forEach((type: DocumentType) => {
          typesMap.set(type.id, type);
        });
        setDocumentTypes(typesMap);
      } catch (e) {
        console.error("Error loading document types:", e);
      }
    };
    loadDocumentTypes();
  }, []);

  // Hàm mở modal hiển thị tài liệu
  const handleViewDocuments = async (payment: ClientContractPayment) => {
    setSelectedPaymentForDocuments(payment);
    setShowDocumentsModal(true);
    setLoadingDocuments(true);
    try {
      const data = await clientDocumentService.getAll({
        clientContractPaymentId: payment.id,
        excludeDeleted: true
      });
      setDocuments(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      console.error("Error loading documents:", e);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Hàm đóng modal tài liệu
  const handleCloseDocumentsModal = () => {
    setShowDocumentsModal(false);
    setSelectedPaymentForDocuments(null);
    setDocuments([]);
  };

  // Khi chọn công ty, load các period của công ty đó
  useEffect(() => {
    if (!selectedCompanyId) {
      setPeriods([]);
      return;
    }

    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await clientPaymentPeriodService.getAll({ 
          clientCompanyId: selectedCompanyId, 
          excludeDeleted: true 
        });
        setPeriods(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, [selectedCompanyId]);

  // Hàm tạo period từ hợp đồng
  const handleCreatePeriods = async () => {
    if (!selectedCompanyId) return;

    setCreatingPeriods(true);
    setCreateMessage(null); // Xóa thông báo cũ
    try {
      // Lấy tất cả hợp đồng của công ty
      const contracts = await clientContractService.getAll({ 
        clientCompanyId: selectedCompanyId,
        excludeDeleted: true 
      });
      const contractsData = contracts?.items ?? contracts ?? [];

      // Lấy các period hiện có để tránh trùng lặp
      const existingPeriods = await clientPaymentPeriodService.getAll({ 
        clientCompanyId: selectedCompanyId, 
        excludeDeleted: true 
      });
      const existingPeriodsData = existingPeriods?.items ?? existingPeriods ?? [];
      
      // Tạo Set để kiểm tra period đã tồn tại (key: "year-month")
      const existingPeriodSet = new Set<string>();
      existingPeriodsData.forEach((p: ClientPaymentPeriod) => {
        existingPeriodSet.add(`${p.periodYear}-${p.periodMonth}`);
      });

      // Tính toán các tháng mà hợp đồng hiệu lực
      const activeMonths = new Set<string>(); // key: "year-month"
      
      contractsData.forEach((contract: ClientContract) => {
        if (!contract.startDate) return;
        
        const startDate = new Date(contract.startDate);
        const endDate = contract.endDate ? new Date(contract.endDate) : new Date('2099-12-31'); // Nếu không có endDate, coi như hợp đồng chưa kết thúc
        
        // Duyệt qua tất cả các tháng từ startDate đến endDate
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        
        while (currentDate <= finalDate) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1; // getMonth() trả về 0-11, cần +1
          activeMonths.add(`${year}-${month}`);
          
          // Chuyển sang tháng tiếp theo
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }
      });

      // Tạo các period mới cho những tháng chưa có period
      const periodsToCreate: Array<{ year: number; month: number }> = [];
      activeMonths.forEach((key) => {
        if (!existingPeriodSet.has(key)) {
          const [year, month] = key.split('-').map(Number);
          periodsToCreate.push({ year, month });
        }
      });

      // Hiển thị thông báo nếu không có period mới nào cần tạo
      if (periodsToCreate.length === 0) {
        setCreateMessage('Tất cả các kỳ thanh toán đã được tạo. Không có kỳ thanh toán mới nào cần tạo.');
        setTimeout(() => setCreateMessage(null), 5000);
        setCreatingPeriods(false);
        return;
      }

      // Tạo các period
      const createdPeriods = await Promise.all(
        periodsToCreate.map(async ({ year, month }) => {
          try {
            return await clientPaymentPeriodService.create({
              clientCompanyId: selectedCompanyId,
              periodMonth: month,
              periodYear: year,
              status: 'Pending'
            });
          } catch (e) {
            console.error(`Error creating period ${year}-${month}:`, e);
            return null;
          }
        })
      );

      const successCount = createdPeriods.filter(p => p !== null).length;
      
      // Reload periods
      const updatedPeriods = await clientPaymentPeriodService.getAll({ 
        clientCompanyId: selectedCompanyId, 
        excludeDeleted: true 
      });
      setPeriods(updatedPeriods?.items ?? updatedPeriods ?? []);
      
      // Hiển thị thông báo thành công
      if (successCount > 0) {
        setCreateMessage(`Đã tạo thành công ${successCount} kỳ thanh toán mới.`);
        setTimeout(() => setCreateMessage(null), 5000);
      } else {
        setCreateMessage('Không thể tạo kỳ thanh toán. Vui lòng thử lại.');
        setTimeout(() => setCreateMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingPeriods(false);
    }
  };

  const onSelectPeriod = async (periodId: number) => {
    setActivePeriodId(periodId);
    setLoadingPayments(true);
    try {
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: periodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);
      // Kiểm tra và cập nhật Overdue sau khi load
      setTimeout(() => checkAndUpdateOverdue(), 500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load contracts khi mở modal
  const handleOpenCreateModal = async () => {
    if (!selectedCompanyId) return;
    setShowCreateModal(true);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);
    setFormData({
      clientPeriodId: activePeriodId || 0,
      clientContractId: 0,
      billableHours: 0,
      calculatedAmount: 0,
      invoicedAmount: 0,
      receivedAmount: 0,
      invoiceNumber: "",
      invoiceDate: "",
      paymentDate: "",
      status: "PendingCalculation",
      notes: ""
    });

    // Load contracts của công ty
    setLoadingContracts(true);
    try {
      const contractsData = await clientContractService.getAll({ 
        clientCompanyId: selectedCompanyId,
        excludeDeleted: true 
      });
      setContracts(contractsData?.items ?? contractsData ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientPeriodId' || name === 'clientContractId' || name === 'billableHours' 
        || name === 'calculatedAmount' || name === 'invoicedAmount' || name === 'receivedAmount'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriodId) return;

    setSubmitting(true);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);

    try {
      const payload = {
        clientPeriodId: activePeriodId,
        clientContractId: formData.clientContractId,
        billableHours: formData.billableHours,
        calculatedAmount: formData.calculatedAmount || null,
        invoicedAmount: formData.invoicedAmount || null,
        receivedAmount: formData.receivedAmount || null,
        invoiceNumber: formData.invoiceNumber || null,
        invoiceDate: formData.invoiceDate || null,
        paymentDate: formData.paymentDate || null,
        status: "PendingCalculation", // Luôn là PendingCalculation khi tạo mới
        notes: formData.notes || null
      };

      await clientContractPaymentService.create(payload);
      setCreatePaymentSuccess(true);

      // Reload payments
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);

      // Close modal after 1 second
      setTimeout(() => {
        handleCloseCreateModal();
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setCreatePaymentError(error.response?.data?.message || error.message || 'Không thể tạo thanh toán');
    } finally {
      setSubmitting(false);
    }
  };


  // Hàm tính toán (Calculate) - chuyển từ PendingCalculation sang ReadyForInvoice
  const handleCalculate = async (payment: ClientContractPayment) => {
    if (payment.status !== 'PendingCalculation') return;

    setCalculating(true);
    setCalculateError(null);
    setCalculateSuccess(false);

    try {
      await clientContractPaymentService.update(payment.id, {
        clientPeriodId: payment.clientPeriodId,
        clientContractId: payment.clientContractId,
        billableHours: payment.billableHours,
        calculatedAmount: payment.calculatedAmount ?? null,
        invoicedAmount: payment.invoicedAmount ?? null,
        receivedAmount: payment.receivedAmount ?? null,
        invoiceNumber: payment.invoiceNumber ?? null,
        invoiceDate: payment.invoiceDate ?? null,
        paymentDate: payment.paymentDate ?? null,
        status: 'ReadyForInvoice',
        notes: payment.notes ?? null
      });
      
      setCalculateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => {
        setCalculateSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setCalculateError(error.response?.data?.message || error.message || 'Không thể tính toán');
      setTimeout(() => setCalculateError(null), 5000);
    } finally {
      setCalculating(false);
    }
  };

  // Hàm đã thanh toán (Paid) - Accountant
  const handleMarkAsPaid = async (payment: ClientContractPayment) => {
    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);

    try {
      await clientContractPaymentService.update(payment.id, {
        clientPeriodId: payment.clientPeriodId,
        clientContractId: payment.clientContractId,
        billableHours: payment.billableHours,
        calculatedAmount: payment.calculatedAmount ?? null,
        invoicedAmount: payment.invoicedAmount ?? null,
        receivedAmount: payment.receivedAmount ?? null,
        invoiceNumber: payment.invoiceNumber ?? null,
        invoiceDate: payment.invoiceDate ?? null,
        paymentDate: payment.paymentDate ?? null,
        status: 'Paid',
        notes: payment.notes ?? null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setStatusUpdateError(error.response?.data?.message || error.message || 'Không thể đánh dấu đã thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Kiểm tra và tự động chuyển Invoiced → Overdue nếu quá 1 tuần
  const checkAndUpdateOverdue = async () => {
    if (!activePeriodId) return;

    try {
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 ngày trước

      const overduePayments = paymentsData.filter((p: ClientContractPayment) => {
        if (p.status !== 'Invoiced' || !p.invoiceDate) return false;
        const invoiceDate = new Date(p.invoiceDate);
        return invoiceDate < oneWeekAgo;
      });

      // Cập nhật các payment quá hạn
      for (const payment of overduePayments) {
        try {
          await clientContractPaymentService.update(payment.id, {
            clientPeriodId: payment.clientPeriodId,
            clientContractId: payment.clientContractId,
            billableHours: payment.billableHours,
            calculatedAmount: payment.calculatedAmount ?? null,
            invoicedAmount: payment.invoicedAmount ?? null,
            receivedAmount: payment.receivedAmount ?? null,
            invoiceNumber: payment.invoiceNumber ?? null,
            invoiceDate: payment.invoiceDate ?? null,
            paymentDate: payment.paymentDate ?? null,
            status: 'Overdue',
            notes: payment.notes ?? null
          });
        } catch (err) {
          console.error(`Error updating payment ${payment.id} to Overdue:`, err);
        }
      }

      // Reload payments nếu có thay đổi
      if (overduePayments.length > 0) {
        const updatedData = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(updatedData?.items ?? updatedData ?? []);
      }
    } catch (err) {
      console.error('Error checking overdue payments:', err);
    }
  };

  // Mapping tiến trình theo status
  const stageOrder: Record<string, number> = {
    PendingCalculation: 1,
    ReadyForInvoice: 2,
    Cancelled: 0,
    Invoiced: 3,
    Overdue: 3,
    Paid: 4,
  };

  const maxStage = 4;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingCalculation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ReadyForInvoice':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Invoiced':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Overdue':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Paid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PendingCalculation':
        return 'Chờ tính toán';
      case 'ReadyForInvoice':
        return 'Sẵn sàng xuất hóa đơn';
      case 'Cancelled':
        return 'Đã hủy';
      case 'Invoiced':
        return 'Đã xuất hóa đơn';
      case 'Overdue':
        return 'Quá hạn';
      case 'Paid':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  const filteredPayments = (statusFilter === 'ALL')
    ? payments
    : payments.filter(p => (p.status || '').toLowerCase() === statusFilter.toString().toLowerCase());

  const statusCounts = payments.reduce<Record<string, number>>((acc, p) => {
    const s = p.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ thanh toán Khách hàng</h1>
          <p className="text-neutral-600 mt-1">Chọn công ty để xem các kỳ thanh toán</p>
        </div>

        {/* Danh sách công ty */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách công ty có hợp đồng</h2>
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách công ty...
            </div>
          ) : companies.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Chưa có công ty nào có hợp đồng</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map(company => (
                <button
                  key={company.id}
                  onClick={() => {
                    setSelectedCompanyId(company.id);
                    setActivePeriodId(null);
                    setPayments([]);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCompanyId === company.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      selectedCompanyId === company.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedCompanyId === company.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {company.name}
                      </div>
                      {company.taxCode && (
                        <div className="text-xs text-gray-500 mt-1">Mã số thuế: {company.taxCode}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách kỳ thanh toán */}
        {selectedCompanyId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedCompany?.name}
              </h2>
              <button
                onClick={handleCreatePeriods}
                disabled={creatingPeriods}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {creatingPeriods ? 'Đang tạo...' : 'Tạo kỳ thanh toán từ hợp đồng'}
              </button>
            </div>
            {createMessage && (
              <div className={`mb-4 p-3 rounded-xl border ${
                createMessage.includes('thành công') 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : createMessage.includes('đã được tạo')
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {createMessage}
              </div>
            )}
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-10 text-gray-600">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
                Đang tải kỳ thanh toán...
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm mb-4">Chưa có kỳ thanh toán nào</div>
                <button
                  onClick={handleCreatePeriods}
                  disabled={creatingPeriods}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {creatingPeriods ? 'Đang tạo...' : 'Tạo kỳ thanh toán từ hợp đồng'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods
                  .sort((a, b) => {
                    if (a.periodYear !== b.periodYear) return a.periodYear - b.periodYear;
                    return a.periodMonth - b.periodMonth;
                  })
                  .map(period => (
                    <button
                      key={period.id}
                      onClick={() => onSelectPeriod(period.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        activePeriodId === period.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${
                          activePeriodId === period.id ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${
                            activePeriodId === period.id ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {monthNames[period.periodMonth - 1]} / {period.periodYear}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Trạng thái: {period.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Chi tiết thanh toán */}
        {selectedCompanyId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết thanh toán</h2>
              <div className="flex items-center gap-2">
                {activePeriodId && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo thanh toán
                  </button>
                )}
                {payments.length > 0 && (
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string | 'ALL')}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.keys(statusCounts).map(s => (
                      <option key={s} value={s}>{getStatusLabel(s)} ({statusCounts[s]})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {calculateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                Tính toán thành công! Trạng thái đã chuyển sang ReadyForInvoice.
              </div>
            )}
            {calculateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {calculateError}
              </div>
            )}
            {!activePeriodId ? (
              <div className="text-gray-500 text-sm">Chọn một kỳ thanh toán để xem chi tiết</div>
            ) : loadingPayments ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />
                Đang tải khoản thanh toán...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-gray-500 text-sm">Chưa có dữ liệu thanh toán cho kỳ này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-3 border-b text-left">ID</th>
                      <th className="p-3 border-b text-left">Hợp đồng</th>
                      <th className="p-3 border-b text-left">Giờ bill</th>
                      <th className="p-3 border-b text-left">Tính toán</th>
                      <th className="p-3 border-b text-left">Hóa đơn</th>
                      <th className="p-3 border-b text-left">Đã nhận</th>
                      <th className="p-3 border-b text-left">Trạng thái</th>
                      <th className="p-3 border-b text-left">Tiến độ</th>
                      <th className="p-3 border-b text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(p => {
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3">
                            {contractsMap.get(p.clientContractId) ? (
                              <Link
                                to={`/accountant/contracts/clients/${p.clientContractId}`}
                                className="text-primary-600 hover:text-primary-800 hover:underline font-medium transition-colors"
                              >
                                {contractsMap.get(p.clientContractId)?.contractNumber || p.clientContractId}
                              </Link>
                            ) : (
                              p.clientContractId
                            )}
                          </td>
                          <td className="p-3">{p.billableHours}</td>
                          <td className="p-3">{p.calculatedAmount ?? "-"}</td>
                          <td className="p-3">{p.invoicedAmount ?? "-"}</td>
                          <td className="p-3">{p.receivedAmount ?? "-"}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            {(() => {
                              const current = stageOrder[p.status] ?? 0;
                              const percent = current > 0 ? Math.round((current / maxStage) * 100) : 0;
                              return (
                                <div className="w-40">
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500" style={{ width: `${percent}%` }} />
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1">{percent}%</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.status === 'PendingCalculation' && (
                                <button
                                  onClick={() => handleCalculate(p)}
                                  disabled={calculating}
                                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  <Calculator className="w-4 h-4" />
                                  {calculating ? 'Đang tính...' : 'Tính toán'}
                                </button>
                              )}
                              {(p.status === 'Invoiced' || p.status === 'Overdue') && (
                                <button
                                  onClick={() => handleMarkAsPaid(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {updatingStatus ? 'Đang xử lý...' : 'Đã thanh toán'}
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDocuments(p)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 transition-all whitespace-nowrap"
                              >
                                <FileText className="w-4 h-4" />
                                Tài liệu
                              </button>
                              {p.status !== 'PendingCalculation' && p.status !== 'Invoiced' && p.status !== 'Overdue' && (
                                <span className="text-gray-400 text-xs whitespace-nowrap">Không thể đổi</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal tạo payment */}
        {showCreateModal && activePeriodId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tạo thanh toán mới</h2>
                <button
                  onClick={handleCloseCreateModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {createPaymentSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                  Tạo thanh toán thành công!
                </div>
              )}

              {createPaymentError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  {createPaymentError}
                </div>
              )}

              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="clientContractId"
                      value={formData.clientContractId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingContracts}
                    >
                      <option value="0">-- Chọn hợp đồng --</option>
                      {contracts.map(contract => (
                        <option key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {contract.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bill <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="billableHours"
                      value={formData.billableHours}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền tính toán
                    </label>
                    <input
                      type="number"
                      name="calculatedAmount"
                      value={formData.calculatedAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền hóa đơn
                    </label>
                    <input
                      type="number"
                      name="invoicedAmount"
                      value={formData.invoicedAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đã nhận
                    </label>
                    <input
                      type="number"
                      name="receivedAmount"
                      value={formData.receivedAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số hóa đơn
                    </label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày hóa đơn
                    </label>
                    <input
                      type="datetime-local"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày thanh toán
                    </label>
                    <input
                      type="datetime-local"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={getStatusLabel(formData.status)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Trạng thái mặc định khi tạo mới</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Tạo thanh toán
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

            {statusUpdateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                Đã đánh dấu thanh toán thành công!
              </div>
            )}
            {statusUpdateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {statusUpdateError}
          </div>
        )}

        {/* Modal hiển thị tài liệu */}
        {showDocumentsModal && selectedPaymentForDocuments && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseDocumentsModal();
              }
            }}
          >
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-neutral-200 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tài liệu thanh toán</h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Hợp đồng: {contractsMap.get(selectedPaymentForDocuments.clientContractId)?.contractNumber || selectedPaymentForDocuments.clientContractId}
                  </p>
                </div>
                <button
                  onClick={handleCloseDocumentsModal}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-lg"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                    <span className="text-gray-600">Đang tải tài liệu...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-500">Chưa có tài liệu nào cho thanh toán này</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 truncate">{doc.fileName}</h4>
                            </div>
                            {documentTypes.get(doc.documentTypeId) && (
                              <p className="text-sm text-neutral-600 mb-1">
                                Loại: {documentTypes.get(doc.documentTypeId)?.typeName}
                              </p>
                            )}
                            {doc.description && (
                              <p className="text-sm text-neutral-500 mb-2">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              {doc.source && (
                                <span>Nguồn: {doc.source}</span>
                              )}
                              {doc.uploadTimestamp && (
                                <span>
                                  {new Date(doc.uploadTimestamp).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-4 h-4" />
                              Xem
                            </a>
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Download className="w-4 h-4" />
                              Tải xuống
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantClientPeriods;
