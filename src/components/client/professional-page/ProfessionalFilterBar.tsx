"use client";

import { Search, Filter, ChevronDown, X } from "lucide-react";
import { categories, locations, experienceLevels } from "./data";

// Định nghĩa interface cho props của component này
interface ProfessionalFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedExperience: string;
  setSelectedExperience: (value: string) => void;
  minRate: string;
  setMinRate: (value: string) => void;
  maxRate: string;
  setMaxRate: (value: string) => void;
  clearFilters: () => void;
}

export default function ProfessionalFilterBar(
  props: ProfessionalFilterBarProps
) {
  const {
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    selectedExperience,
    setSelectedExperience,
    minRate,
    setMinRate,
    maxRate,
    setMaxRate,
    clearFilters,
  } = props;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-neutral-200 p-6 mb-8 animate-slide-up">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-6 h-6" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, kỹ năng, chuyên môn..."
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
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""
              }`}
          />
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-neutral-600 font-medium">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
          >
            <option value="rating">Đánh giá cao nhất</option>
            <option value="rate">Giá thấp nhất</option>
            <option value="experience">Kinh nghiệm nhiều nhất</option>
            <option value="projects">Dự án hoàn thành nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-2xl border border-neutral-200 animate-slide-down">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Lĩnh vực
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Địa điểm
            </label>
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

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Kinh nghiệm
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
            >
              {experienceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Range */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Mức lương (k VNĐ/giờ)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Từ"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              />
            </div>
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
  );
}
