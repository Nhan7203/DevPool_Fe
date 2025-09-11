import { MapPin, Clock, Users, DollarSign, Bookmark } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    company: string;
    description: string;
    skills: string[];
    budget: number;
    budgetType: 'fixed' | 'hourly';
    timeline: string;
    location: string;
    applicants: number;
    posted: string;
    companyLogo?: string;
  };
  onApply?: (projectId: string) => void;
  onBookmark?: (projectId: string) => void;
  isBookmarked?: boolean;
}

export default function ProjectCard({ project, onApply, onBookmark, isBookmarked = false }: ProjectCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatBudget = () => {
    if (project.budgetType === 'hourly') {
      return `${formatCurrency(project.budget)}/giờ`;
    }
    return formatCurrency(project.budget);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {project.companyLogo ? (
            <img
              src={project.companyLogo}
              alt={project.company}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-lg">
                {project.company.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {project.title}
            </h3>
            <p className="text-gray-600">{project.company}</p>
          </div>
        </div>
        
        <button
          onClick={() => onBookmark?.(project.id)}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
        {project.skills.length > 4 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            +{project.skills.length - 4} thêm
          </span>
        )}
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium text-gray-900">{formatBudget()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>{project.timeline}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{project.applicants} ứng viên</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {project.posted}
        </span>
        
        <button
          onClick={() => onApply?.(project.id)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          Ứng Tuyển Ngay
        </button>
      </div>
    </div>
  );
}