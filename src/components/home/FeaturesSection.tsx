import React from 'react';
import { Settings, HeartHandshake, CheckCircle } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Matching Thông Minh',
      description: 'AI gợi ý ứng viên phù hợp nhất với yêu cầu dự án của bạn'
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: 'Hợp Đồng Số',
      description: 'Quản lý hợp đồng điện tử an toàn và minh bạch'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Thanh Toán Minh Bạch',
      description: 'Hệ thống thanh toán trong suốt, an toàn và nhanh chóng'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tính Năng Nổi Bật
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những tính năng giúp DevPool trở thành lựa chọn hàng đầu cho tuyển dụng IT
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;