import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileText, Calendar, UserCheck, Clock, Eye, Edit, TrendingUp, Building2, DollarSign, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerContractService, type PartnerContract, type PartnerContractFilter } from '../../../services/PartnerContract';
import { partnerService, type Partner } from '../../../services/Partner';
import { talentService, type Talent } from '../../../services/Talent';

export default function ListContract() {
    const [contracts, setContracts] = useState<PartnerContract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<PartnerContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [error, setError] = useState('');
    
    // Store partner and talent data for display
    const [partnersMap, setPartnersMap] = useState<Map<number, Partner>>(new Map());
    const [talentsMap, setTalentsMap] = useState<Map<number, Talent>>(new Map());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch contracts, partners, and talents in parallel
                const [contractsData, partnersData, talentsData] = await Promise.all([
                    partnerContractService.getAll({ excludeDeleted: true }),
                    partnerService.getAll(),
                    talentService.getAll({ excludeDeleted: true })
                ]);

                setContracts(contractsData);
                setFilteredContracts(contractsData);

                // Create maps for quick lookup
                const partnersMapData = new Map<number, Partner>();
                partnersData.forEach((p: Partner) => {
                    partnersMapData.set(p.id, p);
                });
                setPartnersMap(partnersMapData);

                const talentsMapData = new Map<number, Talent>();
                talentsData.forEach((t: Talent) => {
                    talentsMapData.set(t.id, t);
                });
                setTalentsMap(talentsMapData);
            } catch (err: any) {
                console.error("❌ Lỗi tải danh sách hợp đồng:", err);
                setError(err.message || "Không thể tải danh sách hợp đồng");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...contracts];
        if (searchTerm) {
            filtered = filtered.filter(c => {
                const contractNumber = c.contractNumber?.toLowerCase() || '';
                const talentName = talentsMap.get(c.talentId)?.fullName?.toLowerCase() || '';
                const partnerName = partnersMap.get(c.partnerId)?.companyName?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();
                
                return contractNumber.includes(searchLower) ||
                       talentName.includes(searchLower) ||
                       partnerName.includes(searchLower);
            });
        }
        if (filterStatus) {
            filtered = filtered.filter(c => c.status === filterStatus);
        }
        setFilteredContracts(filtered);
    }, [searchTerm, filterStatus, contracts, partnersMap, talentsMap]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'terminated':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang hiệu lực';
            case 'pending':
            case 'draft':
                return 'Chờ duyệt';
            case 'completed':
                return 'Đã hoàn thành';
            case 'terminated':
                return 'Đã chấm dứt';
            default:
                return status;
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (!value) return '—';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const getPartnerName = (partnerId: number) => {
        return partnersMap.get(partnerId)?.companyName || '—';
    };

    const getTalentName = (talentId: number) => {
        return talentsMap.get(talentId)?.fullName || '—';
    };

    const stats = [
        {
            title: 'Tổng Hợp Đồng',
            value: contracts.length.toString(),
            change: '+5 tuần này',
            trend: 'up',
            color: 'blue',
            icon: <FileText className="w-6 h-6" />
        },
        {
            title: 'Đang Hiệu Lực',
            value: contracts.filter(c => c.status === 'active').length.toString(),
            change: '+2 tuần này',
            trend: 'up',
            color: 'green',
            icon: <CheckCircle className="w-6 h-6" />
        },
        {
            title: 'Chờ Duyệt',
            value: contracts.filter(c => c.status === 'pending').length.toString(),
            change: '+1 tuần này',
            trend: 'up',
            color: 'orange',
            icon: <Clock className="w-6 h-6" />
        },
        {
            title: 'Tổng Giá Trị',
            value: `${(contracts.reduce((sum, c) => sum + (c.devRate || 0), 0) / 1000000).toFixed(0)}M`,
            change: '+20% tháng này',
            trend: 'up',
            color: 'purple',
            icon: <DollarSign className="w-6 h-6" />
        }
    ];

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải danh sách hợp đồng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 text-lg font-medium mb-2">Lỗi tải dữ liệu</p>
                        <p className="text-gray-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Hợp Đồng Đối Tác</h1>
                            <p className="text-neutral-600 mt-1">Quản lý và theo dõi các hợp đồng đối tác</p>
                        </div>
                        <Link
                            to="/hr/contracts/create"
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span>Tạo hợp đồng mới</span>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
                        {stats.map((stat, index) => (
                            <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                                        stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                                            stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                                                'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                                    } transition-all duration-300`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                                    <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                                    {stat.change}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
                    <div className="p-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo số hợp đồng, tên developer, công ty..."
                                    className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-neutral-50 focus:bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 bg-white"
                            >
                                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-medium">{showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}</span>
                            </button>
                        </div>

                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="draft">Chờ duyệt</option>
                                        <option value="active">Đang hiệu lực</option>
                                        <option value="completed">Đã hoàn thành</option>
                                        <option value="terminated">Đã chấm dứt</option>
                                    </select>
                                    <button
                                        onClick={() => { setFilterStatus(''); setSearchTerm(''); }}
                                        className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform"
                                    >
                                        <span className="font-medium">Đặt lại</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-neutral-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Danh sách hợp đồng</h2>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <span>Tổng: {filteredContracts.length} hợp đồng</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Số hợp đồng</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Nhân viên</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Đối tác</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thời hạn</th>
                                    <th className="py-4 px-6 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Mức Phí Dev</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Loại Mức Phí</th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredContracts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="w-8 h-8 text-neutral-400" />
                                                </div>
                                                <p className="text-neutral-500 text-lg font-medium">Không có hợp đồng nào phù hợp</p>
                                                <p className="text-neutral-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo hợp đồng mới</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContracts.map((contract, i) => (
                                        <tr
                                            key={contract.id}
                                            className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                                        >
                                            <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                                                    {contract.contractNumber}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-sm text-neutral-700">{getTalentName(contract.talentId)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-sm text-neutral-700">{getPartnerName(contract.partnerId)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-sm text-neutral-700">
                                                        {new Date(contract.startDate).toLocaleDateString('vi-VN')} {contract.endDate ? `- ${new Date(contract.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-sm font-medium text-neutral-700">
                                                        {formatCurrency(contract.devRate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-neutral-700">
                                                    {contract.rateType === 'Hourly' ? 'Theo giờ' :
                                                     contract.rateType === 'Daily' ? 'Theo ngày' :
                                                     contract.rateType === 'Monthly' ? 'Theo tháng' :
                                                     contract.rateType === 'Fixed' ? 'Cố định' : 
                                                     contract.rateType || '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                                                    {getStatusText(contract.status)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        to={`/hr/contracts/${contract.id}`}
                                                        className="group inline-flex items-center gap-1 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                                                    >
                                                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                        <span className="text-sm font-medium">Xem</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
