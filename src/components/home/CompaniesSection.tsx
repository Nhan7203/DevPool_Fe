import type React from "react"
import { MapPin, Users, Star, ArrowRight } from "lucide-react"

const CompaniesSection: React.FC = () => {
  const companies = [
    {
      id: 1,
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center",
      name: "TechViet Solutions",
      field: "Phát triển phần mềm",
      location: "Hà Nội",
      employees: "200+",
      rating: 4.8,
      reviews: 120,
      description: "Công ty hàng đầu về giải pháp phần mềm doanh nghiệp với hơn 10 năm kinh nghiệm trong ngành.",
    },
    {
      id: 2,
      logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80&h=80&fit=crop&crop=center",
      name: "AI Innovation Hub",
      field: "Trí tuệ nhân tạo",
      location: "TP.HCM",
      employees: "150+",
      rating: 4.9,
      reviews: 85,
      description: "Chuyên gia về AI và Machine Learning, phát triển các sản phẩm công nghệ tiên tiến.",
    },
    {
      id: 3,
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&h=80&fit=crop&crop=center",
      name: "Mobile First Co.",
      field: "Mobile App Development",
      location: "Đà Nẵng",
      employees: "80+",
      rating: 4.7,
      reviews: 95,
      description: "Startup năng động chuyên phát triển ứng dụng di động cho các doanh nghiệp lớn.",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl leading-[1.3] font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Các Công Ty Hiện tại
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những công ty đang tuyển dụng và hợp tác trong ngành IT
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 p-8 group animate-fade-in-up border border-gray-100"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Logo and Company Name */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                  <img
                    src={company.logo || "/placeholder.svg"}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {company.name}
                  </h3>
                  <p className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-full inline-block shadow-sm">
                    {company.field}
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4 mb-6">
                {/* Location */}
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">{company.location}</span>
                </div>

                {/* Employees */}
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">{company.employees} nhân viên</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">{company.rating}/5</span>
                  </div>
                  <span className="text-sm text-gray-500">từ {company.reviews} đánh giá</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-8">{company.description}</p>

              {/* View Details Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn shadow-lg hover:shadow-xl transform hover:scale-105">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-blue-600 font-semibold py-4 px-10 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
            Xem tất cả công ty
          </button>
        </div>
      </div>
    </section>
  )
}

export default CompaniesSection
