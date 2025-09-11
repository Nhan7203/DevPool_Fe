import { MapPin, Star, Clock, CheckCircle, MessageCircle } from 'lucide-react';

interface ProfessionalCardProps {
  professional: {
    id: string;
    name: string;
    title: string;
    avatar?: string;
    location: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    skills: Array<{ name: string; level: 'Cơ bản' | 'Khá' | 'Giỏi' | 'Chuyên gia' }>;
    availability: 'available' | 'busy' | 'unavailable';
    matchScore?: number;
    completedProjects: number;
    description: string;
    isOnline?: boolean;
  };
  onContact?: (professionalId: string) => void;
  onHire?: (professionalId: string) => void;
  showMatchScore?: boolean;
}

export default function ProfessionalCard({ 
  professional, 
  onContact, 
  onHire, 
  showMatchScore = false 
}: ProfessionalCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailabilityColor = () => {
    switch (professional.availability) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-yellow-600 bg-yellow-50';
      case 'unavailable': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityText = () => {
    switch (professional.availability) {
      case 'available': return 'Sẵn sàng';
      case 'busy': return 'Bận';
      case 'unavailable': return 'Không rảnh';
      default: return 'Không xác định';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Chuyên gia': return 'bg-purple-100 text-purple-800';
      case 'Giỏi': return 'bg-green-100 text-green-800';
      case 'Khá': return 'bg-blue-100 text-blue-800';
      case 'Cơ bản': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {professional.avatar ? (
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-xl">
                  {professional.name.charAt(0)}
                </span>
              </div>
            )}
            {professional.isOnline && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{professional.name}</h3>
            <p className="text-gray-600 mb-1">{professional.title}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{professional.rating}</span>
                <span>({professional.reviewCount} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Score */}
        {showMatchScore && professional.matchScore && (
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              professional.matchScore >= 80 
                ? 'bg-green-100 text-green-800'
                : professional.matchScore >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {professional.matchScore}%
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Phù hợp</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-2">
        {professional.description}
      </p>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {professional.skills.slice(0, 4).map((skill) => (
            <span
              key={`${skill.name}-${skill.level}`}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}
            >
              {skill.name}
            </span>
          ))}
          {professional.skills.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{professional.skills.length - 4} thêm
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Mức lương:</span>
          <div className="font-semibold text-gray-900">
            {formatCurrency(professional.hourlyRate)}/giờ
          </div>
        </div>
        <div>
          <span className="text-gray-600">Hoàn thành:</span>
          <div className="font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            {professional.completedProjects} dự án
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor()}`}>
          <Clock className="w-3 h-3 mr-1" />
          {getAvailabilityText()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onContact?.(professional.id)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Nhắn Tin</span>
        </button>
        
        <button
          onClick={() => onHire?.(professional.id)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          disabled={professional.availability === 'unavailable'}
        >
          {professional.availability === 'unavailable' ? 'Không Rảnh' : 'Thuê Ngay'}
        </button>
      </div>
    </div>
  );
}