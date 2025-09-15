// components/client/company-detail-page/CompanyContactCard.tsx
import { Globe, Phone, Mail } from "lucide-react"

interface CompanyContactCardProps {
  company: {
    website?: string
    phone?: string
    email?: string
  }
}

export default function CompanyContactCard({ company }: CompanyContactCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
        Liên hệ
      </h3>
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
  )
}