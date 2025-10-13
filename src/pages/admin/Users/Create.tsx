import { useState } from 'react';
import { User, Mail, Phone, Briefcase, Code, Calendar } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/admin/SidebarItems';


export default function CreateAccount() {
  const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     specialization: '',
//     experience: '',
//     skills: '',
//     company: ''
//   });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Handle form submission
    setLoading(false);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />
      
      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <User className="text-white font-bold text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Tài Khoản Developer
            </h1>
            <p className="text-neutral-600 mt-2">Cung cấp tài khoản mới cho developer trong hệ thống</p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                    placeholder="example@devpool.com"
                  />
                </div>
              </div>

              {/* Grid for Phone and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                      placeholder="0123456789"
                    />
                  </div>
                </div>

                {/* Kinh nghiệm */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                    <input
                      type="number"
                      name="experience"
                      required
                      min="0"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                      placeholder="Số năm kinh nghiệm"
                    />
                  </div>
                </div>
              </div>

              {/* Chuyên môn */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Chuyên môn
                </label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="specialization"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                    placeholder="Frontend Developer, Backend Developer,..."
                  />
                </div>
              </div>

              {/* Kỹ năng */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Kỹ năng
                </label>
                <div className="relative group">
                  <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="skills"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 hover:shadow-soft text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-primary-500 hover:border-neutral-400"
                    placeholder="React, Node.js, Python,..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}