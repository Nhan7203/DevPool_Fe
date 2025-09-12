import type React from "react"
import { MapPin, Star, Clock, CheckCircle } from "lucide-react"

interface Expert {
  id: number
  avatar: string
  name: string
  title: string
  location: string
  rating: number
  reviewCount: number
  hourlyRate: string
  skills: Array<{
    name: string
    level: "expert" | "good" | "intermediate"
  }>
  description: string
  status: "available" | "busy"
  matchPercentage: number
}

const ExpertsSection: React.FC = () => {
  const experts: Expert[] = [
    {
      id: 1,
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      name: "Nguyễn Thành",
      title: "Senior Full-stack Developer",
      location: "Hồ Chí Minh",
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: "800k VNĐ/giờ",
      skills: [
        { name: "ReactJS", level: "expert" },
        { name: "MongoDB", level: "good" },
        { name: "NodeJS", level: "expert" },
        { name: "TypeScript", level: "good" },
      ],
      description:
        "Chuyên gia phát triển ứng dụng web với 8+ năm kinh nghiệm. Đã hoàn thành 200+ dự án thành công cho các startup và doanh nghiệp lớn.",
      status: "available",
      matchPercentage: 95,
    },
    {
      id: 2,
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      name: "Trần Minh Anh",
      title: "Mobile App Developer",
      location: "Hà Nội",
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: "750k VNĐ/giờ",
      skills: [
        { name: "Flutter", level: "expert" },
        { name: "React Native", level: "good" },
        { name: "Firebase", level: "expert" },
        { name: "Kotlin", level: "intermediate" },
      ],
      description:
        "Chuyên gia phát triển ứng dụng di động cross-platform. Tập trung vào UX/UI và performance optimization cho mobile apps.",
      status: "busy",
      matchPercentage: 88,
    },
    {
      id: 3,
      avatar:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      name: "Lê Hoàng Nam",
      title: "DevOps Engineer",
      location: "Đà Nẵng",
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: "900k VNĐ/giờ",
      skills: [
        { name: "AWS", level: "expert" },
        { name: "Docker", level: "expert" },
        { name: "Kubernetes", level: "good" },
        { name: "Terraform", level: "good" },
      ],
      description:
        "Chuyên gia DevOps với kinh nghiệm triển khai hệ thống cloud-native. Đảm bảo tính ổn định và bảo mật cho infrastructure.",
      status: "available",
      matchPercentage: 92,
    },
  ]

  const getSkillColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-700 border-green-200"
      case "good":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getSkillLevelText = (level: string) => {
    switch (level) {
      case "expert":
        return "Chuyên gia"
      case "good":
        return "Giỏi"
      case "intermediate":
        return "Trung bình"
      default:
        return ""
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Chuyên Gia IT Nổi Bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Kết nối với những tài năng hàng đầu trong ngành IT</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold border border-purple-200">
                {expert.matchPercentage}% phù hợp
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={expert.avatar || "/placeholder.svg"}
                  alt={expert.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
                  <p className="text-gray-600 font-medium">{expert.title}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{expert.location}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">{expert.rating}</span>
                  </div>
                  <span className="text-gray-500">({expert.reviewCount} đánh giá)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{expert.hourlyRate}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {expert.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getSkillColor(skill.level)} transition-colors`}
                    >
                      {skill.name} ({getSkillLevelText(skill.level)})
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6 text-sm">{expert.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                {expert.status === "available" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Có thể làm việc ngay</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-600 font-medium">Hiện tại bận</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExpertsSection
