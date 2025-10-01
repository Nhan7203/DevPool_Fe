import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  Target,
  Handshake,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { sidebarItems } from '../../components/sales_staff/SidebarItems';

type Stage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';

interface SalesStats {
  newLeads: number;
  qualifiedLeads: number;
  jobRequests: number;
  proposalsSent: number;
  dealsWon: number;
  pipelineValue: number;           // VND
  conversionRate: number;          // %
  avgResponseTimeHours: number;    // hours
  monthlyPipeline: { month: string; pipeline: number; won: number }[];
  stageFunnel: { stage: Stage; count: number }[];
}

export default function SalesStaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats>({
    newLeads: 0,
    qualifiedLeads: 0,
    jobRequests: 0,
    proposalsSent: 0,
    dealsWon: 0,
    pipelineValue: 0,
    conversionRate: 0,
    avgResponseTimeHours: 0,
    monthlyPipeline: [],
    stageFunnel: []
  });

  useEffect(() => {
    // Mock data
    const mock: SalesStats = {
      newLeads: 68,
      qualifiedLeads: 42,
      jobRequests: 24,
      proposalsSent: 18,
      dealsWon: 9,
      pipelineValue: 4_750_000_000,
      conversionRate: 21.4,
      avgResponseTimeHours: 5.6,
      monthlyPipeline: [
        { month: 'T1', pipeline: 520_000_000, won: 110_000_000 },
        { month: 'T2', pipeline: 610_000_000, won: 140_000_000 },
        { month: 'T3', pipeline: 730_000_000, won: 160_000_000 },
        { month: 'T4', pipeline: 800_000_000, won: 190_000_000 },
        { month: 'T5', pipeline: 720_000_000, won: 170_000_000 },
        { month: 'T6', pipeline: 1_070_000_000, won: 260_000_000 }
      ],
      stageFunnel: [
        { stage: 'Lead', count: 120 },
        { stage: 'Qualified', count: 75 },
        { stage: 'Proposal', count: 38 },
        { stage: 'Negotiation', count: 19 },
        { stage: 'Won', count: 9 }
      ]
    };

    const t = setTimeout(() => {
      setStats(mock);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Sales" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-neutral-600 mt-1">Tổng quan pipeline và hiệu suất bán hàng</p>
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
              <KpiCard
                label="New Leads"
                value={stats.newLeads.toString()}
                icon={<Users className="w-6 h-6 text-primary-600" />}
                badge={{ dir: 'up', text: '+12%' }}
              />
              <KpiCard
                label="Qualified"
                value={stats.qualifiedLeads.toString()}
                icon={<Target className="w-6 h-6 text-amber-600" />}
                badge={{ dir: 'up', text: '+7%' }}
              />
              <KpiCard
                label="Job Requests"
                value={stats.jobRequests.toString()}
                icon={<FileText className="w-6 h-6 text-blue-600" />}
                badge={{ dir: 'down', text: '-3%' }}
              />
              <KpiCard
                label="Deals Won"
                value={stats.dealsWon.toString()}
                icon={<Handshake className="w-6 h-6 text-emerald-600" />}
                badge={{ dir: 'up', text: '+5%' }}
              />
              <KpiCard
                full
                label="Pipeline Value"
                value={formatVND(stats.pipelineValue)}
                icon={<DollarSign className="w-6 h-6 text-violet-600" />}
              />
              <KpiCard
                label="Conversion Rate"
                value={`${stats.conversionRate}%`}
                icon={<TrendingUp className="w-6 h-6 text-fuchsia-600" />}
              />
              <KpiCard
                label="Avg Response Time"
                value={`${stats.avgResponseTimeHours}h`}
                icon={<Clock className="w-6 h-6 text-sky-600" />}
              />
              <div className="hidden lg:block" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline theo tháng</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyPipeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(val: number) => formatVND(val)} />
                    <Legend />
                    <Line type="monotone" dataKey="pipeline" name="Pipeline" stroke="#6366f1" />
                    <Line type="monotone" dataKey="won" name="Won" stroke="#22c55e" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel theo giai đoạn</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.stageFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Số lượng" fill="#06b6d4" />
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

function KpiCard({
  label,
  value,
  icon,
  badge,
  full
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: { dir: 'up' | 'down'; text: string };
  full?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft p-6 ${full ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-xl">{icon}</div>
        {badge && (
          <span className={`${badge.dir === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {badge.dir === 'up' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
