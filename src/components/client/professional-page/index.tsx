"use client";

import { useState, useMemo } from "react";
import ProfessionalFilterBar from "./ProfessionalFilterBar";
import ProfessionalList from "./ProfessionalList";
import EmptyState from "./EmptyState";
import { mockProfessionals } from "./data";

export default function ProfessionalClientPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [selectedLocation, setSelectedLocation] = useState("Tất cả");
    const [selectedExperience, setSelectedExperience] = useState("Tất cả");
    const [minRate, setMinRate] = useState("");
    const [maxRate, setMaxRate] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState("rating");
    const [selectedAvailability, setSelectedAvailability] = useState("Tất cả"); // Thêm state này

    const filteredProfessionals = useMemo(() => {
        const filtered = mockProfessionals.filter((professional) => {
            const matchesSearch =
                professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professional.skills.some((skill) =>
                    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesCategory =
                selectedCategory === "Tất cả" ||
                professional.category === selectedCategory;
            const matchesLocation =
                selectedLocation === "Tất cả" ||
                professional.location === selectedLocation;
            const matchesAvailability =
                selectedAvailability === "Tất cả" ||
                professional.availability === selectedAvailability;

            const matchesExperience =
                selectedExperience === "Tất cả" ||
                (selectedExperience === "1-3 năm" &&
                    professional.experience >= 1 &&
                    professional.experience <= 3) ||
                (selectedExperience === "3-5 năm" &&
                    professional.experience >= 3 &&
                    professional.experience <= 5) ||
                (selectedExperience === "5-8 năm" &&
                    professional.experience >= 5 &&
                    professional.experience <= 8) ||
                (selectedExperience === "8+ năm" && professional.experience >= 8);

            const matchesRate =
                (!minRate || professional.hourlyRate >= parseInt(minRate) * 1000) &&
                (!maxRate || professional.hourlyRate <= parseInt(maxRate) * 1000);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLocation &&
                matchesAvailability &&
                matchesExperience &&
                matchesRate
            );
        });

        // Sort professionals
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "rate":
                    return a.hourlyRate - b.hourlyRate;
                case "experience":
                    return b.experience - a.experience;
                case "projects":
                    return b.completedProjects - a.completedProjects;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [
        searchTerm,
        selectedCategory,
        selectedLocation,
        selectedAvailability,
        selectedExperience,
        minRate,
        maxRate,
        sortBy,
    ]);

    // Các hàm xử lý sự kiện
    const toggleFavorite = (professionalId: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(professionalId)) {
            newFavorites.delete(professionalId);
        } else {
            newFavorites.add(professionalId);
        }
        setFavorites(newFavorites);
    };

    const clearFilters = () => {
        setSelectedCategory("Tất cả");
        setSelectedLocation("Tất cả");
        setSelectedAvailability("Tất cả");
        setSelectedExperience("Tất cả");
        setMinRate("");
        setMaxRate("");
        setSearchTerm("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
                        Tìm Chuyên Gia IT
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                        Khám phá hàng nghìn chuyên gia IT tài năng sẵn sàng tham gia dự án của bạn
                    </p>
                </div>

                <ProfessionalFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedExperience={selectedExperience}
                    setSelectedExperience={setSelectedExperience}
                    minRate={minRate}
                    setMinRate={setMinRate}
                    maxRate={maxRate}
                    setMaxRate={setMaxRate}
                    clearFilters={clearFilters}
                />

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-neutral-600 font-medium">
                        Tìm thấy{" "}
                        <span className="font-bold text-primary-600">
                            {filteredProfessionals.length}
                        </span>{" "}
                        chuyên gia IT
                    </p>
                </div>

                {filteredProfessionals.length > 0 ? (
                    <ProfessionalList
                        professionals={filteredProfessionals}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                    />
                ) : (
                    <EmptyState onClearFilters={clearFilters} />
                )}

                {/* Load More Button */}
                {filteredProfessionals.length > 0 && (
                    <div className="text-center mt-12 animate-fade-in">
                        <button className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-8 py-4 rounded-2xl hover:from-secondary-700 hover:to-secondary-800 font-semibold text-lg transition-all duration-300 shadow-glow-green hover:shadow-glow-lg transform hover:scale-105">
                            Xem thêm chuyên gia IT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
