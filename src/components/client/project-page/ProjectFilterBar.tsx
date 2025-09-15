"use client"

import { Search } from "lucide-react"

interface ProjectFilterBarProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  selectedField: string
  setSelectedField: (value: string) => void
  selectedLocation: string
  setSelectedLocation: (value: string) => void
  selectedType: string
  setSelectedType: (value: string) => void
  minRating: number
  setMinRating: (value: number) => void
  clearFilters: () => void
}

export default function ProjectFilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  selectedField,
  setSelectedField,
  selectedLocation,
  setSelectedLocation,
  selectedType,
  setSelectedType,
  minRating,
  setMinRating,
  clearFilters,
}: ProjectFilterBarProps) {
  return (
  <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-soft p-8 mb-8 border border-neutral-200/50">
    <div className="flex flex-col md:flex-row gap-6 items-center">
      {/* Search với icon và animation */}
      <div className="relative flex-1 group">
        <div className="absolute inset-0 bg-primary-100/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"/>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-primary-500 transition-colors"/>
        <input
          type="text"
          placeholder="Tìm kiếm dự án theo tên, công ty hoặc công nghệ..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-neutral-200/70 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white/70 backdrop-blur-sm text-neutral-700 placeholder:text-neutral-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sort dropdown với custom styling */}
      <select
        className="px-6 py-3 rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-sm text-neutral-700 outline-none appearance-none cursor-pointer hover:border-primary-300 transition-colors bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNy40MSA4TDEyIDEyLjU5IDE2LjU5IDhMMTggOS40MSAxMiAxNS40MSA2IDkuNDEgNy40MSA4eiIgZmlsbD0iY3VycmVudENvbG9yIi8+PC9zdmc+')] bg-[length:20px] bg-[calc(100%-12px)_center] bg-no-repeat pr-12"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="rating">Đánh giá cao nhất</option>
        <option value="name">Tên dự án</option>
        <option value="teamSize">Quy mô nhóm</option>
        <option value="positions">Vị trí tuyển</option>
      </select>

      {/* Filter toggles với gradient */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
            showFilters
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-neutral-600 hover:text-primary-600'
          }`}
        >
          {showFilters ? '✕ Ẩn bộ lọc' : '⚡ Hiện bộ lọc'}
        </button>

        {showFilters && (
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-2xl text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-all duration-300"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <select
            className="px-4 py-2 rounded-xl border border-neutral-200"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            <option value="Tất cả">Tất cả lĩnh vực</option>
            <option value="Phần mềm">Phần mềm</option>
            <option value="Web">Web</option>
            <option value="Mobile">Mobile</option>
            <option value="AI/ML">AI/ML</option>
          </select>

          <select
            className="px-4 py-2 rounded-xl border border-neutral-200"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="Tất cả">Tất cả địa điểm</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. HCM">TP. HCM</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>

          <select
            className="px-4 py-2 rounded-xl border border-neutral-200"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="Tất cả">Tất cả loại dự án</option>
            <option value="Web">Web</option>
            <option value="Mobile">Mobile</option>
            <option value="Desktop">Desktop</option>
            <option value="AI/ML">AI/ML</option>
          </select>

          <div className="flex items-center gap-2">
            <span>Đánh giá tối thiểu:</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              className="w-20 px-3 py-2 rounded-xl border border-neutral-200"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  )
}