import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';
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
    return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
  };

  const statsCards = [
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      change: 'Tăng 12% so với tháng trước',
      color: 'blue',
      icon: DollarSign
    },
    {
      title: 'Developers',
      value: stats.totalDevelopers.toString(),
      change: 'Tăng 8% so với tháng trước',
      color: 'green',
      icon: Users
    },
    {
      title: 'Dự án đang thực hiện',
      value: stats.activeProjects.toString(),
      change: 'Giảm 3% so với tháng trước',
      color: 'purple',
      icon: Briefcase
    },
    {
      title: 'Độ hài lòng',
      value: `${stats.clientSatisfaction}%`,
      change: 'Tăng 5% so với tháng trước',
      color: 'orange',
      icon: TrendingUp
    }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
              {statsCards.map((stat, index) => (
                <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300 break-words leading-tight">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full flex-shrink-0 ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                      stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                        stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                          'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                      } transition-all duration-300`}>
                      {stat.icon && <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />}
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
                    <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                    {stat.change}
                  </p>
                </div>
              ))}
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