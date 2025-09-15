// pages/client/company-detail/CompanyDetailPage.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import CompanyHeader from "../../../components/client/company-detail-page/CompanyHeader"
import CompanyTabs from "../../../components/client/company-detail-page/CompanyTabs"
import CompanyOverview from "../../../components/client/company-detail-page/CompanyOverview"
import CompanyProjects from "../../../components/client/company-detail-page/CompanyProjects"
import CompanyReviews from "../../../components/client/company-detail-page/CompanyReviews"

// Import types
import type { Company, Project } from "./types"

export default function CompanyClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("overview")

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
        teamSize: 5,           // Added
        duration: "3 tháng",
        startDate: "01/12/2023", // Added
        budget: 150000000,
        budgetType: "fixed",
        timeline: "3 tháng",
        location: "Hà Nội",
        applicants: 12,
        posted: "2 ngày trước",
        companyLogo: "/abstract-tech-logo.png",
        rating: 4.5            // Added optionally
      },
      {
        id: "2",
        title: "Xây dựng hệ thống CRM",
        company: "TechViet Solutions",
        description:
          "Phát triển hệ thống quản lý khách hàng (CRM) với các tính năng quản lý leads, theo dõi cơ hội bán hàng và báo cáo chi tiết.",
        skills: ["Vue.js", "Laravel", "MySQL", "API Integration"],
        teamSize: 3,           // Added
        duration: "2 tháng",
        startDate: "15/12/2023", // Added
        budget: 2500000,
        budgetType: "hourly",
        timeline: "2 tháng",
        location: "Remote",
        applicants: 8,
        posted: "1 tuần trước",
        companyLogo: "/abstract-tech-logo.png",
        rating: 4.2            // Added optionally
      },
      // ... Update the rest of your mock projects similarly
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Không tìm thấy công ty</h2>
          <p className="text-neutral-600 mb-4">Công ty bạn đang tìm kiếm không tồn tại.</p>
          <button
            onClick={() => navigate("/companies")}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105"
          >
            Quay lại danh sách công ty
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: "overview", label: "Tổng quan", count: null },
    { key: "projects", label: "Dự án", count: projects.length },
    { key: "reviews", label: "Đánh giá", count: company.reviewCount },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      <CompanyHeader company={company} />
      <CompanyTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <CompanyOverview company={company} projectCount={projects.length} />
        )}

        {activeTab === "projects" && (
          <CompanyProjects
            projects={projects}
            onApply={handleApplyProject}
            onBookmark={handleBookmarkProject}
          />
        )}

        {activeTab === "reviews" && (
          <CompanyReviews reviewCount={company.reviewCount} />
        )}
      </div>
    </div>
  )
}