import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  company: string;
  rating: number;
  content: string;
  avatar: string;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: 'Nguyễn Văn A',
      company: 'TechViet Co.',
      rating: 5,
      content: 'DevPool đã giúp chúng tôi tìm được đội ngũ developer xuất sắc cho dự án e-commerce. Quy trình matching rất chính xác và hiệu quả.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'Trần Thị B',
      company: 'StartupXYZ',
      rating: 5,
      content: 'Platform tuyệt vời! Tôi đã tìm được nhiều dự án thú vị và phù hợp với kỹ năng. Hệ thống thanh toán rất đáng tin cậy.',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'Lê Minh C',
      company: 'Digital Agency',
      rating: 5,
      content: 'Giao diện thân thiện, dễ sử dụng. Chúng tôi đã hoàn thành hơn 20 dự án thành công qua DevPool trong năm qua.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-xl text-gray-600">
            Những phản hồi tích cực từ khách hàng trên khắp Việt Nam
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;