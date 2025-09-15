// components/client/company-detail-page/CompanyStatsCard.tsx
interface CompanyStatsCardProps {
  projectCount: number
  rating: number
  reviewCount: number
}

export default function CompanyStatsCard({ projectCount, rating, reviewCount }: CompanyStatsCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
        Thống kê
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Dự án đang tuyển</span>
          <span className="font-semibold text-emerald-600">{projectCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Đánh giá trung bình</span>
          <span className="font-semibold text-yellow-600">{rating}/5</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Tổng đánh giá</span>
          <span className="font-semibold text-gray-900">{reviewCount}</span>
        </div>
      </div>
    </div>
  )
}