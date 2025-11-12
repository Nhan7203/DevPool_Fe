import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, UserCheck, Clock, DollarSign, Building2, CheckCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerContractService, type PartnerContract } from '../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { talentService, type Talent } from '../../../services/Talent';

export default function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [contract, setContract] = useState<PartnerContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [partner, setPartner] = useState<Partner | null>(null);
    const [talent, setTalent] = useState<Talent | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                setError('');
                
                // Fetch contract detail
                const contractData = await partnerContractService.getById(Number(id));
                setContract(contractData);
                
                // Fetch related partner and talent data
                try {
                    const [partnerData, talentData] = await Promise.all([
                        partnerService.getAll().then(partners => partners.find((p: Partner) => p.id === contractData.partnerId)),
                        talentService.getById(contractData.talentId)
                    ]);
                    setPartner(partnerData || null);
                    setTalent(talentData);
                } catch (err) {
                    console.error("⚠️ Lỗi tải thông tin đối tác/nhân sự:", err);
                }
            } catch (err: any) {
                console.error("❌ Lỗi tải chi tiết hợp đồng:", err);
                setError(err.message || "Không thể tải thông tin hợp đồng");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Đang hiệu lực',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-green-50'
                };
            case 'pending':
            case 'draft':
                return {
                    label: 'Chờ duyệt',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <ClockIcon className="w-4 h-4" />,
                    bgColor: 'bg-yellow-50'
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
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const getRateTypeText = (rateType: string) => {
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
                <Sidebar items={sidebarItems} title="HR Staff" />
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
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium">
                            {error || "Không tìm thấy hợp đồng"}
                        </p>
                        <Link 
                            to="/hr/contracts"
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

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link 
                            to="/hr/contracts"
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
                                Thông tin chi tiết hợp đồng nhân sự
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
                            <InfoItem 
                                label="Hình thức tính lương" 
                                value={contract.rateType ? getRateTypeText(contract.rateType) : '—'} 
                                icon={<FileText className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Nhân sự" 
                                value={talent?.fullName || '—'} 
                                icon={<UserCheck className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Đối tác" 
                                value={partner?.companyName || '—'} 
                                icon={<Building2 className="w-4 h-4" />}
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
                            <InfoItem 
                                label="Mức lương nhân sự" 
                                value={formatCurrency(contract.devRate)} 
                                icon={<DollarSign className="w-4 h-4" />}
                            />
                            {contract.contractFileUrl && (
                                <InfoItem 
                                    label="File hợp đồng" 
                                    value={
                                        <a 
                                            href={contract.contractFileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-800 underline"
                                        >
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

