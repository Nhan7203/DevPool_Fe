import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  description: string;
}

const HowItWorksSection: React.FC = () => {
  const steps: Step[] = [
    {
      step: '1',
      title: 'Đăng Dự Án',
      description: 'Mô tả chi tiết yêu cầu dự án và ngân sách của bạn'
    },
    {
      step: '2',
      title: 'Nhận Gợi Ý',
      description: 'AI phân tích và gợi ý những ứng viên phù hợp nhất'
    },
    {
      step: '3',
      title: 'Chọn Ứng Viên',
      description: 'Phỏng vấn và lựa chọn chuyên gia IT phù hợp'
    },
    {
      step: '4',
      title: 'Bắt Đầu Làm Việc',
      description: 'Ký hợp đồng số và bắt đầu triển khai dự án'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Cách Hoạt Động
          </h2>
          <p className="text-xl text-gray-600">
            4 bước đơn giản để tìm được đội ngũ IT hoàn hảo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full -ml-8">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;