import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Building2, DollarSign, CheckCircle, AlertCircle, Clock as ClockIcon, Briefcase, Eye } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/developer/SidebarItems';
import { partnerContractService, type PartnerContract } from '../../../services/PartnerContract';
import { clientContractService, type ClientContract } from '../../../services/ClientContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { clientCompanyService, type ClientCompany } from '../../../services/ClientCompany';
import { projectService, type Project } from '../../../services/Project';
import { talentService, type Talent } from '../../../services/Talent';
import { useAuth } from '../../../contexts/AuthContext';
import { decodeJWT } from '../../../services/Auth';

export default function DeveloperContractDetailPage() {
    const { type, id } = useParams<{ type: 'partner' | 'client'; id: string }>();
    const { user } = useAuth();
    const [contract, setContract] = useState<PartnerContract | ClientContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [partner, setPartner] = useState<Partner | null>(null);
    const [client, setClient] = useState<ClientCompany | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [talent, setTalent] = useState<Talent | null>(null);
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

    const fetchData = async (showLoading = true) => {
        if (!id || !type) return;
        
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError('');
            
            // Fetch contract detail based on type
            let contractData: PartnerContract | ClientContract;
            if (type === 'partner') {
                contractData = await partnerContractService.getById(Number(id));
            } else {
                contractData = await clientContractService.getById(Number(id));
            }
            
            setContract(contractData);
            
            // Verify this contract belongs to current user
            if (currentTalentId && contractData.talentId !== currentTalentId) {
                setError('Bạn không có quyền xem hợp đồng này');
                return;
            }
            
            // Fetch related data
            try {
                if (type === 'partner') {
                    const pc = contractData as PartnerContract;
                    const [partnerData, talentData] = await Promise.all([
                        partnerService.getAll().then(partners => 
                            Array.isArray(partners) 
                                ? partners.find((p: Partner) => p.id === pc.partnerId)
                                : null
                        ),
                        talentService.getById(pc.talentId)
                    ]);
                    setPartner(partnerData || null);
                    setTalent(talentData);
                } else {
                    const cc = contractData as ClientContract;
                    const [clientData, projectData, talentData] = await Promise.all([
                        clientCompanyService.getById(cc.clientCompanyId),
                        projectService.getById(cc.projectId),
                        talentService.getById(cc.talentId)
                    ]);
                    setClient(clientData);
                    setProject(projectData);
                    setTalent(talentData);
                }
            } catch (err) {
                console.error("⚠️ Lỗi tải thông tin liên quan:", err);
            }
        } catch (err: any) {
            console.error("❌ Lỗi tải chi tiết hợp đồng:", err);
            setError(err.message || "Không thể tải thông tin hợp đồng");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (currentTalentId) {
            fetchData();
        }
    }, [id, type, currentTalentId]);

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return {
                    label: 'Đang hiệu lực',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-green-50'
                };
            case 'pending':
                return {
                    label: 'Chờ duyệt',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <ClockIcon className="w-4 h-4" />,
                    bgColor: 'bg-yellow-50'
                };
            case 'draft':
                return {
                    label: 'Bản nháp',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <FileText className="w-4 h-4" />,
                    bgColor: 'bg-gray-50'
                };
            case 'expired':
                return {
                    label: 'Đã hết hạn',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-blue-50'
                };
            case 'terminated':
                return {
                    label: 'Đã chấm dứt',
                    color: 'bg-red-100 text-red-800',
                    icon: <AlertCircle className="w-4 h-4" />,
                    bgColor: 'bg-red-50'
                };
            case 'rejected':
                return {
                    label: 'Đã từ chối',
                    color: 'bg-rose-100 text-rose-800',
                    icon: <AlertCircle className="w-4 h-4" />,
                    bgColor: 'bg-rose-50'
                };
            default:
                return {
                    label: 'Không xác định',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <AlertCircle className="w-4 h-4" />,
                    bgColor: 'bg-gray-50'
                };
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (!value) return '—';
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };

    const getRateTypeText = (rateType?: string | null) => {
        if (!rateType) return '—';
        switch (rateType) {
            case 'Hourly':
                return 'Theo giờ';
            case 'Daily':
                return 'Theo ngày';
            case 'Monthly':
                return 'Theo tháng';
            case 'Fixed':
                return 'Cố định';
            default:
                return rateType;
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Developer" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải dữ liệu hợp đồng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Developer" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium">
                            {error || "Không tìm thấy hợp đồng"}
                        </p>
                        <Link 
                            to="/developer/contracts"
                            className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
                        >
                            ← Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(contract.status);
    const isPartnerContract = type === 'partner';

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Developer" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link 
                            to="/developer/contracts"
                            className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-medium">Quay lại danh sách</span>
                        </Link>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contract.contractNumber}</h1>
                            <p className="text-neutral-600 mb-4">
                                {isPartnerContract 
                                    ? 'Thông tin chi tiết hợp đồng đối tác'
                                    : 'Thông tin chi tiết hợp đồng khách hàng'}
                            </p>
                            
                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                                {statusConfig.icon}
                                <span className={`text-sm font-medium ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin chung */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
                    <div className="p-6 border-b border-neutral-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Thông tin chung</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem 
                                label="Mã hợp đồng" 
                                value={contract.contractNumber} 
                                icon={<FileText className="w-4 h-4" />}
                            />
                            {isPartnerContract && (
                                <>
                                    <InfoItem 
                                        label="Hình thức tính lương" 
                                        value={(contract as PartnerContract).rateType ? getRateTypeText((contract as PartnerContract).rateType) : '—'} 
                                        icon={<FileText className="w-4 h-4" />}
                                    />
                                    <InfoItem 
                                        label="Đối tác" 
                                        value={partner?.companyName || '—'} 
                                        icon={<Building2 className="w-4 h-4" />}
                                    />
                                    <InfoItem 
                                        label="Mức lương nhân sự" 
                                        value={formatCurrency((contract as PartnerContract).devRate)} 
                                        icon={<DollarSign className="w-4 h-4" />}
                                    />
                                </>
                            )}
                            {!isPartnerContract && (
                                <>
                                    <InfoItem 
                                        label="Khách hàng" 
                                        value={client?.name || '—'} 
                                        icon={<Building2 className="w-4 h-4" />}
                                    />
                                    <InfoItem 
                                        label="Dự án" 
                                        value={project?.name || '—'} 
                                        icon={<Briefcase className="w-4 h-4" />}
                                    />
                                </>
                            )}
                            <InfoItem 
                                label="Nhân sự" 
                                value={talent?.fullName || '—'} 
                                icon={<FileText className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Ngày bắt đầu" 
                                value={new Date(contract.startDate).toLocaleDateString('vi-VN')} 
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Ngày kết thúc" 
                                value={contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'} 
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            {contract.contractFileUrl && (
                                <InfoItem 
                                    label="File hợp đồng" 
                                    value={
                                        <a 
                                            href={contract.contractFileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 underline"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem file
                                        </a>
                                    } 
                                    icon={<FileText className="w-4 h-4" />}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
    const displayValue: ReactNode =
        value === null || value === undefined
            ? '—'
            : typeof value === 'string' && value.trim() === ''
                ? '—'
                : value;

    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-2">
                {icon && <div className="text-neutral-400">{icon}</div>}
                <p className="text-neutral-500 text-sm font-medium">{label}</p>
            </div>
            <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
                {displayValue}
            </p>
        </div>
    );
}

