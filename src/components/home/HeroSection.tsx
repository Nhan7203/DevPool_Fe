"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Search, Star } from "lucide-react"

const HeroSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-7">
        <div className="text-center space-y-12 min-h-screen flex flex-col justify-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-300 backdrop-blur-sm mx-auto animate-fade-in">
            <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">AI-Powered Matching System</span>
          </div>

          <div className="space-y-6 animate-fade-in">
            <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
                Kết Nối Với
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Chuyên Gia IT
              </span>
              <br />
              <span className="text-gray-900">Hàng Đầu</span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Hệ thống matching thông minh AI giúp tìm kiếm nhân tài IT phù hợp nhất cho dự án của bạn. Nhanh chóng,
              hiệu quả và đáng tin cậy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 animate-fade-in">
            <Link
              to="/register"
              className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-semibold text-xl flex items-center space-x-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 transform"
            >
              <span>Đăng Dự Án</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-white/80 backdrop-blur-sm text-gray-800 px-10 py-5 rounded-2xl font-semibold text-xl flex items-center space-x-3 border border-gray-200 transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-2xl hover:shadow-gray-300/20 transform"
            >
              <Search className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Tìm Việc</span>
            </button>
          </div>

          <div className="flex justify-center items-center space-x-16 pt-12 animate-fade-in-delay">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">1,000+</div>
              <div className="text-purple-600 font-medium">Dự án thành công</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">500+</div>
              <div className="text-purple-600 font-medium">Chuyên gia IT</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">98%</div>
              <div className="text-purple-600 font-medium">Hài lòng</div>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto animate-fade-in-delay">
            <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-102 transform">
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop"
                alt="Professional IT team collaboration"
                className="rounded-2xl shadow-xl w-full h-96 object-cover"
              />

              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-white fill-current" />
                  <span className="text-white font-bold text-sm">Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tìm Việc IT</h3>
            <p className="text-gray-700 mb-6">
              Khám phá hàng nghìn cơ hội việc làm IT hấp dẫn từ các công ty hàng đầu.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/projects"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:scale-105 transition-transform duration-300"
                onClick={() => setIsModalOpen(false)}
              >
                Xem Việc Làm
              </Link>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-delay {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  .animate-fade-in-delay {
    animation: fade-in-delay 0.8s ease-out 0.3s both;
  }
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }
`}</style>

    </section>
  )
}

export default HeroSection
