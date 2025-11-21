import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Code2,
  Timer,
  ClipboardList,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { sidebarItems } from '../../components/developer/SidebarItems';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { decodeJWT } from '../../services/Auth';
import { talentService, type Talent } from '../../services/Talent';
import { partnerContractService, type PartnerContract } from '../../services/PartnerContract';
import { clientContractService, type ClientContract } from '../../services/ClientContract';
import { partnerContractPaymentService, type PartnerContractPayment } from '../../services/PartnerContractPayment';

interface DevStats {
  currentAssignments: number;
  utilizationRate: number; // %
  hoursThisMonth: number;  // hours
  totalEarnings: number; // VNĐ
  velocity: { sprint: string; points: number }[];
  weeklyHours: { week: string; hours: number; billable: number }[];
  monthlyEarnings: { month: string; earnings: number }[];
  techStack: { skill: string; level: number }[]; // 0..100
}

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTalentId, setCurrentTalentId] = useState<number | null>(null);
  const [stats, setStats] = useState<DevStats>({
    currentAssignments: 0,
    utilizationRate: 0,
    hoursThisMonth: 0,
    totalEarnings: 0,
    velocity: [],
    weeklyHours: [],
    monthlyEarnings: [],
    techStack: []
  });

  // Lấy talentId từ user hiện tại
  useEffect(() => {
    const fetchTalentId = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        let userId: string | null = null;
        
        if (token) {
          const decoded = decodeJWT(token);
          userId = decoded?.nameid || decoded?.sub || decoded?.userId || decoded?.uid || user.id;
        } else {
          userId = user.id;
        }
        
        if (!userId) return;
        
        const talents = await talentService.getAll({ excludeDeleted: true });
        const talent = Array.isArray(talents) 
          ? talents.find((t: Talent) => t.userId === userId)
          : null;
        
        if (talent) {
          setCurrentTalentId(talent.id);
        } else {
          setError('Không tìm thấy thông tin nhân sự của bạn. Vui lòng liên hệ HR.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Lỗi tìm talent:', err);
        setError('Không thể tải thông tin nhân sự. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchTalentId();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTalentId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch contracts and payments in parallel
        const [partnerContractsData, clientContractsData, paymentsData] = await Promise.all([
          partnerContractService.getAll({ talentId: currentTalentId, excludeDeleted: true }),
          clientContractService.getAll({ talentId: currentTalentId, excludeDeleted: true }),
          partnerContractPaymentService.getAll({ talentId: currentTalentId, excludeDeleted: true })
        ]);

        const partnerContracts = Array.isArray(partnerContractsData) ? partnerContractsData : [];
        const clientContracts = Array.isArray(clientContractsData) ? clientContractsData : [];
        const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.items || []);

        // Tính toán stats
        // 1. Current Assignments = số hợp đồng đang active
        const activeContracts = [
          ...partnerContracts.filter((c: PartnerContract) => 
            c.status === 'Active' || c.status === 'Ongoing'
          ),
          ...clientContracts.filter((c: ClientContract) => 
            c.status === 'Active' || c.status === 'Ongoing'
          )
        ];
        const currentAssignments = activeContracts.length;

        // 2. Hours this month = tổng giờ làm trong tháng hiện tại
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const thisMonthPayments = payments.filter((p: PartnerContractPayment) => {
          if (!p.paymentDate) return false;
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
        
        const hoursThisMonth = thisMonthPayments.reduce((sum: number, p: PartnerContractPayment) => {
          return sum + (p.actualWorkHours || 0) + (p.otHours || 0);
        }, 0);

        // 3. Total Earnings = tổng số tiền đã thanh toán
        const paidPayments = payments.filter((p: PartnerContractPayment) => 
          p.status?.toLowerCase() === 'paid'
        );
        const totalEarnings = paidPayments.reduce((sum: number, p: PartnerContractPayment) => {
          return sum + (p.paidAmount || p.calculatedAmount || 0);
        }, 0);

        // 4. Utilization Rate = (hours this month / 160) * 100 (giả sử 1 tháng = 160 giờ)
        const utilizationRate = Math.min(100, Math.round((hoursThisMonth / 160) * 100));

        // 5. Monthly Earnings (6 tháng gần nhất)
        const monthlyEarningsMap = new Map<string, number>();
        payments.forEach((p: PartnerContractPayment) => {
          if (p.status?.toLowerCase() === 'paid' && p.paymentDate) {
            const date = new Date(p.paymentDate);
            const monthLabel = `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
            const current = monthlyEarningsMap.get(monthLabel) || 0;
            monthlyEarningsMap.set(monthLabel, current + (p.paidAmount || p.calculatedAmount || 0));
          }
        });
        
        const monthlyEarnings = Array.from(monthlyEarningsMap.entries())
          .map(([month, earnings]) => ({ month, earnings }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6);

        // 6. Weekly Hours (4 tuần gần nhất) - mock data vì không có work report API
        const weeklyHours = [
          { week: 'W1', hours: Math.round(hoursThisMonth * 0.25), billable: Math.round(hoursThisMonth * 0.2) },
          { week: 'W2', hours: Math.round(hoursThisMonth * 0.25), billable: Math.round(hoursThisMonth * 0.2) },
          { week: 'W3', hours: Math.round(hoursThisMonth * 0.25), billable: Math.round(hoursThisMonth * 0.2) },
          { week: 'W4', hours: Math.round(hoursThisMonth * 0.25), billable: Math.round(hoursThisMonth * 0.2) }
        ];

        // 7. Velocity - mock data vì không có sprint data
        const velocity = [
          { sprint: 'S1', points: Math.round(currentAssignments * 8) },
          { sprint: 'S2', points: Math.round(currentAssignments * 9) },
          { sprint: 'S3', points: Math.round(currentAssignments * 10) },
          { sprint: 'S4', points: Math.round(currentAssignments * 9) },
          { sprint: 'S5', points: Math.round(currentAssignments * 11) },
          { sprint: 'S6', points: Math.round(currentAssignments * 12) }
        ];

        // 8. Tech Stack - mock data vì cần fetch từ skills
        const techStack = [
          { skill: 'React', level: 85 },
          { skill: 'Node.js', level: 80 },
          { skill: 'PostgreSQL', level: 70 },
          { skill: 'DevOps', level: 65 },
          { skill: 'Testing', level: 75 }
        ];

        setStats({
          currentAssignments,
          utilizationRate,
          hoursThisMonth,
          totalEarnings,
          velocity,
          weeklyHours,
          monthlyEarnings,
          techStack
        });
      } catch (err: any) {
        console.error('❌ Lỗi tải dữ liệu dashboard:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTalentId]);

  const formatHours = (v: number) => `${v}h`;
  const formatPercent = (v: number) => `${v}%`;
  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Developer" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan</h1>
          <p className="text-neutral-600 mt-1">Hiệu suất cá nhân, thời gian và thu nhập</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                label="Hợp đồng đang thực hiện"
                value={stats.currentAssignments.toString()}
                icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
              />
              <KpiCard
                label="Tỷ lệ sử dụng"
                value={formatPercent(stats.utilizationRate)}
                icon={<Timer className="w-6 h-6 text-amber-600" />}
              />
              <KpiCard
                label="Giờ làm trong tháng"
                value={formatHours(stats.hoursThisMonth)}
                icon={<Code2 className="w-6 h-6 text-violet-600" />}
              />
              <KpiCard
                label="Tổng thu nhập"
                value={formatVND(stats.totalEarnings)}
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thu nhập theo tháng</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatVND(v)} />
                    <Legend />
                    <Bar dataKey="earnings" name="Thu nhập" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Giờ làm theo tuần</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.weeklyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatHours(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="hours" name="Tổng giờ" stroke="#6366f1" />
                    <Line type="monotone" dataKey="billable" name="Giờ thanh toán" stroke="#0ea5e9" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Velocity theo sprint</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.velocity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sprint" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="points" name="Story Points" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kỹ năng chuyên môn</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={stats.techStack}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis />
                    <Radar name="Level" dataKey="level" fill="#14b8a6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="mt-2 text-sm text-gray-500 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Thang điểm 0–100
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
