import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle, FileText, CreditCard, Download, Eye, AlertCircle, X, XCircle } from 'lucide-react';
import Sidebar from '../../../../components/common/Sidebar';
import { sidebarItems } from '../../../../components/manager/SidebarItems';
import { partnerContractPaymentService, type PartnerContractPayment, type PartnerContractPaymentApproveModel, type PartnerContractPaymentRejectModel } from '../../../../services/PartnerContractPayment';
import { partnerContractService, type PartnerContract } from '../../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../../services/Partner';
import { partnerPaymentPeriodService, type PartnerPaymentPeriod } from '../../../../services/PartnerPaymentPeriod';
import { partnerDocumentService, type PartnerDocument } from '../../../../services/PartnerDocument';
import { documentTypeService, type DocumentType } from '../../../../services/DocumentType';
import { talentService, type Talent } from '../../../../services/Talent';

export default function PartnerContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
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

    // Modal duyệt state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approving, setApproving] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [approveSuccess, setApproveSuccess] = useState(false);
    const [approveNotes, setApproveNotes] = useState<string>('');

    // Modal từ chối state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);
    const [rejectSuccess, setRejectSuccess] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<string>('');

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

    // Helper function để kiểm tra status có phải PendingApproval không
    const isPendingApproval = (status: string | null | undefined): boolean => {
        if (!status) return false;
        const normalizedStatus = status.trim();
        return normalizedStatus === 'PendingApproval' || 
               normalizedStatus.toLowerCase() === 'pendingapproval' ||
               normalizedStatus === 'Pending Approval' ||
               normalizedStatus.toLowerCase() === 'pending approval';
    };

    // Hàm mở modal duyệt
    const handleOpenApproveModal = () => {
        if (!payment || !isPendingApproval(payment.status)) return;

        setShowApproveModal(true);
        setApproveError(null);
        setApproveSuccess(false);
        setApproveNotes(payment.notes || '');
    };

    // Hàm đóng modal duyệt
    const handleCloseApproveModal = () => {
        setShowApproveModal(false);
        setApproveError(null);
        setApproveSuccess(false);
        setApproveNotes('');
    };

    // Hàm duyệt
    const handleApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        setApproving(true);
        setApproveError(null);
        setApproveSuccess(false);

        try {
            const approvePayload: PartnerContractPaymentApproveModel = {
                notes: approveNotes || null
            };
            
            await partnerContractPaymentService.approve(payment.id, approvePayload);
            
            setApproveSuccess(true);

            // Reload payment data
            if (id) {
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                setPayment(paymentData);
            }

            // Đóng modal sau 2 giây
            setTimeout(() => {
                handleCloseApproveModal();
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setApproveError(error.response?.data?.message || error.message || 'Không thể duyệt');
        } finally {
            setApproving(false);
        }
    };

    // Hàm mở modal từ chối
    const handleOpenRejectModal = () => {
        if (!payment || !isPendingApproval(payment.status)) return;

        setShowRejectModal(true);
        setRejectError(null);
        setRejectSuccess(false);
        setRejectionReason('');
    };

    // Hàm đóng modal từ chối
    const handleCloseRejectModal = () => {
        setShowRejectModal(false);
        setRejectError(null);
        setRejectSuccess(false);
        setRejectionReason('');
    };

    // Hàm từ chối
    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        // Validate: Lý do từ chối là bắt buộc
        if (!rejectionReason.trim()) {
            setRejectError("Vui lòng nhập lý do từ chối");
            return;
        }

        setRejecting(true);
        setRejectError(null);
        setRejectSuccess(false);

        try {
            // Bước 1: Xóa tất cả documents do accountant tạo (source = "Accountant")
            try {
                const allDocs = await partnerDocumentService.getAll({
                    partnerContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(allDocs) ? allDocs : (allDocs?.items || []);
                
                // Lọc các documents có source = "Accountant"
                const accountantDocs = docs.filter((doc: PartnerDocument) => 
                    doc.source?.toLowerCase() === 'accountant' || doc.source?.toLowerCase() === 'accountantstaff'
                );
                
                // Xóa từng document
                for (const doc of accountantDocs) {
                    try {
                        await partnerDocumentService.delete(doc.id);
                    } catch (docErr) {
                        console.error(`Lỗi khi xóa document ${doc.id}:`, docErr);
                        // Tiếp tục xóa các document khác dù có lỗi
                    }
                }
            } catch (docErr) {
                console.error("Lỗi khi lấy danh sách documents:", docErr);
                // Vẫn tiếp tục reject dù có lỗi xóa documents
            }

            // Bước 2: Reject payment
            const rejectPayload: PartnerContractPaymentRejectModel = {
                rejectionReason: rejectionReason.trim()
            };
            
            await partnerContractPaymentService.reject(payment.id, rejectPayload);
            
            setRejectSuccess(true);

            // Reload payment data và documents
            if (id) {
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                setPayment(paymentData);
                
                // Reload documents
                const allDocs = await partnerDocumentService.getAll({
                    partnerContractPaymentId: payment.id,
                    excludeDeleted: true
                });
                const docs = Array.isArray(allDocs) ? allDocs : (allDocs?.items || []);
                setDocuments(docs);
            }

            // Đóng modal sau 2 giây
            setTimeout(() => {
                handleCloseRejectModal();
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            setRejectError(error.response?.data?.message || error.message || 'Không thể từ chối');
        } finally {
            setRejecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Manager" />
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
                <Sidebar items={sidebarItems} title="Manager" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium mb-2">Lỗi tải dữ liệu</p>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Link
                            to="/manager/payment-periods/partners"
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
                <Sidebar items={sidebarItems} title="Manager" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium mb-2">Không tìm thấy thông tin thanh toán</p>
                        <Link
                            to="/manager/payment-periods/partners"
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

    // Kiểm tra xem có nên hiển thị nút duyệt/từ chối không
    const canApproveOrReject = payment && isPendingApproval(payment.status);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Manager" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <Link
                        to="/manager/payment-periods/partners"
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
                            {canApproveOrReject && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={handleOpenApproveModal}
                                        className="px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleOpenRejectModal}
                                        className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Từ chối
                                    </button>
                                </div>
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
                                        to={`/manager/contracts/developers/${contract.id}`}
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

                {/* Modal duyệt */}
                {showApproveModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Duyệt thanh toán</h2>
                                <button
                                    onClick={handleCloseApproveModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {approveSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Duyệt thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                                </div>
                            )}

                            {approveError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{approveError}</p>
                                </div>
                            )}

                            <form onSubmit={handleApprove} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={approveNotes}
                                        onChange={(e) => setApproveNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                        rows={3}
                                        placeholder="Ghi chú về việc duyệt"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseApproveModal}
                                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={approving}
                                        className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {approving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Duyệt
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal từ chối */}
                {showRejectModal && payment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Từ chối thanh toán</h2>
                                <button
                                    onClick={handleCloseRejectModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {rejectSuccess && (
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">✅ Từ chối thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                                </div>
                            )}

                            {rejectError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{rejectError}</p>
                                </div>
                            )}

                            <form onSubmit={handleReject} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lý do từ chối <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                                        rows={5}
                                        placeholder="Nhập lý do từ chối..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Vui lòng nêu rõ lý do từ chối thanh toán</p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseRejectModal}
                                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejecting || !rejectionReason.trim()}
                                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {rejecting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4" />
                                                Từ chối
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

