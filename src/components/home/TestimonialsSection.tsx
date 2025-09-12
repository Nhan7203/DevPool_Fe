import type React from "react"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  name: string
  company: string
  rating: number
  content: string
  avatar: string
  role: string
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Nguyễn Văn A",
      company: "TechViet Co.",
      role: "CTO",
      rating: 5,
      content:
        "DevPool đã giúp chúng tôi tìm được đội ngũ developer xuất sắc cho dự án e-commerce. Quy trình matching rất chính xác và hiệu quả.",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      name: "Trần Thị B",
      company: "StartupXYZ",
      role: "Founder",
      rating: 5,
      content:
        "Platform tuyệt vời! Tôi đã tìm được nhiều dự án thú vị và phù hợp với kỹ năng. Hệ thống thanh toán rất đáng tin cậy.",
      avatar:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      name: "Lê Minh C",
      company: "Digital Agency",
      role: "Project Manager",
      rating: 5,
      content:
        "Giao diện thân thiện, dễ sử dụng. Chúng tôi đã hoàn thành hơn 20 dự án thành công qua DevPool trong năm qua.",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-primary-50 via-violet-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary-200/20 rounded-full blur-2xl animate-float"></div>
        <div
          className="absolute bottom-20 right-20 w-32 h-32 bg-violet-200/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl leading-[1.3] font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-6">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            Những phản hồi tích cực từ khách hàng trên khắp Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-3xl shadow-soft hover:shadow-strong border border-white/50 hover:border-white/80 transform hover:scale-102 transition-all duration-600 animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-400">
                <Quote className="w-12 h-12 text-primary-600" />
              </div>

              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-warning-400 fill-current transform group-hover:scale-110 transition-transform duration-300"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              <p className="text-neutral-700 mb-8 leading-relaxed text-lg group-hover:text-neutral-800 transition-colors duration-300 relative z-10">
                "{testimonial.content}"
              </p>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-medium group-hover:shadow-strong transition-shadow duration-400"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-violet-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800 text-lg group-hover:text-neutral-900 transition-colors duration-300">
                    {testimonial.name}
                  </h4>
                  <p className="text-primary-600 font-medium">{testimonial.role}</p>
                  <p className="text-neutral-500 text-sm">{testimonial.company}</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-violet-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
