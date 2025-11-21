import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, UserCheck, DollarSign, Building2, CheckCircle, AlertCircle, Clock as ClockIcon, Edit, Trash2, Send, RotateCcw } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerContractService, type PartnerContract } from '../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { talentService, type Talent } from '../../../services/Talent';
import { notificationService, NotificationPriority, NotificationType } from '../../../services/Notification';
import { userService } from '../../../services/User';
import { decodeJWT } from '../../../services/Auth';
import { useAuth } from '../../../contexts/AuthContext';

export default function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contract, setContract] = useState<PartnerContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [partner, setPartner] = useState<Partner | null>(null);
    const [talent, setTalent] = useState<Talent | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const fetchData = async (showLoading = true) => {
        if (!id) return;
        
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError('');
            
            // Fetch contract detail
            const contractData = await partnerContractService.getById(Number(id));
            console.log("contractData", contractData);
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
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Active':
                return {
                    label: 'Đang hiệu lực',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-green-50'
                };
            case 'Pending':
                return {
                    label: 'Chờ duyệt',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <ClockIcon className="w-4 h-4" />,
                    bgColor: 'bg-yellow-50'
                };
            case 'Draft':
                return {
                    label: 'Bàn nháp',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <FileText className="w-4 h-4" />,
                    bgColor: 'bg-gray-50'
                };
            case 'Expired':
                return {
                    label: 'Đã hết hạn',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-blue-50'
                };
            case 'Terminated':
                return {
                    label: 'Đã chấm dứt',
                    color: 'bg-red-100 text-red-800',
                    icon: <AlertCircle className="w-4 h-4" />,
                    bgColor: 'bg-red-50'
                };
            case 'Rejected':
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

    const handleSendForApproval = async () => {
        if (!id || !contract) return;

        const confirmSend = window.confirm(
            `Bạn có chắc muốn gửi yêu cầu duyệt hợp đồng "${contract.contractNumber}"?\n\nHợp đồng sẽ chuyển sang trạng thái "Chờ duyệt" và Manager sẽ nhận được thông báo.`
        );
        if (!confirmSend) return;

        try {
            setIsUpdating(true);
            setUpdateError(null);
            setUpdateSuccess(false);

            // Lấy thông tin user để gửi trong updatedBy
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            const decoded = token ? decodeJWT(token) : null;
            const updatedBy =
                user?.name ||
                decoded?.unique_name ||
                decoded?.email ||
                "Nhân viên HR";

            // Chuyển status từ Draft sang Pending sử dụng API changeStatus
            const result = await partnerContractService.changeStatus(Number(id), {
                newStatus: 'Pending',
                notes: `Gửi yêu cầu duyệt hợp đồng ${contract.contractNumber}`,
                updatedBy: updatedBy,
            });

            // Cập nhật state ngay lập tức
            if (result.success && result.newStatus) {
                setContract({ ...contract, status: result.newStatus });
            } else {
                setContract({ ...contract, status: 'Pending' });
            }
            setUpdateSuccess(true);

            // Gửi thông báo cho manager
            try {
                const managersResponse = await userService.getAll({
                    role: "Manager",
                    excludeDeleted: true,
                    pageNumber: 1,
                    pageSize: 100
                });

                const managerIds =
                    (managersResponse.items || [])
                        .map((manager) => manager.id)
                        .filter((id): id is string => Boolean(id));

                if (managerIds.length > 0) {
                    const creatorName = updatedBy;

                    await notificationService.create({
                        title: "Hợp đồng nhân sự mới",
                        message: `${creatorName} vừa gửi yêu cầu duyệt hợp đồng nhân sự ${contract.contractNumber}. Vui lòng kiểm tra và phê duyệt.`,
                        type: NotificationType.ContractPendingApproval,
                        priority: NotificationPriority.Medium,
                        userIds: managerIds,
                        entityType: "PartnerContract",
                        entityId: contract.id,
                        actionUrl: `/manager/contracts/developers/${contract.id}`,
                        metaData: {
                            contractNumber: contract.contractNumber,
                            createdBy: String(creatorName),
                        },
                    });
                }
            } catch (notifyError) {
                console.error("⚠️ Không thể gửi thông báo tới Manager:", notifyError);
            }

            // Reload dữ liệu để đảm bảo đồng bộ (không hiển thị loading)
            await fetchData(false);

            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err: any) {
            const message =
                err?.errors != null
                    ? Object.values(err.errors).flat().join(", ")
                    : err?.message || err?.title || "Không thể gửi yêu cầu duyệt";
            setUpdateError(message);
            console.error("❌ Lỗi gửi yêu cầu duyệt:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !contract) return;

        const confirmDelete = window.confirm(
            `⚠️ Bạn có chắc muốn xóa hợp đồng "${contract.contractNumber}"?\n\nHành động này không thể hoàn tác!`
        );

        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            await partnerContractService.delete(Number(id));
            alert("✅ Xóa hợp đồng thành công!");
            navigate("/hr/contracts");
        } catch (err: any) {
            console.error("❌ Lỗi khi xóa hợp đồng:", err);
            alert(err?.message || "Không thể xóa hợp đồng. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRestoreToDraft = async () => {
        if (!id || !contract) return;

        const confirmRestore = window.confirm(
            `Bạn có chắc muốn chuyển hợp đồng "${contract.contractNumber}" về trạng thái Bản nháp?`
        );
        if (!confirmRestore) return;

        try {
            setIsRestoring(true);
            setUpdateError(null);

            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            const decoded = token ? decodeJWT(token) : null;
            const updatedBy =
                user?.name ||
                decoded?.unique_name ||
                decoded?.email ||
                "Nhân viên HR";

            const result = await partnerContractService.changeStatus(Number(id), {
                newStatus: "Draft",
                notes: `Khôi phục hợp đồng ${contract.contractNumber} về trạng thái nháp`,
                updatedBy,
            });

            const nextStatus = result.success && result.newStatus ? result.newStatus : "Draft";
            setContract({ ...contract, status: nextStatus });
            alert("✅ Đã chuyển hợp đồng về trạng thái Bản nháp.");
        } catch (err: any) {
            const message =
                err?.errors != null
                    ? Object.values(err.errors).flat().join(", ")
                    : err?.message || err?.title || "Không thể chuyển về trạng thái nháp";
            alert(message);
            console.error("❌ Lỗi khôi phục trạng thái:", err);
        } finally {
            setIsRestoring(false);
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

                        {/* Action Buttons - Chỉ hiển thị khi status là Draft */}
                        {contract.status === 'Draft' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/hr/contracts/edit/${id}`)}
                                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                                >
                                    <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    {isDeleting ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>
                        )}

                        {contract.status === 'Rejected' && (
                            <button
                                onClick={handleRestoreToDraft}
                                disabled={isRestoring}
                                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                {isRestoring ? "Đang chuyển..." : "Chuyển về Bản nháp"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Gửi yêu cầu duyệt - Chỉ hiển thị khi status là Draft */}
                {contract.status === 'Draft' && (
                    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-100 rounded-lg">
                                    <Send className="w-5 h-5 text-accent-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Gửi yêu cầu duyệt</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <p className="text-neutral-600 mb-4">
                                    Gửi hợp đồng này đến Manager để được phê duyệt. Sau khi gửi, hợp đồng sẽ chuyển sang trạng thái "Chờ duyệt" và Manager sẽ nhận được thông báo.
                                </p>
                                <button
                                    onClick={handleSendForApproval}
                                    disabled={isUpdating}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    {isUpdating ? "Đang gửi..." : "Gửi yêu cầu duyệt"}
                                </button>

                                {updateSuccess && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="text-green-700 font-medium">✅ Đã gửi yêu cầu duyệt thành công! Manager đã nhận được thông báo.</p>
                                    </div>
                                )}

                                {updateError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-700 font-medium">{updateError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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

