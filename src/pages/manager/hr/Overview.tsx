import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserMinus, Star } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface HRStats {
  summary: {
    totalDevelopers: number;
    activeDevelopers: number;
    newHires: number;
    turnoverRate: number;
  };
  bySpecialization: {
    name: string;
    value: number;
  }[];
  monthlyTrends: {
    month: string;
    hiring: number;
    leaving: number;
    net: number;
  }[];
}

export default function HROverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HRStats>({
    summary: {
      totalDevelopers: 0,
      activeDevelopers: 0,
      newHires: 0,
      turnoverRate: 0
    },
    bySpecialization: [],
    monthlyTrends: []
  });

  const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    // Mock data
    const mockStats: HRStats = {
      summary: {
        totalDevelopers: 150,
        activeDevelopers: 135,
        newHires: 25,
        turnoverRate: 8.5
      },
      bySpecialization: [
        { name: 'Frontend', value: 45 },
        { name: 'Backend', value: 40 },
        { name: 'Fullstack', value: 30 },
        { name: 'DevOps', value: 20 },
        { name: 'Mobile', value: 15 }
      ],
      monthlyTrends: [
        { month: 'T1', hiring: 5, leaving: 2, net: 3 },
        { month: 'T2', hiring: 7, leaving: 3, net: 4 },
        { month: 'T3', hiring: 4, leaving: 2, net: 2 },
        { month: 'T4', hiring: 6, leaving: 1, net: 5 },
        { month: 'T5', hiring: 8, leaving: 3, net: 5 },
        { month: 'T6', hiring: 5, leaving: 2, net: 3 }
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
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Nhân Sự</h1>
          <p className="text-neutral-600 mt-1">Thống kê và phân tích nhân sự</p>
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
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.activeDevelopers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <UserPlus className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tuyển mới (30 ngày)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.newHires}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <UserMinus className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ nghỉ việc</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.summary.turnoverRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo chuyên môn</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.bySpecialization}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => {
                        const { name, percent } = props as unknown as { name: string; percent: number };
                        return `${name} (${(percent * 100).toFixed(0)}%)`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.bySpecialization.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Biến động nhân sự</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hiring" name="Tuyển mới" stroke="#22c55e" />
                    <Line type="monotone" dataKey="leaving" name="Nghỉ việc" stroke="#ef4444" />
                    <Line type="monotone" dataKey="net" name="Tăng ròng" stroke="#6366f1" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}