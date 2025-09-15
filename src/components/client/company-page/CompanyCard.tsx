"use client"

import {
  MapPin,
  Star,
  Users,
  Building2,
  Briefcase,
  ArrowRight,
  Heart,
  MessageCircle,
  Award,
  Calendar,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Company } from "./types"
import { ROUTES } from "../../../router/routes"

interface CompanyCardProps {
  company: Company
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

const getCompanyTypeColor = (type: string) => {
  switch (type) {
    case "Startup": return "bg-violet-100 text-violet-800 border-violet-200"
    case "SME": return "bg-primary-100 text-primary-800 border-primary-200"
    case "Enterprise": return "bg-success-100 text-success-800 border-success-200"
    case "MNC": return "bg-warning-100 text-warning-800 border-warning-200"
    default: return "bg-neutral-100 text-neutral-800 border-neutral-200"
  }
}

export default function CompanyCard({ company, isFavorite, onToggleFavorite }: CompanyCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border border-neutral-200 hover:border-primary-300 p-8 transition-all duration-500 transform hover:scale-102 hover:-translate-y-2"
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
          <div>
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
          onClick={() => onToggleFavorite(company.id)}
          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 transform ${isFavorite
              ? "text-error-500 bg-error-50 hover:bg-error-100"
              : "text-neutral-400 hover:text-error-500 hover:bg-error-50"
            }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
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
    </div>
  )
}