// components/client/company-detail-page/CompanyInfoCard.tsx
interface CompanyInfoCardProps {
  company: {
    companySize: string
    founded?: string
    workingHours: string
    workingModel: string
  }
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
        Thông tin công ty
      </h3>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Quy mô</div>
          <div className="font-medium text-gray-900">{company.companySize}</div>
        </div>
        {company.founded && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Năm thành lập</div>
            <div className="font-medium text-gray-900">{company.founded}</div>
          </div>
        )}
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
  )
}