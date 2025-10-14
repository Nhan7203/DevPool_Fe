import { useState, useEffect } from 'react';
import { Search, Upload, FileText } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { Link } from 'react-router-dom';

interface CV {
    id: string;
    developerName: string;
    title: string;
    position: string;
    submitDate: string;
    skills: string[];
    experience: string;
    level: 'Junior' | 'Middle' | 'Senior' | 'Lead';
    fileUrl: string;
}

export default function ListCV() {
    const [cvList, setCVList] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosition, setSelectedPosition] = useState<string>('all');
    const [selectedSkill, setSelectedSkill] = useState<string>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');

    // Mock data
    useEffect(() => {
        const mockCVs: CV[] = [
            {
                id: '1',
                developerName: 'Nguyễn Văn A',
                title: 'Frontend Developer CV',
                position: 'Frontend Developer',
                submitDate: '2025-02-15',
                skills: ['React', 'TypeScript', 'Tailwind'],
                experience: '3 năm',
                level: 'Middle',
                fileUrl: '/cv/1.pdf',
            },
            {
                id: '2',
                developerName: 'Trần Thị B',
                title: 'Backend Developer CV',
                position: 'Backend Developer',
                submitDate: '2025-03-10',
                skills: ['Node.js', 'NestJS', 'PostgreSQL'],
                experience: '5 năm',
                level: 'Senior',
                fileUrl: '/cv/2.pdf',
            },
        ];

        setTimeout(() => {
            setCVList(mockCVs);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter logic
    const filteredCVs = cvList.filter((cv) => {
        const matchesSearch = cv.developerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || cv.position === selectedPosition;
        const matchesSkill = selectedSkill === 'all' || cv.skills.includes(selectedSkill);
        const matchesLevel = selectedLevel === 'all' || cv.level === selectedLevel;
        return matchesSearch && matchesPosition && matchesSkill && matchesLevel;
    });

    const allPositions = Array.from(new Set(cvList.map((cv) => cv.position)));
    const allSkills = Array.from(new Set(cvList.flatMap((cv) => cv.skills)));

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Danh dách CV</h1>
                    <p className="text-neutral-600 mt-1">Tìm kiếm, lọc và xem thông tin hồ sơ ứng viên</p>
                </div>

                {/* Search + Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[260px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên ứng viên..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <select
                        value={selectedPosition}
                        onChange={(e) => setSelectedPosition(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả vị trí</option>
                        {allPositions.map((pos) => (
                            <option key={pos} value={pos}>
                                {pos}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả kỹ năng</option>
                        {allSkills.map((skill) => (
                            <option key={skill} value={skill}>
                                {skill}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
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
                        {filteredCVs.map((cv) => (
                            <div
                                key={cv.id}
                                className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{cv.developerName}</h3>
                                            <p className="text-sm text-gray-600">{cv.position}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {cv.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p>Cấp độ: {cv.level}</p>
                                        <p>Kinh nghiệm: {cv.experience}</p>
                                        <p>Ngày nộp: {new Date(cv.submitDate).toLocaleDateString('vi-VN')}</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <Link
                                            to={`/hr/cvs/${cv.id}`}
                                            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            Xem chi tiết
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
