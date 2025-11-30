import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, Briefcase, Star } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface DeveloperStats {
  total: number;
  active: number;
  available: number;
  busy: number;
  onLeave: number;
  bySpecialization: {
    name: string;
    count: number;
  }[];
  byExperience: {
    range: string;
    count: number;
  }[];
}

export default function DeveloperStatus() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeveloperStats>({
    total: 0,
    active: 0,
    available: 0,
    busy: 0,
    onLeave: 0,
    bySpecialization: [],
    byExperience: []
  });

  // Mock data
  useEffect(() => {
    const mockStats: DeveloperStats = {
      total: 150,
      active: 120,
      available: 45,
      busy: 65,
      onLeave: 10,
      bySpecialization: [
        { name: 'Frontend', count: 50 },
        { name: 'Backend', count: 45 },
        { name: 'Fullstack', count: 30 },
        { name: 'Mobile', count: 15 },
        { name: 'DevOps', count: 10 },
      ],
      byExperience: [
        { range: '0-1 năm', count: 20 },
        { range: '1-3 năm', count: 45 },
        { range: '3-5 năm', count: 50 },
        { range: '5+ năm', count: 35 },
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const STATUS_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'];
  const statusData = [
    { name: 'Sẵn sàng', value: stats.available },
    { name: 'Đang bận', value: stats.busy },
    { name: 'Nghỉ phép', value: stats.onLeave },
    { name: 'Không hoạt động', value: stats.total - stats.active },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="TA Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Trạng Thái Developer</h1>
          <p className="text-neutral-600 mt-1">Thống kê và phân tích trạng thái của các developer</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng số Developer</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sẵn sàng</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đang bận</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.busy}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Status Distribution */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân Bố Trạng Thái</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Specialization Distribution */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân Bố Theo Chuyên Môn</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.bySpecialization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Experience Distribution */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân Bố Theo Kinh Nghiệm</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byExperience}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
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