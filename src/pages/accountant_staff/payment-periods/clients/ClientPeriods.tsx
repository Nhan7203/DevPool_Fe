import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clientPaymentPeriodService } from "../../../../services/ClientPaymentPeriod";
import type { ClientPaymentPeriod } from "../../../../services/ClientPaymentPeriod";
import { clientContractPaymentService } from "../../../../services/ClientContractPayment";
import type { ClientContractPayment } from "../../../../services/ClientContractPayment";
import { clientCompanyService, type ClientCompany } from "../../../../services/ClientCompany";
import { clientContractService, type ClientContract } from "../../../../services/ClientContract";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/accountant_staff/SidebarItems";
import { Building2, Plus, Calendar, X, Save, CheckCircle, Calculator, FileText, Download, Eye, Upload, FileUp, AlertCircle, Search } from "lucide-react";
import { clientDocumentService, type ClientDocument, type ClientDocumentCreate } from "../../../../services/ClientDocument";
import { documentTypeService, type DocumentType } from "../../../../services/DocumentType";
import { uploadFile } from "../../../../utils/firebaseStorage";
import { decodeJWT } from "../../../../services/Auth";
import { useAuth } from "../../../../contexts/AuthContext";
import { notificationService, NotificationType, NotificationPriority } from "../../../../services/Notification";
import { userService } from "../../../../services/User";
import { formatVND, getErrorMessage } from "../../../../utils/helpers";

const AccountantClientPeriods: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [allContracts, setAllContracts] = useState<ClientContract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  
  const [periods, setPeriods] = useState<ClientPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [creatingPeriods, setCreatingPeriods] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [showClosedPeriods, setShowClosedPeriods] = useState(false);

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

  // Modal ghi nhận thanh toán
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedPaymentForRecord, setSelectedPaymentForRecord] = useState<ClientContractPayment | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    receivedAmount: 0,
    paymentDate: "",
    notes: ""
  });

  // Modal tạo tài liệu trong ghi nhận thanh toán
  const [recordPaymentDocumentTypesList, setRecordPaymentDocumentTypesList] = useState<DocumentType[]>([]);
  const [loadingRecordPaymentDocumentTypes, setLoadingRecordPaymentDocumentTypes] = useState(false);
  const [createRecordPaymentDocumentError, setCreateRecordPaymentDocumentError] = useState<string | null>(null);
  const [createRecordPaymentDocumentSuccess, setCreateRecordPaymentDocumentSuccess] = useState(false);
  const [recordPaymentFile, setRecordPaymentFile] = useState<File | null>(null);
  const [recordPaymentUploadProgress, setRecordPaymentUploadProgress] = useState<number>(0);
  const [recordPaymentDocumentFormData, setRecordPaymentDocumentFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "Accountant",
    referencedPartnerDocumentId: 0
  });

  // Tính toán (Calculate) - Modal
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedPaymentForCalculate, setSelectedPaymentForCalculate] = useState<ClientContractPayment | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculateError, setCalculateError] = useState<string | null>(null);
  const [calculateSuccess, setCalculateSuccess] = useState(false);
  const [calculateFormData, setCalculateFormData] = useState({
    billableHours: 0,
    notes: ""
  });

  // Modal tạo tài liệu trong tính toán
  const [documentTypesList, setDocumentTypesList] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [createDocumentError, setCreateDocumentError] = useState<string | null>(null);
  const [createDocumentSuccess, setCreateDocumentSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [documentFormData, setDocumentFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "Accountant",
    referencedPartnerDocumentId: 0
  });
  
  // Modal hiển thị tài liệu
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedPaymentForDocuments, setSelectedPaymentForDocuments] = useState<ClientContractPayment | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());

  // Modal tạo tài liệu độc lập
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [selectedPaymentForCreateDocument, setSelectedPaymentForCreateDocument] = useState<ClientContractPayment | null>(null);
  const [createDocumentModalDocumentTypesList, setCreateDocumentModalDocumentTypesList] = useState<DocumentType[]>([]);
  const [loadingCreateDocumentModalDocumentTypes, setLoadingCreateDocumentModalDocumentTypes] = useState(false);
  const [submittingCreateDocumentModal, setSubmittingCreateDocumentModal] = useState(false);
  const [createDocumentModalError, setCreateDocumentModalError] = useState<string | null>(null);
  const [createDocumentModalSuccess, setCreateDocumentModalSuccess] = useState(false);
  const [createDocumentModalFile, setCreateDocumentModalFile] = useState<File | null>(null);
  const [createDocumentModalUploadProgress, setCreateDocumentModalUploadProgress] = useState<number>(0);
  const [createDocumentModalFormData, setCreateDocumentModalFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "Accountant",
    referencedPartnerDocumentId: 0
  });
  
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
        setAllContracts(contractsData);
        
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

  // Hàm mở modal tạo tài liệu độc lập
  // @ts-expect-error - Function kept for potential future use
  const handleOpenCreateDocumentModal = async (payment: ClientContractPayment) => {
    setSelectedPaymentForCreateDocument(payment);
    setShowCreateDocumentModal(true);
    setCreateDocumentModalError(null);
    setCreateDocumentModalSuccess(false);
    setCreateDocumentModalFile(null);
    setCreateDocumentModalUploadProgress(0);
    setCreateDocumentModalFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });

    // Load document types
    setLoadingCreateDocumentModalDocumentTypes(true);
    try {
      const typesData = await documentTypeService.getAll({ excludeDeleted: true });
      const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
      setCreateDocumentModalDocumentTypesList(types);
    } catch (e) {
      console.error("Error loading document types:", e);
      setCreateDocumentModalDocumentTypesList([]);
    } finally {
      setLoadingCreateDocumentModalDocumentTypes(false);
    }
  };

  // Hàm đóng modal tạo tài liệu độc lập
  const handleCloseCreateDocumentModal = () => {
    setShowCreateDocumentModal(false);
    setSelectedPaymentForCreateDocument(null);
    setCreateDocumentModalFile(null);
    setCreateDocumentModalUploadProgress(0);
    setCreateDocumentModalFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });
    setCreateDocumentModalError(null);
    setCreateDocumentModalSuccess(false);
  };

  // Hàm xử lý file upload cho modal tạo tài liệu độc lập
  const onCreateDocumentModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateDocumentModalError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateDocumentModalError(null);
    setCreateDocumentModalFile(f);
    if (f) {
      setCreateDocumentModalFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  // Hàm xử lý thay đổi form document cho modal tạo tài liệu độc lập
  const handleCreateDocumentModalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateDocumentModalFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedPartnerDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  // Hàm tạo tài liệu độc lập
  const handleCreateDocumentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForCreateDocument || !createDocumentModalFile || !createDocumentModalFormData.documentTypeId) return;

    setSubmittingCreateDocumentModal(true);
    setCreateDocumentModalError(null);
    setCreateDocumentModalSuccess(false);

    try {
      // Lấy userId từ token hoặc user context
      let uploadedByUserId: string | null = null;
      
      if (user?.id) {
        uploadedByUserId = user.id;
      } else {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const decoded = decodeJWT(token);
            if (decoded) {
              uploadedByUserId = decoded.nameid || decoded.sub || decoded.userId || decoded.uid || null;
            }
          } catch (error) {
            console.error('Error decoding JWT:', error);
          }
        }
      }
      
      if (!uploadedByUserId) {
        throw new Error('Không xác định được người dùng (uploadedByUserId). Vui lòng đăng nhập lại.');
      }

      // Upload file lên Firebase
      const path = `client-documents/${selectedPaymentForCreateDocument.id}/${Date.now()}_${createDocumentModalFile.name}`;
      const downloadURL = await uploadFile(createDocumentModalFile, path, setCreateDocumentModalUploadProgress);

      // Tạo payload
      const payload: ClientDocumentCreate = {
        clientContractPaymentId: selectedPaymentForCreateDocument.id,
        documentTypeId: createDocumentModalFormData.documentTypeId,
        referencedPartnerDocumentId: createDocumentModalFormData.referencedPartnerDocumentId || null,
        fileName: createDocumentModalFile.name,
        filePath: downloadURL,
        uploadedByUserId,
        description: createDocumentModalFormData.description || null,
        source: createDocumentModalFormData.source || null
      };

      await clientDocumentService.create(payload);
      setCreateDocumentModalSuccess(true);

      // Reload documents nếu đang mở modal xem tài liệu
      if (showDocumentsModal && selectedPaymentForDocuments?.id === selectedPaymentForCreateDocument.id) {
        try {
          const data = await clientDocumentService.getAll({
            clientContractPaymentId: selectedPaymentForCreateDocument.id,
            excludeDeleted: true
          });
          setDocuments(Array.isArray(data) ? data : (data?.items || []));
        } catch (e) {
          console.error("Error reloading documents:", e);
        }
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseCreateDocumentModal();
      }, 2000);
    } catch (err: unknown) {
      setCreateDocumentModalError(getErrorMessage(err) || 'Không thể tạo tài liệu');
    } finally {
      setSubmittingCreateDocumentModal(false);
    }
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

  // Hàm helper để tạo contract payment cho các period đã tồn tại khi hợp đồng được duyệt sau
  const createContractPaymentsForExistingPeriods = async () => {
    if (!selectedCompanyId) return 0;

    try {
      // Lấy tất cả các period hiện có
      const allPeriods = await clientPaymentPeriodService.getAll({ 
        clientCompanyId: selectedCompanyId, 
        excludeDeleted: true 
      });
      const allPeriodsData = allPeriods?.items ?? allPeriods ?? [];

      // Lấy tất cả hợp đồng của công ty đang ở trạng thái Active hoặc Ongoing
      const contracts = await clientContractService.getAll({ 
        clientCompanyId: selectedCompanyId,
        excludeDeleted: true 
      });
      const contractsData = contracts?.items ?? contracts ?? [];
      
      // Lọc các hợp đồng đang hiệu lực (Active hoặc Ongoing)
      const activeContracts = contractsData.filter((contract: ClientContract) => 
        contract.status === 'Active' || contract.status === 'Ongoing'
      );

      if (activeContracts.length === 0) return 0;

      let createdPaymentsCount = 0;

      // Duyệt qua từng period
      for (const period of allPeriodsData) {
        const periodYear = period.periodYear;
        const periodMonth = period.periodMonth;

        // Lấy tất cả contract payment hiện có của period này
        const existingPayments = await clientContractPaymentService.getAll({ 
          clientPeriodId: period.id, 
          excludeDeleted: true 
        });
        const existingPaymentsData = existingPayments?.items ?? existingPayments ?? [];
        const existingContractIds = new Set(
          existingPaymentsData.map((p: ClientContractPayment) => p.clientContractId)
        );

        // Duyệt qua từng hợp đồng đang hiệu lực
        for (const contract of activeContracts) {
          // Bỏ qua nếu đã có contract payment cho hợp đồng này trong period này
          if (existingContractIds.has(contract.id)) continue;

          // Kiểm tra xem hợp đồng có hiệu lực trong tháng của period này không
          if (!contract.startDate) continue;

          const startDate = new Date(contract.startDate);
          const endDate = contract.endDate ? new Date(contract.endDate) : new Date('2099-12-31');
          
          // Tính ngày đầu và ngày cuối của period (tháng)
          const periodStartDate = new Date(periodYear, periodMonth - 1, 1);
          const periodEndDate = new Date(periodYear, periodMonth, 0); // Ngày cuối cùng của tháng

          // Kiểm tra xem period có giao với khoảng thời gian hiệu lực của hợp đồng không
          // Period giao với hợp đồng nếu: periodStartDate <= endDate && periodEndDate >= startDate
          if (periodStartDate <= endDate && periodEndDate >= startDate) {
            try {
              // Tạo contract payment
              await clientContractPaymentService.create({
                clientPeriodId: period.id,
                clientContractId: contract.id,
                billableHours: 0,
                calculatedAmount: null,
                invoicedAmount: null,
                receivedAmount: null,
                invoiceNumber: null,
                invoiceDate: null,
                paymentDate: null,
                status: 'PendingCalculation',
                notes: null
              });
              createdPaymentsCount++;
            } catch (err) {
              console.error(`Error creating contract payment for contract ${contract.id} in period ${period.id}:`, err);
            }
          }
        }
      }

      return createdPaymentsCount;
    } catch (err) {
      console.error('Error creating contract payments for existing periods:', err);
      return 0;
    }
  };

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

      // Tạo các period mới (nếu có)
      let successCount = 0;
      if (periodsToCreate.length > 0) {
        const createdPeriods = await Promise.all(
          periodsToCreate.map(async ({ year, month }) => {
            try {
              return await clientPaymentPeriodService.create({
                clientCompanyId: selectedCompanyId,
                periodMonth: month,
                periodYear: year,
                status: 'Open'
              });
            } catch (e) {
              console.error(`Error creating period ${year}-${month}:`, e);
              return null;
            }
          })
        );

        successCount = createdPeriods.filter(p => p !== null).length;
      }

      // Tạo contract payment cho các period đã tồn tại (bao gồm cả period mới tạo) khi hợp đồng được duyệt sau
      const createdPaymentsCount = await createContractPaymentsForExistingPeriods();
      
      // Reload periods
      const updatedPeriods = await clientPaymentPeriodService.getAll({ 
        clientCompanyId: selectedCompanyId, 
        excludeDeleted: true 
      });
      setPeriods(updatedPeriods?.items ?? updatedPeriods ?? []);
      
      // Hiển thị thông báo thành công
      let message = '';
      if (successCount > 0 && createdPaymentsCount > 0) {
        message = `Đã tạo thành công ${successCount} kỳ thanh toán mới và ${createdPaymentsCount} thanh toán hợp đồng cho các kỳ đã tồn tại.`;
      } else if (successCount > 0) {
        message = `Đã tạo thành công ${successCount} kỳ thanh toán mới.`;
      } else if (createdPaymentsCount > 0) {
        message = `Đã tạo thành công ${createdPaymentsCount} thanh toán hợp đồng cho các kỳ đã tồn tại.`;
      } else {
        message = 'Tất cả các kỳ thanh toán đã được tạo. Không có kỳ thanh toán mới nào cần tạo.';
      }
      
      setCreateMessage(message);
      setTimeout(() => setCreateMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setCreateMessage('Có lỗi xảy ra khi tạo kỳ thanh toán. Vui lòng thử lại.');
      setTimeout(() => setCreateMessage(null), 5000);
    } finally {
      setCreatingPeriods(false);
    }
  };

  // Kiểm tra và cập nhật Cancelled cho các payment của contract terminated (chưa Paid/Invoiced)
  const checkAndUpdateCancelled = async () => {
    if (!activePeriodId) return;

    try {
      // Lấy tất cả contracts để check status
      const contractsData = await clientContractService.getAll({ excludeDeleted: true });
      const contracts = Array.isArray(contractsData) ? contractsData : (contractsData?.items || []);
      const terminatedContractIds = new Set(
        contracts
          .filter((c: ClientContract) => c.status === 'Terminated')
          .map((c: ClientContract) => c.id)
      );

      if (terminatedContractIds.size === 0) return; // Không có contract nào bị terminated

      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];

      // Lọc các payment cần cập nhật: thuộc contract terminated VÀ chưa Paid/Invoiced
      const cancelledPayments = paymentsData.filter((p: ClientContractPayment) => {
        if (!terminatedContractIds.has(p.clientContractId)) return false;
        // Chưa Paid và chưa Invoiced
        return p.status !== 'Paid' && p.status !== 'Invoiced' && p.status !== 'Overdue' && p.status !== 'Cancelled';
      });

      // Cập nhật các payment thành Cancelled
      for (const payment of cancelledPayments) {
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
            status: 'Cancelled',
            notes: payment.notes ?? null
          });
        } catch (err) {
          console.error(`Error updating payment ${payment.id} to Cancelled:`, err);
        }
      }

      // Reload payments nếu có thay đổi
      if (cancelledPayments.length > 0) {
        const updatedData = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(updatedData?.items ?? updatedData ?? []);
        
        // Cập nhật trạng thái period
        await updatePeriodStatus(activePeriodId);
      }
    } catch (err) {
      console.error('Error checking cancelled payments:', err);
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
      // Kiểm tra và cập nhật Cancelled và Overdue sau khi load
      setTimeout(() => {
        checkAndUpdateCancelled();
        checkAndUpdateOverdue();
      }, 500);
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
      
      // Cập nhật trạng thái period
      if (activePeriodId) {
        await updatePeriodStatus(activePeriodId);
      }

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


  // Hàm mở modal tính toán
  // @ts-expect-error - Function kept for potential future use
  const handleOpenCalculateModal = async (payment: ClientContractPayment) => {
    if (payment.status !== 'PendingCalculation') return;

    setSelectedPaymentForCalculate(payment);
    setShowCalculateModal(true);
    setCalculateError(null);
    setCalculateSuccess(false);
    setCreateDocumentError(null);
    setCreateDocumentSuccess(false);
    setFile(null);
    setUploadProgress(0);
    setCalculateFormData({
      billableHours: payment.billableHours || 0,
      notes: payment.notes || ""
    });
    setDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });

    // Load document types và tìm Worksheet
    setLoadingDocumentTypes(true);
    try {
      const typesData = await documentTypeService.getAll({ excludeDeleted: true });
      const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
      setDocumentTypesList(types);
      
      // Tìm và set Worksheet làm mặc định
      const worksheetType = types.find((t: DocumentType) => 
        t.typeName.toLowerCase() === 'worksheet'
      );
      if (worksheetType) {
        setDocumentFormData(prev => ({ ...prev, documentTypeId: worksheetType.id }));
      }
    } catch (e) {
      console.error("Error loading document types:", e);
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  // Hàm đóng modal tính toán
  const handleCloseCalculateModal = () => {
    setShowCalculateModal(false);
    setSelectedPaymentForCalculate(null);
    setCalculateError(null);
    setCalculateSuccess(false);
    setCreateDocumentError(null);
    setCreateDocumentSuccess(false);
    setFile(null);
    setUploadProgress(0);
    setCalculateFormData({
      billableHours: 0,
      notes: ""
    });
    setDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });
  };

  // Hàm xử lý file upload
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateDocumentError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateDocumentError(null);
    setFile(f);
    if (f) {
      setDocumentFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  // Hàm xử lý thay đổi form document
  const handleDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedPartnerDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };


  // Helper function để lấy danh sách user IDs theo role
  const getUserIdByRole = async (role: string): Promise<string[]> => {
    try {
      const usersData = await userService.getAll({ 
        role, 
        isActive: true, 
        excludeDeleted: true 
      });
      return usersData.items.map(user => user.id);
    } catch (error) {
      console.error(`Error getting users with role ${role}:`, error);
      return [];
    }
  };

  // Hàm tính toán và submit (kèm tạo tài liệu nếu có)
  const handleCalculateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForCalculate) return;

    setCalculating(true);
    setCalculateError(null);
    setCalculateSuccess(false);
    setCreateDocumentError(null);
    setCreateDocumentSuccess(false);

    try {
      // Bước 1: Tạo tài liệu nếu có file
      if (file && documentFormData.documentTypeId) {
        try {
          // Lấy userId từ token hoặc user context
          let uploadedByUserId: string | null = null;
          
          if (user?.id) {
            uploadedByUserId = user.id;
          } else {
            const token = localStorage.getItem('accessToken');
            if (token) {
              try {
                const decoded = decodeJWT(token);
                if (decoded) {
                  uploadedByUserId = decoded.nameid || decoded.sub || decoded.userId || decoded.uid || null;
                }
              } catch (error) {
                console.error('Error decoding JWT:', error);
              }
            }
          }
          
          if (!uploadedByUserId) {
            throw new Error('Không xác định được người dùng (uploadedByUserId). Vui lòng đăng nhập lại.');
          }

          // Upload file lên Firebase
          const path = `client-documents/${selectedPaymentForCalculate.id}/${Date.now()}_${file.name}`;
          const downloadURL = await uploadFile(file, path, setUploadProgress);

          // Tạo payload
          const payload: ClientDocumentCreate = {
            clientContractPaymentId: selectedPaymentForCalculate.id,
            documentTypeId: documentFormData.documentTypeId,
            referencedPartnerDocumentId: documentFormData.referencedPartnerDocumentId || null,
            fileName: file.name,
            filePath: downloadURL,
            uploadedByUserId,
            description: documentFormData.description || null,
            source: documentFormData.source || null
          };

          await clientDocumentService.create(payload);
          setCreateDocumentSuccess(true);
        } catch (docErr: unknown) {
          setCreateDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu');
          throw docErr; // Dừng lại nếu không tạo được tài liệu
        }
      }

      // Bước 2: Tính toán và submit
      await clientContractPaymentService.calculateAndSubmit(
        selectedPaymentForCalculate.id,
        {
          billableHours: calculateFormData.billableHours || null,
          notes: calculateFormData.notes || null
        }
      );
      
      // Gửi thông báo cho manager
      try {
        const managerUserIds = await getUserIdByRole('Manager');
        if (managerUserIds.length > 0) {
          const contract = contractsMap.get(selectedPaymentForCalculate.clientContractId);
          await notificationService.create({
            title: "Thanh toán hợp đồng khách hàng chờ duyệt",
            message: `Thanh toán hợp đồng ${contract?.contractNumber || selectedPaymentForCalculate.clientContractId} đã được tính toán và submit. Vui lòng duyệt.`,
            type: NotificationType.PaymentDueSoon,
            priority: NotificationPriority.Medium,
            userIds: managerUserIds,
            entityType: "ClientContractPayment",
            entityId: selectedPaymentForCalculate.id,
            actionUrl: `/manager/payment-periods/clients`
          });
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Không throw error để không ảnh hưởng đến flow chính
      }
      
      setCalculateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
        
        // Cập nhật trạng thái period
        await updatePeriodStatus(activePeriodId);
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseCalculateModal();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setCalculateError(error.response?.data?.message || error.message || 'Không thể tính toán');
    } finally {
      setCalculating(false);
    }
  };

  // Hàm mở modal ghi nhận thanh toán
  // @ts-expect-error - Function kept for potential future use
  const handleOpenRecordPaymentModal = async (payment: ClientContractPayment) => {
    setSelectedPaymentForRecord(payment);
    setShowRecordPaymentModal(true);
    // Set thời gian hiện tại theo giờ Việt Nam (UTC+7) làm mặc định cho paymentDate
    const now = new Date();
    const vietnamTimeString = now.toLocaleString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    // Format: "MM/DD/YYYY, HH:mm" -> "YYYY-MM-DDTHH:mm"
    const [datePart, timePart] = vietnamTimeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const currentDateTime = `${year}-${month}-${day}T${timePart}`;
    setPaymentFormData({
      receivedAmount: payment.receivedAmount || payment.invoicedAmount || 0,
      paymentDate: currentDateTime, // Thời gian thực theo giờ Việt Nam
      notes: payment.notes || ""
    });
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateRecordPaymentDocumentError(null);
    setCreateRecordPaymentDocumentSuccess(false);
    setRecordPaymentFile(null);
    setRecordPaymentUploadProgress(0);
    setRecordPaymentDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });

    // Load document types và tìm Receipt
    setLoadingRecordPaymentDocumentTypes(true);
    try {
      const typesData = await documentTypeService.getAll({ excludeDeleted: true });
      const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
      setRecordPaymentDocumentTypesList(types);
      
      // Tìm và set Receipt làm mặc định
      const receiptType = types.find((t: DocumentType) => {
        const name = t.typeName.toLowerCase().trim();
        return name === 'receipt' || name.includes('receipt');
      });
      
      // Set documentFormData với Receipt đã được tìm thấy
      setRecordPaymentDocumentFormData({
        documentTypeId: receiptType ? receiptType.id : 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedPartnerDocumentId: 0
      });
      
      if (!receiptType) {
        // Nếu không tìm thấy, log để debug
        console.warn("Không tìm thấy document type 'Receipt'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
      }
    } catch (e) {
      console.error("Error loading document types:", e);
      // Nếu có lỗi, vẫn set form data với documentTypeId = 0
      setRecordPaymentDocumentFormData({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedPartnerDocumentId: 0
      });
    } finally {
      setLoadingRecordPaymentDocumentTypes(false);
    }
  };

  // Hàm đóng modal ghi nhận thanh toán
  const handleCloseRecordPaymentModal = () => {
    setShowRecordPaymentModal(false);
    setSelectedPaymentForRecord(null);
    setPaymentFormData({
      receivedAmount: 0,
      paymentDate: "",
      notes: ""
    });
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateRecordPaymentDocumentError(null);
    setCreateRecordPaymentDocumentSuccess(false);
    setRecordPaymentFile(null);
    setRecordPaymentUploadProgress(0);
    setRecordPaymentDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedPartnerDocumentId: 0
    });
  };

  // Hàm xử lý file upload cho record payment
  const onRecordPaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateRecordPaymentDocumentError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateRecordPaymentDocumentError(null);
    setRecordPaymentFile(f);
    if (f) {
      setRecordPaymentDocumentFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  // Hàm xử lý thay đổi form document cho record payment
  const handleRecordPaymentDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecordPaymentDocumentFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedPartnerDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  // Hàm ghi nhận thanh toán (Paid) - Accountant (kèm tạo tài liệu nếu có)
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForRecord) return;

    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateRecordPaymentDocumentError(null);
    setCreateRecordPaymentDocumentSuccess(false);

    try {
      // Bước 1: Tạo document nếu có file
      if (recordPaymentFile && recordPaymentDocumentFormData.documentTypeId) {
        try {
          // Lấy userId từ token hoặc user context
          let uploadedByUserId: string | null = null;
          
          if (user?.id) {
            uploadedByUserId = user.id;
          } else {
            const token = localStorage.getItem('accessToken');
            if (token) {
              try {
                const decoded = decodeJWT(token);
                if (decoded) {
                  uploadedByUserId = decoded.nameid || decoded.sub || decoded.userId || decoded.uid || null;
                }
              } catch (error) {
                console.error('Error decoding JWT:', error);
              }
            }
          }
          
          if (!uploadedByUserId) {
            throw new Error('Không xác định được người dùng (uploadedByUserId). Vui lòng đăng nhập lại.');
          }

          // Upload file lên Firebase
          const path = `client-documents/${selectedPaymentForRecord.id}/${Date.now()}_${recordPaymentFile.name}`;
          const downloadURL = await uploadFile(recordPaymentFile, path, setRecordPaymentUploadProgress);

          // Tạo payload
          const payload: ClientDocumentCreate = {
            clientContractPaymentId: selectedPaymentForRecord.id,
            documentTypeId: recordPaymentDocumentFormData.documentTypeId,
            referencedPartnerDocumentId: recordPaymentDocumentFormData.referencedPartnerDocumentId || null,
            fileName: recordPaymentFile.name,
            filePath: downloadURL,
            uploadedByUserId,
            description: recordPaymentDocumentFormData.description || null,
            source: recordPaymentDocumentFormData.source || null
          };

          await clientDocumentService.create(payload);
          setCreateRecordPaymentDocumentSuccess(true);
        } catch (docErr: unknown) {
          setCreateRecordPaymentDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu');
          throw docErr; // Dừng lại nếu không tạo được tài liệu
        }
      }

      // Bước 2: Record payment
      const paymentDateISO = new Date(paymentFormData.paymentDate).toISOString();
      await clientContractPaymentService.recordPayment(selectedPaymentForRecord.id, {
        receivedAmount: paymentFormData.receivedAmount,
        paymentDate: paymentDateISO,
        notes: paymentFormData.notes || null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
        
        // Cập nhật trạng thái period
        await updatePeriodStatus(activePeriodId);
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseRecordPaymentModal();
        setStatusUpdateSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setStatusUpdateError(error.response?.data?.message || error.message || 'Không thể ghi nhận thanh toán');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hàm cập nhật trạng thái period dựa trên payments
  const updatePeriodStatus = async (periodId: number) => {
    try {
      // Lấy tất cả payments của period
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: periodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];
      
      if (paymentsData.length === 0) {
        // Nếu không có payment nào, giữ nguyên trạng thái hiện tại
        return;
      }

      // Lấy thông tin period hiện tại
      const period = await clientPaymentPeriodService.getById(periodId);
      const currentStatus = period.status;

      // Xác định trạng thái cuối cùng và tiến độ
      const stageOrder: Record<string, number> = {
        PendingCalculation: 1,
        ReadyForInvoice: 2,
        Cancelled: 0,
        Invoiced: 3,
        Overdue: 3,
        Paid: 4,
      };
      const maxStage = 4;
      const finalStatus = 'Paid'; // Trạng thái cuối cùng

      // Kiểm tra xem có payment nào đã thay đổi trạng thái (không phải PendingCalculation)
      const hasChangedStatus = paymentsData.some((p: ClientContractPayment) => 
        p.status !== 'PendingCalculation'
      );

      // Kiểm tra xem tất cả payments đều ở trạng thái cuối cùng và tiến độ 100%
      const allFinalStatus = paymentsData.every((p: ClientContractPayment) => 
        p.status === finalStatus
      );
      const all100Percent = paymentsData.every((p: ClientContractPayment) => {
        const current = stageOrder[p.status] ?? 0;
        const percent = current > 0 ? Math.round((current / maxStage) * 100) : 0;
        return percent === 100;
      });

      // Xác định trạng thái mới cho period
      let newStatus = currentStatus;
      
      if (allFinalStatus && all100Percent) {
        // Tất cả payments đều ở trạng thái cuối cùng và tiến độ 100%
        newStatus = 'Closed';
      } else if (hasChangedStatus && currentStatus === 'Open') {
        // Có ít nhất một payment đã thay đổi trạng thái và period đang là Open
        newStatus = 'Processing';
      }

      // Cập nhật period nếu trạng thái thay đổi
      if (newStatus !== currentStatus) {
        await clientPaymentPeriodService.update(periodId, {
          clientCompanyId: period.clientCompanyId,
          periodMonth: period.periodMonth,
          periodYear: period.periodYear,
          status: newStatus
        });

        // Reload periods để cập nhật UI
        if (selectedCompanyId) {
          const updatedPeriods = await clientPaymentPeriodService.getAll({ 
            clientCompanyId: selectedCompanyId, 
            excludeDeleted: true 
          });
          setPeriods(updatedPeriods?.items ?? updatedPeriods ?? []);
        }
      }
    } catch (err) {
      console.error('Error updating period status:', err);
    }
  };

  // Kiểm tra và tự động chuyển Invoiced → Overdue nếu quá 30 ngày (Background Job CheckAndNotifyOverdueInvoices)
  const checkAndUpdateOverdue = async () => {
    if (!activePeriodId) return;

    try {
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];
      
      const now = new Date();

      // Lọc các payment cần cập nhật: Status == Invoiced VÀ InvoiceDate + 30 ngày < Today VÀ PaymentDate == null
      const overduePayments = paymentsData.filter((p: ClientContractPayment) => {
        if (p.status !== 'Invoiced' || !p.invoiceDate || p.paymentDate !== null) return false;
        const invoiceDate = new Date(p.invoiceDate);
        const invoiceDatePlus30 = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        return invoiceDatePlus30 < now;
      });

      // Cập nhật các payment quá hạn và gửi thông báo
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

          // Gửi thông báo cho accountant và manager
          try {
            const [accountantUserIds, managerUserIds] = await Promise.all([
              getUserIdByRole('AccountantStaff'),
              getUserIdByRole('Manager')
            ]);
            const allUserIds = [...accountantUserIds, ...managerUserIds];
            
            if (allUserIds.length > 0) {
              const contract = contractsMap.get(payment.clientContractId);
              await notificationService.create({
                title: "Hóa đơn quá hạn thanh toán",
                message: `Hóa đơn ${payment.invoiceNumber || payment.id} của hợp đồng ${contract?.contractNumber || payment.clientContractId} đã quá hạn 30 ngày. Vui lòng xử lý.`,
                type: NotificationType.PaymentOverdue,
                priority: NotificationPriority.High,
                userIds: allUserIds,
                entityType: "ClientContractPayment",
                entityId: payment.id,
                actionUrl: `/accountant/payment-periods/clients`
              });
            }
          } catch (notifError) {
            console.error("Error sending notification:", notifError);
          }
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
        
        // Cập nhật trạng thái period
        await updatePeriodStatus(activePeriodId);
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

  // Logic filter companies
  const filteredCompanies = companies.filter(company => {
    // Filter theo status hợp đồng
    const companyContracts = allContracts.filter(c => c.clientCompanyId === company.id);
    const hasActiveContract = companyContracts.some(c => 
      c.status === 'Active' || c.status === 'Ongoing'
    );
    
    // Nếu showAllCompanies = false, chỉ hiển thị companies có hợp đồng Active/Ongoing
    if (!showAllCompanies && !hasActiveContract) {
      return false;
    }
    
    // Filter theo search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        (company.taxCode && company.taxCode.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ Thanh Toán Khách hàng</h1>
          <p className="text-neutral-600 mt-1">Chọn công ty để xem các kỳ thanh toán</p>
        </div>

        {/* Danh sách công ty */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách công ty có hợp đồng</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
              </div>
              {/* Filter checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllCompanies}
                  onChange={(e) => setShowAllCompanies(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Hiển thị tất cả công ty</span>
              </label>
            </div>
          </div>
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách công ty...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">
              {companies.length === 0 
                ? "Chưa có công ty nào có hợp đồng"
                : "Không tìm thấy công ty nào phù hợp"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCompanies.map(company => (
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedCompany?.name}
              </h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showClosedPeriods}
                    onChange={(e) => setShowClosedPeriods(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Hiển thị kỳ đã đóng</span>
                </label>
                <button
                  onClick={handleCreatePeriods}
                  disabled={creatingPeriods}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {creatingPeriods ? 'Đang tạo...' : 'Tạo kỳ thanh toán từ hợp đồng'}
                </button>
              </div>
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
                  .filter(period => showClosedPeriods || period.status !== 'Closed')
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
                          <td className="p-3">{formatVND(p.calculatedAmount)}</td>
                          <td className="p-3">{formatVND(p.invoicedAmount)}</td>
                          <td className="p-3">{formatVND(p.receivedAmount)}</td>
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
                              <Link
                                to={`/accountant/payment-periods/clients/${p.id}/detail`}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-2 transition-all whitespace-nowrap"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </Link>
                              <button
                                onClick={() => handleViewDocuments(p)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 transition-all whitespace-nowrap"
                              >
                                <FileText className="w-4 h-4" />
                                Tài liệu
                              </button>
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

        {/* Modal tính toán và tạo tài liệu */}
        {showCalculateModal && selectedPaymentForCalculate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tính toán và tạo tài liệu</h2>
                <button
                  onClick={handleCloseCalculateModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {calculateSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tính toán thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {calculateError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{calculateError}</p>
                </div>
              )}

              {createDocumentSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tạo tài liệu thành công!</p>
                </div>
              )}

              {createDocumentError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{createDocumentError}</p>
                </div>
              )}

              <form onSubmit={handleCalculateAndSubmit} className="space-y-6">
                {/* Thông tin tính toán */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tính toán</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ bill <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={calculateFormData.billableHours}
                        onChange={(e) => setCalculateFormData(prev => ({ ...prev, billableHours: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hợp đồng
                      </label>
                      <input
                        type="text"
                        value={contractsMap.get(selectedPaymentForCalculate.clientContractId)?.contractNumber || selectedPaymentForCalculate.clientContractId}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={calculateFormData.notes}
                      onChange={(e) => setCalculateFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      placeholder="Ghi chú tính toán"
                    />
                  </div>
                </div>

                {/* Tạo tài liệu (Worksheet) - Tùy chọn */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu (Worksheet) - Tùy chọn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại tài liệu
                      </label>
                      <select
                        name="documentTypeId"
                        value={documentFormData.documentTypeId}
                        onChange={handleDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        disabled={loadingDocumentTypes}
                      >
                        <option value="0">-- Chọn loại tài liệu (tùy chọn) --</option>
                        {documentTypesList.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <input
                        type="text"
                        name="source"
                        value={documentFormData.source}
                        onChange={handleDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Accountant"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                      {file ? (
                        <div className="flex flex-col items-center text-primary-700">
                          <FileUp className="w-8 h-8 mb-2" />
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <p className="text-sm text-gray-600 mt-1">Đang upload: {uploadProgress}%</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Xóa file
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                          <Upload className="w-12 h-12 mb-4" />
                          <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây (tùy chọn)</span>
                          <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={onFileChange}
                          />
                        </label>
                      )}
                    </div>
                    {file && !documentFormData.documentTypeId && (
                      <p className="text-sm text-amber-600 mt-1">⚠️ Vui lòng chọn loại tài liệu nếu muốn tạo tài liệu</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={documentFormData.description}
                      onChange={handleDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      placeholder="Mô tả tài liệu"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCalculateModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={calculating || (file !== null && !documentFormData.documentTypeId)}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {calculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4" />
                        {file && documentFormData.documentTypeId ? 'Tính toán và tạo tài liệu' : 'Tính toán và Submit'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal ghi nhận thanh toán */}
        {showRecordPaymentModal && selectedPaymentForRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ghi nhận thanh toán</h2>
                <button
                  onClick={handleCloseRecordPaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {statusUpdateSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Ghi nhận thanh toán thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {statusUpdateError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{statusUpdateError}</p>
                </div>
              )}

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractsMap.get(selectedPaymentForRecord.clientContractId)?.contractNumber || selectedPaymentForRecord.clientContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền hóa đơn
                    </label>
                    <input
                      type="text"
                      value={formatVND(selectedPaymentForRecord.invoicedAmount)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đã nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={paymentFormData.receivedAmount}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, receivedAmount: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày thanh toán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={paymentFormData.paymentDate}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Ghi chú về thanh toán"
                  />
                </div>

                {/* Form tạo tài liệu - Tùy chọn */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu (Receipt) - Tùy chọn</h3>
                  
                  {createRecordPaymentDocumentSuccess && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 font-medium">✅ Tạo tài liệu thành công!</p>
                    </div>
                  )}

                  {createRecordPaymentDocumentError && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-700 font-medium">{createRecordPaymentDocumentError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại tài liệu <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="documentTypeId"
                        value={recordPaymentDocumentFormData.documentTypeId}
                        onChange={handleRecordPaymentDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        disabled={loadingRecordPaymentDocumentTypes}
                      >
                        <option value="0">-- Chọn loại tài liệu (tùy chọn) --</option>
                        {recordPaymentDocumentTypesList.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <input
                        type="text"
                        name="source"
                        value={recordPaymentDocumentFormData.source}
                        onChange={handleRecordPaymentDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Accountant"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File
                    </label>
                    {recordPaymentFile && !recordPaymentDocumentFormData.documentTypeId && (
                      <p className="text-sm text-amber-600 mb-1">⚠️ Vui lòng chọn loại tài liệu nếu muốn tạo tài liệu</p>
                    )}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                      {recordPaymentFile ? (
                        <div className="flex flex-col items-center text-primary-700">
                          <FileUp className="w-8 h-8 mb-2" />
                          <p className="font-medium">{recordPaymentFile.name}</p>
                          <p className="text-sm text-gray-600">{(recordPaymentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          {recordPaymentUploadProgress > 0 && recordPaymentUploadProgress < 100 && (
                            <p className="text-sm text-gray-600 mt-1">Đang upload: {recordPaymentUploadProgress}%</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setRecordPaymentFile(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Xóa file
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                          <Upload className="w-12 h-12 mb-4" />
                          <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây (tùy chọn)</span>
                          <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={onRecordPaymentFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={recordPaymentDocumentFormData.description}
                      onChange={handleRecordPaymentDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      placeholder="Mô tả tài liệu"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseRecordPaymentModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus || (recordPaymentFile !== null && !recordPaymentDocumentFormData.documentTypeId)}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {recordPaymentFile && recordPaymentDocumentFormData.documentTypeId ? 'Ghi nhận thanh toán và tạo tài liệu' : 'Ghi nhận thanh toán'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
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

        {/* Modal tạo tài liệu độc lập */}
        {showCreateDocumentModal && selectedPaymentForCreateDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tạo tài liệu</h2>
                <button
                  onClick={handleCloseCreateDocumentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {createDocumentModalSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tạo tài liệu thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {createDocumentModalError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{createDocumentModalError}</p>
                </div>
              )}

              <form onSubmit={handleCreateDocumentModal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractsMap.get(selectedPaymentForCreateDocument.clientContractId)?.contractNumber || selectedPaymentForCreateDocument.clientContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại tài liệu <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="documentTypeId"
                      value={createDocumentModalFormData.documentTypeId}
                      onChange={handleCreateDocumentModalFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingCreateDocumentModalDocumentTypes}
                    >
                      <option value="0">-- Chọn loại tài liệu --</option>
                      {createDocumentModalDocumentTypesList.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.typeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      name="source"
                      value={createDocumentModalFormData.source}
                      onChange={handleCreateDocumentModalFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Accountant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                    {createDocumentModalFile ? (
                      <div className="flex flex-col items-center text-primary-700">
                        <FileUp className="w-8 h-8 mb-2" />
                        <p className="font-medium">{createDocumentModalFile.name}</p>
                        <p className="text-sm text-gray-600">{(createDocumentModalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {createDocumentModalUploadProgress > 0 && createDocumentModalUploadProgress < 100 && (
                          <p className="text-sm text-gray-600 mt-1">Đang upload: {createDocumentModalUploadProgress}%</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setCreateDocumentModalFile(null)}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Xóa file
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                        <Upload className="w-12 h-12 mb-4" />
                        <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây</span>
                        <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={onCreateDocumentModalFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={createDocumentModalFormData.description}
                    onChange={handleCreateDocumentModalFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Mô tả tài liệu"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCreateDocumentModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCreateDocumentModal || !createDocumentModalFile || !createDocumentModalFormData.documentTypeId}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingCreateDocumentModal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Tạo tài liệu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantClientPeriods;