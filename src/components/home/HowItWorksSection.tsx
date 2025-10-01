import type React from "react"
import { ArrowRight } from "lucide-react"

interface Step {
  step: string
  title: string
  description: string
  color: string
  bgColor: string
}

const HowItWorksSection: React.FC = () => {
  const steps: Step[] = [
    {
      step: "1",
      title: "Tiếp Nhận Yêu Cầu",
      description: "Doanh nghiệp có thể gửi yêu cầu tuyển dụng developer trực tiếp đến DevPool thông qua email hoặc các kênh liên lạc được hỗ trợ.",
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      step: "2",
      title: "Thẩm Định CV",
      description: "DevPool thẩm định và lọc CV phù hợp từ kho nhân sự sẵn có",
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      step: "3",
      title: "Phỏng Vấn",
      description: "Sắp xếp phỏng vấn giữa doanh nghiệp và ứng viên phù hợp",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      step: "4",
      title: "Ký Hợp Đồng",
      description: "Ký kết hợp đồng 3 bên và bắt đầu làm việc",
      color: "from-secondary-500 to-secondary-600",
      bgColor: "bg-secondary-50",
    },
    {
      step: "5",
      title: "Theo Dõi",
      description: "Theo dõi monthly timesheet & performance",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      step: "6",
      title: "Thanh Toán & Báo Cáo",
      description: "Xử lý thanh toán và báo cáo hàng tháng",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
    },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-primary-50/30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl leading-[1.3] font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-6">
            Quy Trình Làm Việc
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            4 bước đơn giản để có được đội ngũ developer chất lượng cao cho dự án của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center relative group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className={`relative w-20 h-20 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-glow group-hover:shadow-glow-lg transform group-hover:scale-110 transition-all duration-400`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                <span className="relative z-10">{step.step}</span>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-neutral-800 mb-4 group-hover:text-neutral-900 transition-colors duration-300">
                {step.title}
              </h3>

              <p className="text-neutral-600 leading-relaxed lg:text-lg group-hover:text-neutral-700 transition-colors duration-300">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full -ml-12 z-20">
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-neutral-300 group-hover:text-primary-400 transform group-hover:translate-x-2 transition-all duration-400" />
                  </div>
                </div>
              )}

              <div
                className={`absolute inset-0 ${step.bgColor} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-400 -z-10 scale-110`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
