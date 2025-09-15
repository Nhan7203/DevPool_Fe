// components/client/company-detail-page/CompanyOverview.tsx
import { Award } from "lucide-react"
import CompanyInfoCard from "./CompanyInfoCard"
import CompanyContactCard from "./CompanyContactCard"
import CompanyStatsCard from "./CompanyStatsCard"

interface CompanyOverviewProps {
  company: {
    description: string
    specialties: string[]
    benefits: string[]
    companySize: string
    founded?: string
    workingHours: string
    workingModel: string
    website?: string
    phone?: string
    email?: string
    rating: number
    reviewCount: number
  }
  projectCount: number
}

export default function CompanyOverview({ company, projectCount }: CompanyOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* About */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Về công ty
          </h2>
          <p className="text-neutral-700 leading-relaxed">{company.description}</p>
        </div>

        {/* Specialties */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Chuyên môn
          </h2>
          <div className="flex flex-wrap gap-3">
            {company.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium border border-primary-100"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Phúc lợi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <Award className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-neutral-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <CompanyInfoCard company={company} />
        <CompanyContactCard company={company} />
        <CompanyStatsCard 
          projectCount={projectCount}
          rating={company.rating}
          reviewCount={company.reviewCount}
        />
      </div>
    </div>
  )
}