import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/manager/SidebarItems';

interface UtilizationStats {
    summary: {
        totalDevelopers: number;
        utilizedDevelopers: number;
        utilizationRate: number;
        avgUtilization: number;
    };
    byStatus: {
        status: string;
        value: number;
    }[];
    monthlyUtilization: {
        month: string;
        rate: number;
        billable: number;
        bench: number;
    }[];
}

export default function Utilization() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UtilizationStats>({
        summary: {
            totalDevelopers: 0,
            utilizedDevelopers: 0,
            utilizationRate: 0,
            avgUtilization: 0
        },
        byStatus: [],
        monthlyUtilization: []
    });

    const COLORS = ['#22c55e', '#eab308', '#ef4444'];

    useEffect(() => {
        // Mock data
        const mockStats: UtilizationStats = {
            summary: {
                totalDevelopers: 150,
                utilizedDevelopers: 120,
                utilizationRate: 80,
                avgUtilization: 85
            },
            byStatus: [
                { status: 'Đang làm việc', value: 120 },
                { status: 'Chờ việc', value: 20 },
                { status: 'Nghỉ phép', value: 10 }
            ],
            monthlyUtilization: [
                { month: 'T1', rate: 78, billable: 75, bench: 25 },
                { month: 'T2', rate: 82, billable: 80, bench: 20 },
                { month: 'T3', rate: 85, billable: 82, bench: 18 },
                { month: 'T4', rate: 80, billable: 78, bench: 22 },
                { month: 'T5', rate: 88, billable: 85, bench: 15 },
                { month: 'T6', rate: 85, billable: 82, bench: 18 }
            ]
        };

        setTimeout(() => {
            setStats(mockStats);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Manager" />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tỷ Lệ Sử Dụng Nhân Sự</h1>
                    <p className="text-neutral-600 mt-1">Phân tích hiệu suất sử dụng nguồn lực</p>
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
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-100 rounded-xl">
                                        <Users className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng số developers</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.summary.totalDevelopers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <Clock className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Đang được sử dụng</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.summary.utilizedDevelopers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tỷ lệ sử dụng</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.summary.utilizationRate}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <AlertCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Hiệu suất trung bình</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.summary.avgUtilization}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố trạng thái</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={stats.byStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(props) => {
                                                const { name, percent } = props as unknown as { name: string; percent: number };
                                                return `${name} (${(percent * 100).toFixed(0)}%)`;
                                            }}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats.byStatus.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng sử dụng</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={stats.monthlyUtilization}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="rate" name="Tỷ lệ sử dụng" stroke="#6366f1" />
                                        <Line type="monotone" dataKey="billable" name="Billable" stroke="#22c55e" />
                                        <Line type="monotone" dataKey="bench" name="Bench" stroke="#ef4444" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}