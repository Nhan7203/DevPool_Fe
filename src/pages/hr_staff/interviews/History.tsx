import { useEffect, useState } from 'react';
import { Search, Users, CheckCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface Interview {
    id: string;
    candidateName: string;
    interviewer: string;
    interviewDate: string;
    status: 'pending' | 'completed' | 'failed';
    result?: string;  // Optional field for the result of the interview
}

export default function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - Replace with API call
    useEffect(() => {
        const mockInterviews: Interview[] = [
            {
                id: '1',
                candidateName: 'Nguyễn Văn A',
                interviewer: 'Trần Thị B',
                interviewDate: '2023-09-25 14:00',
                status: 'completed',
                result: 'Passed',
            },
            {
                id: '2',
                candidateName: 'Trần Thị C',
                interviewer: 'Nguyễn Minh D',
                interviewDate: '2023-09-26 10:00',
                status: 'completed',
                result: 'Failed',
            },
            {
                id: '3',
                candidateName: 'Lê Quốc B',
                interviewer: 'Nguyễn Văn E',
                interviewDate: '2023-09-27 16:00',
                status: 'pending',
            },
        ];

        setTimeout(() => {
            setInterviews(mockInterviews);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="TA Staff" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lịch Sử Phỏng Vấn</h1>
                    <p className="text-neutral-600 mt-1">Theo dõi các cuộc phỏng vấn đã diễn ra và kết quả</p>
                </div>

                {/* Search */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[260px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên ứng viên, người phỏng vấn..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Interview History List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải lịch sử phỏng vấn...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.map((interview) => (
                            <div key={interview.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{interview.candidateName}</h3>
                                            <p className="text-sm text-gray-600">{interview.interviewer}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        interview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {interview.status === 'completed' ? 'Hoàn thành' :
                                            interview.status === 'pending' ? 'Chờ xử lý' :
                                                'Không đạt'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                            {interview.interviewDate}
                                        </span>
                                    </div>

                                    {interview.result && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>{interview.result}</span>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            Chi tiết
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
