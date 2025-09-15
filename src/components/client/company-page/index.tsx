"use client"

import { useState, useMemo } from "react"
import CompanyFilterBar from "./CompanyFilterBar"
import CompanyList from "./CompanyList"
import EmptyState from "./EmptyState"
import { mockCompanies } from "./data"

export default function CompanyClientPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedField, setSelectedField] = useState("Tất cả")
    const [selectedLocation, setSelectedLocation] = useState("Tất cả")
    const [selectedSize, setSelectedSize] = useState("Tất cả")
    const [selectedType, setSelectedType] = useState("Tất cả")
    const [minRating, setMinRating] = useState(0)
    const [showFilters, setShowFilters] = useState(false)
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [sortBy, setSortBy] = useState("rating")

    const filteredCompanies = useMemo(() => {
        const filtered = mockCompanies.filter((company) => {
            const matchesSearch =
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.description.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesField = selectedField === "Tất cả" || company.field === selectedField
            const matchesLocation = selectedLocation === "Tất cả" || company.location === selectedLocation
            const matchesType = selectedType === "Tất cả" || company.companyType === selectedType
            const matchesRating = company.rating >= minRating

            let matchesSize = true
            if (selectedSize !== "Tất cả") {
                const employeeCount = company.employeeCount
                switch (selectedSize) {
                    case "1-50":
                        matchesSize = employeeCount <= 50
                        break
                    case "51-100":
                        matchesSize = employeeCount > 50 && employeeCount <= 100
                        break
                    case "101-200":
                        matchesSize = employeeCount > 100 && employeeCount <= 200
                        break
                    case "200+":
                        matchesSize = employeeCount > 200
                        break
                }
            }

            return matchesSearch && matchesField && matchesLocation && matchesType && matchesRating && matchesSize
        })

        // Sort companies
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating
                case "name":
                    return a.name.localeCompare(b.name)
                case "employees":
                    return b.employeeCount - a.employeeCount
                case "positions":
                    return b.openPositions - a.openPositions
                default:
                    return 0
            }
        })

        return filtered
    }, [searchTerm, selectedField, selectedLocation, selectedSize, selectedType, minRating, sortBy])

    // Các hàm xử lý cũng được giữ ở component cha
    const toggleFavorite = (companyId: string) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(companyId)) {
            newFavorites.delete(companyId)
        } else {
            newFavorites.add(companyId)
        }
        setFavorites(newFavorites)
    }

    const clearFilters = () => {
        setSelectedField("Tất cả")
        setSelectedLocation("Tất cả")
        setSelectedSize("Tất cả")
        setSelectedType("Tất cả")
        setMinRating(0)
        setSearchTerm("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
                        Tìm Kiếm Công Ty IT
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                        Khám phá những công ty công nghệ hàng đầu và tìm kiếm cơ hội nghề nghiệp phù hợp với bạn
                    </p>
                </div>

                <CompanyFilterBar
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
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    clearFilters={clearFilters}
                />

                <div className="flex items-center justify-between mb-6">
                    <p className="text-neutral-600 font-medium">
                        Tìm thấy <span className="font-bold text-primary-600">{filteredCompanies.length}</span> công ty IT
                    </p>
                </div>

                {filteredCompanies.length > 0 ? (
                    <CompanyList
                        companies={filteredCompanies}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                    />
                ) : (
                    <EmptyState onClearFilters={clearFilters} />
                )}

                {/* Load More Button */}
                {filteredCompanies.length > 0 && (
                    <div className="text-center mt-12 animate-fade-in">
                        <button className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-8 py-4 rounded-2xl hover:from-secondary-700 hover:to-secondary-800 font-semibold text-lg transition-all duration-300 shadow-glow-green hover:shadow-glow-lg transform hover:scale-105">
                            Xem thêm công ty IT
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}