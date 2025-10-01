import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface InterviewStats {
  month: string;
  total: number;
  successful: number;
  failed: number;
  pending: number;
}

export default function InterviewSuccess() {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InterviewStats[]>([]);

  // Mock data
  useEffect(() => {
    const mockStats: InterviewStats[] = [
      { month: 'T1/2025', total: 45, successful: 30, failed: 10, pending: 5 },
      { month: 'T2/2025', total: 38, successful: 25, failed: 8, pending: 5 },
      { month: 'T3/2025', total: 52, successful: 35, failed: 12, pending: 5 },
      { month: 'T4/2025', total: 48, successful: 32, failed: 10, pending: 6 },
      { month: 'T5/2025', total: 55, successful: 40, failed: 10, pending: 5 },
      { month: 'T6/2025', total: 50, successful: 35, failed: 8, pending: 7 },
    ];

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

  const pieData = [
    { name: 'Thành công', value: stats.reduce((acc, curr) => acc + curr.successful, 0) },
    { name: 'Thất bại', value: stats.reduce((acc, curr) => acc + curr.failed, 0) },
    { name: 'Đang xử lý', value: stats.reduce((acc, curr) => acc + curr.pending, 0) },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Tỷ Lệ Phỏng Vấn Thành Công</h1>
          <p className="text-neutral-600 mt-1">Thống kê và phân tích kết quả phỏng vấn</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="3months">3 tháng gần đây</option>
            <option value="6months">6 tháng gần đây</option>
            <option value="1year">1 năm gần đây</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary Cards */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng Quan</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600">Thành công</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round((stats.reduce((acc, curr) => acc + curr.successful, 0) / 
                    stats.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600">Thất bại</p>
                  <p className="text-2xl font-bold text-red-700">
                    {Math.round((stats.reduce((acc, curr) => acc + curr.failed, 0) / 
                    stats.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-600">Đang xử lý</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {Math.round((stats.reduce((acc, curr) => acc + curr.pending, 0) / 
                    stats.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân Bố Kết Quả</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu Hướng Theo Thời Gian</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successful" name="Thành công" fill="#22c55e" />
                  <Bar dataKey="failed" name="Thất bại" fill="#ef4444" />
                  <Bar dataKey="pending" name="Đang xử lý" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}