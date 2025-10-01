import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Briefcase, ChevronUp, ChevronDown } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface DashboardStats {
  totalRevenue: number;
  totalDevelopers: number;
  activeProjects: number;
  clientSatisfaction: number;
  monthlyStats: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalDevelopers: 0,
    activeProjects: 0,
    clientSatisfaction: 0,
    monthlyStats: []
  });

  useEffect(() => {
    // Mock data
    const mockStats: DashboardStats = {
      totalRevenue: 1250000000,
      totalDevelopers: 150,
      activeProjects: 45,
      clientSatisfaction: 92,
      monthlyStats: [
        { month: 'T1', revenue: 180000000, expenses: 120000000, profit: 60000000 },
        { month: 'T2', revenue: 220000000, expenses: 140000000, profit: 80000000 },
        { month: 'T3', revenue: 250000000, expenses: 160000000, profit: 90000000 },
        { month: 'T4', revenue: 300000000, expenses: 180000000, profit: 120000000 },
        { month: 'T5', revenue: 280000000, expenses: 170000000, profit: 110000000 },
        { month: 'T6', revenue: 320000000, expenses: 190000000, profit: 130000000 },
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-green-600 flex items-center">
                    <ChevronUp className="w-4 h-4" />
                    12%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-green-600 flex items-center">
                    <ChevronUp className="w-4 h-4" />
                    8%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Developers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDevelopers}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-red-600 flex items-center">
                    <ChevronDown className="w-4 h-4" />
                    3%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Dự án đang thực hiện</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-600 flex items-center">
                    <ChevronUp className="w-4 h-4" />
                    5%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Độ hài lòng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clientSatisfaction}%</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu & Chi phí</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#6366f1" />
                    <Line type="monotone" dataKey="expenses" name="Chi phí" stroke="#f43f5e" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lợi nhuận</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="profit" name="Lợi nhuận" fill="#22c55e" />
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