import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, UserCheck, Clock, Edit, Trash2, DollarSign, Building2, CheckCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { Button } from '../../../components/ui/button';

interface Contract {
    id: string;
    contractNumber: string;
    developerName: string;
    companyName: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'pending' | 'completed' | 'terminated';
    value: number;
    type: string;
    description?: string;
}

export default function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Mock data - replace with API call
                const mockContract: Contract = {
                    id: id || '1',
                    contractNumber: 'CTR-2025-001',
                    developerName: 'Nguyễn Văn A',
                    companyName: 'Tech Solutions Inc.',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    status: 'active',
                    value: 50000000,
                    type: 'Full-time',
                    description: 'Hợp đồng làm việc toàn thời gian với các điều khoản và điều kiện đã được thỏa thuận.'
                };

                setTimeout(() => {
                    setContract(mockContract);
                    setLoading(false);
                }, 500);
            } catch (err) {
                console.error("❌ Lỗi tải chi tiết hợp đồng:", err);
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
                return {
                    label: 'Chờ duyệt',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <ClockIcon className="w-4 h-4" />,
                    bgColor: 'bg-yellow-50'
                };
            case 'completed':
                return {
                    label: 'Đã hoàn thành',
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const handleDelete = async () => {
        if (!id) return;
        const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa hợp đồng này?");
        if (!confirm) return;

        try {
            // API call to delete
            alert("✅ Đã xóa hợp đồng thành công!");
            navigate("/hr/contracts");
        } catch (err) {
            console.error("❌ Lỗi khi xóa:", err);
            alert("Không thể xóa hợp đồng!");
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

    if (!contract) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium">Không tìm thấy hợp đồng</p>
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
                                Thông tin chi tiết hợp đồng làm việc
                            </p>
                            
                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                                {statusConfig.icon}
                                <span className={`text-sm font-medium ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate(`/hr/contracts/edit/${contract.id}`)}
                                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                            >
                                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Sửa
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                            >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Xóa
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
                    <StatCard
                        title="Giá trị hợp đồng"
                        value={formatCurrency(contract.value)}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="green"
                    />
                    <StatCard
                        title="Thời hạn"
                        value={`${Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày`}
                        icon={<Calendar className="w-6 h-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Loại hợp đồng"
                        value={contract.type}
                        icon={<FileText className="w-6 h-6" />}
                        color="orange"
                    />
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
                                label="Số hợp đồng" 
                                value={contract.contractNumber} 
                                icon={<FileText className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Loại hợp đồng" 
                                value={contract.type} 
                                icon={<FileText className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Developer" 
                                value={contract.developerName} 
                                icon={<UserCheck className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Công ty" 
                                value={contract.companyName} 
                                icon={<Building2 className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Ngày bắt đầu" 
                                value={new Date(contract.startDate).toLocaleDateString('vi-VN')} 
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Ngày kết thúc" 
                                value={new Date(contract.endDate).toLocaleDateString('vi-VN')} 
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Giá trị/tháng" 
                                value={formatCurrency(contract.value)} 
                                icon={<DollarSign className="w-4 h-4" />}
                            />
                            <InfoItem 
                                label="Trạng thái" 
                                value={statusConfig.label} 
                                icon={<Clock className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Mô tả */}
                {contract.description && (
                    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-secondary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Mô tả</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {contract.description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    color: string; 
}) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-primary-100 text-primary-600 group-hover:bg-primary-200';
            case 'green':
                return 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200';
            case 'purple':
                return 'bg-accent-100 text-accent-600 group-hover:bg-accent-200';
            case 'orange':
                return 'bg-warning-100 text-warning-600 group-hover:bg-warning-200';
            default:
                return 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200';
        }
    };

    return (
        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(color)} transition-all duration-300`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-2">
                {icon && <div className="text-neutral-400">{icon}</div>}
                <p className="text-neutral-500 text-sm font-medium">{label}</p>
            </div>
            <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
                {value || "—"}
            </p>
        </div>
    );
}

