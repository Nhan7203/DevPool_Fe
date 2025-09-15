// components/client/company-detail-page/CompanyReviews.tsx
import { Star } from "lucide-react"

interface CompanyReviewsProps {
  reviewCount: number
}

export default function CompanyReviews({ reviewCount }: CompanyReviewsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đánh giá ({reviewCount})</h2>
      </div>

      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-600">Phần đánh giá sẽ được cập nhật trong thời gian tới.</p>
      </div>
    </div>
  )
}