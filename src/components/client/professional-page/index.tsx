"use client";

import { useState, useMemo, useEffect } from "react";
import ProfessionalFilterBar from "./ProfessionalFilterBar";
import ProfessionalList from "./ProfessionalList";
import EmptyState from "./EmptyState";
import { talentService, type TalentDetailedModel } from "../../../services/Talent";
import { skillService } from "../../../services/Skill";
import { locationService } from "../../../services/location";
import { jobRoleLevelService } from "../../../services/JobRoleLevel";
import { jobRoleService } from "../../../services/JobRole";
import type { Professional } from "./types";

// Helper functions for filter
const formatWorkingModeForFilter = (workingMode: string): string => {
    const modeMap: Record<string, string> = {
        'Onsite': 'Tại văn phòng',
        'Remote': 'Từ xa',
        'Hybrid': 'Kết hợp',
        'Flexible': 'Linh hoạt',
        '0': 'Tại văn phòng',
        '1': 'Từ xa',
        '2': 'Kết hợp',
        '3': 'Linh hoạt',
    };
    return modeMap[workingMode] || workingMode;
};

const formatStatusForFilter = (status: string): string => {
    const statusMap: Record<string, string> = {
        'Working': 'Đang làm việc',
        'Available': 'Sẵn sàng',
        'Busy': 'Bận',
        'Unavailable': 'Không rảnh',
    };
    return statusMap[status] || status;
};

export default function ProfessionalClientPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("Tất cả");
    const [selectedWorkingMode, setSelectedWorkingMode] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedExperience, setSelectedExperience] = useState("Tất cả");
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [selectedForContact, setSelectedForContact] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState("projects");

    // Load favorites từ localStorage khi component mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('professional_favorites');
            if (savedFavorites) {
                const favoritesArray = JSON.parse(savedFavorites);
                setFavorites(new Set(favoritesArray));
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải favorites từ localStorage:", error);
        }
    }, []);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // Fetch talents with detailed data
                const talentsData = await talentService.getAllDetailed({ excludeDeleted: true });
                
                // Fetch lookup data
                const [skillsData, locationsData, jobRoleLevelsData, jobRolesData] = await Promise.all([
                    skillService.getAll({ excludeDeleted: true }),
                    locationService.getAll({ excludeDeleted: true }),
                    jobRoleLevelService.getAll({ excludeDeleted: true }),
                    jobRoleService.getAll({ excludeDeleted: true })
                ]);

                // Create lookup maps
                const skillsMap = new Map();
                (skillsData || []).forEach((skill: any) => {
                    skillsMap.set(skill.id, skill);
                });

                const locationsMap = new Map();
                const uniqueLocations = new Set<string>();
                (locationsData || []).forEach((location: any) => {
                    locationsMap.set(location.id, location);
                    if (location.name) {
                        uniqueLocations.add(location.name);
                    }
                });
                setLocations(["Tất cả", ...Array.from(uniqueLocations).sort()]);

                const jobRoleLevelsMap = new Map();
                (jobRoleLevelsData || []).forEach((jrl: any) => {
                    jobRoleLevelsMap.set(jrl.id, jrl);
                });

                const jobRolesMap = new Map();
                (jobRolesData || []).forEach((jr: any) => {
                    jobRolesMap.set(jr.id, jr);
                });

                // Map TalentDetailedModel to Professional
                const mappedProfessionals: Professional[] = (talentsData || []).map((talent: TalentDetailedModel) => {
                    // Get location name
                    const locationName = talent.locationName || 
                        (talent.locationId ? locationsMap.get(talent.locationId)?.name : null) || 
                        "—";

                    // Get position from jobRoleLevels (first active one)
                    const activeJobRoleLevel = talent.jobRoleLevels?.[0];
                    let position = "—";
                    if (activeJobRoleLevel) {
                        const jrl = jobRoleLevelsMap.get(activeJobRoleLevel.jobRoleLevelId);
                        const jr = jrl ? jobRolesMap.get(jrl.jobRoleId) : null;
                        position = jr ? `${jr.name} - ${jrl.name}` : (jrl?.name || "—");
                    }

                    // Map skills
                    const mappedSkills = (talent.skills || []).map((skill: any) => {
                        const skillInfo = skillsMap.get(skill.skillId);
                        // Map level from number/string to Vietnamese
                        let level: 'Cơ bản' | 'Khá' | 'Giỏi' | 'Chuyên gia' = 'Cơ bản';
                        if (skill.level) {
                            const levelStr = String(skill.level).toLowerCase();
                            if (levelStr.includes('expert') || levelStr.includes('senior') || levelStr.includes('chuyên gia')) {
                                level = 'Chuyên gia';
                            } else if (levelStr.includes('advanced') || levelStr.includes('giỏi')) {
                                level = 'Giỏi';
                            } else if (levelStr.includes('intermediate') || levelStr.includes('khá')) {
                                level = 'Khá';
                            } else {
                                level = 'Cơ bản';
                            }
                        }
                        return {
                            name: skillInfo?.name || `Skill #${skill.skillId}`,
                            level,
                            yearsExp: skill.yearsExp || 0
                        };
                    });

                    // Calculate total projects from workExperiences
                    const totalProjects = talent.projects?.length || 0;
                    const totalWorkExperiences = talent.workExperiences?.length || 0;

                    // Determine availability based on status
                    let availability: 'available' | 'busy' | 'unavailable' = 'available';
                    if (talent.status) {
                        const statusLower = talent.status.toLowerCase();
                        if (statusLower.includes('working') || statusLower.includes('available')) {
                            availability = 'available';
                        } else if (statusLower.includes('busy')) {
                            availability = 'busy';
                        } else {
                            availability = 'unavailable';
                        }
                    }

                    // Get avatar (profilePictureUrl or default)
                    const avatar = talent.profilePictureUrl || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.fullName)}&background=6366f1&color=fff&size=150`;

                    return {
                        id: String(talent.id),
                        name: talent.fullName,
                        title: position,
                        avatar,
                        location: locationName,
                        workingMode: talent.workingMode || undefined,
                        status: talent.status || undefined,
                        bio: talent.bio || undefined,
                        phoneNumber: talent.phoneNumber || undefined,
                        hourlyRate: 0, // Not available in talent data
                        rating: 4.5, // Default rating
                        reviewCount: 0, // Not available
                        skills: mappedSkills,
                        availability,
                        completedProjects: totalProjects,
                        workExperiences: totalWorkExperiences,
                        description: talent.bio || "",
                        isOnline: false, // Not available
                        experience: activeJobRoleLevel?.yearsOfExp || 0,
                        category: "IT", // Default category
                        languages: [],
                        certifications: [],
                        responseTime: "< 24 giờ",
                        successRate: 95
                    };
                });

                setProfessionals(mappedProfessionals);
            } catch (err: any) {
                console.error("❌ Lỗi tải dữ liệu professionals:", err);
                setError(err.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProfessionals = useMemo(() => {
        const filtered = professionals.filter((professional) => {
            // Filter: Chỉ hiển thị favorites nếu showOnlyFavorites = true
            if (showOnlyFavorites && !favorites.has(professional.id)) {
                return false;
            }

            const matchesSearch =
                professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professional.skills.some((skill) =>
                    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesLocation =
                selectedLocation === "Tất cả" ||
                professional.location === selectedLocation;

            const matchesWorkingMode =
                selectedWorkingMode === "Tất cả" ||
                !professional.workingMode ||
                formatWorkingModeForFilter(professional.workingMode) === selectedWorkingMode;

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                !professional.status ||
                formatStatusForFilter(professional.status) === selectedStatus;

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

            return (
                matchesSearch &&
                matchesLocation &&
                matchesWorkingMode &&
                matchesStatus &&
                matchesExperience
            );
        });

        // Sort professionals - Favorites luôn lên đầu, sau đó sort theo sortBy
        filtered.sort((a, b) => {
            const aIsFavorite = favorites.has(a.id);
            const bIsFavorite = favorites.has(b.id);
            
            // Favorites luôn lên đầu
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            
            // Nếu cả hai cùng favorite hoặc cùng không favorite, sort theo sortBy
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name, 'vi');
                case "experience":
                    return b.experience - a.experience;
                case "projects":
                    return (b.completedProjects || b.workExperiences || 0) - (a.completedProjects || a.workExperiences || 0);
                case "skills":
                    return b.skills.length - a.skills.length;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [
        searchTerm,
        selectedLocation,
        selectedWorkingMode,
        selectedStatus,
        selectedExperience,
        sortBy,
        professionals,
        favorites,
        showOnlyFavorites,
    ]);

    // Các hàm xử lý sự kiện
    const toggleFavorite = (professionalId: string) => {
        const newFavorites = new Set(favorites);
        const professional = professionals.find(p => p.id === professionalId);
        const talentCode = professionalId ? `TAL-${String(professionalId).padStart(3, '0')}` : '';
        
        if (newFavorites.has(professionalId)) {
            // Xóa khỏi favorites
            newFavorites.delete(professionalId);
            // Hiển thị thông báo
            if (professional) {
                console.log(`Đã xóa ${professional.name} (${talentCode}) khỏi danh sách yêu thích`);
            }
        } else {
            // Thêm vào favorites
            newFavorites.add(professionalId);
            // Hiển thị thông báo
            if (professional) {
                console.log(`Đã thêm ${professional.name} (${talentCode}) vào danh sách yêu thích`);
            }
        }
        
        setFavorites(newFavorites);
        
        // Lưu vào localStorage
        try {
            const favoritesArray = Array.from(newFavorites);
            localStorage.setItem('professional_favorites', JSON.stringify(favoritesArray));
        } catch (error) {
            console.error("❌ Lỗi khi lưu favorites vào localStorage:", error);
        }
    };

    const clearFilters = () => {
        setSelectedLocation("Tất cả");
        setSelectedWorkingMode("Tất cả");
        setSelectedStatus("Tất cả");
        setSelectedExperience("Tất cả");
        setSearchTerm("");
        setShowOnlyFavorites(false);
        setSelectedForContact(new Set());
    };

    // Toggle chọn nhân sự để liên hệ
    const toggleSelectForContact = (id: string) => {
        setSelectedForContact(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Chọn tất cả / Bỏ chọn tất cả
    const toggleSelectAll = () => {
        if (showOnlyFavorites) {
            // Khi showOnlyFavorites = true, filteredProfessionals đã chỉ chứa favorites
            const favoriteIds = filteredProfessionals.map(p => p.id);
            
            if (selectedForContact.size === favoriteIds.length && favoriteIds.length > 0) {
                setSelectedForContact(new Set());
            } else {
                setSelectedForContact(new Set(favoriteIds));
            }
        }
    };

    // Điều hướng đến trang contact với danh sách nhân sự đã chọn
    const handleBulkContact = () => {
        if (selectedForContact.size === 0) {
            alert("Vui lòng chọn ít nhất một nhân sự để liên hệ!");
            return;
        }

        const selectedProfessionals = professionals.filter(p => selectedForContact.has(p.id));
        const formatTalentCode = (id: string): string => {
            const numId = parseInt(id);
            if (isNaN(numId)) return `TAL-${id}`;
            return `TAL-${String(numId).padStart(3, '0')}`;
        };

        const talentIds = selectedProfessionals.map(p => p.id).join(',');
        const talentCodes = selectedProfessionals.map(p => formatTalentCode(p.id)).join(',');
        
        // Điều hướng đến trang contact với query params
        window.location.href = `/contact?talentIds=${talentIds}&talentCodes=${encodeURIComponent(talentCodes)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-5xl font-bold leading-normal bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
                        Tìm Nhân Sự IT
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                        Khám phá các lập trình viên tài năng sẵn sàng tham gia dự án của bạn
                    </p>
                </div>

                <ProfessionalFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedWorkingMode={selectedWorkingMode}
                    setSelectedWorkingMode={setSelectedWorkingMode}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedExperience={selectedExperience}
                    setSelectedExperience={setSelectedExperience}
                    locations={locations}
                    clearFilters={clearFilters}
                />

                {/* Results Count & Favorites Info */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-6 flex-wrap">
                        <p className="text-neutral-600 font-medium">
                            Tìm thấy{" "}
                            <span className="font-bold text-primary-600">
                                {filteredProfessionals.length}
                            </span>{" "}
                            chuyên gia IT
                        </p>
                        {favorites.size > 0 && (
                            <p className="text-neutral-600 font-medium">
                                Đã lưu{" "}
                                <span className="font-bold text-red-500">
                                    {favorites.size}
                                </span>{" "}
                                yêu thích
                            </p>
                        )}
                    </div>
                    {favorites.size > 0 && (
                        <button
                            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105 ${
                                showOnlyFavorites
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill={showOnlyFavorites ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {showOnlyFavorites ? 'Hiển thị tất cả' : `Chỉ hiển thị yêu thích (${favorites.size})`}
                        </button>
                    )}
                </div>

                {/* Bulk Contact Actions - Chỉ hiển thị khi đang xem favorites */}
                {showOnlyFavorites && favorites.size > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-200 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={toggleSelectAll}
                                className="px-4 py-2 bg-white border-2 border-primary-300 text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-all duration-300 shadow-soft hover:shadow-medium"
                            >
                                {selectedForContact.size === filteredProfessionals.length && filteredProfessionals.length > 0
                                    ? 'Bỏ chọn tất cả' 
                                    : 'Chọn tất cả'}
                            </button>
                            {selectedForContact.size > 0 && (
                                <p className="text-neutral-700 font-medium">
                                    Đã chọn <span className="font-bold text-primary-600">{selectedForContact.size}</span> nhân sự
                                </p>
                            )}
                        </div>
                        {selectedForContact.size > 0 && (
                            <button
                                onClick={handleBulkContact}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Liên hệ ({selectedForContact.size})
                            </button>
                        )}
                    </div>
                )}

                {filteredProfessionals.length > 0 ? (
                    <ProfessionalList
                        professionals={filteredProfessionals}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        showOnlyFavorites={showOnlyFavorites}
                        selectedForContact={selectedForContact}
                        onToggleSelectForContact={toggleSelectForContact}
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
