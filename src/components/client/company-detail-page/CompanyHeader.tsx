// components/client/company-detail-page/CompanyHeader.tsx
import { ArrowLeft, Building2, MapPin, Users, Star, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface CompanyHeaderProps {
  company: {
    id: string
    name: string
    logo?: string
    field: string
    location: string
    employeeCount: string
    rating: number
    reviewCount: number
    website?: string
  }
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-soft border-b border-neutral-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate("/companies")}
          className="flex items-center text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại danh sách công ty
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-soft"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-2xl">{company.name.charAt(0)}</span>
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-2">
                {company.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-600">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                  <span>{company.field}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-500" />
                  <span>{company.employeeCount} nhân viên</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{company.rating}</span>
                  <span className="ml-1 text-neutral-500">({company.reviewCount} đánh giá)</span>
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
                className="flex items-center px-4 py-2 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Website
              </a>
            )}
            <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105">
              Theo dõi công ty
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}