import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { partnerPaymentPeriodService } from "../../../../services/PartnerPaymentPeriod";
import type { PartnerPaymentPeriod } from "../../../../services/PartnerPaymentPeriod";
import { partnerContractPaymentService } from "../../../../services/PartnerContractPayment";
import type { PartnerContractPayment } from "../../../../services/PartnerContractPayment";
import { partnerService, type Partner } from "../../../../services/Partner";
import { partnerContractService, type PartnerContract } from "../../../../services/PartnerContract";
import { talentService, type Talent } from "../../../../services/Talent";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/accountant_staff/SidebarItems";
import { Building2, Plus, Calendar, X, Save, Wallet, FileText, Download, Eye, Upload, FileUp, AlertCircle, Calculator, CheckCircle, Search } from "lucide-react";
import { partnerDocumentService, type PartnerDocument, type PartnerDocumentCreate } from "../../../../services/PartnerDocument";
import { documentTypeService, type DocumentType } from "../../../../services/DocumentType";
import { uploadFile } from "../../../../utils/firebaseStorage";
import { decodeJWT } from "../../../../services/Auth";
import { useAuth } from "../../../../contexts/AuthContext";
import { notificationService, NotificationType, NotificationPriority } from "../../../../services/Notification";
import { userService } from "../../../../services/User";
import { formatVND, getErrorMessage } from "../../../../utils/helpers";

const AccountantPartnerPeriods: React.FC = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [allContracts, setAllContracts] = useState<PartnerContract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllPartners, setShowAllPartners] = useState(false);
  
  const [periods, setPeriods] = useState<PartnerPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [creatingPeriods, setCreatingPeriods] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [showClosedPeriods, setShowClosedPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<PartnerContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');
  
  // Map contract ID to contract and talent ID to talent for display
  const [contractsMap, setContractsMap] = useState<Map<number, PartnerContract>>(new Map());
  const [talentsMap, setTalentsMap] = useState<Map<number, Talent>>(new Map());

  // Modal tạo payment
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contracts, setContracts] = useState<PartnerContract[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingTalents, setLoadingTalents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState<string | null>(null);
  const [createPaymentSuccess, setCreatePaymentSuccess] = useState(false);

  // Trạng thái cập nhật
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Modal ghi nhận đã chi trả
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
  const [selectedPaymentForMarkAsPaid, setSelectedPaymentForMarkAsPaid] = useState<PartnerContractPayment | null>(null);
  const [markAsPaidFormData, setMarkAsPaidFormData] = useState({
    paidAmount: 0,
    paymentDate: "",
    notes: ""
  });

  // Modal tạo tài liệu trong ghi nhận đã chi trả (Invoice và Receipt)
  const [markAsPaidDocumentTypesList, setMarkAsPaidDocumentTypesList] = useState<DocumentType[]>([]);
  const [loadingMarkAsPaidDocumentTypes, setLoadingMarkAsPaidDocumentTypes] = useState(false);
  const [createInvoiceDocumentError, setCreateInvoiceDocumentError] = useState<string | null>(null);
  const [createReceiptDocumentError, setCreateReceiptDocumentError] = useState<string | null>(null);
  const [createInvoiceDocumentSuccess, setCreateInvoiceDocumentSuccess] = useState(false);
  const [createReceiptDocumentSuccess, setCreateReceiptDocumentSuccess] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [invoiceUploadProgress, setInvoiceUploadProgress] = useState<number>(0);
  const [receiptUploadProgress, setReceiptUploadProgress] = useState<number>(0);
  const [invoiceDocumentFormData, setInvoiceDocumentFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "Accountant",
    referencedClientDocumentId: 0
  });
  const [receiptDocumentFormData, setReceiptDocumentFormData] = useState({
    documentTypeId: 0,
    fileName: "",
    filePath: "",
    description: "",
    source: "Accountant",
    referencedClientDocumentId: 0
  });

  // Tính toán (Calculate) - Modal
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedPaymentForCalculate, setSelectedPaymentForCalculate] = useState<PartnerContractPayment | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculateError, setCalculateError] = useState<string | null>(null);
  const [calculateSuccess, setCalculateSuccess] = useState(false);
  const [calculateFormData, setCalculateFormData] = useState({
    actualWorkHours: 0,
    otHours: 0,
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
    referencedClientDocumentId: 0
  });
  
  // Modal hiển thị tài liệu
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedPaymentForDocuments, setSelectedPaymentForDocuments] = useState<PartnerContractPayment | null>(null);
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());

  // Modal tạo tài liệu độc lập
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [selectedPaymentForCreateDocument, setSelectedPaymentForCreateDocument] = useState<PartnerContractPayment | null>(null);
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
    referencedClientDocumentId: 0
  });
  
  // Form data
  const [formData, setFormData] = useState({
    partnerPeriodId: 0,
    partnerContractId: 0,
    talentId: 0,
    actualWorkHours: 0,
    otHours: 0,
    calculatedAmount: 0,
    paidAmount: 0,
    paymentDate: "",
    status: "PendingCalculation",
    notes: ""
  });

  // Lấy danh sách đối tác có hợp đồng
  useEffect(() => {
    const loadPartners = async () => {
      setLoadingPartners(true);
      try {
        // Lấy tất cả hợp đồng
        const contracts = await partnerContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        setAllContracts(contractsData);
        
        // Tạo map contract ID -> contract
        const contractMap = new Map<number, PartnerContract>();
        contractsData.forEach((c: PartnerContract) => {
          contractMap.set(c.id, c);
        });
        setContractsMap(contractMap);
        
        // Lấy danh sách các talentId duy nhất từ contracts
        const talentIds = [...new Set(contractsData.map((c: PartnerContract) => c.talentId))];
        
        // Lấy thông tin các talent
        const talentsData = await talentService.getAll({ excludeDeleted: true });
        const allTalents = Array.isArray(talentsData) ? talentsData : (talentsData?.items || []);
        
        // Tạo map talent ID -> talent
        const talentMap = new Map<number, Talent>();
        allTalents.forEach((t: Talent) => {
          if (talentIds.includes(t.id)) {
            talentMap.set(t.id, t);
          }
        });
        setTalentsMap(talentMap);
        
        // Lấy danh sách các partnerId duy nhất
        const partnerIds = [...new Set(contractsData.map((c: PartnerContract) => c.partnerId))];
        
        // Lấy thông tin các đối tác từ danh sách tất cả partners
        const allPartners = await partnerService.getAll();
        const allPartnersData = allPartners?.items ?? allPartners ?? [];
        
        const partnersData = allPartnersData.filter((p: Partner) => partnerIds.includes(p.id));
        
        setPartners(partnersData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPartners(false);
      }
    };
    loadPartners();
  }, []);

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
  const handleViewDocuments = async (payment: PartnerContractPayment) => {
    setSelectedPaymentForDocuments(payment);
    setShowDocumentsModal(true);
    setLoadingDocuments(true);
    try {
      const data = await partnerDocumentService.getAll({
        partnerContractPaymentId: payment.id,
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
  const handleOpenCreateDocumentModal = async (payment: PartnerContractPayment) => {
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
      referencedClientDocumentId: 0
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
      referencedClientDocumentId: 0
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
      [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
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
      const path = `partner-documents/${selectedPaymentForCreateDocument.id}/${Date.now()}_${createDocumentModalFile.name}`;
      const downloadURL = await uploadFile(createDocumentModalFile, path, setCreateDocumentModalUploadProgress);

      // Tạo payload
      const payload: PartnerDocumentCreate = {
        partnerContractPaymentId: selectedPaymentForCreateDocument.id,
        documentTypeId: createDocumentModalFormData.documentTypeId,
        referencedClientDocumentId: createDocumentModalFormData.referencedClientDocumentId || null,
        fileName: createDocumentModalFile.name,
        filePath: downloadURL,
        uploadedByUserId,
        description: createDocumentModalFormData.description || null,
        source: createDocumentModalFormData.source || null
      };

      await partnerDocumentService.create(payload);
      setCreateDocumentModalSuccess(true);

      // Reload documents nếu đang mở modal xem tài liệu
      if (showDocumentsModal && selectedPaymentForDocuments?.id === selectedPaymentForCreateDocument.id) {
        try {
          const data = await partnerDocumentService.getAll({
            partnerContractPaymentId: selectedPaymentForCreateDocument.id,
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

  // Khi chọn đối tác, load các period của đối tác đó
  useEffect(() => {
    if (!selectedPartnerId) {
      setPeriods([]);
      return;
    }

    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await partnerPaymentPeriodService.getAll({ 
          partnerId: selectedPartnerId, 
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
  }, [selectedPartnerId]);

  // Hàm helper để tạo contract payment cho các period đã tồn tại khi hợp đồng được duyệt sau
  const createContractPaymentsForExistingPeriods = async () => {
    if (!selectedPartnerId) return 0;

    try {
      // Lấy tất cả các period hiện có
      const allPeriods = await partnerPaymentPeriodService.getAll({ 
        partnerId: selectedPartnerId, 
        excludeDeleted: true 
      });
      const allPeriodsData = allPeriods?.items ?? allPeriods ?? [];

      // Lấy tất cả hợp đồng của đối tác đang ở trạng thái Active hoặc Ongoing
      const contracts = await partnerContractService.getAll({ 
        partnerId: selectedPartnerId,
        excludeDeleted: true 
      });
      const contractsData = contracts?.items ?? contracts ?? [];
      
      // Lọc các hợp đồng đang hiệu lực (Active hoặc Ongoing)
      const activeContracts = contractsData.filter((contract: PartnerContract) => 
        contract.status === 'Active' || contract.status === 'Ongoing'
      );

      if (activeContracts.length === 0) return 0;

      let createdPaymentsCount = 0;

      // Duyệt qua từng period
      for (const period of allPeriodsData) {
        const periodYear = period.periodYear;
        const periodMonth = period.periodMonth;

        // Lấy tất cả contract payment hiện có của period này
        const existingPayments = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: period.id, 
          excludeDeleted: true 
        });
        const existingPaymentsData = existingPayments?.items ?? existingPayments ?? [];
        const existingContractIds = new Set(
          existingPaymentsData.map((p: PartnerContractPayment) => p.partnerContractId)
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
              await partnerContractPaymentService.create({
                partnerPeriodId: period.id,
                partnerContractId: contract.id,
                talentId: contract.talentId,
                actualWorkHours: 0,
                otHours: null,
                calculatedAmount: null,
                paidAmount: null,
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
    if (!selectedPartnerId) return;

    setCreatingPeriods(true);
    setCreateMessage(null); // Xóa thông báo cũ
    try {
      // Lấy tất cả hợp đồng của đối tác
      const contracts = await partnerContractService.getAll({ 
        partnerId: selectedPartnerId,
        excludeDeleted: true 
      });
      const contractsData = contracts?.items ?? contracts ?? [];

      // Lấy các period hiện có để tránh trùng lặp
      const existingPeriods = await partnerPaymentPeriodService.getAll({ 
        partnerId: selectedPartnerId, 
        excludeDeleted: true 
      });
      const existingPeriodsData = existingPeriods?.items ?? existingPeriods ?? [];
      
      // Tạo Set để kiểm tra period đã tồn tại (key: "year-month")
      const existingPeriodSet = new Set<string>();
      existingPeriodsData.forEach((p: PartnerPaymentPeriod) => {
        existingPeriodSet.add(`${p.periodYear}-${p.periodMonth}`);
      });

      // Tính toán các tháng mà hợp đồng hiệu lực
      const activeMonths = new Set<string>(); // key: "year-month"
      
      contractsData.forEach((contract: PartnerContract) => {
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
              return await partnerPaymentPeriodService.create({
                partnerId: selectedPartnerId,
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
      const updatedPeriods = await partnerPaymentPeriodService.getAll({ 
        partnerId: selectedPartnerId, 
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

  // Kiểm tra và cập nhật Cancelled cho các payment của contract terminated (chưa Paid)
  const checkAndUpdateCancelled = async () => {
    if (!activePeriodId) return;

    try {
      // Lấy tất cả contracts để check status
      const contractsData = await partnerContractService.getAll({ excludeDeleted: true });
      const contracts = Array.isArray(contractsData) ? contractsData : (contractsData?.items || []);
      const terminatedContractIds = new Set(
        contracts
          .filter((c: PartnerContract) => c.status === 'Terminated')
          .map((c: PartnerContract) => c.id)
      );

      if (terminatedContractIds.size === 0) return; // Không có contract nào bị terminated

      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];

      // Lọc các payment cần cập nhật: thuộc contract terminated VÀ chưa Paid
      const cancelledPayments = paymentsData.filter((p: PartnerContractPayment) => {
        if (!terminatedContractIds.has(p.partnerContractId)) return false;
        // Chưa Paid và chưa Cancelled
        return p.status !== 'Paid' && p.status !== 'Cancelled';
      });

      // Cập nhật các payment thành Cancelled
      for (const payment of cancelledPayments) {
        try {
          await partnerContractPaymentService.update(payment.id, {
            partnerPeriodId: payment.partnerPeriodId,
            partnerContractId: payment.partnerContractId,
            talentId: payment.talentId,
            actualWorkHours: payment.actualWorkHours,
            otHours: payment.otHours ?? null,
            calculatedAmount: payment.calculatedAmount ?? null,
            paidAmount: payment.paidAmount ?? null,
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
        const updatedData = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
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
      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: periodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);
      
      // Kiểm tra và cập nhật Cancelled sau khi load
      setTimeout(() => checkAndUpdateCancelled(), 500);
      
      // Cập nhật trạng thái period
      await updatePeriodStatus(periodId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load contracts và talents khi mở modal
  const handleOpenCreateModal = async () => {
    if (!selectedPartnerId) return;
    setShowCreateModal(true);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);
    setFormData({
      partnerPeriodId: activePeriodId || 0,
      partnerContractId: 0,
      talentId: 0,
      actualWorkHours: 0,
      otHours: 0,
      calculatedAmount: 0,
      paidAmount: 0,
      paymentDate: "",
      status: "PendingCalculation",
      notes: ""
    });

    // Load contracts và talents của đối tác
    setLoadingContracts(true);
    setLoadingTalents(true);
    try {
      const [contractsData, talentsData] = await Promise.all([
        partnerContractService.getAll({ 
          partnerId: selectedPartnerId,
          excludeDeleted: true 
        }),
        talentService.getAll({ excludeDeleted: true })
      ]);
      setContracts(contractsData?.items ?? contractsData ?? []);
      setTalents(talentsData?.items ?? talentsData ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContracts(false);
      setLoadingTalents(false);
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
      [name]: name === 'partnerPeriodId' || name === 'partnerContractId' || name === 'talentId' 
        || name === 'actualWorkHours' || name === 'otHours' 
        || name === 'calculatedAmount' || name === 'paidAmount'
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
        partnerPeriodId: activePeriodId,
        partnerContractId: formData.partnerContractId,
        talentId: formData.talentId,
        actualWorkHours: formData.actualWorkHours,
        otHours: formData.otHours || null,
        calculatedAmount: formData.calculatedAmount || null,
        paidAmount: formData.paidAmount || null,
        paymentDate: formData.paymentDate || null,
        status: 'PendingCalculation', // Luôn là PendingCalculation khi tạo mới
        notes: formData.notes || null
      };

      await partnerContractPaymentService.create(payload);
      setCreatePaymentSuccess(true);

      // Reload payments
      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: activePeriodId, 
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
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo thanh toán';
      setCreatePaymentError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm cập nhật trạng thái period dựa trên payments
  const updatePeriodStatus = async (periodId: number) => {
    try {
      // Lấy tất cả payments của period
      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: periodId, 
        excludeDeleted: true 
      });
      const paymentsData = data?.items ?? data ?? [];
      
      if (paymentsData.length === 0) {
        // Nếu không có payment nào, giữ nguyên trạng thái hiện tại
        return;
      }

      // Lấy thông tin period hiện tại
      const period = await partnerPaymentPeriodService.getById(periodId);
      const currentStatus = period.status;

      // Xác định trạng thái cuối cùng và tiến độ
      const stageOrder: Record<string, number> = {
        PendingCalculation: 1,
        PendingApproval: 2,
        Rejected: 0,
        Approved: 3,
        Paid: 4,
      };
      const maxStage = 4;
      const finalStatus = 'Paid'; // Trạng thái cuối cùng

      // Kiểm tra xem có payment nào đã thay đổi trạng thái (không phải PendingCalculation)
      const hasChangedStatus = paymentsData.some((p: PartnerContractPayment) => 
        p.status !== 'PendingCalculation'
      );

      // Kiểm tra xem tất cả payments đều ở trạng thái cuối cùng và tiến độ 100%
      const allFinalStatus = paymentsData.every((p: PartnerContractPayment) => 
        p.status === finalStatus
      );
      const all100Percent = paymentsData.every((p: PartnerContractPayment) => {
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
        await partnerPaymentPeriodService.update(periodId, {
          partnerId: period.partnerId,
          periodMonth: period.periodMonth,
          periodYear: period.periodYear,
          status: newStatus
        });

        // Reload periods để cập nhật UI
        if (selectedPartnerId) {
          const updatedPeriods = await partnerPaymentPeriodService.getAll({ 
            partnerId: selectedPartnerId, 
            excludeDeleted: true 
          });
          setPeriods(updatedPeriods?.items ?? updatedPeriods ?? []);
        }
      }
    } catch (err) {
      console.error('Error updating period status:', err);
    }
  };

  // Hàm mở modal tính toán
  const handleOpenCalculateModal = async (payment: PartnerContractPayment) => {
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
      actualWorkHours: payment.actualWorkHours || 0,
      otHours: payment.otHours || 0,
      notes: payment.notes || ""
    });
    // Load document types và tìm Acceptant trước
    setLoadingDocumentTypes(true);
    try {
      const typesData = await documentTypeService.getAll({ excludeDeleted: true });
      const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
      setDocumentTypesList(types);
      
      // Tìm và set Acceptant làm mặc định (tìm theo nhiều cách)
      const acceptantType = types.find((t: DocumentType) => {
        const name = t.typeName.toLowerCase().trim();
        return name === 'acceptant' || 
               name === 'acceptance' || 
               name.includes('acceptant') ||
               name.includes('acceptance');
      });
      
      // Set documentFormData với Acceptant đã được tìm thấy
      setDocumentFormData({
        documentTypeId: acceptantType ? acceptantType.id : 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
      
      if (!acceptantType) {
        // Nếu không tìm thấy, log để debug
        console.warn("Không tìm thấy document type 'Acceptant'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
      }
    } catch (e) {
      console.error("Error loading document types:", e);
      // Nếu có lỗi, vẫn set form data với documentTypeId = 0
      setDocumentFormData({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
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
      actualWorkHours: 0,
      otHours: 0,
      notes: ""
    });
    setDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedClientDocumentId: 0
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
      [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
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
          const path = `partner-documents/${selectedPaymentForCalculate.id}/${Date.now()}_${file.name}`;
          const downloadURL = await uploadFile(file, path, setUploadProgress);

          // Tạo payload
          const payload: PartnerDocumentCreate = {
            partnerContractPaymentId: selectedPaymentForCalculate.id,
            documentTypeId: documentFormData.documentTypeId,
            referencedClientDocumentId: documentFormData.referencedClientDocumentId || null,
            fileName: file.name,
            filePath: downloadURL,
            uploadedByUserId,
            description: documentFormData.description || null,
            source: documentFormData.source || null
          };

          await partnerDocumentService.create(payload);
          setCreateDocumentSuccess(true);
        } catch (docErr: unknown) {
          setCreateDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu');
          throw docErr; // Dừng lại nếu không tạo được tài liệu
        }
      }

      // Bước 2: Tính toán và submit
      await partnerContractPaymentService.calculateAndSubmit(
        selectedPaymentForCalculate.id,
        {
          actualWorkHours: calculateFormData.actualWorkHours,
          otHours: calculateFormData.otHours || null,
          notes: calculateFormData.notes || null
        }
      );
      
      // Gửi thông báo cho manager
      try {
        const managerUserIds = await getUserIdByRole('Manager');
        if (managerUserIds.length > 0) {
          const contract = contractsMap.get(selectedPaymentForCalculate.partnerContractId);
          const talent = talentsMap.get(selectedPaymentForCalculate.talentId);
          await notificationService.create({
            title: "Thanh toán hợp đồng đối tác chờ duyệt",
            message: `Thanh toán hợp đồng ${contract?.contractNumber || selectedPaymentForCalculate.partnerContractId} - ${talent?.fullName || selectedPaymentForCalculate.talentId} đã được tính toán và submit. Vui lòng duyệt.`,
            type: NotificationType.PaymentDueSoon,
            priority: NotificationPriority.Medium,
            userIds: managerUserIds,
            entityType: "PartnerContractPayment",
            entityId: selectedPaymentForCalculate.id,
            actionUrl: `/manager/payment-periods/partners`
          });
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Không throw error để không ảnh hưởng đến flow chính
      }
      
      setCalculateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
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
      setCalculateError(error.response?.data?.message || error.message || 'Không thể tính toán và submit');
    } finally {
      setCalculating(false);
    }
  };

  // Hàm mở modal ghi nhận đã chi trả
  const handleOpenMarkAsPaidModal = async (payment: PartnerContractPayment) => {
    setSelectedPaymentForMarkAsPaid(payment);
    setShowMarkAsPaidModal(true);
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
    setMarkAsPaidFormData({
      paidAmount: payment.paidAmount || payment.calculatedAmount || 0,
      paymentDate: currentDateTime, // Thời gian thực theo giờ Việt Nam
      notes: payment.notes || ""
    });
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateInvoiceDocumentError(null);
    setCreateReceiptDocumentError(null);
    setCreateInvoiceDocumentSuccess(false);
    setCreateReceiptDocumentSuccess(false);
    setInvoiceFile(null);
    setReceiptFile(null);
    setInvoiceUploadProgress(0);
    setReceiptUploadProgress(0);
    setInvoiceDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedClientDocumentId: 0
    });
    setReceiptDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedClientDocumentId: 0
    });

    // Load document types và tìm Invoice và Receipt
    setLoadingMarkAsPaidDocumentTypes(true);
    try {
      const typesData = await documentTypeService.getAll({ excludeDeleted: true });
      const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
      setMarkAsPaidDocumentTypesList(types);
      
      // Tìm và set Invoice và Receipt làm mặc định
      const invoiceType = types.find((t: DocumentType) => {
        const name = t.typeName.toLowerCase().trim();
        return name === 'invoice' || name.includes('invoice');
      });
      
      const receiptType = types.find((t: DocumentType) => {
        const name = t.typeName.toLowerCase().trim();
        return name === 'receipt' || name.includes('receipt');
      });
      
      // Set documentFormData với Invoice và Receipt đã được tìm thấy
      setInvoiceDocumentFormData({
        documentTypeId: invoiceType ? invoiceType.id : 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
      
      setReceiptDocumentFormData({
        documentTypeId: receiptType ? receiptType.id : 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
      
      if (!invoiceType || !receiptType) {
        console.warn("Không tìm thấy document type 'Invoice' hoặc 'Receipt'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
      }
    } catch (e) {
      console.error("Error loading document types:", e);
      setInvoiceDocumentFormData({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
      setReceiptDocumentFormData({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: 0
      });
    } finally {
      setLoadingMarkAsPaidDocumentTypes(false);
    }
  };

  // Hàm đóng modal ghi nhận đã chi trả
  const handleCloseMarkAsPaidModal = () => {
    setShowMarkAsPaidModal(false);
    setSelectedPaymentForMarkAsPaid(null);
    setMarkAsPaidFormData({
      paidAmount: 0,
      paymentDate: "",
      notes: ""
    });
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateInvoiceDocumentError(null);
    setCreateReceiptDocumentError(null);
    setCreateInvoiceDocumentSuccess(false);
    setCreateReceiptDocumentSuccess(false);
    setInvoiceFile(null);
    setReceiptFile(null);
    setInvoiceUploadProgress(0);
    setReceiptUploadProgress(0);
    setInvoiceDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedClientDocumentId: 0
    });
    setReceiptDocumentFormData({
      documentTypeId: 0,
      fileName: "",
      filePath: "",
      description: "",
      source: "Accountant",
      referencedClientDocumentId: 0
    });
  };

  // Hàm xử lý file upload cho Invoice
  const onInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateInvoiceDocumentError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateInvoiceDocumentError(null);
    setInvoiceFile(f);
    if (f) {
      setInvoiceDocumentFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  // Hàm xử lý file upload cho Receipt
  const onReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setCreateReceiptDocumentError("File quá lớn (tối đa 10MB)");
      return;
    }
    setCreateReceiptDocumentError(null);
    setReceiptFile(f);
    if (f) {
      setReceiptDocumentFormData(prev => ({ ...prev, fileName: f.name }));
    }
  };

  // Hàm xử lý thay đổi form document cho Invoice
  const handleInvoiceDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceDocumentFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  // Hàm xử lý thay đổi form document cho Receipt
  const handleReceiptDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReceiptDocumentFormData(prev => ({
      ...prev,
      [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };


  // Hàm ghi nhận đã chi trả (Paid) - Accountant
  const handleMarkAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForMarkAsPaid) return;

    // Kiểm tra bắt buộc phải có cả Invoice và Receipt
    if (!invoiceFile || !invoiceDocumentFormData.documentTypeId) {
      setStatusUpdateError("Vui lòng upload file Invoice");
      return;
    }
    if (!receiptFile || !receiptDocumentFormData.documentTypeId) {
      setStatusUpdateError("Vui lòng upload file Receipt");
      return;
    }

    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    setCreateInvoiceDocumentError(null);
    setCreateReceiptDocumentError(null);
    setCreateInvoiceDocumentSuccess(false);
    setCreateReceiptDocumentSuccess(false);
    setCreateInvoiceDocumentError(null);
    setCreateReceiptDocumentError(null);
    setCreateInvoiceDocumentSuccess(false);
    setCreateReceiptDocumentSuccess(false);

    try {
      // Lấy userId từ token hoặc user context (dùng chung cho cả 2 document)
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

      // Bước 1: Tạo document Invoice
      try {
        const path = `partner-documents/${selectedPaymentForMarkAsPaid.id}/${Date.now()}_invoice_${invoiceFile.name}`;
        const downloadURL = await uploadFile(invoiceFile, path, setInvoiceUploadProgress);

        const payload: PartnerDocumentCreate = {
          partnerContractPaymentId: selectedPaymentForMarkAsPaid.id,
          documentTypeId: invoiceDocumentFormData.documentTypeId,
          referencedClientDocumentId: invoiceDocumentFormData.referencedClientDocumentId || null,
          fileName: invoiceFile.name,
          filePath: downloadURL,
          uploadedByUserId,
          description: invoiceDocumentFormData.description || null,
          source: invoiceDocumentFormData.source || null
        };

        await partnerDocumentService.create(payload);
        setCreateInvoiceDocumentSuccess(true);
      } catch (docErr: unknown) {
        setCreateInvoiceDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Invoice');
        throw docErr;
      }

      // Bước 2: Tạo document Receipt
      try {
        const path = `partner-documents/${selectedPaymentForMarkAsPaid.id}/${Date.now()}_receipt_${receiptFile.name}`;
        const downloadURL = await uploadFile(receiptFile, path, setReceiptUploadProgress);

        const payload: PartnerDocumentCreate = {
          partnerContractPaymentId: selectedPaymentForMarkAsPaid.id,
          documentTypeId: receiptDocumentFormData.documentTypeId,
          referencedClientDocumentId: receiptDocumentFormData.referencedClientDocumentId || null,
          fileName: receiptFile.name,
          filePath: downloadURL,
          uploadedByUserId,
          description: receiptDocumentFormData.description || null,
          source: receiptDocumentFormData.source || null
        };

        await partnerDocumentService.create(payload);
        setCreateReceiptDocumentSuccess(true);
      } catch (docErr: unknown) {
        setCreateReceiptDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Receipt');
        throw docErr;
      }

      // Bước 3: Mark as paid
      const paymentDateISO = new Date(markAsPaidFormData.paymentDate).toISOString();
      await partnerContractPaymentService.markAsPaid(selectedPaymentForMarkAsPaid.id, {
        paidAmount: markAsPaidFormData.paidAmount,
        paymentDate: paymentDateISO,
        notes: markAsPaidFormData.notes || null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
        
        // Cập nhật trạng thái period
        await updatePeriodStatus(activePeriodId);
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseMarkAsPaidModal();
        setStatusUpdateSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setStatusUpdateError(error.response?.data?.message || error.message || 'Không thể ghi nhận đã chi trả');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mapping tiến trình theo status
  const stageOrder: Record<string, number> = {
    PendingCalculation: 1,
    PendingApproval: 2,
    Rejected: 0,
    Approved: 3,
    Paid: 4,
  };

  const maxStage = 4;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingCalculation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PendingApproval':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
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
      case 'PendingApproval':
        return 'Chờ duyệt';
      case 'Rejected':
        return 'Từ chối';
      case 'Approved':
        return 'Đã duyệt';
      case 'Paid':
        return 'Đã chi trả';
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

  // Logic filter partners
  const filteredPartners = partners.filter(partner => {
    // Filter theo status hợp đồng
    const partnerContracts = allContracts.filter(c => c.partnerId === partner.id);
    const hasActiveContract = partnerContracts.some(c => 
      c.status === 'Active' || c.status === 'Ongoing'
    );
    
    // Nếu showAllPartners = false, chỉ hiển thị partners có hợp đồng Active/Ongoing
    if (!showAllPartners && !hasActiveContract) {
      return false;
    }
    
    // Filter theo search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        partner.companyName.toLowerCase().includes(searchLower) ||
        (partner.taxCode && partner.taxCode.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ Thanh Toán Nhân Sự</h1>
          <p className="text-neutral-600 mt-1">Chọn nhân sự để xem các kỳ thanh toán</p>
        </div>

        {/* Danh sách đối tác */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách nhân sự có hợp đồng</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đối tác..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
              </div>
              {/* Filter checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllPartners}
                  onChange={(e) => setShowAllPartners(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Hiển thị tất cả đối tác</span>
              </label>
            </div>
          </div>
          {loadingPartners ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách nhân sự...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">
              {partners.length === 0 
                ? "Chưa có nhân sự nào có hợp đồng"
                : "Không tìm thấy đối tác nào phù hợp"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPartners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => {
                    setSelectedPartnerId(partner.id);
                    setActivePeriodId(null);
                    setPayments([]);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPartnerId === partner.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      selectedPartnerId === partner.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedPartnerId === partner.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {partner.companyName}
                      </div>
                      {partner.taxCode && (
                        <div className="text-xs text-gray-500 mt-1">Mã số thuế: {partner.taxCode}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách kỳ thanh toán */}
        {selectedPartnerId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedPartner?.companyName}
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
        {selectedPartnerId && (
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
            {statusUpdateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                Cập nhật trạng thái thành công!
              </div>
            )}
            {statusUpdateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {statusUpdateError}
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
                      <th className="p-3 border-b text-left whitespace-nowrap">ID</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Hợp đồng</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Nhân sự</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Giờ thực tế</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">OT</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Tính toán</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Đã chi</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Trạng thái</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Tiến độ</th>
                      <th className="p-3 border-b text-left whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(p => {
                      const contract = contractsMap.get(p.partnerContractId);
                      const talent = talentsMap.get(p.talentId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3 whitespace-nowrap">{p.id}</td>
                          <td className="p-3">
                            {contract ? (
                              <Link
                                to={`/accountant/contracts/partners/${p.partnerContractId}`}
                                className="text-primary-600 hover:text-primary-800 hover:underline font-medium transition-colors whitespace-nowrap"
                              >
                                {contract.contractNumber || p.partnerContractId}
                              </Link>
                            ) : (
                              <span className="whitespace-nowrap">{p.partnerContractId}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="whitespace-nowrap">{talent?.fullName || p.talentId}</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">{p.actualWorkHours}</td>
                          <td className="p-3 whitespace-nowrap">{p.otHours ?? "-"}</td>
                          <td className="p-3 whitespace-nowrap">{formatVND(p.calculatedAmount)}</td>
                          <td className="p-3 whitespace-nowrap">{formatVND(p.paidAmount)}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
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
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/accountant/payment-periods/partners/${p.id}/detail`}
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
                        Giờ làm việc thực tế <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={calculateFormData.actualWorkHours}
                        onChange={(e) => setCalculateFormData(prev => ({ ...prev, actualWorkHours: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ OT
                      </label>
                      <input
                        type="number"
                        value={calculateFormData.otHours}
                        onChange={(e) => setCalculateFormData(prev => ({ ...prev, otHours: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hợp đồng
                      </label>
                      <input
                        type="text"
                        value={contractsMap.get(selectedPaymentForCalculate.partnerContractId)?.contractNumber || selectedPaymentForCalculate.partnerContractId}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                        readOnly
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhân sự
                      </label>
                      <input
                        type="text"
                        value={talentsMap.get(selectedPaymentForCalculate.talentId)?.fullName || selectedPaymentForCalculate.talentId}
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

                {/* Tạo tài liệu (Acceptant) - Tùy chọn */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu (Acceptant) - Tùy chọn</h3>
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

        {/* Modal ghi nhận đã chi trả */}
        {showMarkAsPaidModal && selectedPaymentForMarkAsPaid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ghi nhận đã chi trả</h2>
                <button
                  onClick={handleCloseMarkAsPaidModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {statusUpdateSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Ghi nhận đã chi trả thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {statusUpdateError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{statusUpdateError}</p>
                </div>
              )}

              {createInvoiceDocumentSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tạo tài liệu Invoice thành công!</p>
                </div>
              )}

              {createInvoiceDocumentError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{createInvoiceDocumentError}</p>
                </div>
              )}

              {createReceiptDocumentSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Tạo tài liệu Receipt thành công!</p>
                </div>
              )}

              {createReceiptDocumentError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{createReceiptDocumentError}</p>
                </div>
              )}

              <form onSubmit={handleMarkAsPaid} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractsMap.get(selectedPaymentForMarkAsPaid.partnerContractId)?.contractNumber || selectedPaymentForMarkAsPaid.partnerContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân sự
                    </label>
                    <input
                      type="text"
                      value={talentsMap.get(selectedPaymentForMarkAsPaid.talentId)?.fullName || selectedPaymentForMarkAsPaid.talentId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đã tính toán
                    </label>
                    <input
                      type="text"
                      value={formatVND(selectedPaymentForMarkAsPaid.calculatedAmount)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đã chi trả <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={markAsPaidFormData.paidAmount}
                      onChange={(e) => setMarkAsPaidFormData(prev => ({ ...prev, paidAmount: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày chi trả <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={markAsPaidFormData.paymentDate}
                      onChange={(e) => setMarkAsPaidFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
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
                    value={markAsPaidFormData.notes}
                    onChange={(e) => setMarkAsPaidFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Ghi chú về việc chi trả"
                  />
                </div>

                {/* Form tạo tài liệu Invoice */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu Invoice <span className="text-red-500">*</span></h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại tài liệu <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="documentTypeId"
                        value={invoiceDocumentFormData.documentTypeId}
                        onChange={handleInvoiceDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        required={!!invoiceFile}
                        disabled={loadingMarkAsPaidDocumentTypes}
                      >
                        <option value="0">-- Chọn loại tài liệu --</option>
                        {markAsPaidDocumentTypesList.map(type => (
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
                        value={invoiceDocumentFormData.source}
                        onChange={handleInvoiceDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Accountant"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Invoice <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                      {invoiceFile ? (
                        <div className="flex flex-col items-center text-primary-700">
                          <FileUp className="w-8 h-8 mb-2" />
                          <p className="font-medium">{invoiceFile.name}</p>
                          <p className="text-sm text-gray-600">{(invoiceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          {invoiceUploadProgress > 0 && invoiceUploadProgress < 100 && (
                            <p className="text-sm text-gray-600 mt-1">Đang upload: {invoiceUploadProgress}%</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setInvoiceFile(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Xóa file
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                          <Upload className="w-12 h-12 mb-4" />
                          <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file Invoice vào đây</span>
                          <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={onInvoiceFileChange}
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
                      value={invoiceDocumentFormData.description}
                      onChange={handleInvoiceDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      rows={2}
                      placeholder="Mô tả tài liệu Invoice"
                    />
                  </div>
                </div>

                {/* Form tạo tài liệu Receipt */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu Receipt <span className="text-red-500">*</span></h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại tài liệu <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="documentTypeId"
                        value={receiptDocumentFormData.documentTypeId}
                        onChange={handleReceiptDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        required={!!receiptFile}
                        disabled={loadingMarkAsPaidDocumentTypes}
                      >
                        <option value="0">-- Chọn loại tài liệu --</option>
                        {markAsPaidDocumentTypesList.map(type => (
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
                        value={receiptDocumentFormData.source}
                        onChange={handleReceiptDocumentFormChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Accountant"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Receipt <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                      {receiptFile ? (
                        <div className="flex flex-col items-center text-primary-700">
                          <FileUp className="w-8 h-8 mb-2" />
                          <p className="font-medium">{receiptFile.name}</p>
                          <p className="text-sm text-gray-600">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          {receiptUploadProgress > 0 && receiptUploadProgress < 100 && (
                            <p className="text-sm text-gray-600 mt-1">Đang upload: {receiptUploadProgress}%</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Xóa file
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                          <Upload className="w-12 h-12 mb-4" />
                          <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file Receipt vào đây</span>
                          <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={onReceiptFileChange}
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
                      value={receiptDocumentFormData.description}
                      onChange={handleReceiptDocumentFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      rows={2}
                      placeholder="Mô tả tài liệu Receipt"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseMarkAsPaidModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus || !invoiceFile || !receiptFile || !invoiceDocumentFormData.documentTypeId || !receiptDocumentFormData.documentTypeId}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Ghi nhận đã chi trả và tạo tài liệu
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
                      name="partnerContractId"
                      value={formData.partnerContractId}
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
                      Talent <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="talentId"
                      value={formData.talentId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingTalents}
                    >
                      <option value="0">-- Chọn talent --</option>
                      {talents.map(talent => (
                        <option key={talent.id} value={talent.id}>
                          {talent.fullName} - {talent.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ thực tế <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="actualWorkHours"
                      value={formData.actualWorkHours}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ OT
                    </label>
                    <input
                      type="number"
                      name="otHours"
                      value={formData.otHours}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
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
                      Số tiền đã chi
                    </label>
                    <input
                      type="number"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
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
                      name="status"
                      value={getStatusLabel(formData.status)}
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

      </div>

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
                    Hợp đồng: {contractsMap.get(selectedPaymentForDocuments.partnerContractId)?.contractNumber || selectedPaymentForDocuments.partnerContractId} | 
                    Nhân sự: {talentsMap.get(selectedPaymentForDocuments.talentId)?.fullName || selectedPaymentForDocuments.talentId}
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
                      value={contractsMap.get(selectedPaymentForCreateDocument.partnerContractId)?.contractNumber || selectedPaymentForCreateDocument.partnerContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân sự
                    </label>
                    <input
                      type="text"
                      value={talentsMap.get(selectedPaymentForCreateDocument.talentId)?.fullName || selectedPaymentForCreateDocument.talentId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div className="md:col-span-2">
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
  );
};

export default AccountantPartnerPeriods;