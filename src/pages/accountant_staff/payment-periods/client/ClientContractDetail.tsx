import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, FileText, CreditCard, Download, Eye, Calculator, Upload, FileUp, X } from 'lucide-react';
import Sidebar from '../../../../components/common/Sidebar';
import { sidebarItems } from '../../../../components/accountant_staff/SidebarItems';
import { clientContractPaymentService, type ClientContractPayment, type ClientContractPaymentCalculateModel, type RecordPaymentModel } from '../../../../services/ClientContractPayment';
import { clientContractService, type ClientContract } from '../../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../../services/ClientCompany';
import { clientPaymentPeriodService, type ClientPaymentPeriod } from '../../../../services/ClientPaymentPeriod';
import { clientDocumentService, type ClientDocument, type ClientDocumentCreate } from '../../../../services/ClientDocument';
import { documentTypeService, type DocumentType } from '../../../../services/DocumentType';
import { projectService } from '../../../../services/Project';
import { talentService, type Talent } from '../../../../services/Talent';
import { uploadFile } from '../../../../utils/firebaseStorage';
import { decodeJWT } from '../../../../services/Auth';
import { useAuth } from '../../../../contexts/AuthContext';
import { getErrorMessage } from '../../../../utils/helpers';

export default function ClientContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [payment, setPayment] = useState<ClientContractPayment | null>(null);
    const [contract, setContract] = useState<ClientContract | null>(null);
    const [company, setCompany] = useState<ClientCompany | null>(null);
    const [period, setPeriod] = useState<ClientPaymentPeriod | null>(null);
    const [documents, setDocuments] = useState<ClientDocument[]>([]);
    const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());
    const [project, setProject] = useState<any>(null);
    const [talent, setTalent] = useState<Talent | null>(null);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal tính toán state
    const [showCalculateModal, setShowCalculateModal] = useState(false);
    const [calculateFormData, setCalculateFormData] = useState<ClientContractPaymentCalculateModel>({
        billableHours: null,
        notes: null,
    });
    const [calculating, setCalculating] = useState(false);
    const [calculateError, setCalculateError] = useState<string | null>(null);
    const [calculateSuccess, setCalculateSuccess] = useState(false);
    
    // Document state cho tính toán (Worksheet - bắt buộc)
    const [worksheetFile, setWorksheetFile] = useState<File | null>(null);
    const [worksheetUploadProgress, setWorksheetUploadProgress] = useState(0);
    const [worksheetDocumentFormData, setWorksheetDocumentFormData] = useState<Partial<ClientDocumentCreate>>({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedPartnerDocumentId: null,
    });
    const [worksheetDocumentTypesList, setWorksheetDocumentTypesList] = useState<DocumentType[]>([]);
    const [loadingWorksheetDocumentTypes, setLoadingWorksheetDocumentTypes] = useState(false);
    const [createWorksheetDocumentError, setCreateWorksheetDocumentError] = useState<string | null>(null);
    const [createWorksheetDocumentSuccess, setCreateWorksheetDocumentSuccess] = useState(false);
    
    // Modal ghi nhận thanh toán state
    const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState<RecordPaymentModel>({
        receivedAmount: 0,
        paymentDate: "",
        notes: null,
    });
    const [updatingPayment, setUpdatingPayment] = useState(false);
    const [recordPaymentError, setRecordPaymentError] = useState<string | null>(null);
    const [recordPaymentSuccess, setRecordPaymentSuccess] = useState(false);
    
    // Document state cho ghi nhận thanh toán (Receipt - bắt buộc)
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptUploadProgress, setReceiptUploadProgress] = useState(0);
    const [receiptDocumentFormData, setReceiptDocumentFormData] = useState<Partial<ClientDocumentCreate>>({
        documentTypeId: 0,
        fileName: "",
        filePath: "",
        description: "",
        source: "Accountant",
        referencedPartnerDocumentId: null,
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
            } catch (err: any) {
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
                const paymentData = await clientContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Fetch related data in parallel
                const [contractData, periodData] = await Promise.all([
                    clientContractService.getById(paymentData.clientContractId),
                    clientPaymentPeriodService.getById(paymentData.clientPeriodId)
                ]);
                
                setContract(contractData);
                setPeriod(periodData);
                
                // Fetch company
                try {
                    const companyData = await clientCompanyService.getById(contractData.clientCompanyId);
                    setCompany(companyData);
                } catch (err) {
                    console.warn("⚠️ Không thể tải thông tin công ty:", err);
                }

                // Fetch project
                try {
                    if (contractData.projectId) {
                        const projectData = await projectService.getById(contractData.projectId);
                        setProject(projectData);
                    }
                } catch (err) {
                    console.warn("⚠️ Không thể tải thông tin dự án:", err);
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
            } catch (err: any) {
                console.error('❌ Lỗi tải thông tin thanh toán:', err);
                setError(err?.message || 'Không thể tải thông tin thanh toán');
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
                const data = await clientDocumentService.getAll({
                    clientContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(data) ? data : (data?.items || []);
                setDocuments(docs);
            } catch (err: any) {
                console.error("❌ Lỗi tải tài liệu:", err);
            } finally {
                setLoadingDocuments(false);
            }
        };
        
        loadDocuments();
    }, [payment?.id]);

    const formatPeriod = (period: ClientPaymentPeriod | null): string => {
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
            'Calculated': 'bg-blue-50 text-blue-800 border-blue-200',
            'ApprovedForInvoicing': 'bg-purple-50 text-purple-800 border-purple-200',
            'Invoiced': 'bg-green-50 text-green-800 border-green-200',
            'Overdue': 'bg-orange-50 text-orange-800 border-orange-200',
            'Paid': 'bg-emerald-50 text-emerald-800 border-emerald-200',
            'Rejected': 'bg-red-50 text-red-800 border-red-200',
        };
        return statusMap[status] || 'bg-gray-50 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: string): string => {
        const statusMap: Record<string, string> = {
            'PendingCalculation': 'Chờ tính toán',
            'Calculated': 'Đã tính toán',
            'ApprovedForInvoicing': 'Đã duyệt xuất hóa đơn',
            'Invoiced': 'Đã xuất hóa đơn',
            'Overdue': 'Quá hạn',
            'Paid': 'Đã thanh toán',
            'Rejected': 'Đã từ chối',
        };
        return statusMap[status] || status;
    };

    const formatVND = (value?: number | null): string => {
        if (value === null || value === undefined) return '—';
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };

    const groupDocumentsByType = (): Array<[string, ClientDocument[]]> => {
        const groups: Record<string, ClientDocument[]> = {
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
        return Object.entries(groups).filter(([_, docs]) => docs.length > 0);
    };

    // Hàm mở modal tính toán
    const handleOpenCalculateModal = async () => {
        if (!payment || payment.status !== 'PendingCalculation') return;

        setShowCalculateModal(true);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateWorksheetDocumentError(null);
        setCreateWorksheetDocumentSuccess(false);
        setWorksheetFile(null);
        setWorksheetUploadProgress(0);
        setCalculateFormData({
            billableHours: payment.billableHours || null,
            notes: payment.notes || null,
        });
        setWorksheetDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedPartnerDocumentId: null,
        });

        // Load document types và tìm Worksheet
        setLoadingWorksheetDocumentTypes(true);
        try {
            const typesData = await documentTypeService.getAll({ excludeDeleted: true });
            const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
            setWorksheetDocumentTypesList(types);
            
            // Tìm và set Worksheet làm mặc định (bắt buộc)
            const worksheetType = types.find((t: DocumentType) => {
                const name = t.typeName.toLowerCase().trim();
                return name === 'worksheet' || name.includes('worksheet');
            });
            
            if (worksheetType) {
                setWorksheetDocumentFormData(prev => ({ ...prev, documentTypeId: worksheetType.id }));
            } else {
                console.warn("Không tìm thấy document type 'Worksheet'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
            }
        } catch (e) {
            console.error("Error loading document types:", e);
        } finally {
            setLoadingWorksheetDocumentTypes(false);
        }
    };

    // Hàm đóng modal tính toán
    const handleCloseCalculateModal = () => {
        setShowCalculateModal(false);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateWorksheetDocumentError(null);
        setCreateWorksheetDocumentSuccess(false);
        setWorksheetFile(null);
        setWorksheetUploadProgress(0);
        setCalculateFormData({
            billableHours: null,
            notes: null,
        });
        setWorksheetDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedPartnerDocumentId: null,
        });
    };

    // Hàm xử lý file upload cho Worksheet
    const onWorksheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (f && f.size > 10 * 1024 * 1024) {
            setCreateWorksheetDocumentError("File quá lớn (tối đa 10MB)");
            return;
        }
        setCreateWorksheetDocumentError(null);
        setWorksheetFile(f);
        if (f) {
            setWorksheetDocumentFormData(prev => ({ ...prev, fileName: f.name }));
        }
    };

    // Hàm xử lý thay đổi form document cho Worksheet
    const handleWorksheetDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWorksheetDocumentFormData(prev => ({
            ...prev,
            [name]: name === 'documentTypeId' || name === 'referencedPartnerDocumentId'
                ? (value === '' ? 0 : Number(value))
                : value
        }));
    };

    // Hàm tính toán và submit (bắt buộc phải có Worksheet document)
    const handleCalculateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        // Validate: Worksheet document là bắt buộc
        if (!worksheetFile || !worksheetDocumentFormData.documentTypeId) {
            setCreateWorksheetDocumentError("Vui lòng tải lên file Worksheet (bắt buộc)");
            return;
        }

        setCalculating(true);
        setCalculateError(null);
        setCalculateSuccess(false);
        setCreateWorksheetDocumentError(null);
        setCreateWorksheetDocumentSuccess(false);

        try {
            // Bước 1: Tạo Worksheet document (bắt buộc)
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
                const path = `client-documents/${payment.id}/${Date.now()}_${worksheetFile.name}`;
                const downloadURL = await uploadFile(worksheetFile, path, setWorksheetUploadProgress);

                // Tạo payload
                const payload: ClientDocumentCreate = {
                    clientContractPaymentId: payment.id,
                    documentTypeId: worksheetDocumentFormData.documentTypeId!,
                    referencedPartnerDocumentId: worksheetDocumentFormData.referencedPartnerDocumentId || null,
                    fileName: worksheetFile.name,
                    filePath: downloadURL,
                    uploadedByUserId,
                    description: worksheetDocumentFormData.description || null,
                    source: worksheetDocumentFormData.source || null
                };

                await clientDocumentService.create(payload);
                setCreateWorksheetDocumentSuccess(true);
            } catch (docErr: unknown) {
                setCreateWorksheetDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Worksheet');
                throw docErr; // Dừng lại nếu không tạo được tài liệu
            }

            // Bước 2: Tính toán và submit
            await clientContractPaymentService.calculateAndSubmit(
                payment.id,
                {
                    billableHours: calculateFormData.billableHours || null,
                    notes: calculateFormData.notes || null
                }
            );
            
            setCalculateSuccess(true);

            // Reload payment data
            if (id) {
                const paymentData = await clientContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Reload documents
                const docsData = await clientDocumentService.getAll({
                    clientContractPaymentId: payment.id,
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

    // Hàm mở modal ghi nhận thanh toán
    const handleOpenRecordPaymentModal = async () => {
        if (!payment) return;

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
            paymentDate: currentDateTime,
            notes: payment.notes || null
        });
        setRecordPaymentError(null);
        setRecordPaymentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);
        setReceiptFile(null);
        setReceiptUploadProgress(0);
        setReceiptDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedPartnerDocumentId: null,
        });

        // Load document types và tìm Receipt
        setLoadingReceiptDocumentTypes(true);
        try {
            const typesData = await documentTypeService.getAll({ excludeDeleted: true });
            const types = Array.isArray(typesData) ? typesData : (typesData?.items || []);
            setReceiptDocumentTypesList(types);
            
            // Tìm và set Receipt làm mặc định (bắt buộc)
            const receiptType = types.find((t: DocumentType) => {
                const name = t.typeName.toLowerCase().trim();
                return name === 'receipt' || name.includes('receipt');
            });
            
            if (receiptType) {
                setReceiptDocumentFormData(prev => ({ ...prev, documentTypeId: receiptType.id }));
            } else {
                console.warn("Không tìm thấy document type 'Receipt'. Các loại tài liệu có sẵn:", types.map((t: DocumentType) => t.typeName));
            }
        } catch (e) {
            console.error("Error loading document types:", e);
        } finally {
            setLoadingReceiptDocumentTypes(false);
        }
    };

    // Hàm đóng modal ghi nhận thanh toán
    const handleCloseRecordPaymentModal = () => {
        setShowRecordPaymentModal(false);
        setPaymentFormData({
            receivedAmount: 0,
            paymentDate: "",
            notes: null,
        });
        setRecordPaymentError(null);
        setRecordPaymentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);
        setReceiptFile(null);
        setReceiptUploadProgress(0);
        setReceiptDocumentFormData({
            documentTypeId: 0,
            fileName: "",
            filePath: "",
            description: "",
            source: "Accountant",
            referencedPartnerDocumentId: null,
        });
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
            [name]: name === 'documentTypeId' || name === 'referencedPartnerDocumentId'
                ? (value === '' ? 0 : Number(value))
                : value
        }));
    };

    // Hàm ghi nhận thanh toán (bắt buộc phải có Receipt document)
    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        // Validate: Receipt document là bắt buộc
        if (!receiptFile || !receiptDocumentFormData.documentTypeId) {
            setCreateReceiptDocumentError("Vui lòng tải lên file Receipt (bắt buộc)");
            return;
        }

        setUpdatingPayment(true);
        setRecordPaymentError(null);
        setRecordPaymentSuccess(false);
        setCreateReceiptDocumentError(null);
        setCreateReceiptDocumentSuccess(false);

        try {
            // Bước 1: Tạo Receipt document (bắt buộc)
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
                const path = `client-documents/${payment.id}/${Date.now()}_${receiptFile.name}`;
                const downloadURL = await uploadFile(receiptFile, path, setReceiptUploadProgress);

                // Tạo payload
                const payload: ClientDocumentCreate = {
                    clientContractPaymentId: payment.id,
                    documentTypeId: receiptDocumentFormData.documentTypeId!,
                    referencedPartnerDocumentId: receiptDocumentFormData.referencedPartnerDocumentId || null,
                    fileName: receiptFile.name,
                    filePath: downloadURL,
                    uploadedByUserId,
                    description: receiptDocumentFormData.description || null,
                    source: receiptDocumentFormData.source || null
                };

                await clientDocumentService.create(payload);
                setCreateReceiptDocumentSuccess(true);
            } catch (docErr: unknown) {
                setCreateReceiptDocumentError(getErrorMessage(docErr) || 'Không thể tạo tài liệu Receipt');
                throw docErr; // Dừng lại nếu không tạo được tài liệu
            }

            // Bước 2: Record payment
            const paymentDateISO = new Date(paymentFormData.paymentDate).toISOString();
            await clientContractPaymentService.recordPayment(payment.id, {
                receivedAmount: paymentFormData.receivedAmount,
                paymentDate: paymentDateISO,
                notes: paymentFormData.notes || null
            });
            
            setRecordPaymentSuccess(true);

            // Reload payment data
            if (id) {
                const paymentData = await clientContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Reload documents
                const docsData = await clientDocumentService.getAll({
                    clientContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(docsData) ? docsData : (docsData?.items || []);
                setDocuments(docs);
            }

            // Đóng modal sau 2 giây
            setTimeout(() => {
                handleCloseRecordPaymentModal();
                setRecordPaymentSuccess(false);
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setRecordPaymentError(error.response?.data?.message || error.message || 'Không thể ghi nhận thanh toán');
        } finally {
            setUpdatingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Accountant Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải thông tin thanh toán...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Accountant Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium mb-2">Lỗi tải dữ liệu</p>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Link
                            to="/accountant/payment-periods/clients"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!payment || !contract) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Accountant Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium mb-2">Không tìm thấy thông tin thanh toán</p>
                        <Link
                            to="/accountant/payment-periods/clients"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
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
                    <Link
                        to="/accountant/payment-periods/clients"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Quay lại danh sách thanh toán</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi Tiết Thanh Toán Hợp Đồng Khách Hàng</h1>
                    <p className="text-neutral-600">Thông tin chi tiết về khoản thanh toán từ khách hàng</p>
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
                            {/* Công ty khách hàng */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Công ty khách hàng</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {company?.name || '—'}
                                </p>
                            </div>

                            {/* Dự án */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Dự án</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {project?.name || '—'}
                                </p>
                            </div>

                            {/* Hợp đồng */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Hợp đồng</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {contract.contractNumber || '—'}
                                </p>
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

                            {/* Số giờ billable */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số giờ billable</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.billableHours}h
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

                            {/* Số tiền đã xuất hóa đơn */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số tiền đã xuất hóa đơn</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatVND(payment.invoicedAmount)}
                                </p>
                            </div>

                            {/* Số tiền đã nhận */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số tiền đã nhận</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatVND(payment.receivedAmount)}
                                </p>
                            </div>

                            {/* Số hóa đơn */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số hóa đơn</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.invoiceNumber || '—'}
                                </p>
                            </div>

                            {/* Ngày xuất hóa đơn */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Ngày xuất hóa đơn</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatDate(payment.invoiceDate)}
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

                            {/* Trạng thái */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Trạng thái</label>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                </span>
                            </div>
                        </div>

                        {/* Nút thao tác */}
                        <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center gap-3">
                            {payment.status === 'PendingCalculation' && (
                                <button
                                    onClick={handleOpenCalculateModal}
                                    className="px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all"
                                >
                                    <Calculator className="w-4 h-4" />
                                    Tính toán
                                </button>
                            )}
                            {(payment.status === 'Invoiced' || payment.status === 'Overdue') && (
                                <button
                                    onClick={handleOpenRecordPaymentModal}
                                    className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Đã thanh toán
                                </button>
                            )}
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
                            {/* Số giờ billable */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Số giờ billable</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {payment.billableHours} giờ
                                    </p>
                                </div>
                            </div>

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

                            {/* Số tiền đã xuất hóa đơn */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Số tiền đã xuất hóa đơn</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {formatVND(payment.invoicedAmount)}
                                    </p>
                                </div>
                            </div>

                            {/* Số tiền đã nhận */}
                            <div className="flex items-center justify-between py-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg px-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-base font-bold text-gray-900">Số tiền đã nhận</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary-700">
                                        {formatVND(payment.receivedAmount)}
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

                {/* Modal tính toán (bắt buộc Worksheet) */}
                {showCalculateModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Tính toán và tạo tài liệu Worksheet</h2>
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

                            {createWorksheetDocumentSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Tạo tài liệu Worksheet thành công!</p>
                                </div>
                            )}

                            {createWorksheetDocumentError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{createWorksheetDocumentError}</p>
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
                                                value={calculateFormData.billableHours || ""}
                                                onChange={(e) => setCalculateFormData(prev => ({ ...prev, billableHours: Number(e.target.value) || null }))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                required
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
                                            value={calculateFormData.notes || ""}
                                            onChange={(e) => setCalculateFormData(prev => ({ ...prev, notes: e.target.value || null }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                            rows={3}
                                            placeholder="Ghi chú tính toán"
                                        />
                                    </div>
                                </div>

                                {/* Tạo tài liệu Worksheet - Bắt buộc */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu Worksheet <span className="text-red-500">*</span> (Bắt buộc)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loại tài liệu <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="documentTypeId"
                                                value={worksheetDocumentFormData.documentTypeId || 0}
                                                onChange={handleWorksheetDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                disabled={loadingWorksheetDocumentTypes}
                                                required
                                            >
                                                <option value="0">-- Chọn loại tài liệu (bắt buộc) --</option>
                                                {worksheetDocumentTypesList.map(type => (
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
                                                value={worksheetDocumentFormData.source || ""}
                                                onChange={handleWorksheetDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                placeholder="Accountant"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File Worksheet <span className="text-red-500">*</span> (Bắt buộc)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50 hover:bg-primary-50">
                                            {worksheetFile ? (
                                                <div className="flex flex-col items-center text-primary-700">
                                                    <FileUp className="w-8 h-8 mb-2" />
                                                    <p className="font-medium">{worksheetFile.name}</p>
                                                    <p className="text-sm text-gray-600">{(worksheetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    {worksheetUploadProgress > 0 && worksheetUploadProgress < 100 && (
                                                        <p className="text-sm text-gray-600 mt-1">Đang upload: {worksheetUploadProgress}%</p>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setWorksheetFile(null)}
                                                        className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                                                    >
                                                        Xóa file
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                                                    <Upload className="w-12 h-12 mb-4" />
                                                    <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file Worksheet vào đây (bắt buộc)</span>
                                                    <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        onChange={onWorksheetFileChange}
                                                        required
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {!worksheetFile && (
                                            <p className="text-sm text-amber-600 mt-1">⚠️ Vui lòng tải lên file Worksheet (bắt buộc)</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={worksheetDocumentFormData.description || ""}
                                            onChange={handleWorksheetDocumentFormChange}
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
                                        disabled={calculating || !worksheetFile || !worksheetDocumentFormData.documentTypeId}
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
                                                Tính toán và tạo Worksheet
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal ghi nhận thanh toán (bắt buộc Receipt) */}
                {showRecordPaymentModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Ghi nhận thanh toán và tạo tài liệu Receipt</h2>
                                <button
                                    onClick={handleCloseRecordPaymentModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {recordPaymentSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Ghi nhận thanh toán thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                                </div>
                            )}

                            {recordPaymentError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{recordPaymentError}</p>
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

                            <form onSubmit={handleRecordPayment} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số tiền hóa đơn
                                        </label>
                                        <input
                                            type="text"
                                            value={formatVND(payment.invoicedAmount)}
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
                                            value={paymentFormData.receivedAmount || ""}
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
                                            value={paymentFormData.paymentDate || ""}
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
                                        value={paymentFormData.notes || ""}
                                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value || null }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                        rows={3}
                                        placeholder="Ghi chú về thanh toán"
                                    />
                                </div>

                                {/* Form tạo tài liệu Receipt - Bắt buộc */}
                                <div className="border-t pt-6 mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tài liệu Receipt <span className="text-red-500">*</span> (Bắt buộc)</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loại tài liệu <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="documentTypeId"
                                                value={receiptDocumentFormData.documentTypeId || 0}
                                                onChange={handleReceiptDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                disabled={loadingReceiptDocumentTypes}
                                                required
                                            >
                                                <option value="0">-- Chọn loại tài liệu (bắt buộc) --</option>
                                                {receiptDocumentTypesList.map(type => (
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
                                                value={receiptDocumentFormData.source || ""}
                                                onChange={handleReceiptDocumentFormChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                                placeholder="Accountant"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File Receipt <span className="text-red-500">*</span> (Bắt buộc)
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
                                                    <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file Receipt vào đây (bắt buộc)</span>
                                                    <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        onChange={onReceiptFileChange}
                                                        required
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {!receiptFile && (
                                            <p className="text-sm text-amber-600 mt-1">⚠️ Vui lòng tải lên file Receipt (bắt buộc)</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={receiptDocumentFormData.description || ""}
                                            onChange={handleReceiptDocumentFormChange}
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
                                        disabled={updatingPayment || !receiptFile || !receiptDocumentFormData.documentTypeId}
                                        className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updatingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Ghi nhận thanh toán và tạo Receipt
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
}

