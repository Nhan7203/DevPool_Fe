import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Wallet,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { sidebarItems } from '../../components/accountant_staff/SidebarItems';
import Sidebar from '../../components/common/Sidebar';

type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

interface AccountantStats {
  cashOnHand: number;         // Tiền mặt/TK
  arTotal: number;            // Phải thu
  apTotal: number;            // Phải trả
  invoicesIssued: number;     // Hóa đơn phát hành tháng
  invoicesPaid: number;       // Hóa đơn đã thu
  invoicesOverdue: number;    // Hóa đơn quá hạn
  dso: number;                // Days Sales Outstanding
  collectionRate: number;     // % thu tiền
  monthlyCashflow: { month: string; inflow: number; outflow: number; net: number }[];
  arAging: { bucket: AgingBucket; amount: number }[];
  apAging: { bucket: AgingBucket; amount: number }[];
}

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AccountantStats>({
    cashOnHand: 0,
    arTotal: 0,
    apTotal: 0,
    invoicesIssued: 0,
    invoicesPaid: 0,
    invoicesOverdue: 0,
    dso: 0,
    collectionRate: 0,
    monthlyCashflow: [],
    arAging: [],
    apAging: []
  });

  useEffect(() => {
    const mock: AccountantStats = {
      cashOnHand: 3_250_000_000,
      arTotal: 2_180_000_000,
      apTotal: 1_240_000_000,
      invoicesIssued: 56,
      invoicesPaid: 41,
      invoicesOverdue: 7,
      dso: 48,
      collectionRate: 73.2,
      monthlyCashflow: [
        { month: 'T1', inflow: 620_000_000, outflow: 480_000_000, net: 140_000_000 },
        { month: 'T2', inflow: 710_000_000, outflow: 520_000_000, net: 190_000_000 },
        { month: 'T3', inflow: 760_000_000, outflow: 590_000_000, net: 170_000_000 },
        { month: 'T4', inflow: 820_000_000, outflow: 650_000_000, net: 170_000_000 },
        { month: 'T5', inflow: 790_000_000, outflow: 670_000_000, net: 120_000_000 },
        { month: 'T6', inflow: 910_000_000, outflow: 720_000_000, net: 190_000_000 }
      ],
      arAging: [
        { bucket: '0-30', amount: 980_000_000 },
        { bucket: '31-60', amount: 720_000_000 },
        { bucket: '61-90', amount: 340_000_000 },
        { bucket: '90+', amount: 140_000_000 }
      ],
      apAging: [
        { bucket: '0-30', amount: 520_000_000 },
        { bucket: '31-60', amount: 410_000_000 },
        { bucket: '61-90', amount: 190_000_000 },
        { bucket: '90+', amount: 120_000_000 }
      ]
    };

    const t = setTimeout(() => {
      setStats(mock);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v) + ' VNĐ';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
          <p className="text-neutral-600 mt-1">Tiền mặt, công nợ, hóa đơn và dòng tiền</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard label="Cash on hand" value={formatVND(stats.cashOnHand)} icon={<Wallet className="w-6 h-6 text-emerald-600" />} />
              <KpiCard label="Accounts Receivable" value={formatVND(stats.arTotal)} icon={<DollarSign className="w-6 h-6 text-blue-600" />} badge={{ dir: 'up', text: '+6%' }} />
              <KpiCard label="Accounts Payable" value={formatVND(stats.apTotal)} icon={<DollarSign className="w-6 h-6 text-rose-600" />} badge={{ dir: 'down', text: '-3%' }} />
              <KpiCard label="DSO" value={`${stats.dso} ngày`} icon={<CalendarClock className="w-6 h-6 text-amber-600" />} />

              <KpiCard label="Issued" value={stats.invoicesIssued.toString()} icon={<Receipt className="w-6 h-6 text-violet-600" />} />
              <KpiCard label="Paid" value={stats.invoicesPaid.toString()} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} />
              <KpiCard label="Overdue" value={stats.invoicesOverdue.toString()} icon={<AlertTriangle className="w-6 h-6 text-red-600" />} />
              <KpiCard label="Collection Rate" value={`${stats.collectionRate}%`} icon={<TrendingUp className="w-6 h-6 text-fuchsia-600" />} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dòng tiền theo tháng</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyCashflow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatVND(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="inflow" name="Inflow" stroke="#22c55e" />
                    <Line type="monotone" dataKey="outflow" name="Outflow" stroke="#ef4444" />
                    <Line type="monotone" dataKey="net" name="Net" stroke="#6366f1" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Aging AR vs AP</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.arAging.map((a, i) => ({
                      bucket: a.bucket,
                      AR: a.amount,
                      AP: stats.apAging[i]?.amount ?? 0
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatVND(v)} />
                    <Legend />
                    <Bar dataKey="AR" name="Phải thu (AR)" fill="#3b82f6" />
                    <Bar dataKey="AP" name="Phải trả (AP)" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" /> Mục tiêu: giảm nhóm 61–90 và 90+
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  badge
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: { dir: 'up' | 'down'; text: string };
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-xl">{icon}</div>
        {badge && (
          <span className={`${badge.dir === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {badge.dir === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
