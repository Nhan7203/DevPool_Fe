"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../../router/routes"
import {
  Search,
  Filter,
  MapPin,
  Star,
  Users,
  Building2,
  Briefcase,
  ArrowRight,
  ChevronDown,
  X,
  Heart,
  MessageCircle,
  Award,
  Calendar,
} from "lucide-react"

interface Company {
  id: string
  name: string
  field: string
  logo: string
  location: string
  employees: string
  employeeCount: number
  rating: number
  reviews: number
  description: string
  founded: number
  website: string
  isVerified: boolean
  openPositions: number
  benefits: string[]
  workingHours: string
  companyType: "Startup" | "SME" | "Enterprise" | "MNC"
}

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "TechViet Solutions",
    field: "Phát triển phần mềm",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center",
    location: "Hà Nội",
    employees: "200+",
    employeeCount: 200,
    rating: 4.8,
    reviews: 120,
    description:
      "Công ty hàng đầu về giải pháp phần mềm doanh nghiệp với hơn 10 năm kinh nghiệm trong ngành công nghệ thông tin.",
    founded: 2013,
    website: "techviet.com",
    isVerified: true,
    openPositions: 15,
    benefits: ["Bảo hiểm sức khỏe", "Thưởng hiệu suất", "Du lịch công ty"],
    workingHours: "8:00 - 17:30",
    companyType: "Enterprise",
  },
  {
    id: "2",
    name: "AI Innovation Hub",
    field: "Trí tuệ nhân tạo",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80&h=80&fit=crop&crop=center",
    location: "TP.HCM",
    employees: "150+",
    employeeCount: 150,
    rating: 4.9,
    reviews: 85,
    description:
      "Chuyên gia về AI và Machine Learning, phát triển các sản phẩm công nghệ tiên tiến cho thị trường toàn cầu.",
    founded: 2018,
    website: "aiinnovation.vn",
    isVerified: true,
    openPositions: 8,
    benefits: ["Flexible working", "Stock options", "Learning budget"],
    workingHours: "9:00 - 18:00",
    companyType: "Startup",
  },
  {
    id: "3",
    name: "Mobile First Co.",
    field: "Mobile App Development",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&h=80&fit=crop&crop=center",
    location: "Đà Nẵng",
    employees: "80+",
    employeeCount: 80,
    rating: 4.7,
    reviews: 95,
    description: "Startup năng động chuyên phát triển ứng dụng di động cho các doanh nghiệp lớn và startup công nghệ.",
    founded: 2020,
    website: "mobilefirst.vn",
    isVerified: false,
    openPositions: 12,
    benefits: ["Remote work", "Team building", "Overtime pay"],
    workingHours: "8:30 - 17:30",
    companyType: "SME",
  },
  {
    id: "4",
    name: "CloudTech Vietnam",
    field: "Cloud Computing",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=80&fit=crop&crop=center",
    location: "Hà Nội",
    employees: "300+",
    employeeCount: 300,
    rating: 4.6,
    reviews: 150,
    description: "Nhà cung cấp dịch vụ cloud hàng đầu Việt Nam với giải pháp toàn diện cho doanh nghiệp và tổ chức.",
    founded: 2015,
    website: "cloudtech.vn",
    isVerified: true,
    openPositions: 20,
    benefits: ["13th month salary", "Training courses", "Health insurance"],
    workingHours: "8:00 - 17:00",
    companyType: "Enterprise",
  },
  {
    id: "5",
    name: "CyberSec Pro",
    field: "An ninh mạng",
    logo: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=80&h=80&fit=crop&crop=center",
    location: "TP.HCM",
    employees: "120+",
    employeeCount: 120,
    rating: 4.8,
    reviews: 75,
    description:
      "Chuyên gia bảo mật thông tin và an ninh mạng cho các tổ chức lớn, ngân hàng và doanh nghiệp tài chính.",
    founded: 2017,
    website: "cybersecpro.vn",
    isVerified: true,
    openPositions: 6,
    benefits: ["High salary", "Certification support", "Flexible hours"],
    workingHours: "9:00 - 18:00",
    companyType: "SME",
  },
  {
    id: "6",
    name: "DataViz Analytics",
    field: "Data Analytics",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center",
    location: "Đà Nẵng",
    employees: "60+",
    employeeCount: 60,
    rating: 4.5,
    reviews: 45,
    description: "Công ty chuyên về phân tích dữ liệu và business intelligence cho doanh nghiệp trong và ngoài nước.",
    founded: 2019,
    website: "dataviz.vn",
    isVerified: false,
    openPositions: 4,
    benefits: ["Work from home", "Performance bonus", "Team events"],
    workingHours: "8:30 - 17:30",
    companyType: "Startup",
  },
]

const fields = [
  "Tất cả",
  "Phát triển phần mềm",
  "Trí tuệ nhân tạo",
  "Mobile App Development",
  "Cloud Computing",
  "An ninh mạng",
  "Data Analytics",
]
const locations = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng"]
const companySizes = ["Tất cả", "1-50", "51-100", "101-200", "200+"]
const companyTypes = ["Tất cả", "Startup", "SME", "Enterprise", "MNC"]

export default function CompanyClientPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState("Tất cả")
  const [selectedLocation, setSelectedLocation] = useState("Tất cả")
  const [selectedSize, setSelectedSize] = useState("Tất cả")
  const [selectedType, setSelectedType] = useState("Tất cả")
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState("rating")
  const navigate = useNavigate()

  const filteredCompanies = useMemo(() => {
    const filtered = mockCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesField = selectedField === "Tất cả" || company.field === selectedField
      const matchesLocation = selectedLocation === "Tất cả" || company.location === selectedLocation
      const matchesType = selectedType === "Tất cả" || company.companyType === selectedType
      const matchesRating = company.rating >= minRating

      let matchesSize = true
      if (selectedSize !== "Tất cả") {
        const employeeCount = company.employeeCount
        switch (selectedSize) {
          case "1-50":
            matchesSize = employeeCount <= 50
            break
          case "51-100":
            matchesSize = employeeCount > 50 && employeeCount <= 100
            break
          case "101-200":
            matchesSize = employeeCount > 100 && employeeCount <= 200
            break
          case "200+":
            matchesSize = employeeCount > 200
            break
        }
      }

      return matchesSearch && matchesField && matchesLocation && matchesType && matchesRating && matchesSize
    })

    // Sort companies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "name":
          return a.name.localeCompare(b.name)
        case "employees":
          return b.employeeCount - a.employeeCount
        case "positions":
          return b.openPositions - a.openPositions
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedField, selectedLocation, selectedSize, selectedType, minRating, sortBy])

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case "Startup":
        return "bg-violet-100 text-violet-800 border-violet-200"
      case "SME":
        return "bg-primary-100 text-primary-800 border-primary-200"
      case "Enterprise":
        return "bg-success-100 text-success-800 border-success-200"
      case "MNC":
        return "bg-warning-100 text-warning-800 border-warning-200"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200"
    }
  }

  const toggleFavorite = (companyId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(companyId)) {
      newFavorites.delete(companyId)
    } else {
      newFavorites.add(companyId)
    }
    setFavorites(newFavorites)
  }

  const clearFilters = () => {
    setSelectedField("Tất cả")
    setSelectedLocation("Tất cả")
    setSelectedSize("Tất cả")
    setSelectedType("Tất cả")
    setMinRating(0)
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Tìm Kiếm Công Ty IT
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá những công ty công nghệ hàng đầu và tìm kiếm cơ hội nghề nghiệp phù hợp với bạn
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-neutral-200 p-6 mb-8 animate-slide-up">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công ty, lĩnh vực, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-neutral-400 hover:shadow-soft text-neutral-900 placeholder-neutral-500 text-lg"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300 hover:scale-105 transform"
            >
              <Filter className="w-5 h-5" />
              <span>Bộ lọc nâng cao</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-neutral-600 font-medium">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="employees">Quy mô lớn nhất</option>
                <option value="positions">Nhiều vị trí tuyển dụng</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-2xl border border-neutral-200 animate-slide-down">
              {/* Field Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Lĩnh vực</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {fields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Địa điểm</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Quy mô</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Loại hình</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {companyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Đánh giá tối thiểu</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  <option value={0}>Tất cả</option>
                  <option value={4}>4+ sao</option>
                  <option value={4.5}>4.5+ sao</option>
                  <option value={4.8}>4.8+ sao</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-error-500 to-error-600 text-white px-4 py-2 rounded-xl hover:from-error-600 hover:to-error-700 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600 font-medium">
            Tìm thấy <span className="font-bold text-primary-600">{filteredCompanies.length}</span> công ty IT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map((company, index) => (
            <div
              key={company.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border border-neutral-200 hover:border-primary-300 p-8 transition-all duration-500 transform hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={company.logo || "/placeholder.svg"}
                      alt={`${company.name} logo`}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
                    />
                    {company.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-neutral-900 group-hover:text-primary-700 transition-colors duration-300 mb-1">
                      {company.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105 ${getCompanyTypeColor(company.companyType)}`}
                    >
                      {company.companyType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorite(company.id)}
                  className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 transform ${
                    favorites.has(company.id)
                      ? "text-error-500 bg-error-50 hover:bg-error-100"
                      : "text-neutral-400 hover:text-error-500 hover:bg-error-50"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(company.id) ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Field Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-medium rounded-full shadow-soft">
                  {company.field}
                </span>
              </div>

              {/* Location and Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{company.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-warning-400 fill-current" />
                    <span className="font-bold text-neutral-900">{company.rating}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">({company.reviews} đánh giá)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-neutral-700 mb-6 line-clamp-3 leading-relaxed group-hover:text-neutral-800 transition-colors duration-300">
                {company.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="font-bold text-primary-700">{company.employees}</span>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">nhân viên</span>
                </div>

                <div className="text-center p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 group-hover:from-secondary-100 group-hover:to-secondary-200 transition-all duration-300">
                  <div className="flex items-center justify-center mb-1">
                    <Briefcase className="w-4 h-4 text-secondary-600 mr-1" />
                    <span className="font-bold text-secondary-700">{company.openPositions}</span>
                  </div>
                  <span className="text-xs text-secondary-600 font-medium">vị trí tuyển</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-600 font-medium">Thành lập {company.founded}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-600 font-medium">{company.workingHours}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {company.benefits.slice(0, 2).map((benefit) => (
                    <span
                      key={benefit}
                      className="px-3 py-1.5 bg-success-100 text-success-800 text-xs font-medium rounded-full border border-success-200 transition-all duration-300 hover:scale-105"
                    >
                      {benefit}
                    </span>
                  ))}
                  {company.benefits.length > 2 && (
                    <span className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full border border-neutral-200 hover:bg-neutral-200 transition-colors duration-300">
                      +{company.benefits.length - 2} thêm
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 px-4 py-3 rounded-xl hover:from-neutral-200 hover:to-neutral-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105">
                  <MessageCircle className="w-4 h-4" />
                  <span>Liên Hệ</span>
                </button>

                <button 
                onClick={() => navigate(ROUTES.COMPANY_DETAIL(company.id))}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105">
                  <span>Xem Chi Tiết</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Badge */}
              {company.isVerified && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-success-500 to-success-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-soft">
                  Đã xác minh
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-neutral-500" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-700 mb-4">Không tìm thấy công ty phù hợp</h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy công ty phù hợp với yêu cầu của bạn.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredCompanies.length > 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <button className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-8 py-4 rounded-2xl hover:from-secondary-700 hover:to-secondary-800 font-semibold text-lg transition-all duration-300 shadow-glow-green hover:shadow-glow-lg transform hover:scale-105">
              Xem thêm công ty IT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
