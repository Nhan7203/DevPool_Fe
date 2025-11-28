import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, FileText, CreditCard, Download, Eye } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/developer/SidebarItems';
import { partnerContractPaymentService, type PartnerContractPaymentModel } from '../../../services/PartnerContractPayment';
import { talentAssignmentService, type TalentAssignmentModel } from '../../../services/TalentAssignment';
import { partnerService, type Partner } from '../../../services/Partner';
import { projectPeriodService, type ProjectPeriodModel } from '../../../services/ProjectPeriod';
import { partnerDocumentService, type PartnerDocument } from '../../../services/PartnerDocument';
import { documentTypeService, type DocumentType } from '../../../services/DocumentType';
import { talentService, type Talent } from '../../../services/Talent';
import { talentCVService, type TalentCV } from '../../../services/TalentCV';
import { talentJobRoleLevelService, type TalentJobRoleLevel } from '../../../services/TalentJobRoleLevel';
import { jobRoleLevelService, type JobRoleLevel } from '../../../services/JobRoleLevel';
import { jobRoleService, type JobRole } from '../../../services/JobRole';
import { useAuth } from '../../../contexts/AuthContext';
import { decodeJWT } from '../../../services/Auth';

export default function DeveloperPaymentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [payment, setPayment] = useState<PartnerContractPaymentModel | null>(null);
    const [talentAssignment, setTalentAssignment] = useState<TalentAssignmentModel | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [period, setPeriod] = useState<ProjectPeriodModel | null>(null);
    const [documents, setDocuments] = useState<PartnerDocument[]>([]);
    const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());
    const [talentJobRoleLevel, setTalentJobRoleLevel] = useState<TalentJobRoleLevel | null>(null);
    const [jobRoleLevel, setJobRoleLevel] = useState<JobRoleLevel | null>(null);
    const [jobRole, setJobRole] = useState<JobRole | null>(null);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTalentId, setCurrentTalentId] = useState<number | null>(null);

    // Lấy talentId từ user hiện tại
    useEffect(() => {
        const fetchTalentId = async () => {
            if (!user) return;
            
            try {
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                let userId: string | null = null;
                
                if (token) {
                    const decoded = decodeJWT(token);
                    userId = decoded?.nameid || decoded?.sub || decoded?.userId || decoded?.uid || user.id;
                } else {
                    userId = user.id;
                }
                
                if (!userId) return;
                
                const talents = await talentService.getAll({ excludeDeleted: true });
                const talent = Array.isArray(talents) 
                    ? talents.find((t: Talent) => t.userId === userId)
                    : null;
                
                if (talent) {
                    setCurrentTalentId(talent.id);
                }
            } catch (err: any) {
                console.error('❌ Lỗi tìm talent:', err);
            }
        };
        
        fetchTalentId();
    }, [user]);

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
            if (!id || !currentTalentId) return;
            
            try {
                setLoading(true);
                setError('');
                
                // Fetch payment detail
                const paymentData = await partnerContractPaymentService.getById(Number(id));
                
                // Fetch TalentAssignment để lấy talentId
                const assignmentData = await talentAssignmentService.getById(paymentData.talentAssignmentId);
                
                // Verify this payment belongs to current user
                if (assignmentData.talentId !== currentTalentId) {
                    setError('Bạn không có quyền xem thanh toán này');
                    setLoading(false);
                    return;
                }
                
                setPayment(paymentData);
                setTalentAssignment(assignmentData);
                
                // Fetch related data
                const periodData = await projectPeriodService.getById(paymentData.projectPeriodId);
                setPeriod(periodData);
                
                // Fetch partner
                const partners = await partnerService.getAll();
                const partnerData = Array.isArray(partners) 
                    ? partners.find((p: Partner) => p.id === assignmentData.partnerId)
                    : null;
                setPartner(partnerData || null);
                
                // Fetch talent and job role level
                try {
                    await talentService.getById(assignmentData.talentId);
                    
                    let jobRoleLevelIdToUse: number | null = null;
                    
                    // Try to get from TalentJobRoleLevel first
                    try {
                        const talentJobRoleLevelsData = await talentJobRoleLevelService.getAll({
                            talentId: assignmentData.talentId,
                            excludeDeleted: true
                        });
                        const talentJobRoleLevels = Array.isArray(talentJobRoleLevelsData) 
                            ? talentJobRoleLevelsData 
                            : (talentJobRoleLevelsData?.items || []);
                        
                        if (talentJobRoleLevels.length > 0) {
                            const firstJobRoleLevel = talentJobRoleLevels[0] as TalentJobRoleLevel;
                            setTalentJobRoleLevel(firstJobRoleLevel);
                            jobRoleLevelIdToUse = firstJobRoleLevel.jobRoleLevelId;
                        }
                    } catch (err) {
                        console.warn("⚠️ Không thể tải TalentJobRoleLevel, thử lấy từ CV:", err);
                    }
                    
                    // Fallback: Get from active CV if no TalentJobRoleLevel found
                    if (!jobRoleLevelIdToUse) {
                        try {
                            const cvsData = await talentCVService.getAll({
                                talentId: assignmentData.talentId,
                                excludeDeleted: true
                            });
                            const cvs = Array.isArray(cvsData) ? cvsData : (cvsData?.items || []);
                            const activeCV = cvs.find((cv: TalentCV) => cv.isActive);
                            
                            if (activeCV) {
                                jobRoleLevelIdToUse = activeCV.jobRoleLevelId;
                                console.log("✅ Lấy job role level từ CV active:", activeCV.jobRoleLevelId);
                            }
                        } catch (err) {
                            console.error("❌ Lỗi tải CV:", err);
                        }
                    }
                    
                    // Fetch job role level and job role details
                    if (jobRoleLevelIdToUse) {
                        try {
                            const jobRoleLevelData = await jobRoleLevelService.getById(jobRoleLevelIdToUse);
                            setJobRoleLevel(jobRoleLevelData);
                            
                            // Fetch job role details
                            try {
                                const jobRoleData = await jobRoleService.getById(jobRoleLevelData.jobRoleId);
                                setJobRole(jobRoleData);
                                console.log("✅ Đã tải job role:", jobRoleData.name, "-", jobRoleLevelData.name);
                            } catch (err) {
                                console.error("❌ Lỗi tải job role:", err);
                            }
                        } catch (err) {
                            console.error("❌ Lỗi tải job role level:", err);
                        }
                    } else {
                        console.warn("⚠️ Không tìm thấy job role level cho talent:", assignmentData.talentId);
                    }
                } catch (err) {
                    console.error("❌ Lỗi tải thông tin talent:", err);
                }
                
                // Fetch documents
                setLoadingDocuments(true);
                try {
                    const documentsData = await partnerDocumentService.getAll({
                        partnerContractPaymentId: paymentData.id,
                        excludeDeleted: true
                    });
                    const docs = Array.isArray(documentsData) ? documentsData : (documentsData?.items || []);
                    setDocuments(docs);
                } catch (docErr: any) {
                    console.error("❌ Lỗi tải file chứng từ:", docErr);
                    setDocuments([]);
                } finally {
                    setLoadingDocuments(false);
                }
                
            } catch (err: any) {
                console.error("❌ Lỗi tải chi tiết thanh toán:", err);
                setError(err.message || "Không thể tải thông tin thanh toán");
            } finally {
                setLoading(false);
            }
        };

        if (currentTalentId) {
            fetchData();
        }
    }, [id, currentTalentId]);

    const normalizeStatus = (status?: string | null) => (status ?? '').toLowerCase();

    const getStatusColor = (status: string) => {
        const normalized = normalizeStatus(status);
        switch (normalized) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pendingcalculation':
                return 'bg-yellow-100 text-yellow-800';
            case 'pendingapproval':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-purple-100 text-purple-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'invoiced':
                return 'bg-indigo-100 text-indigo-800';
            case 'overdue':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        const normalized = normalizeStatus(status);
        switch (normalized) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pendingcalculation':
                return 'Chờ tính toán';
            case 'pendingapproval':
                return 'Chờ duyệt';
            case 'approved':
                return 'Đã duyệt';
            case 'rejected':
                return 'Đã từ chối';
            case 'invoiced':
                return 'Đã xuất hóa đơn';
            case 'overdue':
                return 'Quá hạn';
            default:
                return status;
        }
    };

    const formatPeriod = (period: PartnerPaymentPeriod | null) => {
        if (!period) return '—';
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        return `${monthNames[period.periodMonth - 1]}/${period.periodYear}`;
    };

    const formatRate = (payment: PartnerContractPaymentModel | null) => {
        if (!payment || !payment.monthlyRate) return '—';
        return `${new Intl.NumberFormat('vi-VN').format(payment.monthlyRate)} VNĐ/tháng`;
    };

    const getTotalAmount = () => {
        if (!payment) return 0;
        return payment.paidAmount || payment.calculatedAmount || 0;
    };

    const getTotalHours = () => {
        if (!payment) return 0;
        return payment.actualWorkHours + (payment.otHours || 0);
    };

    // Group documents by type
    const groupDocumentsByType = () => {
        const groups: { [key: string]: PartnerDocument[] } = {
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
                <Sidebar items={sidebarItems} title="Developer" />
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
                <Sidebar items={sidebarItems} title="Developer" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium mb-2">Lỗi tải dữ liệu</p>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Link
                            to="/developer/payments"
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
                <Sidebar items={sidebarItems} title="Developer" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium mb-2">Không tìm thấy thông tin thanh toán</p>
                        <Link
                            to="/developer/payments"
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
            <Sidebar items={sidebarItems} title="Developer" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <Link
                        to="/developer/payments"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Quay lại danh sách thanh toán</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi Tiết Thanh Toán</h1>
                    <p className="text-neutral-600">Thông tin chi tiết về khoản thanh toán từ DevPool</p>
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
                            {/* Công ty đối tác */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Công ty đối tác</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {partner?.companyName || '—'}
                                </p>
                            </div>

                            {/* Dự án */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Dự án</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {contract.contractNumber || '—'}
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

                            {/* Số giờ làm */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Số giờ làm việc</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.actualWorkHours}h
                                    {payment.otHours ? (
                                        <span className="text-xs text-neutral-600 ml-1">
                                            + {payment.otHours}h OT
                                        </span>
                                    ) : null}
                                    <span className="text-xs text-neutral-500 ml-2">
                                        (Tổng: {getTotalHours()}h)
                                    </span>
                                </p>
                            </div>

                            {/* Mức lương */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Mức lương</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formatRate(payment)}
                                </p>
                            </div>

                            {/* Tổng tiền */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Tổng tiền</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN').format(getTotalAmount())} VNĐ
                                </p>
                            </div>

                            {/* Ngày thanh toán */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Ngày thanh toán</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {payment.paymentDate
                                        ? new Date(payment.paymentDate).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })
                                        : '—'}
                                </p>
                            </div>

                            {/* Trạng thái */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Trạng thái</label>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                </span>
                            </div>

                            {/* Vai trò / Vị trí Talent đảm nhận */}
                            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 md:col-span-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <label className="text-xs font-medium text-neutral-600">Vai trò / Vị trí nhân sự đảm nhận</label>
                                </div>
                                <p className="text-base font-semibold text-gray-900">
                                    {jobRole && jobRoleLevel 
                                        ? `${jobRole.name} - ${jobRoleLevel.name}`
                                        : jobRoleLevel
                                        ? jobRoleLevel.name
                                        : '—'}
                                </p>
                                {talentJobRoleLevel && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Kinh nghiệm: {talentJobRoleLevel.yearsOfExp} năm
                                    </p>
                                )}
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
                            {/* Đơn giá */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Đơn giá (Hourly rate)</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {payment?.monthlyRate 
                                            ? `${new Intl.NumberFormat('vi-VN').format(payment.monthlyRate)} VNĐ/tháng`
                                            : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Tổng giờ làm */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Tổng giờ làm</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {getTotalHours()} giờ
                                        {payment.otHours ? (
                                            <span className="text-xs text-neutral-500 ml-2">
                                                ({payment.actualWorkHours}h + {payment.otHours}h OT)
                                            </span>
                                        ) : null}
                                    </p>
                                </div>
                            </div>

                            {/* Tổng tiền = Hours × Rate */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200 bg-primary-50 rounded-lg px-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-neutral-700">Tổng tiền = Giờ × Đơn giá</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary-700">
                                        {payment?.finalAmount 
                                            ? `${new Intl.NumberFormat('vi-VN').format(payment.finalAmount)} VNĐ`
                                            : '—'}
                                    </p>
                                    {payment?.reportedHours && payment?.monthlyRate && (
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {payment.reportedHours}h × {new Intl.NumberFormat('vi-VN').format(payment.monthlyRate / 160)} VNĐ/giờ
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bonus (nếu có) */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Bonus (nếu có)</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-green-600">
                                        0 VNĐ
                                    </p>
                                </div>
                            </div>

                            {/* Khấu trừ (Deduction nếu có) */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Khấu trừ (nếu có)</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-red-600">
                                        0 VNĐ
                                    </p>
                                </div>
                            </div>

                            {/* Số tiền cuối cùng */}
                            <div className="flex items-center justify-between py-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg px-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-base font-bold text-gray-900">Số tiền cuối cùng</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary-700">
                                        {new Intl.NumberFormat('vi-VN').format(getTotalAmount())} VNĐ
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {payment.paidAmount ? 'Số tiền đã thanh toán' : 'Số tiền đã tính toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thời gian làm việc */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in mt-6">
                    <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Clock className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Thời Gian Làm Việc</h2>
                                <p className="text-xs text-neutral-600">Chi tiết về số giờ làm việc được duyệt</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Tổng số giờ làm việc được duyệt */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200 bg-green-50 rounded-lg px-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-neutral-700">Tổng số giờ làm việc được duyệt (Approved billable hours)</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-700">
                                        {payment.actualWorkHours}h
                                        {payment.otHours ? ` + ${payment.otHours}h OT` : ''}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Tổng: {getTotalHours()} giờ
                                    </p>
                                </div>
                            </div>

                            {/* Giờ không hợp lệ / bị loại bỏ */}
                            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Giờ không hợp lệ / bị loại bỏ (nếu có)</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-red-600">
                                        0 giờ
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Không có giờ bị loại bỏ
                                    </p>
                                </div>
                            </div>

                            {/* Timesheet period */}
                            <div className="flex items-center justify-between py-3 bg-neutral-50 rounded-lg px-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-neutral-700">Timesheet period</label>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-semibold text-gray-900">
                                        {formatPeriod(period)}
                                    </p>
                                    {period && (
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Tháng {period.periodMonth}/{period.periodYear}
                                        </p>
                                    )}
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

