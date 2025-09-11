import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Kết Nối Với{' '}
              <span className="text-blue-600">Chuyên Gia IT</span>{' '}
              Hàng Đầu Cho Dự Án Của Bạn
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Hệ thống matching thông minh AI giúp tìm kiếm nhân tài IT phù hợp nhất 
              cho dự án của bạn. Nhanh chóng, hiệu quả và đáng tin cậy.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Đăng Dự Án</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/projects"
                className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 font-medium text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Tìm Việc</span>
                <Briefcase className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
              alt="Team working"
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">1,000+ Dự án thành công</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;