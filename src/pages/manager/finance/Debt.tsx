// import { useState, useEffect } from 'react';
// import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Receipt, Send, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
// import Sidebar from '../../../components/common/Sidebar';
// import { sidebarItems } from '../../../components/manager/SidebarItems';

// interface DebtData {
//   summary: {
//     totalReceivable: number;
//     totalPayable: number;
//     netDebt: number;
//     overdueReceivable: number;
//     overduePayable: number;
//     avgCollectionDays: number;
//     avgPaymentDays: number;
//     badDebtProvision: number;
//   };
//   receivableAging: {
//     range: string;
//     amount: number;
//     percentage: number;
//     count: number;
//   }[];
//   payableAging: {
//     range: string;
//     amount: number;
//     percentage: number;
//     count: number;
//   }[];
//   monthlyTrends: {
//     month: string;
//     receivable: number;
//     payable: number;
//     collected: number;
//     paid: number;
//   }[];
//   topDebtors: {
//     id: number;
//     name: string;
//     amount: number;
//     daysOverdue: number;
//     status: 'current' | 'overdue' | 'critical';
//     lastPayment: string;
//     riskLevel: 'low' | 'medium' | 'high';
//   }[];
//   topCreditors: {
//     id: number;
//     name: string;
//     amount: number;
//     dueDate: string;
//     status: 'current' | 'overdue' | 'scheduled';
//     paymentTerms: string;
//   }[];
//   collectionEfficiency: {
//     month: string;
//     target: number;
//     actual: number;
//     rate: number;
//   }[];
// }

// export default function Debt() {
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
//   const [debtData, setDebtData] = useState<DebtData>({
//     summary: {
//       totalReceivable: 0,
//       totalPayable: 0,
//       netDebt: 0,
//       overdueReceivable: 0,
//       overduePayable: 0,
//       avgCollectionDays: 0,
//       avgPaymentDays: 0,
//       badDebtProvision: 0
//     },
//     receivableAging: [],
//     payableAging: [],
//     monthlyTrends: [],
//     topDebtors: [],
//     topCreditors: [],
//     collectionEfficiency: []
//   });

//   const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#991b1b'];

//   useEffect(() => {
//     // Mock data
//     const mockData: DebtData = {
//       summary: {
//         totalReceivable: 4200000000,
//         totalPayable: 2100000000,
//         netDebt: 2100000000,
//         overdueReceivable: 680000000,
//         overduePayable: 150000000,
//         avgCollectionDays: 45,
//         avgPaymentDays: 30,
//         badDebtProvision: 42000000
//       },
//       receivableAging: [
//         { range: '0-30 ngày', amount: 2100000000, percentage: 50, count: 25 },
//         { range: '31-60 ngày', amount: 1050000000, percentage: 25, count: 12 },
//         { range: '61-90 ngày', amount: 630000000, percentage: 15, count: 8 },
//         { range: '91-180 ngày', amount: 336000000, percentage: 8, count: 4 },
//         { range: '>180 ngày', amount: 84000000, percentage: 2, count: 2 }
//       ],
//       payableAging: [
//         { range: '0-30 ngày', amount: 1470000000, percentage: 70, count: 18 },
//         { range: '31-60 ngày', amount: 420000000, percentage: 20, count: 8 },
//         { range: '61-90 ngày', amount: 147000000, percentage: 7, count: 3 },
//         { range: '>90 ngày', amount: 63000000, percentage: 3, count: 2 }
//       ],
//       monthlyTrends: [
//         { month: 'T1', receivable: 3800000000, payable: 1900000000, collected: 3200000000, paid: 1800000000 },
//         { month: 'T2', receivable: 3900000000, payable: 1950000000, collected: 3300000000, paid: 1850000000 },
//         { month: 'T3', receivable: 4000000000, payable: 2000000000, collected: 3400000000, paid: 1900000000 },
//         { month: 'T4', receivable: 4100000000, payable: 2050000000, collected: 3600000000, paid: 1950000000 },
//         { month: 'T5', receivable: 4150000000, payable: 2080000000, collected: 3700000000, paid: 2000000000 },
//         { month: 'T6', receivable: 4200000000, payable: 2100000000, collected: 3800000000, paid: 2050000000 }
//       ],
//       topDebtors: [
//         { id: 1, name: 'Công ty ABC', amount: 650000000, daysOverdue: 0, status: 'current', lastPayment: '15/06/2024', riskLevel: 'low' },
//         { id: 2, name: 'Tập đoàn XYZ', amount: 480000000, daysOverdue: 35, status: 'overdue', lastPayment: '25/05/2024', riskLevel: 'medium' },
//         { id: 3, name: 'DNTN DEF', amount: 320000000, daysOverdue: 0, status: 'current', lastPayment: '20/06/2024', riskLevel: 'low' },
//         { id: 4, name: 'Công ty GHI', amount: 280000000, daysOverdue: 62, status: 'overdue', lastPayment: '30/04/2024', riskLevel: 'high' },
//         { id: 5, name: 'Cty TNHH JKL', amount: 250000000, daysOverdue: 0, status: 'current', lastPayment: '10/06/2024', riskLevel: 'low' },
//         { id: 6, name: 'Doanh nghiệp MNO', amount: 180000000, daysOverdue: 95, status: 'critical', lastPayment: '28/03/2024', riskLevel: 'high' },
//         { id: 7, name: 'Công ty PQR', amount: 150000000, daysOverdue: 15, status: 'overdue', lastPayment: '15/06/2024', riskLevel: 'medium' }
//       ],
//       topCreditors: [
//         { id: 1, name: 'Nhà cung cấp A', amount: 450000000, dueDate: '15/07/2024', status: 'scheduled', paymentTerms: 'Net 30' },
//         { id: 2, name: 'Đối tác B', amount: 380000000, dueDate: '30/06/2024', status: 'current', paymentTerms: 'Net 45' },
//         { id: 3, name: 'Vendor C', amount: 320000000, dueDate: '10/07/2024', status: 'scheduled', paymentTerms: 'Net 30' },
//         { id: 4, name: 'Supplier D', amount: 250000000, dueDate: '25/06/2024', status: 'overdue', paymentTerms: 'Net 15' },
//         { id: 5, name: 'NCC E', amount: 180000000, dueDate: '05/07/2024', status: 'current', paymentTerms: 'Net 30' }
//       ],
//       collectionEfficiency: [
//         { month: 'T1', target: 3500000000, actual: 3200000000, rate: 91.4 },
//         { month: 'T2', target: 3600000000, actual: 3300000000, rate: 91.7 },
//         { month: 'T3', target: 3700000000, actual: 3400000000, rate: 91.9 },
//         { month: 'T4', target: 3800000000, actual: 3600000000, rate: 94.7 },
//         { month: 'T5', target: 3900000000, actual: 3700000000, rate: 94.9 },
//         { month: 'T6', target: 4000000000, actual: 3800000000, rate: 95.0 }
//       ]
//     };

//     setTimeout(() => {
//       setDebtData(mockData);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const formatCurrency = (value: number) => {
//     if (value >= 1000000000) {
//       return `${(value / 1000000000).toFixed(1)} tỷ`;
//     } else if (value >= 1000000) {
//       return `${(value / 1000000).toFixed(0)} tr`;
//     }
//     return value.toLocaleString('vi-VN');
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'current': return 'text-green-600 bg-green-100';
//       case 'overdue': return 'text-yellow-600 bg-yellow-100';
//       case 'critical': return 'text-red-600 bg-red-100';
//       case 'scheduled': return 'text-blue-600 bg-blue-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
//     const colors = {
//       low: 'bg-green-100 text-green-800',
//       medium: 'bg-yellow-100 text-yellow-800',
//       high: 'bg-red-100 text-red-800'
//     };
//     const labels = {
//       low: 'Thấp',
//       medium: 'Trung bình',
//       high: 'Cao'
//     };
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[risk]}`}>
//         {labels[risk]}
//       </span>
//     );
//   };

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar items={sidebarItems} title="Manager" />
      
//       <div className="flex-1 p-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Quản Lý Công Nợ</h1>
//           <p className="text-neutral-600 mt-1">Theo dõi và quản lý các khoản phải thu, phải trả</p>
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
//                 <div className="flex items-center justify-between mb-4">
//                   <Receipt className="w-8 h-8 text-green-600" />
//                   <span className="text-xs text-gray-500">Phải thu</span>
//                 </div>
//                 <p className="text-sm text-gray-600">Tổng phải thu</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(debtData.summary.totalReceivable)}</p>
//                 <div className="mt-2 flex items-center gap-2">
//                   <div className="flex-1 bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-green-600 h-2 rounded-full" 
//                       style={{ width: `${((debtData.summary.totalReceivable - debtData.summary.overdueReceivable) / debtData.summary.totalReceivable) * 100}%` }}
//                     />
//                   </div>
//                   <span className="text-xs text-gray-600">
//                     {Math.round(((debtData.summary.totalReceivable - debtData.summary.overdueReceivable) / debtData.summary.totalReceivable) * 100)}%
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <Send className="w-8 h-8 text-red-600" />
//                   <span className="text-xs text-gray-500">Phải trả</span>
//                 </div>
//                 <p className="text-sm text-gray-600">Tổng phải trả</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(debtData.summary.totalPayable)}</p>
//                 <div className="mt-2 flex items-center gap-2">
//                   <div className="flex-1 bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-blue-600 h-2 rounded-full" 
//                       style={{ width: `${((debtData.summary.totalPayable - debtData.summary.overduePayable) / debtData.summary.totalPayable) * 100}%` }}
//                     />
//                   </div>
//                   <span className="text-xs text-gray-600">
//                     {Math.round(((debtData.summary.totalPayable - debtData.summary.overduePayable) / debtData.summary.totalPayable) * 100)}%
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <AlertTriangle className="w-8 h-8 text-yellow-600" />
//                   <span className="text-xs text-red-500">Quá hạn</span>
//                 </div>
//                 <p className="text-sm text-gray-600">Nợ quá hạn</p>
//                 <div className="space-y-2 mt-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-gray-500">Phải thu:</span>
//                     <span className="text-sm font-semibold text-red-600">{formatCurrency(debtData.summary.overdueReceivable)}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-gray-500">Phải trả:</span>
//                     <span className="text-sm font-semibold text-orange-600">{formatCurrency(debtData.summary.overduePayable)}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <Clock className="w-8 h-8 text-primary-600" />
//                   <span className="text-xs text-gray-500">Thời gian</span>
//                 </div>
//                 <p className="text-sm text-gray-600">Chu kỳ thu/trả TB</p>
//                 <div className="space-y-2 mt-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-gray-500">Thu tiền:</span>
//                     <span className="text-sm font-semibold text-gray-900">{debtData.summary.avgCollectionDays} ngày</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-gray-500">Thanh toán:</span>
//                     <span className="text-sm font-semibold text-gray-900">{debtData.summary.avgPaymentDays} ngày</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Tab Navigation */}
//             <div className="bg-white rounded-2xl shadow-soft p-1">
//               <div className="flex">
//                 <button
//                   onClick={() => setActiveTab('receivable')}
//                   className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
//                     activeTab === 'receivable' 
//                       ? 'bg-primary-600 text-white' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   Khoản phải thu
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('payable')}
//                   className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
//                     activeTab === 'payable' 
//                       ? 'bg-primary-600 text-white' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   Khoản phải trả
//                 </button>
//               </div>
//             </div>

//             {/* Charts */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Aging Analysis */}
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Phân tích tuổi nợ {activeTab === 'receivable' ? 'phải thu' : 'phải trả'}
//                 </h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={activeTab === 'receivable' ? debtData.receivableAging : debtData.payableAging}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ range, percentage }) => `${range} (${percentage}%)`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="amount"
//                     >
//                       {(activeTab === 'receivable' ? debtData.receivableAging : debtData.payableAging).map((_, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div className="mt-4 space-y-2">
//                   {(activeTab === 'receivable' ? debtData.receivableAging : debtData.payableAging).map((item, index) => (
//                     <div key={item.range} className="flex items-center justify-between text-sm">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
//                         <span className="text-gray-600">{item.range}</span>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className="text-gray-500">({item.count} KH)</span>
//                         <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Collection Efficiency */}
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiệu quả thu hồi công nợ</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={debtData.collectionEfficiency}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
//                     <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tickFormatter={(value) => `${value}%`} />
//                     <Tooltip formatter={(value: never, name: string) => {
//                       if (name === 'Tỷ lệ') return `${value}%`;
//                       return formatCurrency(value);
//                     }} />
//                     <Legend />
//                     <Bar yAxisId="left" dataKey="target" name="Mục tiêu" fill="#e5e7eb" />
//                     <Bar yAxisId="left" dataKey="actual" name="Thực tế" fill="#6366f1" />
//                     <Line yAxisId="right" type="monotone" dataKey="rate" name="Tỷ lệ" stroke="#22c55e" strokeWidth={2} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Monthly Trends */}
//             <div className="bg-white rounded-2xl shadow-soft p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng công nợ theo tháng</h2>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={debtData.monthlyTrends}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis tickFormatter={(value) => formatCurrency(value)} />
//                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="receivable" name="Phải thu" fill="#22c55e" />
//                   <Bar dataKey="payable" name="Phải trả" fill="#ef4444" />
//                   <Bar dataKey="collected" name="Đã thu" fill="#6366f1" />
//                   <Bar dataKey="paid" name="Đã trả" fill="#eab308" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Tables */}
//             {activeTab === 'receivable' ? (
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900">Khách hàng nợ lớn nhất</h2>
//                   <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//                     Xem tất cả →
//                   </button>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Khách hàng</th>
//                         <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Số tiền</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Quá hạn</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Trạng thái</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">TT gần nhất</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Rủi ro</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {debtData.topDebtors.map((debtor) => (
//                         <tr key={debtor.id} className="border-b border-gray-100 hover:bg-gray-50">
//                           <td className="py-3 px-4">
//                             <p className="font-medium text-gray-900">{debtor.name}</p>
//                           </td>
//                           <td className="py-3 px-4 text-right font-semibold text-gray-900">
//                             {formatCurrency(debtor.amount)}
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             {debtor.daysOverdue > 0 ? (
//                               <span className="text-red-600 font-medium">{debtor.daysOverdue} ngày</span>
//                             ) : (
//                               <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
//                             )}
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debtor.status)}`}>
//                               {debtor.status === 'current' ? 'Hiện tại' : debtor.status === 'overdue' ? 'Quá hạn' : 'Nghiêm trọng'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-center text-sm text-gray-600">
//                             {debtor.lastPayment}
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             {getRiskBadge(debtor.riskLevel)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white rounded-2xl shadow-soft p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900">Nhà cung cấp cần thanh toán</h2>
//                   <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//                     Xem tất cả →
//                   </button>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nhà cung cấp</th>
//                         <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Số tiền</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Hạn thanh toán</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Trạng thái</th>
//                         <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Điều khoản</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {debtData.topCreditors.map((creditor) => (
//                         <tr key={creditor.id} className="border-b border-gray-100 hover:bg-gray-50">
//                           <td className="py-3 px-4">
//                             <p className="font-medium text-gray-900">{creditor.name}</p>
//                           </td>
//                           <td className="py-3 px-4 text-right font-semibold text-gray-900">
//                             {formatCurrency(creditor.amount)}
//                           </td>
//                           <td className="py-3 px-4 text-center text-sm text-gray-600">
//                             {creditor.dueDate}
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(creditor.status)}`}>
//                               {creditor.status === 'current' ? 'Hiện tại' : creditor.status === 'overdue' ? 'Quá hạn' : 'Đã lên lịch'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-center text-sm text-gray-600">
//                             {creditor.paymentTerms}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }