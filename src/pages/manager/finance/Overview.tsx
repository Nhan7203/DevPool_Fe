import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank, ArrowUpRight } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface FinanceData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    cashBalance: number;
    accountsReceivable: number;
    accountsPayable: number;
    burnRate: number;
  };
  monthlyFinance: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  revenueBreakdown: {
    name: string;
    value: number;
    percentage: number;
  }[];
  expenseBreakdown: {
    name: string;
    value: number;
    percentage: number;
  }[];
  cashflowTrend: {
    month: string;
    inflow: number;
    outflow: number;
    net: number;
  }[];
}

export default function FinanceOverview() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [financeData, setFinanceData] = useState<FinanceData>({
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      cashBalance: 0,
      accountsReceivable: 0,
      accountsPayable: 0,
      burnRate: 0
    },
    monthlyFinance: [],
    revenueBreakdown: [],
    expenseBreakdown: [],
    cashflowTrend: []
  });

  const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  useEffect(() => {
    // Mock data
    const mockData: FinanceData = {
      summary: {
        totalRevenue: 25500000000, // 25.5 billion VND
        totalExpenses: 18200000000, // 18.2 billion VND
        netProfit: 7300000000, // 7.3 billion VND
        profitMargin: 28.6,
        cashBalance: 12800000000, // 12.8 billion VND
        accountsReceivable: 4200000000, // 4.2 billion VND
        accountsPayable: 2100000000, // 2.1 billion VND
        burnRate: 1500000000 // 1.5 billion VND per month
      },
      monthlyFinance: [
        { month: 'T1', revenue: 3800000000, expenses: 2900000000, profit: 900000000 },
        { month: 'T2', revenue: 4100000000, expenses: 3000000000, profit: 1100000000 },
        { month: 'T3', revenue: 3900000000, expenses: 2850000000, profit: 1050000000 },
        { month: 'T4', revenue: 4300000000, expenses: 3100000000, profit: 1200000000 },
        { month: 'T5', revenue: 4500000000, expenses: 3200000000, profit: 1300000000 },
        { month: 'T6', revenue: 4900000000, expenses: 3150000000, profit: 1750000000 }
      ],
      revenueBreakdown: [
        { name: 'Dự án phần mềm', value: 15300000000, percentage: 60 },
        { name: 'Tư vấn', value: 5100000000, percentage: 20 },
        { name: 'Bảo trì', value: 3825000000, percentage: 15 },
        { name: 'Đào tạo', value: 1275000000, percentage: 5 }
      ],
      expenseBreakdown: [
        { name: 'Lương nhân viên', value: 10920000000, percentage: 60 },
        { name: 'Văn phòng', value: 2730000000, percentage: 15 },
        { name: 'Marketing', value: 1820000000, percentage: 10 },
        { name: 'R&D', value: 1456000000, percentage: 8 },
        { name: 'Vận hành', value: 1274000000, percentage: 7 }
      ],
      cashflowTrend: [
        { month: 'T1', inflow: 3500000000, outflow: 2800000000, net: 700000000 },
        { month: 'T2', inflow: 3900000000, outflow: 2950000000, net: 950000000 },
        { month: 'T3', inflow: 3700000000, outflow: 2750000000, net: 950000000 },
        { month: 'T4', inflow: 4100000000, outflow: 3000000000, net: 1100000000 },
        { month: 'T5', inflow: 4300000000, outflow: 3100000000, net: 1200000000 },
        { month: 'T6', inflow: 4700000000, outflow: 3050000000, net: 1650000000 }
      ]
    };

    setTimeout(() => {
      setFinanceData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  const formatPercentage = (value: number, change: boolean = false) => {
    if (change) {
      return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Tài Chính</h1>
          <p className="text-neutral-600 mt-1">Phân tích và theo dõi tình hình tài chính doanh nghiệp</p>
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
            {/* Summary Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    +12.5%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financeData.summary.totalRevenue)}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="flex items-center text-sm text-red-600 font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    +8.3%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financeData.summary.totalExpenses)}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    +15.7%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Lợi nhuận ròng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financeData.summary.netProfit)}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <PiggyBank className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-500">Margin</span>
                </div>
                <p className="text-sm text-gray-600">Biên lợi nhuận</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercentage(financeData.summary.profitMargin)}</p>
              </div>
            </div>

            {/* Summary Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Số dư tiền mặt</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(financeData.summary.cashBalance)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phải thu</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(financeData.summary.accountsReceivable)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phải trả</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(financeData.summary.accountsPayable)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Burn Rate/tháng</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(financeData.summary.burnRate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue & Profit Trend */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu & Lợi nhuận</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financeData.monthlyFinance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cashflow Trend */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dòng tiền</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financeData.cashflowTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="inflow" name="Tiền vào" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="outflow" name="Tiền ra" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" name="Dòng tiền ròng" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cơ cấu doanh thu</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financeData.revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financeData.revenueBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {financeData.revenueBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cơ cấu chi phí</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financeData.expenseBreakdown} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#6366f1">
                      {financeData.expenseBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Ratios */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số tài chính quan trọng</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">8.5</p>
                  <p className="text-sm text-gray-600 mt-1">Runway (tháng)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">2.8</p>
                  <p className="text-sm text-gray-600 mt-1">Current Ratio</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">45</p>
                  <p className="text-sm text-gray-600 mt-1">DSO (ngày)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">32.5%</p>
                  <p className="text-sm text-gray-600 mt-1">ROE</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">18.7%</p>
                  <p className="text-sm text-gray-600 mt-1">ROA</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}