"use client"

import { Search, Filter, ChevronDown, X } from "lucide-react"
import { fields, locations, companySizes, companyTypes } from "./data"

interface CompanyFilterBarProps {
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
  selectedSize: string
  setSelectedSize: (value: string) => void
  selectedType: string
  setSelectedType: (value: string) => void
  minRating: number
  setMinRating: (value: number) => void
  clearFilters: () => void
}

export default function CompanyFilterBar({
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
  selectedSize,
  setSelectedSize,
  selectedType,
  setSelectedType,
  minRating,
  setMinRating,
  clearFilters,
}: CompanyFilterBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-neutral-200 p-6 mb-8 animate-slide-up">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-6 h-6" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên công ty, lĩnh vực, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-neutral-400 hover:shadow-soft text-neutral-900 placeholder-neutral-500 text-lg"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300 hover:scale-105 transform"
        >
          <Filter className="w-5 h-5" />
          <span>Bộ lọc nâng cao</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-neutral-600 font-medium">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
          >
            <option value="rating">Đánh giá cao nhất</option>
            <option value="name">Tên A-Z</option>
            <option value="employees">Quy mô lớn nhất</option>
            <option value="positions">Nhiều vị trí tuyển dụng</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-2xl border border-neutral-200 animate-slide-down">
          {/* Field Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Lĩnh vực</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Địa điểm</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Quy mô</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {companySizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Loại hình</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {companyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Đánh giá tối thiểu</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              <option value={0}>Tất cả</option>
              <option value={4}>4+ sao</option>
              <option value={4.5}>4.5+ sao</option>
              <option value={4.8}>4.8+ sao</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-error-500 to-error-600 text-white px-4 py-2 rounded-xl hover:from-error-600 hover:to-error-700 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105"
            >
              <X className="w-4 h-4" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}