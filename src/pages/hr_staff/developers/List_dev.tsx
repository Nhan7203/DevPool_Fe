import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Users } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface Developer {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    phone: string;
    specialization: string;
    skills: string[];
    experience: number;
    status: 'available' | 'assigned' | 'busy';
    rating: number;
    currentProject?: string;
}

export default function ListDev() {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Mock data - replace with API call
    useEffect(() => {
        const mockDevelopers: Developer[] = [
            {
                id: '1',
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@devpool.com',
                phone: '0123456789',
                specialization: 'Frontend Developer',
                skills: ['React', 'TypeScript', 'Tailwind CSS'],
                experience: 3,
                status: 'available',
                rating: 4.5,
            },
            // Add more mock developers
        ];

        setTimeout(() => {
            setDevelopers(mockDevelopers);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Danh Sách Developer</h1>
                    <p className="text-neutral-600 mt-1">Quản lý và theo dõi thông tin các developer</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, kỹ năng..."
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

                    <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Thêm Developer
                    </button>
                </div>

                {/* Developer Cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách developer...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {developers.map((developer) => (
                            <div key={developer.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{developer.name}</h3>
                                            <p className="text-sm text-gray-600">{developer.specialization}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${developer.status === 'available' ? 'bg-green-100 text-green-800' :
                                        developer.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {developer.status === 'available' ? 'Sẵn sàng' :
                                            developer.status === 'assigned' ? 'Đã phân công' :
                                                'Bận'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {developer.skills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{developer.experience} năm kinh nghiệm</span>
                                        <span>⭐ {developer.rating}</span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            Chi tiết
                                        </button>
                                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                            Liên hệ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>


    );
}