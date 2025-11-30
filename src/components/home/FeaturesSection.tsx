import type React from "react"
import {Shield, TrendingUp, Users } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Quy trình chuyên nghiệp",
      description: "Mọi bước đều có luồng rõ ràng, phê duyệt theo vai trò (TA, Sales, Manager, Accountant). Hệ thống giúp tránh sai sót và giảm thời gian xử lý thủ công",
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      icon: <Shield  className="w-8 h-8" />,
      title: "Hợp Đồng Rõ Ràng",
      description: "Quản lý hợp đồng 3 bên minh bạch, đảm bảo quyền lợi các bên",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      icon: <TrendingUp  className="w-8 h-8" />,
      title: "Theo Dõi Hiệu Suất",
      description: "Hệ thống báo cáo và theo dõi tiến độ làm việc hàng tháng",
      color: "text-secondary-600",
      bgColor: "bg-secondary-50",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl leading-[1.3] font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-6">
            Tại Sao Chọn DevPool
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Giải pháp outsourcing toàn diện cho doanh nghiệp với quy trình chuyên nghiệp, minh bạch và hiệu quả
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-soft hover:shadow-strong border border-neutral-100 hover:border-neutral-200 transform hover:scale-102 transition-all duration-600 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-400 shadow-glow-sm`}
              >
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold text-neutral-800 mb-4 group-hover:text-neutral-900 transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-neutral-600 leading-relaxed text-lg group-hover:text-neutral-700 transition-colors duration-300">
                {feature.description}
              </p>

              <div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary-400 to-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
