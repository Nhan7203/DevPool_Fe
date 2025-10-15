import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, Target, Handshake, DollarSign, FileText,
  TrendingUp, Clock, ChevronUp, ChevronDown, PlusCircle
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import { sidebarItems } from "../../components/sales_staff/SidebarItems";

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newLeads: 68,
    qualifiedLeads: 42,
    jobRequests: 24,
    proposalsSent: 18,
    dealsWon: 9,
    pipelineValue: 4750000000,
    conversionRate: 21.4,
    avgResponseTimeHours: 5.6,
    monthlyPipeline: [
      { month: "T1", pipeline: 520000000, won: 110000000 },
      { month: "T2", pipeline: 610000000, won: 140000000 },
      { month: "T3", pipeline: 730000000, won: 160000000 },
      { month: "T4", pipeline: 800000000, won: 190000000 },
      { month: "T5", pipeline: 720000000, won: 170000000 },
      { month: "T6", pipeline: 1070000000, won: 260000000 },
    ],
    stageFunnel: [
      { stage: "Lead", count: 120 },
      { stage: "Qualified", count: 75 },
      { stage: "Proposal", count: 38 },
      { stage: "Negotiation", count: 19 },
      { stage: "Won", count: 9 },
    ],
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-neutral-600">Theo dõi hiệu suất và pipeline bán hàng</p>
          </div>
          <button className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-xl hover:scale-105 transition-all shadow-soft hover:shadow-glow">
            <PlusCircle className="w-5 h-5" />
            <span>Thêm Lead</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard label="New Leads" value={stats.newLeads} color="from-sky-500 to-blue-600" icon={<Users />} />
              <KpiCard label="Qualified" value={stats.qualifiedLeads} color="from-amber-400 to-orange-500" icon={<Target />} />
              <KpiCard label="Deals Won" value={stats.dealsWon} color="from-emerald-400 to-green-500" icon={<Handshake />} />
              <KpiCard label="Pipeline Value" value={formatVND(stats.pipelineValue)} color="from-violet-400 to-indigo-500" icon={<DollarSign />} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Pipeline theo tháng">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyPipeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatVND(Number(v))} />
                    <Legend />
                    <Line type="monotone" dataKey="pipeline" name="Pipeline" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="won" name="Won" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Phễu bán hàng (Sales Funnel)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.stageFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">{icon}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
