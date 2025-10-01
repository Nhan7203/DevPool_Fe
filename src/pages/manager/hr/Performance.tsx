import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Clock, AlertCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface PerformanceData {
  summary: {
    averageScore: number;
    topPerformers: number;
    needsImprovement: number;
    onTrack: number;
  };
  byTeam: {
    team: string;
    score: number;
    productivity: number;
    quality: number;
    deadline: number;
  }[];
  monthlyTrends: {
    month: string;
    avgScore: number;
    productivity: number;
    quality: number;
  }[];
  skillsRadar: {
    skill: string;
    current: number;
    target: number;
  }[];
  developers: {
    id: number;
    name: string;
    role: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    projects: number;
    completionRate: number;
  }[];
}

export default function HRPerformance() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    summary: {
      averageScore: 0,
      topPerformers: 0,
      needsImprovement: 0,
      onTrack: 0
    },
    byTeam: [],
    monthlyTrends: [],
    skillsRadar: [],
    developers: []
  });

  useEffect(() => {
    // Mock data
    const mockData: PerformanceData = {
      summary: {
        averageScore: 82.5,
        topPerformers: 28,
        needsImprovement: 12,
        onTrack: 95
      },
      byTeam: [
        { team: 'Frontend', score: 85, productivity: 88, quality: 82, deadline: 90 },
        { team: 'Backend', score: 83, productivity: 85, quality: 84, deadline: 86 },
        { team: 'Mobile', score: 87, productivity: 89, quality: 85, deadline: 88 },
        { team: 'DevOps', score: 81, productivity: 83, quality: 80, deadline: 82 },
        { team: 'QA', score: 79, productivity: 78, quality: 86, deadline: 84 }
      ],
      monthlyTrends: [
        { month: 'T1', avgScore: 78, productivity: 75, quality: 80 },
        { month: 'T2', avgScore: 79, productivity: 77, quality: 81 },
        { month: 'T3', avgScore: 81, productivity: 80, quality: 82 },
        { month: 'T4', avgScore: 82, productivity: 82, quality: 83 },
        { month: 'T5', avgScore: 83, productivity: 84, quality: 84 },
        { month: 'T6', avgScore: 84, productivity: 85, quality: 85 }
      ],
      skillsRadar: [
        { skill: 'Coding', current: 85, target: 90 },
        { skill: 'Problem Solving', current: 82, target: 85 },
        { skill: 'Communication', current: 78, target: 85 },
        { skill: 'Teamwork', current: 88, target: 90 },
        { skill: 'Time Management', current: 75, target: 80 },
        { skill: 'Innovation', current: 80, target: 85 }
      ],
      developers: [
        { id: 1, name: 'Nguyễn Văn A', role: 'Senior Frontend', score: 92, trend: 'up', projects: 8, completionRate: 95 },
        { id: 2, name: 'Trần Thị B', role: 'Backend Lead', score: 89, trend: 'stable', projects: 6, completionRate: 92 },
        { id: 3, name: 'Lê Văn C', role: 'Mobile Developer', score: 87, trend: 'up', projects: 5, completionRate: 88 },
        { id: 4, name: 'Phạm Thị D', role: 'DevOps Engineer', score: 85, trend: 'up', projects: 7, completionRate: 90 },
        { id: 5, name: 'Hoàng Văn E', role: 'QA Lead', score: 83, trend: 'stable', projects: 9, completionRate: 87 },
        { id: 6, name: 'Vũ Thị F', role: 'Junior Frontend', score: 75, trend: 'down', projects: 4, completionRate: 78 },
        { id: 7, name: 'Đinh Văn G', role: 'Backend Developer', score: 70, trend: 'down', projects: 3, completionRate: 72 }
      ]
    };

    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hiệu Suất Làm Việc</h1>
          <p className="text-neutral-600 mt-1">Đánh giá và phân tích hiệu suất của đội ngũ phát triển</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'quarter' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Quý này
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'year' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Năm nay
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm TB Hiệu suất</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.summary.averageScore}%</p>
                    <p className="text-xs text-green-600 mt-1">+3.2% so với kỳ trước</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Xuất sắc</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.summary.topPerformers}</p>
                    <p className="text-xs text-gray-500 mt-1">Điểm ≥ 85%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đúng tiến độ</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.summary.onTrack}</p>
                    <p className="text-xs text-gray-500 mt-1">Hoàn thành deadline</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cần cải thiện</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.summary.needsImprovement}</p>
                    <p className="text-xs text-gray-500 mt-1">Điểm 70%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất theo Team</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.byTeam}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="productivity" name="Năng suất" fill="#6366f1" />
                    <Bar dataKey="quality" name="Chất lượng" fill="#22c55e" />
                    <Bar dataKey="deadline" name="Deadline" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Skills Radar */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kỹ năng tổng hợp</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData.skillsRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Hiện tại" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Radar name="Mục tiêu" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng hiệu suất</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" name="Điểm TB" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="productivity" name="Năng suất" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="quality" name="Chất lượng" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Performers Table */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Bảng xếp hạng Developer</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Xem tất cả →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Developer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vai trò</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Điểm</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Xu hướng</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Dự án</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Tỷ lệ HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.developers.map((dev) => (
                      <tr key={dev.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {dev.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-gray-900">{dev.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{dev.role}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(dev.score)} ${getScoreColor(dev.score)}`}>
                            {dev.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-lg ${getTrendColor(dev.trend)}`}>
                            {getTrendIcon(dev.trend)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-900">{dev.projects}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full" 
                                style={{ width: `${dev.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{dev.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}