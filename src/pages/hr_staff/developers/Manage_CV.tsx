import { useState, useEffect } from 'react';
import { Search, Upload, Eye, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface CV {
    id: string;
    developerName: string;
    title: string;
    submitDate: string;
    skills: string[];
    experience: string;
    status: 'pending' | 'approved' | 'rejected';
    fileUrl: string;
}

export default function ManageCV() {
    const [cvList, setCVList] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Mock data - replace with API call
    useEffect(() => {
        const mockCVs: CV[] = [
            {
                id: '1',
                developerName: 'Nguyễn Văn A',
                title: 'Frontend Developer CV',
                submitDate: '2025-02-15',
                skills: ['React', 'TypeScript', 'Tailwind'],
                experience: '3 năm',
                status: 'pending',
                fileUrl: '/cv/1.pdf'
            },
            // Add more mock CVs
        ];

        setTimeout(() => {
            setCVList(mockCVs);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />
            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý CV</h1>
                    <p className="text-neutral-600 mt-1">Duyệt và quản lý CV của các developer</p>
                </div>

                {/* Search and Upload */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm CV..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>

                    <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                        <Upload className="w-5 h-5" />
                        Tải lên CV
                    </button>
                </div>

                {/* CV List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách CV...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvList.map((cv) => (
                            <div key={cv.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{cv.title}</h3>
                                        <p className="text-sm text-gray-600">{cv.developerName}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cv.status)}`}>
                                        {cv.status === 'pending' ? 'Chờ duyệt' :
                                            cv.status === 'approved' ? 'Đã duyệt' :
                                                'Từ chối'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {cv.skills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p>Kinh nghiệm: {cv.experience}</p>
                                        <p>Ngày nộp: {new Date(cv.submitDate).toLocaleDateString('vi-VN')}</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                                        <button className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            <Eye className="w-4 h-4" />
                                            Xem CV
                                        </button>
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                <CheckCircle className="w-4 h-4" />
                                                Duyệt
                                            </button>
                                            <button className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <XCircle className="w-4 h-4" />
                                                Từ chối
                                            </button>
                                        </div>
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