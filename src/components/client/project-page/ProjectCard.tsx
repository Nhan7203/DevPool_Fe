"use client"

import { Star, Users, Briefcase, Calendar, Clock } from "lucide-react"
import type { Project } from "./types"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../../router/routes"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()

  return (
    <div className="group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-xl border border-neutral-200/50 hover:border-primary-300 p-6 transition-all duration-300 hover:-translate-y-1">
      {/* Header với gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-50/30 to-transparent rounded-t-3xl"/>
      
      <div className="relative">
        {/* Company Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-2xl blur opacity-50"/>
            <img
              src={project.companyLogo || "/company-placeholder.png"}
              alt={project.companyName}
              className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800 group-hover:text-primary-700 transition-colors">
              {project.name}
            </h3>
            <p className="text-neutral-500 flex items-center gap-2">
              <span>{project.companyName}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-sm">{project.location}</span>
            </p>
          </div>
        </div>

        {/* Tags với gradient */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 text-sm font-medium border border-primary-100">
            {project.field}
          </span>
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-700 text-sm font-medium border border-secondary-100">
            {project.projectType}
          </span>
        </div>

        {/* Description với line clamp */}
        <p className="text-neutral-600 mb-6 line-clamp-2 group-hover:text-neutral-700 transition-colors">
          {project.description}
        </p>

        {/* Stats Grid với icons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsItem icon={<Users className="w-5 h-5"/>} value={`${project.teamSize} thành viên`}/>
          <StatsItem icon={<Briefcase className="w-5 h-5"/>} value={`${project.openPositions} vị trí`}/>
          <StatsItem icon={<Calendar className="w-5 h-5"/>} value={project.startDate}/>
          <StatsItem icon={<Clock className="w-5 h-5"/>} value={project.duration}/>
        </div>

        {/* Technologies với hover effect */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-lg bg-neutral-50 text-neutral-600 text-sm border border-neutral-200/50 hover:bg-neutral-100 hover:border-neutral-300 transition-all duration-200"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Footer với gradient button */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
            <span className="font-semibold text-neutral-700">{project.rating}</span>
            <span className="text-neutral-400 text-sm">/5.0</span>
          </div>
          <button
            onClick={() => navigate(ROUTES.PROJECT_DETAIL(project.id))}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  )
}

// Component phụ cho Stats
function StatsItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100">
      <div className="text-primary-500">{icon}</div>
      <span className="text-sm text-neutral-600">{value}</span>
    </div>
  )
}