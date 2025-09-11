import React from 'react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Sẵn Sàng Bắt Đầu Dự Án Của Bạn?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Tham gia cộng đồng DevPool ngay hôm nay và kết nối với hàng nghìn chuyên gia IT
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-medium text-lg transition-colors"
          >
            Đăng Ký Miễn Phí
          </Link>
          <Link
            to="/about"
            className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 font-medium text-lg transition-colors"
          >
            Tìm Hiểu Thêm
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;