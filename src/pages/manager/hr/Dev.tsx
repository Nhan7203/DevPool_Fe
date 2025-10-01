import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, GraduationCap, Award } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface DevStats {
  summary: {
    totalDevelopers: number;
    avgExperience: number;
    topSkills: string[];
    avgRating: number;
  };
  byExperience: {
    range: string;
    count: number;
  }[];
  bySkillLevel: {
    level: string;
    frontend: number;
    backend: number;
    fullstack: number;
    devops: number;
  }[];
}

export default function HRDevelopers() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DevStats>({
    summary: {
      totalDevelopers: 0,
      avgExperience: 0,
      topSkills: [],
      avgRating: 0
    },
    byExperience: [],
    bySkillLevel: []
  });

  useEffect(() => {
    // Mock data
    const mockStats: DevStats = {
      summary: {
        totalDevelopers: 150,
        avgExperience: 4.5,
        topSkills: ['React', 'Node.js', 'TypeScript', 'Java', 'Python'],
        avgRating: 4.2
      },
      byExperience: [
        { range: '0-1 năm', count: 20 },
        { range: '1-3 năm', count: 45 },
        { range: '3-5 năm', count: 50 },
        { range: '5-7 năm', count: 25 },
        { range: '7+ năm', count: 10 }
      ],
      bySkillLevel: [
        { level: 'Junior', frontend: 15, backend: 12, fullstack: 8, devops: 5 },
        { level: 'Middle', frontend: 20, backend: 18, fullstack: 15, devops: 8 },
        { level: 'Senior', frontend: 10, backend: 12, fullstack: 7, devops: 7 },
        { level: 'Lead', frontend: 5, backend: 5, fullstack: 3, devops: 2 }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thống Kê Developers</h1>
          <p className="text-neutral-600 mt-1">Phân tích chi tiết về đội ngũ developers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng số developers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.totalDevelopers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kinh nghiệm trung bình</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.avgExperience} năm</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kỹ năng phổ biến</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stats.summary.topSkills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.avgRating}/5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo kinh nghiệm</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byExperience}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo level và chuyên môn</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.bySkillLevel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="frontend" name="Frontend" fill="#6366f1" />
                    <Bar dataKey="backend" name="Backend" fill="#22c55e" />
                    <Bar dataKey="fullstack" name="Fullstack" fill="#eab308" />
                    <Bar dataKey="devops" name="DevOps" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}