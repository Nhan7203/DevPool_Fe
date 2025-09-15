// components/client/company-detail-page/CompanyProjects.tsx
import { TrendingUp } from "lucide-react"
import ProjectCard from "./ProjectCard"

interface Project {
  id: string
  title: string
  company: string
  description: string
  skills: string[]
  teamSize: number
  duration: string
  startDate: string
  location: string
  timeline: string
  budget: number
  budgetType: "fixed" | "hourly"
  applicants: number
  posted: string
  companyLogo?: string
  rating?: number
}

interface CompanyProjectsProps {
  projects: Project[]
  onApply: (projectId: string) => void
  onBookmark: (projectId: string) => void
}

export default function CompanyProjects({ projects, onApply, onBookmark }: CompanyProjectsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dự án đang tuyển ({projects.length})</h2>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onApply={onApply}
              onBookmark={onBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dự án nào</h3>
          <p className="text-gray-600">Công ty này hiện chưa đăng tuyển dự án nào.</p>
        </div>
      )}
    </div>
  )
}