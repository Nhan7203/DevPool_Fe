import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface RevenueStats {
  summary: {
    totalRevenue: number;
    growth: number;
    avgDealSize: number;
    conversionRate: number;
  };
  monthly: {
    month: string;
    revenue: number;
    target: number;
    deals: number;
  }[];
  sources: {
    name: string;
    value: number;
    growth: number;
  }[];
}

export default function Revenue() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');
  const [stats, setStats] = useState<RevenueStats>({
    summary: {
      totalRevenue: 0,
      growth: 0,
      avgDealSize: 0,
      conversionRate: 0
    },
    monthly: [],
    sources: []
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  useEffect(() => {
    // Mock data
    const mockStats: RevenueStats = {
      summary: {
        totalRevenue: 15000000000,
        growth: 23.5,
        avgDealSize: 250000000,
        conversionRate: 68
      },
      monthly: [
        { month: 'T1', revenue: 1200000000, target: 1000000000, deals: 5 },
        { month: 'T2', revenue: 1400000000, target: 1200000000, deals: 6 },
        { month: 'T3', revenue: 1100000000, target: 1300000000, deals: 4 },
        { month: 'T4', revenue: 1600000000, target: 1400000000, deals: 7 },
        { month: 'T5', revenue: 1800000000, target: 1500000000, deals: 8 },
        { month: 'T6', revenue: 1500000000, target: 1600000000, deals: 6 }
      ],
      sources: [
        { name: 'Outsourcing', value: 8000000000, growth: 15 },
        { name: 'Staff Augmentation', value: 5000000000, growth: 28 },
        { name: 'Project-based', value: 2000000000, growth: -5 }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doanh Thu</h1>
              <p className="text-neutral-600 mt-1">Phân tích chi tiết doanh thu</p>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="year">Năm nay</option>
              <option value="quarter">Quý này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="w-4 h-4" />
                    {stats.summary.growth}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.summary.totalRevenue)}
                </p>
              </div>

              {/* Add more summary cards */}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo thời gian</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Doanh thu" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Mục tiêu" 
                    stroke="#22c55e" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Sources */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nguồn doanh thu</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Doanh thu" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}