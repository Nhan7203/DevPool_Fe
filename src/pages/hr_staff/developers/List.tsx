import { useState, useEffect } from 'react';
import { Search, Filter, Users, X } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { talentService, type Developer, type TalentPayload } from '../../../services/Talent';
import EditForm from './Edit';

export default function ListDev() {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDev, setSelectedDev] = useState<Developer | null>(null);
    const [tab, setTab] = useState<'info' | 'edit'>('info');

    const [minYears, setMinYears] = useState('');
    const [maxYears, setMaxYears] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            setLoading(true);
            const data = await talentService.getAll();
            setDevelopers(data);
        } catch (err) {
            console.error("❌ Failed to fetch developers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (payload: TalentPayload) => {
        try {
            if (!selectedDev) return;
            await talentService.update(selectedDev.id, payload);
            alert("✅ Cập nhật thành công!");
            fetchDevelopers();
            setSelectedDev(null);
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi khi cập nhật!");
        }
    };


    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xoá ${name}?`)) {
            try {
                await talentService.deleteById(id);
                alert("Đã xoá developer thành công!");
                setSelectedDev(null);
                fetchDevelopers();
            } catch (error) {
                console.error(error);
                alert("Xoá thất bại!");
            }
        }
    };


    const filteredDevelopers = developers.filter((dev) => {
        const matchName = dev.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchYears =
            (!minYears || dev.yearsOfExp >= Number(minYears)) &&
            (!maxYears || dev.yearsOfExp <= Number(maxYears));

        const matchRate =
            (!minRate || dev.ratePerMonth >= Number(minRate)) &&
            (!maxRate || dev.ratePerMonth <= Number(maxRate));

        return matchName && matchYears && matchRate;
    });

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Danh Sách Developer</h1>
                    <p className="text-neutral-600 mt-1">Theo dõi thông tin developer trong hệ thống DevPool</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
                    >
                        <Filter className="w-5 h-5" />
                        {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                    </button>

                    {showFilters && (
                        <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {/* Kinh nghiệm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm (năm)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Từ"
                                        value={minYears}
                                        onChange={(e) => setMinYears(e.target.value)}
                                        className="w-full border rounded-lg px-2 py-1 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Đến"
                                        value={maxYears}
                                        onChange={(e) => setMaxYears(e.target.value)}
                                        className="w-full border rounded-lg px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Rate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($/tháng)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Từ"
                                        value={minRate}
                                        onChange={(e) => setMinRate(e.target.value)}
                                        className="w-full border rounded-lg px-2 py-1 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Đến"
                                        value={maxRate}
                                        onChange={(e) => setMaxRate(e.target.value)}
                                        className="w-full border rounded-lg px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Nút reset */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setMinYears('');
                                        setMaxYears('');
                                        setMinRate('');
                                        setMaxRate('');
                                    }}
                                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Developer Cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách developer...</p>
                    </div>
                ) : filteredDevelopers.length === 0 ? (
                    <p className="text-center text-gray-500">Không tìm thấy developer nào.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDevelopers.map((dev) => (
                            <div
                                key={dev.id}
                                className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{dev.fullName}</h3>
                                            <p className="text-sm text-gray-600">{dev.level || '—'}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${dev.status === 'Available'
                                            ? 'bg-green-100 text-green-800'
                                            : dev.status === 'Busy'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {dev.status || 'Unknown'}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-gray-700">
                                    <p>📧 <span className="text-gray-600">{dev.email || '—'}</span></p>
                                    <p>📞 <span className="text-gray-600">{dev.phone || '—'}</span></p>
                                    <p>💼 Kinh nghiệm: <span className="font-medium">{dev.yearsOfExp} năm</span></p>
                                    <p>💰 Rate: <span className="font-medium">{dev.ratePerMonth ? `$${dev.ratePerMonth}/mo` : '—'}</span></p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setSelectedDev(dev)}
                                        className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {selectedDev && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-2xl p-6 relative">
                        <button
                            onClick={() => setSelectedDev(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Tabs */}
                        <div className="flex gap-6 mb-6 border-b pb-2">
                            <button
                                className={`pb-2 font-medium text-lg ${tab === 'info'
                                    ? 'border-b-2 border-primary-600 text-primary-600'
                                    : 'text-gray-500'
                                    }`}
                                onClick={() => setTab('info')}
                            >
                                Thông tin
                            </button>
                            <button
                                className={`pb-2 font-medium text-lg ${tab === 'edit'
                                    ? 'border-b-2 border-primary-600 text-primary-600'
                                    : 'text-gray-500'
                                    }`}
                                onClick={() => setTab('edit')}
                            >
                                Chỉnh sửa
                            </button>
                        </div>

                        {/* Nội dung tab */}
                        {tab === 'info' ? (
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> {selectedDev.email || '—'}</p>
                                <p><strong>Phone:</strong> {selectedDev.phone || '—'}</p>
                                <p><strong>Level:</strong> {selectedDev.level || '—'}</p>
                                <p><strong>Kinh nghiệm:</strong> {selectedDev.yearsOfExp} năm</p>
                                <p><strong>Rate/tháng:</strong> {selectedDev.ratePerMonth ? `$${selectedDev.ratePerMonth}` : '—'}</p>
                                <p><strong>Trạng thái:</strong> {selectedDev.status || '—'}</p>
                                <p><strong>Partner ID:</strong> {selectedDev.partnerId ?? '—'}</p>
                                <p><strong>Project hiện tại:</strong> {selectedDev.currentProjectId ?? '—'}</p>
                                <p><strong>Contract hiện tại:</strong> {selectedDev.currentContractId ?? '—'}</p>
                            </div>
                        ) : (
                            <EditForm dev={selectedDev} onSave={handleUpdate} />
                        )}

                        <div className="mt-6 flex justify-between">
                            <button className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg" onClick={() => handleDelete(selectedDev.id, selectedDev.fullName)}>Xoá</button>

                            <button
                                onClick={() => setSelectedDev(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
