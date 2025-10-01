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
  Bug,
  ClipboardList,
  ChevronUp,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { sidebarItems } from '../../components/developer/SidebarItems';
import Sidebar from '../../components/common/Sidebar';

interface DevStats {
  currentAssignments: number;
  utilizationRate: number; // %
  hoursThisMonth: number;  // hours
  openBugs: number;
  velocity: { sprint: string; points: number }[];
  weeklyHours: { week: string; hours: number; billable: number }[];
  reviewTime: { week: string; avgHoursToApprove: number }[];
  techStack: { skill: string; level: number }[]; // 0..100
}

export default function DeveloperDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DevStats>({
    currentAssignments: 0,
    utilizationRate: 0,
    hoursThisMonth: 0,
    openBugs: 0,
    velocity: [],
    weeklyHours: [],
    reviewTime: [],
    techStack: []
  });

  useEffect(() => {
    const mock: DevStats = {
      currentAssignments: 3,
      utilizationRate: 82,
      hoursThisMonth: 136,
      openBugs: 5,
      velocity: [
        { sprint: 'S1', points: 28 },
        { sprint: 'S2', points: 32 },
        { sprint: 'S3', points: 35 },
        { sprint: 'S4', points: 31 },
        { sprint: 'S5', points: 38 },
        { sprint: 'S6', points: 40 }
      ],
      weeklyHours: [
        { week: 'W1', hours: 38, billable: 32 },
        { week: 'W2', hours: 40, billable: 34 },
        { week: 'W3', hours: 42, billable: 36 },
        { week: 'W4', hours: 44, billable: 39 }
      ],
      reviewTime: [
        { week: 'W1', avgHoursToApprove: 9.2 },
        { week: 'W2', avgHoursToApprove: 7.6 },
        { week: 'W3', avgHoursToApprove: 6.1 },
        { week: 'W4', avgHoursToApprove: 5.4 }
      ],
      techStack: [
        { skill: 'React', level: 88 },
        { skill: 'Node.js', level: 82 },
        { skill: 'PostgreSQL', level: 70 },
        { skill: 'DevOps', level: 62 },
        { skill: 'Testing', level: 76 }
      ]
    };

    const t = setTimeout(() => {
      setStats(mock);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const formatHours = (v: number) => `${v}h`;
  const formatPercent = (v: number) => `${v}%`;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Developer" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
          <p className="text-neutral-600 mt-1">Hiệu suất cá nhân, thời gian và chất lượng</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                label="Assignments hiện tại"
                value={stats.currentAssignments.toString()}
                icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
                badge={{ dir: 'up', text: '+1' }}
              />
              <KpiCard
                label="Utilization"
                value={formatPercent(stats.utilizationRate)}
                icon={<Timer className="w-6 h-6 text-amber-600" />}
                badge={{ dir: 'up', text: '+2%' }}
              />
              <KpiCard
                label="Giờ trong tháng"
                value={formatHours(stats.hoursThisMonth)}
                icon={<Code2 className="w-6 h-6 text-violet-600" />}
              />
              <KpiCard
                label="Bug mở"
                value={stats.openBugs.toString()}
                icon={<Bug className="w-6 h-6 text-rose-600" />}
                badge={{ dir: 'down', text: '-2' }}
              />
            </div>

            {/* Charts */}
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Giờ làm theo tuần</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.weeklyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatHours(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="hours" name="Hours" stroke="#6366f1" />
                    <Line type="monotone" dataKey="billable" name="Billable" stroke="#0ea5e9" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thời gian review PR</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.reviewTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v}h`} />
                    <Legend />
                    <Line type="monotone" dataKey="avgHoursToApprove" name="Avg to approve" stroke="#f43f5e" />
                  </LineChart>
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
