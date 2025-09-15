"use client"

import { useState, useMemo } from "react"
import ProjectFilterBar from "./ProjectFilterBar"
import ProjectList from "./ProjectList"
import EmptyState from "./EmptyState"
import type { Project } from "./types"

// Mock data - thay thế bằng API call thực tế
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Hệ thống quản lý nhân sự",
    description: "Xây dựng hệ thống quản lý nhân sự toàn diện với các tính năng hiện đại.",
    companyName: "Tech Solutions",
    companyLogo: "/company1.png",
    field: "Phần mềm",
    location: "Hà Nội",
    projectType: "Web",
    rating: 4.5,
    teamSize: 10,
    openPositions: 3,
    technologies: ["React", "Node.js", "PostgreSQL"],
    startDate: "01/10/2023",
    duration: "6 tháng",
    benefits: ["Remote 100%", "Training", "Bonus"]
  },
  // Thêm nhiều project khác
]

export default function ProjectClientPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState("Tất cả")
  const [selectedLocation, setSelectedLocation] = useState("Tất cả")
  const [selectedType, setSelectedType] = useState("Tất cả")
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("rating")

  const filteredProjects = useMemo(() => {
    const filtered = mockProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesField = selectedField === "Tất cả" || project.field === selectedField
      const matchesLocation = selectedLocation === "Tất cả" || project.location === selectedLocation
      const matchesType = selectedType === "Tất cả" || project.projectType === selectedType
      const matchesRating = project.rating >= minRating

      return matchesSearch && matchesField && matchesLocation && matchesType && matchesRating
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "name":
          return a.name.localeCompare(b.name)
        case "teamSize":
          return b.teamSize - a.teamSize
        case "positions":
          return b.openPositions - a.openPositions
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedField, selectedLocation, selectedType, minRating, sortBy])

  const clearFilters = () => {
    setSelectedField("Tất cả")
    setSelectedLocation("Tất cả")
    setSelectedType("Tất cả")
    setMinRating(0)
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Khám Phá Dự Án IT
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Tìm kiếm và tham gia các dự án công nghệ hấp dẫn từ những công ty hàng đầu
          </p>
        </div>

        <ProjectFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          minRating={minRating}
          setMinRating={setMinRating}
          clearFilters={clearFilters}
        />

        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600 font-medium">
            Tìm thấy <span className="font-bold text-primary-600">{filteredProjects.length}</span> dự án
          </p>
        </div>

        {filteredProjects.length > 0 ? (
          <ProjectList projects={filteredProjects} />
        ) : (
          <EmptyState onClearFilters={clearFilters} />
        )}

        {filteredProjects.length > 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <button className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-8 py-4 rounded-2xl hover:from-secondary-700 hover:to-secondary-800 font-semibold text-lg transition-all duration-300 shadow-glow-green hover:shadow-glow-lg transform hover:scale-105">
              Xem thêm dự án
            </button>
          </div>
        )}
      </div>
    </div>
  )
}