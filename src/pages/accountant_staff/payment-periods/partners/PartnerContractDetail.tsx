import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle, FileText, CreditCard, Download, Eye, Calculator, AlertCircle, X, Upload, FileUp } from 'lucide-react';
import Sidebar from '../../../../components/common/Sidebar';
import { sidebarItems } from '../../../../components/accountant_staff/SidebarItems';
import { partnerContractPaymentService, type PartnerContractPayment, type PartnerContractPaymentCalculateModel, type PartnerContractPaymentMarkAsPaidModel } from '../../../../services/PartnerContractPayment';
import { partnerContractService, type PartnerContract } from '../../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../../services/Partner';
import { partnerPaymentPeriodService, type PartnerPaymentPeriod } from '../../../../services/PartnerPaymentPeriod';
import { partnerDocumentService, type PartnerDocument, type PartnerDocumentCreate } from '../../../../services/PartnerDocument';
import { documentTypeService, type DocumentType } from '../../../../services/DocumentType';
import { talentService, type Talent } from '../../../../services/Talent';
import { uploadFile } from '../../../../utils/firebaseStorage';
import { decodeJWT } from '../../../../services/Auth';
import { useAuth } from '../../../../contexts/AuthContext';
import { getErrorMessage } from '../../../../utils/helpers';

export default function PartnerContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { user } = useAuth();
    const [payment, setPayment] = useState<PartnerContractPayment | null>(null);
    const [contract, setContract] = useState<PartnerContract | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [period, setPeriod] = useState<PartnerPaymentPeriod | null>(null);
    const [documents, setDocuments] = useState<PartnerDocument[]>([]);
    const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());
    const [talent, setTalent] = useState<Talent | null>(null);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal tính toán state
    const [showCalculateModal, setShowCalculateModal] = useState(false);
    const [calculateFormData, setCalculateFormData] = useState<PartnerContractPaymentCalculateModel>({
        actualWorkHours: 0,
        otHours: null,
        notes: null,
    });
    const [calculating, setCalculating] = useState(false);
    const [calculateError, setCalculateError] = useState<string | null>(null);
    const [calculateSuccess, setCalculateSuccess] = useState(false);
    
    // Document state cho tính toán (Acceptance - bắt buộc)
    const [acceptantFile, setAcceptantFile] = useState<File | null>(null);
    const [acceptantUploadProgress, setAcceptantUploadProgress] = useState(0);
    const [acceptantDocumentFormData, setAcceptantDocumentFormData] = useState<Partial<PartnerDocumentCreate>>({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: null,
    });
    const [acceptantDocumentTypesList, setAcceptantDocumentTypesList] = useState<DocumentType[]>([]);
    const [loadingAcceptantDocumentTypes, setLoadingAcceptantDocumentTypes] = useState(false);
    const [createAcceptantDocumentError, setCreateAcceptantDocumentError] = useState<string | null>(null);
    const [createAcceptantDocumentSuccess, setCreateAcceptantDocumentSuccess] = useState(false);

    // Modal đánh dấu đã thanh toán state
    const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
    const [markAsPaidFormData, setMarkAsPaidFormData] = useState<PartnerContractPaymentMarkAsPaidModel>({
        paidAmount: 0,
        paymentDate: '',
        notes: null,
    });
    const [markingAsPaid, setMarkingAsPaid] = useState(false);
    const [markAsPaidError, setMarkAsPaidError] = useState<string | null>(null);
    const [markAsPaidSuccess, setMarkAsPaidSuccess] = useState(false);
    
    // Document state cho đánh dấu đã thanh toán (Invoice và Receipt - bắt buộc)
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [invoiceUploadProgress, setInvoiceUploadProgress] = useState(0);
    const [invoiceDocumentFormData, setInvoiceDocumentFormData] = useState<Partial<PartnerDocumentCreate>>({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: null,
    });
    const [invoiceDocumentTypesList, setInvoiceDocumentTypesList] = useState<DocumentType[]>([]);
    const [loadingInvoiceDocumentTypes, setLoadingInvoiceDocumentTypes] = useState(false);
    const [createInvoiceDocumentError, setCreateInvoiceDocumentError] = useState<string | null>(null);
    const [createInvoiceDocumentSuccess, setCreateInvoiceDocumentSuccess] = useState(false);
    
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptUploadProgress, setReceiptUploadProgress] = useState(0);
    const [receiptDocumentFormData, setReceiptDocumentFormData] = useState<Partial<PartnerDocumentCreate>>({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedClientDocumentId: null,
    });
    const [receiptDocumentTypesList, setReceiptDocumentTypesList] = useState<DocumentType[]>([]);
    const [loadingReceiptDocumentTypes, setLoadingReceiptDocumentTypes] = useState(false);
    const [createReceiptDocumentError, setCreateReceiptDocumentError] = useState<string | null>(null);
    const [createReceiptDocumentSuccess, setCreateReceiptDocumentSuccess] = useState(false);

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
            } catch (err: unknown) {
                console.error("❌ Lỗi tải loại tài liệu:", err);
            }
        };
        loadDocumentTypes();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                setError('');
                
                // Fetch payment detail
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Fetch related data in parallel
                const [contractData, periodData] = await Promise.all([
                    partnerContractService.getById(paymentData.partnerContractId),
                    partnerPaymentPeriodService.getById(paymentData.partnerPeriodId)
                ]);
                
                setContract(contractData);
                setPeriod(periodData);
                
                // Fetch partner
                try {
                    const partnersData = await partnerService.getAll();
                    const partners = Array.isArray(partnersData) ? partnersData : (partnersData?.items || []);
                    const partnerData = partners.find((p: Partner) => p.id === contractData.partnerId);
                    if (partnerData) {
                        setPartner(partnerData);
                    }
                } catch (err) {
                    console.warn("⚠️ Không thể tải thông tin đối tác:", err);
                }

                // Fetch talent
                try {
                    if (contractData.talentId) {
                        const talentData = await talentService.getById(contractData.talentId);
                        setTalent(talentData);
                    }
                } catch (err) {
                    console.warn("⚠️ Không thể tải thông tin nhân sự:", err);
                }
            } catch (err: unknown) {
                const error = err as { message?: string };
                console.error('❌ Lỗi tải thông tin thanh toán:', err);
                setError(error?.message || 'Không thể tải thông tin thanh toán');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    // Load documents
    useEffect(() => {
        const loadDocuments = async () => {
            if (!payment?.id) return;
            
            try {
                setLoadingDocuments(true);
                const data = await partnerDocumentService.getAll({
                    partnerContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(data) ? data : (data?.items || []);
                setDocuments(docs);
            } catch (err: unknown) {
                console.error("❌ Lỗi tải tài liệu:", err);
            } finally {
                setLoadingDocuments(false);
            }
        };
        
        loadDocuments();
    }, [payment?.id]);

    const formatPeriod = (period: PartnerPaymentPeriod | null): string => {
        if (!period) return '—';
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        return `${monthNames[period.periodMonth - 1]} ${period.periodYear}`;
    };

    const formatDate = (value?: string | null): string => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return value;
        }
    };

    const getStatusColor = (status: string): string => {
        const statusMap: Record<string, string> = {
            'PendingCalculation': 'bg-yellow-50 text-yellow-800 border-yellow-200',
            'PendingApproval': 'bg-blue-50 text-blue-800 border-blue-200',
            'Approved': 'bg-green-50 text-green-800 border-green-200',
            'Paid': 'bg-purple-50 text-purple-800 border-purple-200',
            'Rejected': 'bg-red-50 text-red-800 border-red-200',
            'Cancelled': 'bg-gray-50 text-gray-800 border-gray-200',
        };
        return statusMap[status] || 'bg-gray-50 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: string): string => {
        const statusMap: Record<string, string> = {
            'PendingCalculation': 'Chờ tính toán',
            'PendingApproval': 'Chờ duyệt',
            'Approved': 'Đã duyệt',
            'Paid': 'Đã chi trả',
            'Rejected': 'Đã từ chối',
            'Cancelled': 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const formatVND = (value?: number | null): string => {
        if (value === null || value === undefined) return '—';
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };

    const groupDocumentsByType = (): Array<[string, PartnerDocument[]]> => {
        const groups: Record<string, PartnerDocument[]> = {
            'Sao kê / Ủy nhiệm chi': [],
            'Hóa đơn / Phiếu lương': [],
            'Timesheet gốc': [],
            'Khác': []
        };

        documents.forEach((doc) => {
            const docType = documentTypes.get(doc.documentTypeId);
            const typeName = docType?.typeName || '';
            const typeNameLower = typeName.toLowerCase();

            if (typeNameLower.includes('sao kê') || typeNameLower.includes('ủy nhiệm chi') || 
                typeNameLower.includes('uy nhiem chi') || typeNameLower.includes('bank statement') ||
                typeNameLower.includes('payment order')) {
                groups['Sao kê / Ủy nhiệm chi'].push(doc);
            } else if (typeNameLower.includes('hóa đơn') || typeNameLower.includes('hoa don') ||
                       typeNameLower.includes('phiếu lương') || typeNameLower.includes('phieu luong') ||
                       typeNameLower.includes('invoice') || typeNameLower.includes('payslip') ||
                       typeNameLower.includes('salary')) {
                groups['Hóa đơn / Phiếu lương'].push(doc);
            } else if (typeNameLower.includes('timesheet') || typeNameLower.includes('time sheet') ||
                       typeNameLower.includes('bảng chấm công') || typeNameLower.includes('bang cham cong')) {
                groups['Timesheet gốc'].push(doc);
            } else {
                groups['Khác'].push(doc);
            }
        });

        // Remove empty groups
        return Object.entries(groups).filter(([, docs]) => docs.length > 0);
    };

    // Hàm mở modal tính toán
    const handleOpenCalculateModal = async () => {
        if (!payment || (payment.status !== 'PendingCalculation' && payment.status !== 'Rejected')) return;

        setShowCalculateModal(true);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateAcceptantDocumentError(null);
        setCreateAcceptantDocumentSuccess(false);
        setAcceptantFile(null);
        setAcceptantUploadProgress(0);
        setCalculateFormData({
            actualWorkHours: payment.actualWorkHours || 0,
            otHours: payment.otHours || null,
            notes: payment.notes || null,
        });
        setAcceptantDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
        });

        // Load document types và tìm Acceptance
        setLoadingAcceptantDocumentTypes(true);
        try {
            const typesData = await documentTypeService.getAll({ excludeDeleted: true });
            const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
            setAcceptantDocumentTypesList(types);
            
            // Tìm và set Acceptance làm mặc định (bắt buộc)
            const acceptanceType = types.find((t: DocumentType) => {
                const name = t.typeName.toLowerCase().trim();
                return name === 'acceptance' || name.includes('acceptance') || name.includes('chấp nhận') || name.includes('chap nhan');
            });
            
            if (acceptanceType) {
                setAcceptantDocumentFormData(prev => ({ ...prev, documentTypeId: acceptanceType.id }));
            } else {
                console.warn("Không tìm thấy document type 'Acceptance'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
            }
        } catch (e) {
            console.error("Error loading document types:", e);
        } finally {
            setLoadingAcceptantDocumentTypes(false);
        }
    };

    // Hàm đóng modal tính toán
    const handleCloseCalculateModal = () => {
        setShowCalculateModal(false);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateAcceptantDocumentError(null);
        setCreateAcceptantDocumentSuccess(false);
        setAcceptantFile(null);
        setAcceptantUploadProgress(0);
        setCalculateFormData({
            actualWorkHours: 0,
            otHours: null,
            notes: null,
        });
        setAcceptantDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
        });
    };

    // Hàm xử lý file upload cho Acceptance
    const onAcceptantFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (f && f.size > 10 * 1024 * 1024) {
            setCreateAcceptantDocumentError("File quá lớn (tối đa 10MB)");
            return;
        }
        setCreateAcceptantDocumentError(null);
        setAcceptantFile(f);
        if (f) {
            setAcceptantDocumentFormData(prev => ({ ...prev, fileName: f.name }));
        }
    };

    // Hàm xử lý thay đổi form document cho Acceptance
    const handleAcceptantDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAcceptantDocumentFormData(prev => ({
            ...prev,
            [name]: name === 'documentTypeId' || name === 'referencedClientDocumentId'
                ? (value === '' ? 0 : Number(value))
                : value
        }));
    };

    // Hàm tính toán (bắt buộc phải có Acceptance document)
    const handleCalculateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        if (!calculateFormData.actualWorkHours || calculateFormData.actualWorkHours <= 0) {
            setCalculateError('Vui lòng nhập số giờ thực tế (bắt buộc)');
            return;
        }

        // Validate: Acceptance document là bắt buộc
        if (!acceptantFile || !acceptantDocumentFormData.documentTypeId) {
            setCreateAcceptantDocumentError("Vui lòng tải lên file Acceptance (bắt buộc)");
            return;
        }

        setCalculating(true);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateAcceptantDocumentError(null);
        setCreateAcceptantDocumentSuccess(false);

        try {
            // Bước 1: Tạo Acceptance document (bắt buộc)
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
                const path = `partner-documents/${payment.id}/${Date.now()}_${acceptantFile.name}`;
                const downloadURL = await uploadFile(acceptantFile, path, setAcceptantUploadProgress);

                // Tạo payload
                const payload: PartnerDocumentCreate = {
                    partnerContractPaymentId: payment.id,
                    documentTypeId: acceptantDocumentFormData.documentTypeId!,
                    referencedClientDocumentId: acceptantDocumentFormData.referencedClientDocumentId || null,
                    fileName: acceptantFile.name,
                    filePath: downloadURL,
                    uploadedByUserId,
                    description: acceptantDocumentFormData.description || null,
                    source: acceptantDocumentFormData.source || null
                };

                await partnerDocumentService.create(payload);
                setCreateAcceptantDocumentSuccess(true);
            } catch (docErr: unknown) {
                setCreateAcceptantDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Acceptance');
                throw docErr; // Dừng lại nếu không tạo được tài liệu
            }

            // Bước 2: Tính toán và submit
            await partnerContractPaymentService.calculateAndSubmit(payment.id, calculateFormData);
            
            setCalculateSuccess(true);

            // Reload payment data
            if (id) {
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Reload documents
                const docsData = await partnerDocumentService.getAll({
                    partnerContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(docsData) ? docsData : (docsData?.items || []);
                setDocuments(docs);
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

    // Hàm mở modal đánh dấu đã thanh toán
    const handleOpenMarkAsPaidModal = async () => {
        if (!payment || payment.status !== 'Approved') return;

        setShowMarkAsPaidModal(true);
        setMarkAsPaidError(null);
        setMarkAsPaidSuccess(false);
        setCreateInvoiceDocumentError(null);
        setCreateInvoiceDocumentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);
        setInvoiceFile(null);
        setInvoiceUploadProgress(0);
        setReceiptFile(null);
        setReceiptUploadProgress(0);
        setMarkAsPaidFormData({
            paidAmount: payment.calculatedAmount || 0,
            paymentDate: new Date().toISOString().split('T')[0],
            notes: payment.notes || null,
        });
        setInvoiceDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
        });
        setReceiptDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
        });

        // Load document types và tìm Invoice và Receipt
        setLoadingInvoiceDocumentTypes(true);
        setLoadingReceiptDocumentTypes(true);
        try {
            const typesData = await documentTypeService.getAll({ excludeDeleted: true });
            const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
            setInvoiceDocumentTypesList(types);
            setReceiptDocumentTypesList(types);
            
            // Tìm và set Invoice làm mặc định (bắt buộc)
            const invoiceType = types.find((t: DocumentType) => {
                const name = t.typeName.toLowerCase().trim();
                return name === 'invoice' || name.includes('invoice') || name.includes('hóa đơn') || name.includes('hoa don');
            });
            
            if (invoiceType) {
                setInvoiceDocumentFormData(prev => ({ ...prev, documentTypeId: invoiceType.id }));
            } else {
                console.warn("Không tìm thấy document type 'Invoice'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
            }

            // Tìm và set Receipt làm mặc định (bắt buộc)
            const receiptType = types.find((t: DocumentType) => {
                const name = t.typeName.toLowerCase().trim();
                return name === 'receipt' || name.includes('receipt') || name.includes('biên lai') || name.includes('bien lai');
            });
            
            if (receiptType) {
                setReceiptDocumentFormData(prev => ({ ...prev, documentTypeId: receiptType.id }));
            } else {
                console.warn("Không tìm thấy document type 'Receipt'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
            }
        } catch (e) {
            console.error("Error loading document types:", e);
        } finally {
            setLoadingInvoiceDocumentTypes(false);
            setLoadingReceiptDocumentTypes(false);
        }
    };

    // Hàm đóng modal đánh dấu đã thanh toán
    const handleCloseMarkAsPaidModal = () => {
        setShowMarkAsPaidModal(false);
        setMarkAsPaidError(null);
        setMarkAsPaidSuccess(false);
        setCreateInvoiceDocumentError(null);
        setCreateInvoiceDocumentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);
        setInvoiceFile(null);
        setInvoiceUploadProgress(0);
        setReceiptFile(null);
        setReceiptUploadProgress(0);
        setMarkAsPaidFormData({
            paidAmount: 0,
            paymentDate: '',
            notes: null,
        });
        setInvoiceDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
        });
        setReceiptDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedClientDocumentId: null,
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

    // Hàm đánh dấu đã thanh toán (bắt buộc phải có Invoice và Receipt documents)
    const handleMarkAsPaid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        if (!markAsPaidFormData.paidAmount || markAsPaidFormData.paidAmount <= 0) {
            setMarkAsPaidError('Vui lòng nhập số tiền đã chi trả (bắt buộc)');
            return;
        }

        if (!markAsPaidFormData.paymentDate) {
            setMarkAsPaidError('Vui lòng chọn ngày thanh toán (bắt buộc)');
            return;
        }

        // Validate: Invoice và Receipt documents là bắt buộc
        if (!invoiceFile || !invoiceDocumentFormData.documentTypeId) {
            setCreateInvoiceDocumentError("Vui lòng tải lên file Invoice (bắt buộc)");
            return;
        }

        if (!receiptFile || !receiptDocumentFormData.documentTypeId) {
            setCreateReceiptDocumentError("Vui lòng tải lên file Receipt (bắt buộc)");
            return;
        }

        setMarkingAsPaid(true);
        setMarkAsPaidError(null);
        setMarkAsPaidSuccess(false);
        setCreateInvoiceDocumentError(null);
        setCreateInvoiceDocumentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);

        try {
            // Lấy userId từ token hoặc user context (dùng chung cho cả 2 documents)
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

            // Bước 1: Tạo Invoice document (bắt buộc)
            try {
                // Upload file Invoice lên Firebase
                const invoicePath = `partner-documents/${payment.id}/${Date.now()}_invoice_${invoiceFile.name}`;
                const invoiceDownloadURL = await uploadFile(invoiceFile, invoicePath, setInvoiceUploadProgress);

                // Tạo payload Invoice
                const invoicePayload: PartnerDocumentCreate = {
                    partnerContractPaymentId: payment.id,
                    documentTypeId: invoiceDocumentFormData.documentTypeId!,
                    referencedClientDocumentId: invoiceDocumentFormData.referencedClientDocumentId || null,
                    fileName: invoiceFile.name,
                    filePath: invoiceDownloadURL,
                    uploadedByUserId,
                    description: invoiceDocumentFormData.description || null,
                    source: invoiceDocumentFormData.source || null
                };

                await partnerDocumentService.create(invoicePayload);
                setCreateInvoiceDocumentSuccess(true);
            } catch (docErr: unknown) {
                setCreateInvoiceDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Invoice');
                throw docErr; // Dừng lại nếu không tạo được tài liệu
            }

            // Bước 2: Tạo Receipt document (bắt buộc)
            try {
                // Upload file Receipt lên Firebase
                const receiptPath = `partner-documents/${payment.id}/${Date.now()}_receipt_${receiptFile.name}`;
                const receiptDownloadURL = await uploadFile(receiptFile, receiptPath, setReceiptUploadProgress);

                // Tạo payload Receipt
                const receiptPayload: PartnerDocumentCreate = {
                    partnerContractPaymentId: payment.id,
                    documentTypeId: receiptDocumentFormData.documentTypeId!,
                    referencedClientDocumentId: receiptDocumentFormData.referencedClientDocumentId || null,
                    fileName: receiptFile.name,
                    filePath: receiptDownloadURL,
                    uploadedByUserId,
                    description: receiptDocumentFormData.description || null,
                    source: receiptDocumentFormData.source || null
                };

                await partnerDocumentService.create(receiptPayload);
                setCreateReceiptDocumentSuccess(true);
            } catch (docErr: unknown) {
                setCreateReceiptDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Receipt');
                throw docErr; // Dừng lại nếu không tạo được tài liệu
            }

            // Bước 3: Đánh dấu đã thanh toán
            await partnerContractPaymentService.markAsPaid(payment.id, {
                paidAmount: markAsPaidFormData.paidAmount,
                paymentDate: new Date(markAsPaidFormData.paymentDate).toISOString(),
                notes: markAsPaidFormData.notes || null,
            });
            
            setMarkAsPaidSuccess(true);

            // Reload payment data
            if (id) {
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Reload documents
                const docsData = await partnerDocumentService.getAll({
                    partnerContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(docsData) ? docsData : (docsData?.items || []);
                setDocuments(docs);
            }

            // Đóng modal sau 2 giây
            setTimeout(() => {
                handleCloseMarkAsPaidModal();
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setMarkAsPaidError(error.response?.data?.message || error.message || 'Không thể đánh dấu đã thanh toán');
        } finally {
            setMarkingAsPaid(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Accountant Staff" />
                <div className="flex-1 p-8 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <span>Đang tải thông tin...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !payment || !contract) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Accountant Staff" />
                <div className="flex-1 p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <p className="text-red-700">{error || 'Không tìm thấy thông tin thanh toán'}</p>
                        <Link
                            to="/accountant/payment-periods/partners"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">Quay lại danh sách thanh toán</span>
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
                    <Link
                        to="/accountant/payment-periods/partners"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Quay lại danh sách thanh toán</span>
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi Tiết Thanh Toán Hợp Đồng Nhân Sự</h1>
                            <p className="text-neutral-600">Thông tin chi tiết về khoản thanh toán cho đối tác</p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3">
                            {/* Trạng thái */}
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                                {getStatusText(payment.status)}
                            </span>
                            {/* Nút thao tác */}
                            {(payment.status === 'PendingCalculation' || payment.status === 'Rejected') && (
                                <button
                                    onClick={handleOpenCalculateModal}
                                    className="px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                >
                                    <Calculator className="w-4 h-4" />
                                    Tính toán
                                </button>
                            )}
                            {payment.status === 'Approved' && (
                                <button
                                    onClick={handleOpenMarkAsPaidModal}
                                    className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Đã thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <CreditCard className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Thông Tin Thanh Toán</h2>
                                <p className="text-xs text-neutral-600">ID: #{payment.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Đối tác */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Đối tác</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {partner?.companyName || '—'}
                                </p>
                            </div>

                            {/* Hợp đồng */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Hợp đồng</label>
                                </div>
                                {contract ? (
                                    <Link
                                        to={`/accountant/contracts/partners/${contract.id}`}
                                        state={{ from: location.pathname }}
                                        className="text-base font-semibold text-primary-600 hover:text-primary-800 hover:underline transition-colors"
                                    >
                                        {contract.contractNumber || '—'}
                                    </Link>
                                ) : (
                                    <p className="text-base font-semibold text-gray-900">—</p>
                                )}
                            </div>

                            {/* Nhân sự */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Nhân sự</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {talent?.fullName || '—'}
                                </p>
                            </div>

                            {/* Kỳ thanh toán */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Kỳ thanh toán</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatPeriod(period)}
                                </p>
                            </div>

                            {/* Số giờ thực tế */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số giờ thực tế</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.actualWorkHours}h
                                </p>
                            </div>

                            {/* Số giờ OT */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số giờ OT</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.otHours ? `${payment.otHours}h` : '—'}
                                </p>
                            </div>

                            {/* Số tiền đã tính toán */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số tiền đã tính toán</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatVND(payment.calculatedAmount)}
                                </p>
                            </div>

                            {/* Số tiền đã chi trả */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số tiền đã chi trả</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatVND(payment.paidAmount)}
                                </p>
                            </div>

                            {/* Ngày thanh toán */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Ngày thanh toán</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatDate(payment.paymentDate)}
                                </p>
                            </div>

                        </div>

                        {/* Ghi chú */}
                        {payment.notes && (
                            <div className="mt-4 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Ghi chú</label>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{payment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chi tiết tiền */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in mt-6">
                    <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Chi Tiết Tiền</h2>
                                <p className="text-xs text-neutral-600">Phân tích chi tiết số tiền thanh toán</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Số giờ thực tế */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Số giờ thực tế</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {payment.actualWorkHours} giờ
                                    </p>
                                </div>
                            </div>

                            {/* Số giờ OT */}
                            {payment.otHours && (
                                <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-neutral-700">Số giờ OT</label>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-semibold text-gray-900">
                                            {payment.otHours} giờ
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Số tiền đã tính toán */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200 bg-primary-50 rounded-lg px-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-neutral-700">Số tiền đã tính toán</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary-700">
                                        {formatVND(payment.calculatedAmount)}
                                    </p>
                                </div>
                            </div>

                            {/* Số tiền đã chi trả */}
                            <div className="flex items-center justify-between py-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg px-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-base font-bold text-gray-900">Số tiền đã chi trả</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary-700">
                                        {formatVND(payment.paidAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File chứng từ */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in mt-6">
                    <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">File Chứng Từ</h2>
                                <p className="text-xs text-neutral-600">Các tài liệu liên quan đến thanh toán này</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loadingDocuments ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                <span className="ml-3 text-neutral-600">Đang tải file chứng từ...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-neutral-400" />
                                </div>
                                <p className="text-neutral-500 text-sm">Chưa có file chứng từ nào</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupDocumentsByType().map(([groupName, groupDocs]) => (
                                    <div key={groupName} className="space-y-3">
                                        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                                            <h3 className="text-sm font-semibold text-gray-900">{groupName}</h3>
                                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                                {groupDocs.length} {groupDocs.length === 1 ? 'file' : 'files'}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {groupDocs.map((doc) => {
                                                const docType = documentTypes.get(doc.documentTypeId);
                                                return (
                                                    <div
                                                        key={doc.id}
                                                        className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary-300 transition-all duration-300"
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                                                                    <FileText className="w-4 h-4 text-primary-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                                            {doc.fileName}
                                                                        </p>
                                                                        {docType && (
                                                                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                                                                {docType.typeName}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {doc.description && (
                                                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                                                            {doc.description}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-neutral-400 mt-1">
                                                                        {new Date(doc.uploadTimestamp).toLocaleDateString('vi-VN', {
                                                                            year: 'numeric',
                                                                            month: '2-digit',
                                                                            day: '2-digit',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <a
                                                                    href={doc.filePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Xem</span>
                                                                </a>
                                                                <a
                                                                    href={doc.filePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                    className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors whitespace-nowrap"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Tải xuống</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal tính toán */}
                {showCalculateModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Tính toán thanh toán</h2>
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

                            {createAcceptantDocumentSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Đã tạo tài liệu Acceptance thành công!</p>
                                </div>
                            )}

                            {createAcceptantDocumentError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{createAcceptantDocumentError}</p>
                                </div>
                            )}

                            {calculateError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{calculateError}</p>
                                </div>
                            )}

                            <form onSubmit={handleCalculateAndSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số giờ thực tế <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={calculateFormData.actualWorkHours || ''}
                                            onChange={(e) => setCalculateFormData(prev => ({ ...prev, actualWorkHours: Number(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            required
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số giờ OT
                                        </label>
                                        <input
                                            type="number"
                                            value={calculateFormData.otHours || ''}
                                            onChange={(e) => setCalculateFormData(prev => ({ ...prev, otHours: e.target.value ? Number(e.target.value) : null }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={calculateFormData.notes || ''}
                                        onChange={(e) => setCalculateFormData(prev => ({ ...prev, notes: e.target.value || null }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                        rows={3}
                                        placeholder="Ghi chú tính toán"
                                    />
                                </div>

                                {/* Upload Acceptance Document (Bắt buộc) */}
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Tài liệu Acceptance <span className="text-red-500">*</span></h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại tài liệu <span className="text-red-500">*</span>
                                        </label>
                                        {loadingAcceptantDocumentTypes ? (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                Đang tải loại tài liệu...
                                            </div>
                                        ) : (
                                            <select
                                                name="documentTypeId"
                                                value={acceptantDocumentFormData.documentTypeId || ''}
                                                onChange={handleAcceptantDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">Chọn loại tài liệu</option>
                                                {acceptantDocumentTypesList.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.typeName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File Acceptance <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <label className="flex-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={onAcceptantFileChange}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    required
                                                />
                                                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors">
                                                    {acceptantFile ? (
                                                        <div className="flex items-center gap-2">
                                                            <FileUp className="w-5 h-5 text-primary-600" />
                                                            <span className="text-sm font-medium text-gray-700">{acceptantFile.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Upload className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm text-gray-500">Chọn file (tối đa 10MB)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        {acceptantUploadProgress > 0 && acceptantUploadProgress < 100 && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${acceptantUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Đang tải: {acceptantUploadProgress}%</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={acceptantDocumentFormData.description || ''}
                                            onChange={handleAcceptantDocumentFormChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            rows={2}
                                            placeholder="Mô tả về tài liệu"
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
                                        disabled={calculating}
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
                                                Tính toán
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal đánh dấu đã thanh toán */}
                {showMarkAsPaidModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                            {/* Header - Cố định */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-gray-900">Đánh dấu đã thanh toán</h2>
                                <button
                                    onClick={handleCloseMarkAsPaidModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            {/* Body - Có thể scroll */}
                            <div className="flex-1 overflow-y-auto p-6">

                            {markAsPaidSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Đánh dấu đã thanh toán thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                                </div>
                            )}

                            {createInvoiceDocumentSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Đã tạo tài liệu Invoice thành công!</p>
                                </div>
                            )}

                            {createReceiptDocumentSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Đã tạo tài liệu Receipt thành công!</p>
                                </div>
                            )}

                            {createInvoiceDocumentError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{createInvoiceDocumentError}</p>
                                </div>
                            )}

                            {createReceiptDocumentError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{createReceiptDocumentError}</p>
                                </div>
                            )}

                            {markAsPaidError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{markAsPaidError}</p>
                                </div>
                            )}

                            <form id="markAsPaidForm" onSubmit={handleMarkAsPaid} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số tiền đã tính toán
                                        </label>
                                        <input
                                            type="text"
                                            value={formatVND(payment.calculatedAmount)}
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
                                            value={markAsPaidFormData.paidAmount || ''}
                                            onChange={(e) => setMarkAsPaidFormData(prev => ({ ...prev, paidAmount: Number(e.target.value) || 0 }))}
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
                                            type="date"
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
                                        value={markAsPaidFormData.notes || ''}
                                        onChange={(e) => setMarkAsPaidFormData(prev => ({ ...prev, notes: e.target.value || null }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                        rows={3}
                                        placeholder="Ghi chú về thanh toán"
                                    />
                                </div>

                                {/* Upload Invoice Document (Bắt buộc) */}
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Tài liệu Invoice <span className="text-red-500">*</span></h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại tài liệu <span className="text-red-500">*</span>
                                        </label>
                                        {loadingInvoiceDocumentTypes ? (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                Đang tải loại tài liệu...
                                            </div>
                                        ) : (
                                            <select
                                                name="documentTypeId"
                                                value={invoiceDocumentFormData.documentTypeId || ''}
                                                onChange={handleInvoiceDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">Chọn loại tài liệu</option>
                                                {invoiceDocumentTypesList.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.typeName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File Invoice <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <label className="flex-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={onInvoiceFileChange}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    required
                                                />
                                                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors">
                                                    {invoiceFile ? (
                                                        <div className="flex items-center gap-2">
                                                            <FileUp className="w-5 h-5 text-primary-600" />
                                                            <span className="text-sm font-medium text-gray-700">{invoiceFile.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Upload className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm text-gray-500">Chọn file (tối đa 10MB)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        {invoiceUploadProgress > 0 && invoiceUploadProgress < 100 && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${invoiceUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Đang tải: {invoiceUploadProgress}%</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={invoiceDocumentFormData.description || ''}
                                            onChange={handleInvoiceDocumentFormChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            rows={2}
                                            placeholder="Mô tả về tài liệu"
                                        />
                                    </div>
                                </div>

                                {/* Upload Receipt Document (Bắt buộc) */}
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Tài liệu Receipt <span className="text-red-500">*</span></h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại tài liệu <span className="text-red-500">*</span>
                                        </label>
                                        {loadingReceiptDocumentTypes ? (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                Đang tải loại tài liệu...
                                            </div>
                                        ) : (
                                            <select
                                                name="documentTypeId"
                                                value={receiptDocumentFormData.documentTypeId || ''}
                                                onChange={handleReceiptDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">Chọn loại tài liệu</option>
                                                {receiptDocumentTypesList.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.typeName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File Receipt <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <label className="flex-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={onReceiptFileChange}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    required
                                                />
                                                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors">
                                                    {receiptFile ? (
                                                        <div className="flex items-center gap-2">
                                                            <FileUp className="w-5 h-5 text-primary-600" />
                                                            <span className="text-sm font-medium text-gray-700">{receiptFile.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Upload className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm text-gray-500">Chọn file (tối đa 10MB)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        {receiptUploadProgress > 0 && receiptUploadProgress < 100 && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${receiptUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Đang tải: {receiptUploadProgress}%</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={receiptDocumentFormData.description || ''}
                                            onChange={handleReceiptDocumentFormChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            rows={2}
                                            placeholder="Mô tả về tài liệu"
                                        />
                                    </div>
                                </div>

                            </form>
                            </div>
                            
                            {/* Footer - Cố định */}
                            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCloseMarkAsPaidModal}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    form="markAsPaidForm"
                                    disabled={markingAsPaid}
                                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {markingAsPaid ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Đánh dấu đã thanh toán
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

