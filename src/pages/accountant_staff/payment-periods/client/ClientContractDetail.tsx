import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, FileText, CreditCard, Download, Eye } from 'lucide-react';
import Sidebar from '../../../../components/common/Sidebar';
import { sidebarItems } from '../../../../components/accountant_staff/SidebarItems';
import { clientContractPaymentService, type ClientContractPayment } from '../../../../services/ClientContractPayment';
import { clientContractService, type ClientContract } from '../../../../services/ClientContract';
import { clientCompanyService, type ClientCompany } from '../../../../services/ClientCompany';
import { clientPaymentPeriodService, type ClientPaymentPeriod } from '../../../../services/ClientPaymentPeriod';
import { clientDocumentService, type ClientDocument } from '../../../../services/ClientDocument';
import { documentTypeService, type DocumentType } from '../../../../services/DocumentType';
import { projectService } from '../../../../services/Project';
import { talentService, type Talent } from '../../../../services/Talent';

export default function ClientContractDetailPage() {
    const { id } = useParams<{ id: string }>();
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

    const getTotalAmount = (): number => {
        if (!payment) return 0;
        return payment.calculatedAmount || 0;
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
            </div>
        </div>
    );
}

