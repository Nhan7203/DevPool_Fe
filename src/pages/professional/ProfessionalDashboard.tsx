// import Sidebar from '../../components/common/Sidebar';
// import {
//   Home,
//   User,
//   Search,
//   FileText,
//   Briefcase,
//   Clock,
//   DollarSign,
//   Settings,
//   TrendingUp,
//   Eye,
// } from 'lucide-react';

// const sidebarItems = [
//   { label: 'Trang Chủ', href: '/professional/dashboard', icon: Home },
//   { label: 'Hồ Sơ Của Tôi', href: '/professional/profile', icon: User },
//   { label: 'Tìm Dự Án', href: '/professional/projects', icon: Search },
//   { label: 'Đơn Ứng Tuyển', href: '/professional/applications', icon: FileText },
//   { label: 'Dự Án Đang Làm', href: '/professional/active-projects', icon: Briefcase },
//   { label: 'Lịch Sử Dự Án', href: '/professional/history', icon: Clock },
//   { label: 'Thu Nhập', href: '/professional/earnings', icon: DollarSign },
//   { label: 'Cài Đặt', href: '/professional/settings', icon: Settings },
// ];

// export default function ProfessionalDashboard() {
//   const stats = [
//     {
//       title: 'Đơn Đã Gửi',
//       value: '12',
//       change: '+3 tuần này',
//       color: 'blue'
//     },
//     {
//       title: 'Dự Án Đang Làm',
//       value: '2',
//       change: 'Đang tiến triển tốt',
//       color: 'green'
//     },
//     {
//       title: 'Dự Án Hoàn Thành',
//       value: '15',
//       change: '+2 tháng này',
//       color: 'purple'
//     },
//     {
//       title: 'Tổng Thu Nhập',
//       value: '85M VNĐ',
//       change: '+25% tháng này',
//       color: 'orange'
//     }
//   ];

//   const suggestedProjects = [
//     {
//       id: 1,
//       title: 'React Developer cho E-commerce',
//       company: 'TechViet Co.',
//       budget: '15M - 20M VNĐ',
//       skills: ['React', 'Node.js', 'MongoDB'],
//       matchScore: 95,
//       posted: '2 giờ trước'
//     },
//     {
//       id: 2,
//       title: 'Mobile App Development',
//       company: 'StartupXYZ',
//       budget: '25M - 30M VNĐ',
//       skills: ['React Native', 'Firebase'],
//       matchScore: 88,
//       posted: '5 giờ trước'
//     },
//     {
//       id: 3,
//       title: 'Full-stack Developer',
//       company: 'Digital Agency',
//       budget: '18M - 25M VNĐ',
//       skills: ['Vue.js', 'Laravel', 'MySQL'],
//       matchScore: 82,
//       posted: '1 ngày trước'
//     }
//   ];

//   const recentApplications = [
//     {
//       id: 1,
//       project: 'CRM System Development',
//       company: 'Business Corp',
//       status: 'interview',
//       appliedDate: '10/01/2025'
//     },
//     {
//       id: 2,
//       project: 'Website Redesign',
//       company: 'Creative Studio',
//       status: 'reviewed',
//       appliedDate: '08/01/2025'
//     },
//     {
//       id: 3,
//       project: 'API Development',
//       company: 'Tech Solutions',
//       status: 'selected',
//       appliedDate: '05/01/2025'
//     }
//   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'selected': return 'bg-green-100 text-green-800';
//       case 'interview': return 'bg-blue-100 text-blue-800';
//       case 'reviewed': return 'bg-yellow-100 text-yellow-800';
//       case 'rejected': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'selected': return 'Được chọn';
//       case 'interview': return 'Phỏng vấn';
//       case 'reviewed': return 'Đang xem xét';
//       case 'rejected': return 'Từ chối';
//       default: return status;
//     }
//   };

//   const getMatchScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-600 bg-green-100';
//     if (score >= 80) return 'text-blue-600 bg-blue-100';
//     if (score >= 70) return 'text-yellow-600 bg-yellow-100';
//     return 'text-gray-600 bg-gray-100';
//   };

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar items={sidebarItems} title="Chuyên Gia IT" />

//       <div className="flex-1 p-8">
//         {/* Header */}
//         <div className="mb-8 animate-slide-up">
//           <h1 className="text-3xl font-bold text-gray-900">Chào mừng, Nguyễn Văn A</h1>
//           <div className="flex items-center mt-2">
//             <p className="text-neutral-600">Hồ sơ hoàn thành: </p>
//             <div className="ml-2 flex items-center">
//               <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
//                 <div className="w-28 h-2 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full transition-all duration-500 animate-pulse-gentle"></div>
//               </div>
//               <span className="ml-2 text-sm font-medium text-secondary-600">87%</span>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
//           {stats.map((stat, index) => (
//             <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
//                   <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
//                     stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
//                       stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
//                         'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
//                   } transition-all duration-300`}>
//                   <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
//                 </div>
//               </div>
//               <p className="text-sm text-secondary-600 mt-4 flex items-center group-hover:text-secondary-700 transition-colors duration-300">
//                 <TrendingUp className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
//                 {stat.change}
//               </p>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
//           {/* Suggested Projects */}
//           <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
//             <div className="p-6 border-b border-neutral-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold text-gray-900">Dự Án Được Gợi Ý</h2>
//                 <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300 hover:scale-105 transform">
//                   Xem tất cả
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="space-y-6">
//                 {suggestedProjects.map((project) => (
//                   <div key={project.id} className="group border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-all duration-300 hover:shadow-soft bg-gradient-to-r from-white to-neutral-50 hover:from-primary-50 hover:to-accent-50">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">{project.title}</h3>
//                         <p className="text-neutral-600 text-sm group-hover:text-neutral-700 transition-colors duration-300">{project.company}</p>
//                       </div>
//                       <div className={`px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(project.matchScore)}`}>
//                         {project.matchScore}% phù hợp
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-2 mb-3">
//                       {project.skills.map((skill) => (
//                         <span key={skill} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full group-hover:bg-primary-200 transition-colors duration-300">
//                           {skill}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
//                         <span className="font-medium text-gray-900">{project.budget}</span>
//                         <span className="mx-2">•</span>
//                         <span>{project.posted}</span>
//                       </div>
//                       <div className="flex space-x-2">
//                         <button className="text-neutral-600 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-all duration-300 hover:scale-110 transform">
//                           <Eye className="w-4 h-4 hover:scale-110 transition-transform duration-300" />
//                         </button>
//                         <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg text-sm hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
//                           Ứng tuyển
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Recent Applications */}
//           <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
//             <div className="p-6 border-b border-neutral-200">
//               <h2 className="text-lg font-semibold text-gray-900">Đơn Ứng Tuyển Gần Đây</h2>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {recentApplications.map((application) => (
//                   <div key={application.id} className="group p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-xl hover:from-primary-50 hover:to-accent-50 transition-all duration-300 border border-neutral-200 hover:border-primary-300">
//                     <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">{application.project}</h3>
//                     <p className="text-sm text-neutral-600 mb-2 group-hover:text-neutral-700 transition-colors duration-300">{application.company}</p>
//                     <div className="flex items-center justify-between">
//                       <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
//                         {getStatusText(application.status)}
//                       </span>
//                       <span className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">{application.appliedDate}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Notifications & Messages */}
//         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
//           <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
//             <div className="p-6 border-b border-neutral-200">
//               <h2 className="text-lg font-semibold text-gray-900">Thông Báo</h2>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 <div className="group flex items-start space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
//                   <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 animate-pulse-gentle"></div>
//                   <div>
//                     <p className="text-sm text-gray-900 group-hover:text-primary-700 transition-colors duration-300">Bạn có lời mời phỏng vấn từ TechViet Co.</p>
//                     <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">10 phút trước</p>
//                   </div>
//                 </div>
//                 <div className="group flex items-start space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
//                   <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2 animate-pulse-gentle"></div>
//                   <div>
//                     <p className="text-sm text-gray-900 group-hover:text-secondary-700 transition-colors duration-300">Dự án API Development đã được hoàn thành</p>
//                     <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">2 giờ trước</p>
//                   </div>
//                 </div>
//                 <div className="group flex items-start space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-all duration-300">
//                   <div className="w-2 h-2 bg-warning-600 rounded-full mt-2 animate-pulse-gentle"></div>
//                   <div>
//                     <p className="text-sm text-gray-900 group-hover:text-warning-700 transition-colors duration-300">Có 3 dự án mới phù hợp với kỹ năng của bạn</p>
//                     <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">1 ngày trước</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100">
//             <div className="p-6 border-b border-neutral-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold text-gray-900">Tin Nhắn</h2>
//                 <span className="bg-error-100 text-error-800 text-xs px-2 py-1 rounded-full animate-pulse-gentle">2 mới</span>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 <div className="group flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-soft">
//                   <img
//                     src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
//                     alt="Company"
//                     className="w-10 h-10 rounded-full ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
//                   />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">TechViet Co.</p>
//                     <p className="text-xs text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">Chúng tôi muốn trao đổi về dự án...</p>
//                   </div>
//                   <div className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">15:30</div>
//                 </div>
//                 <div className="group flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-soft">
//                   <img
//                     src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
//                     alt="Company"
//                     className="w-10 h-10 rounded-full ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
//                   />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">StartupXYZ</p>
//                     <p className="text-xs text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">Khi nào bạn có thể bắt đầu dự án?</p>
//                   </div>
//                   <div className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">14:20</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 animate-slide-up">
//           <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 border border-neutral-100">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
//                 <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
//                 <span>Cập Nhật Hồ Sơ</span>
//               </button>
//               <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-3 rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-300 shadow-soft hover:shadow-glow-green transform hover:scale-105">
//                 <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
//                 <span>Tìm Dự Án</span>
//               </button>
//               <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-6 py-3 rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-soft hover:shadow-glow-purple transform hover:scale-105">
//                 <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
//                 <span>Xem Thu Nhập</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }