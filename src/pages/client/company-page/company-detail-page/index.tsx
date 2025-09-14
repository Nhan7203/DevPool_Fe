"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  MapPin,
  Users,
  Star,
  Globe,
  Phone,
  Mail,
  Building2,
  Award,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import ProjectCard from "../../../../components/cards/ProjectCard"

interface Company {
  id: string
  name: string
  logo?: string
  field: string
  location: string
  employeeCount: string
  rating: number
  reviewCount: number
  description: string
  website?: string
  phone?: string
  email?: string
  founded?: string
  specialties: string[]
  benefits: string[]
  companySize: string
  workingHours: string
  workingModel: string
}

interface Project {
  id: string
  title: string
  company: string
  description: string
  skills: string[]
  budget: number
  budgetType: "fixed" | "hourly"
  timeline: string
  location: string
  applicants: number
  posted: string
  companyLogo?: string
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "reviews">("overview")

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCompany: Company = {
      id: id || "1",
      name: "TechViet Solutions",
      logo: "/abstract-tech-logo.png",
      field: "Phát triển phần mềm",
      location: "Hà Nội, Việt Nam",
      employeeCount: "50-100",
      rating: 4.8,
      reviewCount: 127,
      description:
        "TechViet Solutions là công ty hàng đầu trong lĩnh vực phát triển phần mềm tại Việt Nam. Chúng tôi chuyên cung cấp các giải pháp công nghệ tiên tiến cho doanh nghiệp, từ phát triển ứng dụng web, mobile đến các hệ thống quản lý doanh nghiệp. Với đội ngũ kỹ sư giàu kinh nghiệm và quy trình làm việc chuyên nghiệp, chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất cho khách hàng.",
      website: "https://techviet.com",
      phone: "+84 24 1234 5678",
      email: "contact@techviet.com",
      founded: "2018",
      specialties: ["React", "Node.js", "Python", "AWS", "DevOps", "UI/UX Design"],
      benefits: [
        "Lương thưởng cạnh tranh",
        "Bảo hiểm sức khỏe toàn diện",
        "Môi trường làm việc hiện đại",
        "Cơ hội thăng tiến rõ ràng",
        "Đào tạo và phát triển kỹ năng",
        "Team building định kỳ",
      ],
      companySize: "Công ty vừa (50-100 nhân viên)",
      workingHours: "8:00 - 17:30 (Thứ 2 - Thứ 6)",
      workingModel: "Hybrid (3 ngày tại văn phòng, 2 ngày remote)",
    }

    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Phát triển ứng dụng E-commerce",
        company: "TechViet Solutions",
        description:
          "Cần phát triển một ứng dụng thương mại điện tử hoàn chỉnh với tính năng thanh toán online, quản lý kho hàng và hệ thống đánh giá sản phẩm.",
        skills: ["React", "Node.js", "MongoDB", "Payment Gateway"],
        budget: 150000000,
        budgetType: "fixed",
        timeline: "3 tháng",
        location: "Hà Nội",
        applicants: 12,
        posted: "2 ngày trước",
        companyLogo: "/abstract-tech-logo.png",
      },
      {
        id: "2",
        title: "Xây dựng hệ thống CRM",
        company: "TechViet Solutions",
        description:
          "Phát triển hệ thống quản lý khách hàng (CRM) với các tính năng quản lý leads, theo dõi cơ hội bán hàng và báo cáo chi tiết.",
        skills: ["Vue.js", "Laravel", "MySQL", "API Integration"],
        budget: 2500000,
        budgetType: "hourly",
        timeline: "2 tháng",
        location: "Remote",
        applicants: 8,
        posted: "1 tuần trước",
        companyLogo: "/abstract-tech-logo.png",
      },
      {
        id: "3",
        title: "Ứng dụng Mobile Banking",
        company: "TechViet Solutions",
        description:
          "Phát triển ứng dụng ngân hàng di động với các tính năng chuyển tiền, thanh toán hóa đơn và quản lý tài khoản an toàn.",
        skills: ["React Native", "Firebase", "Blockchain", "Security"],
        budget: 300000000,
        budgetType: "fixed",
        timeline: "6 tháng",
        location: "Hà Nội",
        applicants: 25,
        posted: "3 ngày trước",
        companyLogo: "/abstract-tech-logo.png",
      },
    ]

    setTimeout(() => {
      setCompany(mockCompany)
      setProjects(mockProjects)
      setLoading(false)
    }, 1000)
  }, [id])

  const handleApplyProject = (projectId: string) => {
    console.log("Apply to project:", projectId)
  }

  const handleBookmarkProject = (projectId: string) => {
    console.log("Bookmark project:", projectId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy công ty</h2>
          <p className="text-gray-600 mb-4">Công ty bạn đang tìm kiếm không tồn tại.</p>
          <button
            onClick={() => navigate("/companies")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Quay lại danh sách công ty
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/companies")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách công ty
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              {company.logo ? (
                <img
                  src={company.logo || "/placeholder.svg"}
                  alt={company.name}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">{company.name.charAt(0)}</span>
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span>{company.field}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{company.employeeCount} nhân viên</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{company.rating}</span>
                    <span className="ml-1">({company.reviewCount} đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex space-x-3">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </a>
              )}
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Theo dõi công ty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: "overview", label: "Tổng quan", count: null },
              { key: "projects", label: "Dự án", count: projects.length },
              { key: "reviews", label: "Đánh giá", count: company.reviewCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Về công ty</h2>
                <p className="text-gray-700 leading-relaxed">{company.description}</p>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Chuyên môn</h2>
                <div className="flex flex-wrap gap-3">
                  {company.specialties.map((specialty) => (
                    <span key={specialty} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Phúc lợi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <Award className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Quy mô</div>
                    <div className="font-medium text-gray-900">{company.companySize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Năm thành lập</div>
                    <div className="font-medium text-gray-900">{company.founded}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Giờ làm việc</div>
                    <div className="font-medium text-gray-900">{company.workingHours}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Mô hình làm việc</div>
                    <div className="font-medium text-gray-900">{company.workingModel}</div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>
                <div className="space-y-3">
                  {company.website && (
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{company.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dự án đang tuyển</span>
                    <span className="font-semibold text-emerald-600">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đánh giá trung bình</span>
                    <span className="font-semibold text-yellow-600">{company.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tổng đánh giá</span>
                    <span className="font-semibold text-gray-900">{company.reviewCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dự án đang tuyển ({projects.length})</h2>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onApply={handleApplyProject}
                    onBookmark={handleBookmarkProject}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dự án nào</h3>
                <p className="text-gray-600">Công ty này hiện chưa đăng tuyển dự án nào.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Đánh giá ({company.reviewCount})</h2>
            </div>

            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng đang phát triển</h3>
              <p className="text-gray-600">Phần đánh giá sẽ được cập nhật trong thời gian tới.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
