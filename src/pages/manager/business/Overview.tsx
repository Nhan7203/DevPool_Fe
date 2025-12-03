// import { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Building2, TrendingUp } from 'lucide-react';
// import Sidebar from '../../../components/common/Sidebar';
// import { sidebarItems } from '../../../components/manager/SidebarItems';

// interface BusinessStats {
//   clients: {
//     total: number;
//     active: number;
//     new: number;
//     byIndustry: {
//       name: string;
//       value: number;
//     }[];
//   };
//   projects: {
//     total: number;
//     ongoing: number;
//     completed: number;
//     byType: {
//       name: string;
//       value: number;
//     }[];
//   };
//   trends: {
//     month: string;
//     newClients: number;
//     revenue: number;
//     projects: number;
//   }[];
// }

// export default function BusinessOverview() {
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<BusinessStats>({
//     clients: {
//       total: 0,
//       active: 0,
//       new: 0,
//       byIndustry: []
//     },
//     projects: {
//       total: 0,
//       ongoing: 0,
//       completed: 0,
//       byType: []
//     },
//     trends: []
//   });

//   const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

//   useEffect(() => {
//     // Mock data
//     const mockStats: BusinessStats = {
//       clients: {
//         total: 85,
//         active: 65,
//         new: 12,
//         byIndustry: [
//           { name: 'Fintech', value: 30 },
//           { name: 'E-commerce', value: 25 },
//           { name: 'Healthcare', value: 15 },
//           { name: 'Education', value: 10 },
//           { name: 'Others', value: 5 }
//         ]
//       },
//       projects: {
//         total: 120,
//         ongoing: 45,
//         completed: 75,
//         byType: [
//           { name: 'Web App', value: 40 },
//           { name: 'Mobile App', value: 30 },
//           { name: 'Enterprise', value: 20 },
//           { name: 'Integration', value: 15 },
//           { name: 'Others', value: 15 }
//         ]
//       },
//       trends: [
//         { month: 'T1', newClients: 5, revenue: 100, projects: 8 },
//         { month: 'T2', newClients: 7, revenue: 120, projects: 10 },
//         { month: 'T3', newClients: 4, revenue: 90, projects: 7 },
//         { month: 'T4', newClients: 8, revenue: 150, projects: 12 },
//         { month: 'T5', newClients: 6, revenue: 130, projects: 9 },
//         { month: 'T6', newClients: 9, revenue: 180, projects: 15 }
//       ]
//     };

//     setTimeout(() => {
//       setStats(mockStats);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar items={sidebarItems} title="Manager" />
      
//       <div className="flex-1 p-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Kinh Doanh</h1>
//           <p className="text-neutral-600 mt-1">Phân tích và thống kê hoạt động kinh doanh</p>
//         </div>

//         {loading ? (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="p-3 bg-primary-100 rounded-xl">
//                     <Building2 className="w-6 h-6 text-primary-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Tổng số khách hàng</p>
//                     <p className="text-2xl font-bold text-gray-900">{stats.clients.total}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Đang hoạt động: <span className="font-medium text-gray-900">{stats.clients.active}</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="p-3 bg-green-100 rounded-xl">
//                     <TrendingUp className="w-6 h-6 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Dự án</p>
//                     <p className="text-2xl font-bold text-gray-900">{stats.projects.total}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Đang thực hiện: <span className="font-medium text-gray-900">{stats.projects.ongoing}</span>
//                 </div>
//               </div>

//               {/* Add more summary cards as needed */}
//             </div>

//             {/* Charts */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo ngành</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats.clients.byIndustry}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={(props) => {
//                         const { name, percent } = props as unknown as { name: string; percent: number };
//                         return `${name} (${(percent * 100).toFixed(0)}%)`;
//                       }}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {stats.clients.byIndustry.map((_entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng phát triển</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={stats.trends}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="newClients" name="Khách hàng mới" stroke="#6366f1" />
//                     <Line type="monotone" dataKey="projects" name="Dự án mới" stroke="#22c55e" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }