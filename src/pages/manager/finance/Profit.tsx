import { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Activity } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface ProfitData {
  summary: {
    revenue: number;
    cost: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
    ebitda: number;
  };
  monthlyProfit: {
    month: string;
    revenue: number;
    cost: number;
    grossProfit: number;
    netProfit: number;
    margin: number;
  }[];
  profitByProject: {
    name: string;
    revenue: number;
    profit: number;
    margin: number;
    status: 'excellent' | 'good' | 'average' | 'poor';
  }[];
  profitByClient: {
    name: string;
    revenue: number;
    profit: number;
    projects: number;
    avgMargin: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }[];
}

export default function Profit() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [profitData, setProfitData] = useState<ProfitData>({
    summary: {
      revenue: 0,
      cost: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0,
      grossMargin: 0,
      netMargin: 0,
      ebitda: 0
    },
    monthlyProfit: [],
    profitByProject: [],
    profitByClient: [],
    expenseBreakdown: []
  });

  const COLORS = ['#22c55e', '#6366f1', '#eab308', '#f97316', '#ef4444', '#a855f7'];

  useEffect(() => {
    const mockData: ProfitData = {
      summary: {
        revenue: 8500000000,
        cost: 5100000000,
        grossProfit: 3400000000,
        operatingExpenses: 2040000000,
        netProfit: 1360000000,
        grossMargin: 40,
        netMargin: 16,
        ebitda: 1700000000
      },
      monthlyProfit: [
        { month: 'T1', revenue: 1200000000, cost: 780000000, grossProfit: 420000000, netProfit: 168000000, margin: 14 },
        { month: 'T2', revenue: 1350000000, cost: 850000000, grossProfit: 500000000, netProfit: 200000000, margin: 14.8 },
        { month: 'T3', revenue: 1400000000, cost: 868000000, grossProfit: 532000000, netProfit: 212800000, margin: 15.2 },
        { month: 'T4', revenue: 1450000000, cost: 885000000, grossProfit: 565000000, netProfit: 232000000, margin: 16 },
        { month: 'T5', revenue: 1500000000, cost: 900000000, grossProfit: 600000000, netProfit: 255000000, margin: 17 },
        { month: 'T6', revenue: 1600000000, cost: 950000000, grossProfit: 650000000, netProfit: 280000000, margin: 17.5 }
      ],
      profitByProject: [
        { name: 'KMS Development', revenue: 2500000000, profit: 750000000, margin: 30, status: 'excellent' },
        { name: 'NAVER Integration', revenue: 1800000000, profit: 450000000, margin: 25, status: 'excellent' },
        { name: 'Banking System', revenue: 1500000000, profit: 300000000, margin: 20, status: 'good' },
        { name: 'E-commerce Platform', revenue: 1200000000, profit: 180000000, margin: 15, status: 'average' },
        { name: 'Mobile App', revenue: 800000000, profit: 80000000, margin: 10, status: 'poor' },
        { name: 'CRM System', revenue: 700000000, profit: 140000000, margin: 20, status: 'good' }
      ],
      profitByClient: [
        { name: 'Công ty ABC', revenue: 2100000000, profit: 630000000, projects: 5, avgMargin: 30 },
        { name: 'Tập đoàn XYZ', revenue: 1800000000, profit: 432000000, projects: 3, avgMargin: 24 },
        { name: 'DNTN DEF', revenue: 1500000000, profit: 300000000, projects: 4, avgMargin: 20 },
        { name: 'Công ty GHI', revenue: 1200000000, profit: 216000000, projects: 2, avgMargin: 18 },
        { name: 'Cty TNHH JKL', revenue: 900000000, profit: 135000000, projects: 3, avgMargin: 15 }
      ],
      expenseBreakdown: [
        { category: 'Lương nhân sự', amount: 3500000000, percentage: 41.2, trend: 'up', change: 5.2 },
        { category: 'Thuê văn phòng', amount: 600000000, percentage: 7.1, trend: 'stable', change: 0.1 },
        { category: 'Marketing', amount: 400000000, percentage: 4.7, trend: 'up', change: 12.5 },
        { category: 'Vận hành', amount: 850000000, percentage: 10, trend: 'down', change: -3.2 },
        { category: 'Công nghệ', amount: 750000000, percentage: 8.8, trend: 'up', change: 8.7 },
        { category: 'Khác', amount: 400000000, percentage: 4.7, trend: 'stable', change: 1.1 }
      ]
    };

    setTimeout(() => {
      setProfitData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTrendIcon = (trend: 'up' | 'down' | 'stable', _change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    } else {
      return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lợi Nhuận</h1>
          <p className="text-neutral-600 mt-1">Theo dõi hiệu quả kinh doanh và lợi nhuận dự án</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Time Range Filter */}
            <div className="flex justify-end">
              <div className="bg-white rounded-lg shadow-soft p-1">
                <div className="flex gap-1">
                  {(['month', 'quarter', 'year'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        timeRange === range 
                          ? 'bg-primary-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {range === 'month' ? 'Tháng' : range === 'quarter' ? 'Quý' : 'Năm'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <span className="text-xs text-gray-500">Doanh thu</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitData.summary.revenue)}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12.5% so với kỳ trước
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                  <span className="text-xs text-gray-500">Lợi nhuận gộp</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitData.summary.grossProfit)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Margin: <span className="font-semibold text-green-600">{profitData.summary.grossMargin}%</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                  <span className="text-xs text-gray-500">Lợi nhuận ròng</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitData.summary.netProfit)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Margin: <span className="font-semibold text-primary-600">{profitData.summary.netMargin}%</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <Percent className="w-8 h-8 text-purple-600" />
                  <span className="text-xs text-gray-500">EBITDA</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitData.summary.ebitda)}</p>
                <p className="text-sm text-purple-600 mt-2">
                  {((profitData.summary.ebitda / profitData.summary.revenue) * 100).toFixed(1)}% of revenue
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit Trend */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng lợi nhuận</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={profitData.monthlyProfit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Doanh thu" stackId="1" stroke="#6366f1" fill="#6366f1" />
                    <Area type="monotone" dataKey="grossProfit" name="LN gộp" stackId="2" stroke="#22c55e" fill="#22c55e" />
                    <Area type="monotone" dataKey="netProfit" name="LN ròng" stackId="3" stroke="#eab308" fill="#eab308" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Margin Trend */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Biên lợi nhuận (%)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitData.monthlyProfit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 25]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Line type="monotone" dataKey="margin" name="Net Margin" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân tích chi phí</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={profitData.expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {profitData.expenseBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {profitData.expenseBreakdown.map((expense, index) => (
                    <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(expense.trend, expense.change)}
                        <span className={`text-sm font-medium ${
                          expense.trend === 'up' ? 'text-red-600' : 
                          expense.trend === 'down' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {expense.change > 0 ? '+' : ''}{expense.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit by Project */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lợi nhuận theo dự án</h2>
                <div className="space-y-3">
                  {profitData.profitByProject.map(project => (
                    <div key={project.name} className="border-b border-gray-100 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-600">Revenue: {formatCurrency(project.revenue)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.margin}% margin
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.status === 'excellent' ? 'bg-green-600' :
                              project.status === 'good' ? 'bg-blue-600' :
                              project.status === 'average' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${project.margin * 2}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(project.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profit by Client */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lợi nhuận theo khách hàng</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Khách hàng</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-700">Dự án</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-700">Lợi nhuận</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-700">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitData.profitByClient.map(client => (
                        <tr key={client.name} className="border-b border-gray-100">
                          <td className="py-3">
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-xs text-gray-500">Revenue: {formatCurrency(client.revenue)}</p>
                          </td>
                          <td className="text-center py-3">
                            <span className="text-sm text-gray-700">{client.projects}</span>
                          </td>
                          <td className="text-right py-3">
                            <p className="font-semibold text-gray-900">{formatCurrency(client.profit)}</p>
                          </td>
                          <td className="text-center py-3">
                            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold ${
                              client.avgMargin >= 25 ? 'bg-green-100 text-green-800' :
                              client.avgMargin >= 15 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {client.avgMargin}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}