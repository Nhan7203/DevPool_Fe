"use client"

import { MapPin, Clock, Users, DollarSign, Calendar, Star } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    skills: string[]
    teamSize: number
    duration: string
    startDate: string
    location: string
    budget: number
    budgetType: "fixed" | "hourly"
    applicants: number
    posted: string
    rating?: number
  }
  onApply?: (projectId: string) => void
  onBookmark?: (projectId: string) => void;
}

export default function ProjectCard({ project, onApply }: ProjectCardProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-xl border border-neutral-200/50 hover:border-primary-300 p-6 transition-all duration-300 hover:-translate-y-1">
      {/* Header với gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-50/30 to-transparent rounded-t-3xl" />

      <div className="relative">
        {/* Project Title & Rating */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-800 group-hover:text-primary-700 transition-colors">
            {project.title}
          </h3>
          {project.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-neutral-700">{project.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-neutral-600 mb-6 line-clamp-2">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium border border-primary-100"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-neutral-600">
              {project.teamSize} thành viên
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100">
            <Clock className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-neutral-600">{project.duration}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-neutral-600">{project.startDate}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/50 border border-neutral-100">
            <MapPin className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-neutral-600">{project.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-100">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-500">Ngân sách</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-lg text-emerald-700">
                {formatCurrency(project.budget)}
                {project.budgetType === "hourly" && "/giờ"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-sm text-neutral-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{project.applicants} ứng viên</span>
              <span>•</span>
              <span>{project.posted}</span>
            </div>
            <button
              onClick={() => onApply?.(project.id)}
              className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:scale-105"
            >
              Ứng tuyển ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}