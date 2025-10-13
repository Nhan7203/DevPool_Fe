import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Building2, Calendar, Users, ChevronRight } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface JobRequest {
    id: string;
    companyName: string;
    position: string;
    requiredSkills: string[];
    experience: string;
    quantity: number;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'high' | 'medium' | 'low';
    matchedCandidates: number;
    totalCandidates: number;
    createdAt: string;
}

export default function ListRequest() {
    const [requests, setRequests] = useState<JobRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Mock data
    useEffect(() => {
        const mockRequests: JobRequest[] = [
            {
                id: "JR001",
                companyName: "Tech Solutions Inc",
                position: "Senior Frontend Developer",
                requiredSkills: ["React", "TypeScript", "NextJS"],
                experience: "3-5 năm",
                quantity: 2,
                deadline: "2025-03-01",
                status: "in_progress",
                priority: "high",
                matchedCandidates: 5,
                totalCandidates: 12,
                createdAt: "2025-01-15",
            },
            {
                id: "JR002",
                companyName: "Digital Innovations",
                position: "Backend Developer",
                requiredSkills: ["Node.js", "PostgreSQL", "AWS"],
                experience: "2-4 năm",
                quantity: 1,
                deadline: "2025-02-28",
                status: "pending",
                priority: "medium",
                matchedCandidates: 3,
                totalCandidates: 8,
                createdAt: "2025-01-20",
            },
            // Add more mock data as needed
        ];

        setTimeout(() => {
            setRequests(mockRequests);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý';
            case 'in_progress':
                return 'Đang xử lý';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Tuyển Dụng</h1>
                    <p className="text-neutral-600 mt-1">Quản lý các yêu cầu tuyển dụng từ doanh nghiệp</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo công ty, vị trí..."
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
                </div>

                {/* Request Cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách yêu cầu...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{request.position}</h3>
                                            <p className="text-sm text-gray-600">{request.companyName}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                        {getStatusText(request.status)}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {request.requiredSkills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>Cần {request.quantity} developer</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Deadline: {new Date(request.deadline).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                                            ● Ưu tiên {request.priority === 'high' ? 'Cao' : request.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                        </span>
                                        <span className="text-gray-600">
                                            {request.matchedCandidates}/{request.totalCandidates} ứng viên phù hợp
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <Link 
                                            to={`/hr/job-requests/${request.id}`}
                                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                                        >
                                            Chi tiết <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            to={`/hr/job-requests/${request.id}/matching`}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                        >
                                            Matching CV
                                        </Link>
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