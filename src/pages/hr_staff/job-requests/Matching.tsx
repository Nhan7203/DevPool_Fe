import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCVService, type TalentCVMatchResult, type TalentCV } from "../../../services/TalentCV";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentService, type Talent } from "../../../services/Talent";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { locationService, type Location } from "../../../services/location";
import { talentSkillService, type TalentSkill } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { skillGroupService } from "../../../services/SkillGroup";
import { talentSkillGroupAssessmentService } from "../../../services/TalentSkillGroupAssessment";
import { applyService } from "../../../services/Apply";
import { talentApplicationService, TalentApplicationStatusConstants, type TalentApplication } from "../../../services/TalentApplication";
import { decodeJWT } from "../../../services/Auth";
import { useAuth } from "../../../contexts/AuthContext";
import {
    ArrowLeft,
    Sparkles,
    Target,
    CheckCircle2,
    Users,
    TrendingUp,
    Award,
    Eye,
    FileText,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Code,
    Clock,
    Filter,
    X,
    SlidersHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { WorkingMode } from "../../../types/WorkingMode";

interface EnrichedMatchResult extends TalentCVMatchResult {
    talentInfo?: Talent;
}

interface EnrichedCVWithoutScore {
    talentCV: TalentCV;
    talentInfo?: Talent;
    matchScore?: number; // undefined nếu không có điểm số
    matchedSkills?: string[];
    missingSkills?: string[];
    levelMatch?: boolean;
}

const WORKING_MODE_OPTIONS = [
    { value: WorkingMode.Onsite, label: "Làm việc tại văn phòng" },
    { value: WorkingMode.Remote, label: "Làm việc từ xa" },
    { value: WorkingMode.Hybrid, label: "Hybrid (kết hợp tại văn phòng và từ xa)" },
    { value: WorkingMode.Flexible, label: "Linh hoạt theo thỏa thuận" },
];

const formatWorkingMode = (mode?: number) => {
    if (!mode || mode === WorkingMode.None) return "";
    const labels = WORKING_MODE_OPTIONS
        .filter((option) => (mode & option.value) !== 0)
        .map((option) => option.label);
    return labels.join(", ");
};

const formatLevel = (level?: number) => {
    const levelMap: Record<number, string> = {
        0: "Junior",
        1: "Middle",
        2: "Senior",
        3: "Lead"
    };
    return level !== undefined ? levelMap[level] || "N/A" : "N/A";
};

// Hàm tính điểm matching chi tiết cho CV không có trong kết quả backend
const calculateMatchScore = async (
    cv: TalentCV,
    talent: Talent,
    jobReq: JobRequest,
    jobRoleLevel: JobRoleLevel | null
): Promise<EnrichedMatchResult> => {
    // Lấy skills của talent
    const talentSkills = await talentSkillService.getAll({
        talentId: talent.id,
        excludeDeleted: true,
    }) as TalentSkill[];
    
    // Lấy tất cả skills để map skillId -> skillName
    const allSkills = await skillService.getAll({ excludeDeleted: true }) as Skill[];
    const skillMap = new Map<number, string>();
    allSkills.forEach(skill => {
        skillMap.set(skill.id, skill.name);
    });
    
    // Lấy danh sách skill names của talent
    const talentSkillNames = talentSkills.map(ts => skillMap.get(ts.skillId) || "").filter(Boolean);
    
    // Lấy danh sách skill names yêu cầu từ job request
    // jobReq.jobSkills có cấu trúc {id, jobRequestId, skillsId} - cần map skillsId -> skillName
    const requiredSkillNames = jobReq.jobSkills?.map(js => {
        // Nếu có skillName thì dùng, nếu không thì map từ skillsId
        if ((js as any).skillName) {
            return (js as any).skillName;
        } else if ((js as any).skillsId) {
            return skillMap.get((js as any).skillsId) || "";
        }
        return "";
    }).filter(Boolean) || [];
    
    // So sánh skills
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    requiredSkillNames.forEach(skillName => {
        if (talentSkillNames.includes(skillName)) {
            matchedSkills.push(skillName);
        } else {
            missingSkills.push(skillName);
        }
    });
    
    // Tính điểm skills (50 điểm tối đa)
    const totalRequiredSkills = requiredSkillNames.length;
    const skillPoints = totalRequiredSkills > 0
        ? Math.round((50.0 / totalRequiredSkills) * matchedSkills.length)
        : 50;
    
    // Tính điểm working mode (10 điểm tối đa)
    const jobWorkingMode = jobReq.workingMode ?? WorkingMode.None;
    const talentWorkingMode = talent.workingMode ?? WorkingMode.None;
    const workingModeRequired = jobWorkingMode !== WorkingMode.None;
    const workingModeMatch = workingModeRequired
        ? (talentWorkingMode !== WorkingMode.None && (talentWorkingMode & jobWorkingMode) !== 0)
        : true;
    const workingModePoints = workingModeRequired
        ? (workingModeMatch ? 10 : 0)
        : 10;
    
    // Tính điểm location (15 điểm tối đa)
    const locationRequired = !!jobReq.locationId;
    const talentLocationId = talent.locationId ?? null;
    const isRemoteOrFlexible = workingModeRequired && (jobWorkingMode & (WorkingMode.Remote | WorkingMode.Hybrid)) !== 0;
    const locationMatch = locationRequired ? talentLocationId === jobReq.locationId : true;
    const locationPoints = isRemoteOrFlexible
        ? 15 // Remote/Flexible thì cho đủ điểm
        : locationRequired
            ? (locationMatch ? 15 : 0)
            : 15; // Nếu không yêu cầu thì cho đủ điểm
    
    // Tính điểm level (20 điểm tối đa)
    // Kiểm tra xem CV có cùng jobRoleLevelId với job request không
    const levelMatch = cv.jobRoleLevelId === jobRoleLevel?.id;
    const levelPoints = levelMatch ? 20 : 0;
    
    // Tính điểm availability bonus (+5 điểm nếu status === "Available")
    const availabilityBonus = talent.status === "Available" ? 5 : 0;
    
    // Tổng điểm
    const totalScore = skillPoints + workingModePoints + locationPoints + levelPoints + availabilityBonus;
    
    return {
        talentCV: cv,
        matchScore: totalScore,
        matchedSkills: matchedSkills,
        missingSkills: missingSkills,
        levelMatch: levelMatch,
        matchSummary: `Skills: ${matchedSkills.length}/${totalRequiredSkills}, WorkingMode: ${workingModeMatch ? "Match" : "No match"}, Location: ${locationMatch ? "Match" : "No match"}, Level: ${levelMatch ? "Match" : "No match"}${availabilityBonus > 0 ? ", Available bonus: +5" : ""}`,
    };
};

export default function CVMatchingPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const jobRequestId = searchParams.get("jobRequestId");

    const [allCVs, setAllCVs] = useState<(EnrichedMatchResult | EnrichedCVWithoutScore)[]>([]);
    const [filteredCVs, setFilteredCVs] = useState<(EnrichedMatchResult | EnrichedCVWithoutScore)[]>([]);
    const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
    const [jobRoleLevel, setJobRoleLevel] = useState<JobRoleLevel | null>(null);
    const [jobLocation, setJobLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter states
    const [minScore, setMinScore] = useState(0);
    const [showMissingSkillsOnly, setShowMissingSkillsOnly] = useState(false);
    const [hideLowScore, setHideLowScore] = useState(false);
    
    // Search and pagination states
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const currentMatchingPath = `${location.pathname}${location.search}`;

    useEffect(() => {
        const fetchData = async () => {
            if (!jobRequestId) {
                navigate("/ta/job-requests");
                return;
            }

            try {
                setLoading(true);
                
                // Fetch job request details
                const jobReq = await jobRequestService.getById(Number(jobRequestId));
                console.log("✅ Job Request loaded:", jobReq);
                console.log("📋 Job Skills:", jobReq.jobSkills);
                console.log("📋 Job Skills count:", jobReq.jobSkills?.length || 0);
                setJobRequest(jobReq);

                // Fetch job role level to get level information
                let level: JobRoleLevel | null = null;
                try {
                    level = await jobRoleLevelService.getById(jobReq.jobRoleLevelId);
                    setJobRoleLevel(level);
                } catch (err) {
                    console.warn("⚠️ Không thể tải thông tin JobRoleLevel:", err);
                    throw new Error("Không thể tải thông tin JobRoleLevel");
                }

                // Fetch job location if exists
                if (jobReq.locationId) {
                    try {
                        const location = await locationService.getById(jobReq.locationId);
                        setJobLocation(location);
                    } catch (err) {
                        console.warn("⚠️ Không thể tải thông tin Location:", err);
                    }
                }

                // Lấy danh sách đơn ứng tuyển đã tồn tại cho job request này để loại bỏ các CV đã nộp
                const existingApplications = await talentApplicationService.getAll({
                    jobRequestId: Number(jobRequestId),
                    excludeDeleted: true,
                }) as TalentApplication[];
                const excludedStatuses = new Set<string>([
                    TalentApplicationStatusConstants.Hired,
                ]);
                const excludedCvIds = new Set(
                    existingApplications
                        .filter((app) => excludedStatuses.has(app.status))
                        .map((app) => app.cvId)
                );

                // Fetch toàn bộ CV trong hệ thống (không filter theo jobRoleId)
                console.log("🔍 Fetching all CVs in system...");
                const allCVsData = await talentCVService.getAll({
                    isActive: true,
                    excludeDeleted: true,
                }) as TalentCV[];
                console.log("✅ All CVs received:", allCVsData.length);

                // Lọc bỏ CV đã ứng tuyển ở trạng thái Hired
                const availableCVs = allCVsData.filter(cv => !excludedCvIds.has(cv.id));
                console.log("📊 CVs available (after excluding Hired):", availableCVs.length);

                // Fetch matching CVs (có điểm số từ backend)
                console.log("🔍 Fetching matching CVs for Job Request ID:", jobRequestId);
                const matches = await talentCVService.getMatchesForJobRequest({
                    jobRequestId: Number(jobRequestId),
                    excludeDeleted: true,
                });
                console.log("✅ Matching CVs received:", matches);
                console.log("📊 Total matches found:", matches?.length || 0);

                // Tạo map của CV có điểm số để dễ dàng tra cứu
                const matchMap = new Map<number, TalentCVMatchResult>();
                matches.forEach((match: TalentCVMatchResult) => {
                    if (!excludedCvIds.has(match.talentCV.id)) {
                        matchMap.set(match.talentCV.id, match);
                    }
                });
                console.log("📉 Số CV có điểm số sau khi loại trừ đã ứng tuyển:", matchMap.size);

                // Fetch skillMap một lần để dùng cho tất cả CV
                const allSkills = await skillService.getAll({ excludeDeleted: true }) as Skill[];
                const skillMap = new Map<number, string>();
                allSkills.forEach(skill => {
                    skillMap.set(skill.id, skill.name);
                });

                // Enrich tất cả CV với talent information và tính điểm
                const enrichedCVs = await Promise.all(
                    availableCVs.map(async (cv: TalentCV): Promise<EnrichedMatchResult | EnrichedCVWithoutScore | null> => {
                        try {
                            const talent = await talentService.getById(cv.talentId);
                            
                            // Lọc bỏ talent có trạng thái "Applying" hoặc "Working"
                            if (talent.status === "Applying" || talent.status === "Working") {
                                return null; // Trả về null để filter sau
                            }
                            
                            // ✅ Kiểm tra verification status: Talent có skills thuộc group chưa verify thì không được matching
                            try {
                                // Lấy skills của talent
                                const talentSkills = await talentSkillService.getAll({
                                    talentId: talent.id,
                                    excludeDeleted: true,
                                }) as TalentSkill[];
                                
                                // Lấy tất cả skills để map skillId -> skillGroupId
                                const allSkills = await skillService.getAll({ excludeDeleted: true }) as Skill[];
                                const skillGroupMap = new Map<number, number | undefined>();
                                allSkills.forEach(skill => {
                                    skillGroupMap.set(skill.id, skill.skillGroupId);
                                });
                                
                                // Lấy danh sách skill group IDs của talent
                                const distinctSkillGroupIds = Array.from(
                                    new Set(
                                        talentSkills
                                            .map(ts => skillGroupMap.get(ts.skillId))
                                            .filter((gid): gid is number => typeof gid === "number")
                                    )
                                );
                                
                                if (distinctSkillGroupIds.length > 0) {
                                    const statuses = await talentSkillGroupAssessmentService.getVerificationStatuses(
                                        talent.id,
                                        distinctSkillGroupIds
                                    );
                                    
                                    // Kiểm tra xem có skill group nào chưa verify không
                                    const hasUnverifiedGroup = statuses.some(status => 
                                        !status.isVerified || status.needsReverification
                                    );
                                    
                                    if (hasUnverifiedGroup) {
                                        console.log(`⚠️ CV ${cv.id} - Talent ${talent.id} có skill group chưa verify, loại bỏ khỏi matching.`);
                                        return null; // Loại bỏ CV này khỏi matching
                                    }
                                }
                            } catch (verificationError) {
                                console.warn("⚠️ Không thể kiểm tra verification status cho talent:", talent.id, verificationError);
                                // Nếu lỗi khi check verification, vẫn cho phép matching (không block)
                            }
                            
                            let talentLocationName: string | null = null;
                            if (talent.locationId) {
                                try {
                                    const loc = await locationService.getById(talent.locationId);
                                    talentLocationName = loc.name;
                                } catch (err) {
                                    console.warn("⚠️ Failed to load location for talent:", err);
                                }
                            }
                            
                            const talentInfo = { ...talent, locationName: talentLocationName } as Talent & { locationName?: string | null };
                            
                            // Kiểm tra xem CV này có trong kết quả matching không
                            const match = matchMap.get(cv.id);
                            
                            if (match) {
                                // CV có điểm số từ backend
                                // Tính toán lại missingSkills từ jobReq.jobSkills và matchedSkills
                                const matchedSkills = match.matchedSkills || [];
                                let missingSkills: string[] = [];
                                
                                // Luôn tính toán lại missingSkills từ jobReq.jobSkills để đảm bảo đầy đủ
                                if (jobReq.jobSkills && jobReq.jobSkills.length > 0) {
                                    // jobReq.jobSkills có cấu trúc {id, jobRequestId, skillsId}
                                    // skillMap đã được fetch trước vòng lặp
                                    const requiredSkillNames = jobReq.jobSkills.map((js: any) => {
                                        if (js.skillName) {
                                            return js.skillName;
                                        } else if (js.skillsId) {
                                            return skillMap.get(js.skillsId) || "";
                                        }
                                        return "";
                                    }).filter(Boolean);
                                    
                                    // So sánh case-insensitive để đảm bảo chính xác
                                    const matchedSkillsLower = matchedSkills.map(s => s.toLowerCase().trim());
                                    missingSkills = requiredSkillNames.filter((skillName: string) => {
                                        const skillNameLower = skillName.toLowerCase().trim();
                                        return !matchedSkillsLower.includes(skillNameLower);
                                    });
                                    
                                    console.log(`🔍 CV ${cv.id} - Tính toán missingSkills:`, {
                                        requiredSkills: requiredSkillNames,
                                        matchedSkills: matchedSkills,
                                        missingSkills: missingSkills,
                                        count: missingSkills.length
                                    });
                                } else {
                                    // Nếu không có jobSkills, dùng missingSkills từ backend (nếu có)
                                    missingSkills = match.missingSkills || [];
                                    console.log(`⚠️ CV ${cv.id} - Không có jobSkills, dùng missingSkills từ backend:`, missingSkills);
                                }
                                
                                return {
                                    ...match,
                                    talentInfo: talentInfo,
                                    matchedSkills: matchedSkills,
                                    missingSkills: missingSkills,
                                };
                            } else {
                                // CV không có điểm số - tính điểm chi tiết
                                try {
                                    const calculatedMatch = await calculateMatchScore(
                                        cv,
                                        talent,
                                        jobReq,
                                        level
                                    );
                                    
                                    console.log(`🔍 CV ${cv.id} - calculateMatchScore result:`, {
                                        matchedSkills: calculatedMatch.matchedSkills,
                                        missingSkills: calculatedMatch.missingSkills,
                                        missingCount: calculatedMatch.missingSkills?.length || 0
                                    });
                                    
                                    return {
                                        ...calculatedMatch,
                                        talentInfo: talentInfo,
                                    };
                                } catch (calcErr) {
                                    console.warn("⚠️ Failed to calculate match score for CV:", cv.id, calcErr);
                                    // Nếu không tính được, vẫn tạo với điểm 0
                                    return {
                                        talentCV: cv,
                                        talentInfo: talentInfo,
                                        matchScore: 0,
                                        matchedSkills: [],
                                        missingSkills: jobReq.jobSkills?.map((skill: { skillName: string }) => skill.skillName) || [],
                                        levelMatch: false,
                                        matchSummary: "Không thể tính điểm matching",
                                    };
                                }
                            }
                        } catch (err) {
                            console.warn("⚠️ Failed to load talent info for ID:", cv.talentId, err);
                            // Nếu không load được talent info, không thể kiểm tra trạng thái nên loại bỏ
                            return null;
                        }
                    })
                );

                // Lọc bỏ các CV null (talent có trạng thái không phù hợp)
                const filteredEnrichedCVs = enrichedCVs.filter((cv): cv is EnrichedMatchResult | EnrichedCVWithoutScore => cv !== null);
                
                // Sắp xếp theo điểm từ cao xuống thấp
                const sortedCVs = filteredEnrichedCVs.sort((a, b) => {
                    const scoreA = a.matchScore ?? 0;
                    const scoreB = b.matchScore ?? 0;
                    return scoreB - scoreA;
                });

                console.log("✅ Final enriched CVs:", sortedCVs.length);
                console.log("📊 CVs with score > 0:", sortedCVs.filter(cv => (cv.matchScore ?? 0) > 0).length);
                console.log("📊 CVs with score = 0:", sortedCVs.filter(cv => (cv.matchScore ?? 0) === 0).length);
                
                setAllCVs(sortedCVs);
                setFilteredCVs(sortedCVs);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách CV matching:", err);
                alert(`❌ Lỗi: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobRequestId, navigate]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-100 border-green-200";
        if (score >= 60) return "text-blue-600 bg-blue-100 border-blue-200";
        if (score >= 40) return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Xuất sắc";
        if (score >= 60) return "Tốt";
        if (score >= 40) return "Trung bình";
        return "Thấp";
    };

    // Apply filters, search and pagination
    useEffect(() => {
        let filtered = [...allCVs];
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(cv => {
                const talentName = cv.talentInfo?.fullName?.toLowerCase() || "";
                const email = cv.talentInfo?.email?.toLowerCase() || "";
                const phone = cv.talentInfo?.phone?.toLowerCase() || "";
                const cvVersion = `v${cv.talentCV.version}`.toLowerCase();
                
                return talentName.includes(query) || 
                       email.includes(query) || 
                       phone.includes(query) ||
                       cvVersion.includes(query);
            });
        }
        
        // Filter by min score (chỉ áp dụng cho CV có điểm số)
        filtered = filtered.filter(cv => {
            if (cv.matchScore === undefined) return true; // CV không có điểm số luôn pass
            return cv.matchScore >= minScore;
        });
        
        // Filter by hiding low score
        if (hideLowScore) {
            filtered = filtered.filter(cv => {
                if (cv.matchScore === undefined) return true; // CV không có điểm số luôn pass
                return cv.matchScore >= 60;
            });
        }
        
        // Filter by missing skills only (chỉ áp dụng cho CV có điểm số)
        if (showMissingSkillsOnly) {
            filtered = filtered.filter(cv => {
                if (cv.matchScore === undefined) return true; // CV không có điểm số luôn pass
                return cv.missingSkills?.length === 0;
            });
        }
        
        setFilteredCVs(filtered);
        setCurrentPage(1); // Reset về trang đầu khi filter thay đổi
    }, [searchQuery, minScore, showMissingSkillsOnly, hideLowScore, allCVs]);
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredCVs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCVs = filteredCVs.slice(startIndex, endIndex);

    const resetFilters = () => {
        setMinScore(0);
        setShowMissingSkillsOnly(false);
        setHideLowScore(false);
    };

    const handleCreateApplication = async (match: EnrichedMatchResult) => {
        if (!jobRequestId) return;

        const confirm = window.confirm(
            `⚠️ Bạn có chắc muốn tạo hồ sơ ứng tuyển cho ${match.talentInfo?.fullName || 'talent này'}?\n\n` +
            `Điểm khớp: ${match.matchScore}%\n` +
            `CV: v${match.talentCV.version}`
        );
        
        if (!confirm) return;

        try {
            // Lấy userId từ token hoặc user context
            let submittedBy: string | null = null;
            
            // Thử lấy từ user context trước
            if (user?.id) {
                submittedBy = user.id;
            } else {
                // Nếu không có, lấy từ token
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        const decoded = decodeJWT(token);
                        if (decoded) {
                            // JWT payload có nameid là userId
                            submittedBy = decoded.nameid || decoded.sub || decoded.userId || decoded.uid || null;
                        }
                    } catch (error) {
                        console.error('Error decoding JWT:', error);
                    }
                }
            }
            
            if (!submittedBy) {
                throw new Error('Không xác định được người dùng (submittedBy). Vui lòng đăng nhập lại.');
            }
            
            await applyService.create({
                jobRequestId: Number(jobRequestId),
                cvId: match.talentCV.id,
                submittedBy: submittedBy,
                note: `Điểm khớp: ${match.matchScore}%`,
            });

      // Cập nhật trạng thái nhân sự sang Applying
      try {
        await talentService.changeStatus(match.talentCV.talentId, {
          newStatus: "Applying",
          notes: "Tự động chuyển trạng thái khi tạo hồ sơ ứng tuyển",
        });
      } catch (statusErr) {
        console.error("⚠️ Không thể cập nhật trạng thái nhân sự sang Applying:", statusErr);
      }

            alert("✅ Đã tạo hồ sơ ứng tuyển thành công!");
            navigate(`/ta/applications`);
        } catch (err) {
            console.error("❌ Lỗi tạo hồ sơ ứng tuyển:", err);
            alert("Không thể tạo hồ sơ ứng tuyển!");
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="TA Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang phân tích và matching CV với AI...</p>
                    </div>
                </div>
            </div>
        );
    }

    const cvWithScores = filteredCVs.filter(cv => cv.matchScore !== undefined) as EnrichedMatchResult[];
    const avgScore = cvWithScores.length > 0
        ? Math.round(cvWithScores.reduce((sum, r) => sum + r.matchScore, 0) / cvWithScores.length)
        : 0;

    const excellentCount = cvWithScores.filter(r => r.matchScore >= 80).length;
    const totalMatched = filteredCVs.length;

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="TA Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            to={`/ta/job-requests/${jobRequestId}`}
                            className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-medium">Quay lại chi tiết yêu cầu</span>
                        </Link>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">AI CV Matching Results</h1>
                            </div>
                            <p className="text-neutral-600 mb-4">
                                {jobRequest?.title || "Đang tải..."}
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200">
                                <Target className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">
                                    {filteredCVs.length} CVs trong hệ thống (yêu cầu: {jobRequest?.quantity || 0} vị trí)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
                    <div className="p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm CV theo tên, email, số điện thoại hoặc phiên bản CV..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-300 text-gray-900 placeholder:text-neutral-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in overflow-hidden">
                    {/* Header */}
                    <div
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors duration-300"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-soft">
                                <SlidersHorizontal className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc kết quả</h2>
                                <p className="text-sm text-neutral-500">
                                    {showFilters ? "Nhấn để thu gọn" : "Nhấn để mở rộng & điều chỉnh tiêu chí"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {(minScore > 0 || hideLowScore || showMissingSkillsOnly) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetFilters();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-all duration-300"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Xóa bộ lọc</span>
                                </button>
                            )}
                            <div className={`p-2 rounded-full border border-neutral-200 transition-transform duration-300 ${showFilters ? "bg-primary-100 border-primary-200 rotate-180" : ""}`}>
                                <Filter className={`w-5 h-5 ${showFilters ? "text-primary-600" : "text-neutral-400"}`} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {showFilters && (
                        <div className="px-6 pb-6 border-t border-neutral-200 animate-fade-in">
                            <div className="pt-6 space-y-6">
                                {/* Min Score Slider */}
                                <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-5 rounded-xl border border-primary-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-primary-600" />
                                            <label className="text-sm font-semibold text-gray-900">
                                                Điểm khớp tối thiểu
                                            </label>
                                        </div>
                                        <div className="px-3 py-1.5 bg-white rounded-lg border border-primary-200 shadow-soft">
                                            <span className="text-lg font-bold text-primary-600">{minScore}%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={minScore}
                                        onChange={(e) => setMinScore(Number(e.target.value))}
                                        className="w-full h-3 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-600"
                                        style={{
                                            background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${minScore}%, rgb(229 231 235) ${minScore}%, rgb(229 231 235) 100%)`,
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-neutral-500 mt-2">
                                        <span>0%</span>
                                        <span>25%</span>
                                        <span>50%</span>
                                        <span>75%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="group flex items-center gap-3 p-4 bg-neutral-50 hover:bg-primary-50 border-2 border-transparent hover:border-primary-200 rounded-xl cursor-pointer transition-all duration-300">
                                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${hideLowScore ? "bg-primary-600" : "bg-neutral-300"}`}>
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                                                    hideLowScore ? "translate-x-6" : ""
                                                }`}
                                            ></span>
                                            <input
                                                type="checkbox"
                                                checked={hideLowScore}
                                                onChange={(e) => setHideLowScore(e.target.checked)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-900 block">Ẩn CV điểm thấp</span>
                                            <span className="text-xs text-neutral-600">Loại bỏ CV có điểm khớp &lt; 60%</span>
                                        </div>
                                    </label>

                                    <label className="group flex items-center gap-3 p-4 bg-neutral-50 hover:bg-primary-50 border-2 border-transparent hover:border-primary-200 rounded-xl cursor-pointer transition-all duration-300">
                                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${showMissingSkillsOnly ? "bg-primary-600" : "bg-neutral-300"}`}>
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                                                    showMissingSkillsOnly ? "translate-x-6" : ""
                                                }`}
                                            ></span>
                                            <input
                                                type="checkbox"
                                                checked={showMissingSkillsOnly}
                                                onChange={(e) => setShowMissingSkillsOnly(e.target.checked)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-900 block">Chỉ hiện CV đủ kỹ năng</span>
                                            <span className="text-xs text-neutral-600">Ẩn các CV còn thiếu kỹ năng</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
                    <StatCard
                        title="Tổng CVs"
                        value={totalMatched.toString()}
                        icon={<FileText className="w-6 h-6" />}
                        color="blue"
                        change={`Tất cả CV trong hệ thống`}
                    />
                    <StatCard
                        title="Điểm Trung Bình"
                        value={`${avgScore}/100`}
                        icon={<Award className="w-6 h-6" />}
                        color="purple"
                        change={getScoreLabel(avgScore)}
                    />
                    <StatCard
                        title="CVs Xuất Sắc"
                        value={excellentCount.toString()}
                        icon={<Target className="w-6 h-6" />}
                        color="green"
                        change="≥80 điểm"
                    />
                    <StatCard
                        title="Tỷ Lệ Matching"
                        value={jobRequest?.quantity ? `${Math.round((totalMatched / jobRequest.quantity) * 100)}%` : "0%"}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="orange"
                        change="Tỷ lệ tìm được"
                    />
                </div>

                {/* CV List */}
                <div className="space-y-6 animate-fade-in">
                    {paginatedCVs.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-12">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy CV phù hợp</h3>
                                <p className="text-neutral-600 mb-6">Không có CV nào khớp với yêu cầu tuyển dụng này</p>
                            </div>
                                                      
                        </div>
                    ) : (
                        paginatedCVs.map((cv, index) => {
                            // Kiểm tra xem CV có điểm số hay không
                            const hasScore = cv.matchScore !== undefined;
                            const match = hasScore ? cv as EnrichedMatchResult : null;
                            
                            // Tính toán index thực tế trong danh sách đã filter
                            const actualIndex = startIndex + index;
                            
                            // Nếu CV không có điểm số (undefined), hiển thị đơn giản
                            // CV có điểm 0 vẫn hiển thị đầy đủ thông tin phân tích
                            if (!hasScore && cv.matchScore === undefined) {
                                return (
                                    <div
                                        key={cv.talentCV.id}
                                        className="group bg-white rounded-2xl shadow-soft hover:shadow-medium border border-neutral-100 hover:border-primary-200 p-6 transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-start gap-6">
                                            {/* Rank Badge */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-neutral-100 text-neutral-600">
                                                    #{actualIndex + 1}
                                                </div>
                                            </div>

                                            {/* CV Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                                                            {cv.talentInfo?.fullName || `Talent #${cv.talentCV.talentId}`}
                                                        </h3>
                                                        <p className="text-neutral-600 text-sm mb-2">Phiên bản CV: v{cv.talentCV.version}</p>
                                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                            {cv.talentInfo?.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-4 h-4" />
                                                                    {cv.talentInfo.email}
                                                                </span>
                                                            )}
                                                            {cv.talentInfo?.phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-4 h-4" />
                                                                    {cv.talentInfo.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* No Score Badge */}
                                                    <div className="text-right">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg border-2 ${getScoreColor(0)}`}>
                                                            0
                                                            <span className="text-sm font-medium">/100</span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 mt-1">Không khớp</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-200">
                                                    <Button
                                                        onClick={() => window.open(cv.talentCV.cvFileUrl, '_blank')}
                                                        className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transform hover:scale-105"
                                                    >
                                                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                        Xem CV
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            navigate(`/ta/developers/${cv.talentCV.talentId}`, {
                                                                state: { returnTo: currentMatchingPath },
                                                            })
                                                        }
                                                        className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white transform hover:scale-105"
                                                    >
                                                        <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                        Xem Talent
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleCreateApplication(cv as EnrichedMatchResult)}
                                                        className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transform hover:scale-105"
                                                    >
                                                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                        Tạo hồ sơ ứng tuyển
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // CV có điểm số - hiển thị đầy đủ thông tin
                            if (!match) return null; // Safety check
                            
                            // Debug: Log missingSkills trước khi render
                            console.log(`🎨 Rendering CV ${match.talentCV.id}:`, {
                                matchedSkills: match.matchedSkills,
                                missingSkills: match.missingSkills,
                                missingCount: match.missingSkills?.length || 0,
                                hasMissing: match.missingSkills && match.missingSkills.length > 0
                            });
                            
                            const totalRequiredSkills = (match.matchedSkills?.length || 0) + (match.missingSkills?.length || 0);
                            const skillMatchPercent = totalRequiredSkills > 0
                                ? Math.round(((match.matchedSkills?.length || 0) / totalRequiredSkills) * 100)
                                : 100;

                            const jobWorkingMode = jobRequest?.workingMode ?? WorkingMode.None;
                            const talentWorkingMode = match.talentInfo?.workingMode ?? WorkingMode.None;
                            const workingModeRequired = jobWorkingMode !== WorkingMode.None;
                            const workingModeMatch = workingModeRequired
                                ? (talentWorkingMode !== WorkingMode.None && (talentWorkingMode & jobWorkingMode) !== 0)
                                : true;
                            const isRemoteOrFlexible = workingModeRequired && (jobWorkingMode & (WorkingMode.Remote | WorkingMode.Hybrid)) !== 0;

                            const locationRequired = !!jobRequest?.locationId;
                            const talentLocationId = match.talentInfo?.locationId ?? null;
                            const locationMatch = locationRequired ? talentLocationId === jobRequest?.locationId : true;

                            const workingModeRequirementText = workingModeRequired ? formatWorkingMode(jobWorkingMode) : "";
                            const talentWorkingModeText = talentWorkingMode !== WorkingMode.None ? formatWorkingMode(talentWorkingMode) : "";

                            // Tính điểm chi tiết theo công thức backend
                            const levelPoints = match.levelMatch ? 20 : 0;
                            
                            // Working mode: 10 points
                            const workingModePoints = workingModeRequired
                                ? (workingModeMatch ? 10 : 0)
                                : 10; // Nếu không yêu cầu thì cho đủ điểm
                            
                            // Location: 15 points
                            const locationPoints = isRemoteOrFlexible
                                ? 15 // Remote/Flexible thì cho đủ điểm
                                : locationRequired
                                    ? (locationMatch ? 15 : 0)
                                    : 15; // Nếu không yêu cầu thì cho đủ điểm
                            
                            // Skills: 50 points
                            const skillPoints = totalRequiredSkills > 0
                                ? Math.round((50.0 / totalRequiredSkills) * (match.matchedSkills?.length || 0))
                                : 50; // Nếu không có skill yêu cầu thì cho đủ điểm
                            
                            // Availability bonus: +5 points nếu status === "Available"
                            const availabilityBonus = match.talentInfo?.status === "Available" ? 5 : 0;
                            
                            // Xác định tiêu chí phù hợp - rút gọn
                            const jobLevelDisplay = jobRoleLevel 
                                ? `${jobRoleLevel.name} (${formatLevel(jobRoleLevel.level)})` 
                                : "N/A";
                            const levelMatchReason = match.levelMatch 
                                ? `✅ Khớp: Talent có cấp độ phù hợp ↔ Job: ${jobLevelDisplay}`
                                : `❌ Không khớp: Talent có cấp độ khác ↔ Job: ${jobLevelDisplay}`;
                            
                            const workingModeMatchReason = workingModeRequired
                                ? workingModeMatch
                                    ? `✅ Khớp: Talent ${talentWorkingModeText || "chưa cập nhật"} ↔ Job yêu cầu ${workingModeRequirementText}`
                                    : `❌ Không khớp: Talent ${talentWorkingModeText || "chưa cập nhật"} ↔ Job yêu cầu ${workingModeRequirementText}`
                                : "✅ Không yêu cầu: Job chấp nhận mọi chế độ làm việc";
                            
                            const talentLocationName = (match.talentInfo as Talent & { locationName?: string | null })?.locationName || null;
                            const locationMatchReason = isRemoteOrFlexible
                                ? "✅ Remote/Hybrid: Job cho phép làm việc từ xa nên không yêu cầu địa điểm cố định"
                                : locationRequired
                                    ? talentLocationId
                                        ? locationMatch
                                            ? `✅ Khớp: Talent ở ${talentLocationName || "N/A"} ↔ Job yêu cầu ${jobLocation?.name || "N/A"}`
                                            : `❌ Khác địa điểm: Talent ở ${talentLocationName || "N/A"} ↔ Job yêu cầu ${jobLocation?.name || "N/A"}`
                                        : "⚠️ Chưa xác định: Job yêu cầu địa điểm cụ thể nhưng Talent chưa cập nhật"
                                    : "✅ Không yêu cầu: Job không yêu cầu địa điểm cụ thể";
                            
                            const skillMatchReason = totalRequiredSkills > 0
                                ? `${match.matchedSkills?.length || 0}/${totalRequiredSkills} kỹ năng (${skillMatchPercent}%)`
                                : "Không yêu cầu kỹ năng cụ thể";

                            return (
                            <div
                                key={match.talentCV.id}
                                className="group bg-white rounded-2xl shadow-soft hover:shadow-medium border border-neutral-100 hover:border-primary-200 p-6 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-6">
                                    {/* Rank Badge */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                            actualIndex === 0 ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-300' :
                                            actualIndex === 1 ? 'bg-gray-100 text-gray-600 border-2 border-gray-300' :
                                            actualIndex === 2 ? 'bg-orange-100 text-orange-600 border-2 border-orange-300' :
                                            'bg-neutral-100 text-neutral-600'
                                        }`}>
                                            #{actualIndex + 1}
                                        </div>
                                    </div>

                                    {/* CV Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                                                    {match.talentInfo?.fullName || `Talent #${match.talentCV.talentId}`}
                                                </h3>
                                                <p className="text-neutral-600 text-sm mb-2">Phiên bản CV: v{match.talentCV.version}</p>
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    {match.talentInfo?.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {match.talentInfo.email}
                                                        </span>
                                                    )}
                                                    {match.talentInfo?.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {match.talentInfo.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Match Score */}
                                            <div className="text-right">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-2xl border-2 ${getScoreColor(match.matchScore)}`}>
                                                    {match.matchScore}
                                                    <span className="text-sm font-medium">/100</span>
                                                </div>
                                                <p className="text-xs text-neutral-500 mt-1">{getScoreLabel(match.matchScore)}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
                                                <span>Độ phù hợp</span>
                                                <span>{match.matchScore}%</span>
                                            </div>
                                            <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        match.matchScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                        match.matchScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                        match.matchScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                                        'bg-gradient-to-r from-red-500 to-red-600'
                                                    }`}
                                                    style={{ width: `${match.matchScore}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Match Summary */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Target className="w-5 h-5 text-primary-600" />
                                                <h4 className="text-lg font-bold text-gray-900">Phân tích mức độ phù hợp</h4>
                                            </div>
                                            
                                            {/* Score Cards Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {/* Cấp độ/Kinh nghiệm */}
                                                <div className={`p-4 rounded-xl border-2 ${
                                                    match.levelMatch 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-red-50 border-red-200'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-2 rounded-lg ${
                                                                match.levelMatch ? 'bg-green-100' : 'bg-red-100'
                                                            }`}>
                                                                <GraduationCap className={`w-4 h-4 ${
                                                                    match.levelMatch ? 'text-green-600' : 'text-red-600'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Cấp độ/Kinh nghiệm</p>
                                                                <p className="text-xs text-gray-600">Tối đa 20 điểm</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-2xl font-bold ${
                                                                match.levelMatch ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {levelPoints}
                                                            </p>
                                                            <p className="text-xs text-gray-500">/20</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm mt-2 font-medium ${
                                                        match.levelMatch ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {levelMatchReason}
                                                    </p>
                                                </div>

                                                {/* Chế độ làm việc */}
                                                <div className={`p-4 rounded-xl border-2 ${
                                                    workingModePoints === 10
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-red-50 border-red-200'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-2 rounded-lg ${
                                                                workingModePoints === 10 ? 'bg-green-100' : 'bg-red-100'
                                                            }`}>
                                                                <Briefcase className={`w-4 h-4 ${
                                                                    workingModePoints === 10 ? 'text-green-600' : 'text-red-600'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Chế độ làm việc</p>
                                                                <p className="text-xs text-gray-600">Tối đa 10 điểm</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-2xl font-bold ${
                                                                workingModePoints === 10 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {workingModePoints}
                                                            </p>
                                                            <p className="text-xs text-gray-500">/10</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm mt-2 font-medium ${
                                                        workingModePoints === 10 ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {workingModeMatchReason}
                                                    </p>
                                                </div>

                                                {/* Địa điểm */}
                                                <div className={`p-4 rounded-xl border-2 ${
                                                    locationPoints === 15
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-yellow-50 border-yellow-200'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-2 rounded-lg ${
                                                                locationPoints === 15 ? 'bg-green-100' : 'bg-yellow-100'
                                                            }`}>
                                                                <MapPin className={`w-4 h-4 ${
                                                                    locationPoints === 15 ? 'text-green-600' : 'text-yellow-600'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Địa điểm</p>
                                                                <p className="text-xs text-gray-600">Tối đa 15 điểm</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-2xl font-bold ${
                                                                locationPoints === 15 ? 'text-green-600' : 'text-yellow-600'
                                                            }`}>
                                                                {locationPoints}
                                                            </p>
                                                            <p className="text-xs text-gray-500">/15</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm mt-2 font-medium ${
                                                        locationPoints === 15 ? 'text-green-700' : 'text-yellow-700'
                                                    }`}>
                                                        {locationMatchReason}
                                                    </p>
                                                </div>

                                                {/* Kỹ năng */}
                                                <div className={`p-4 rounded-xl border-2 ${
                                                    skillPoints >= 40
                                                        ? 'bg-green-50 border-green-200' 
                                                        : skillPoints >= 25
                                                        ? 'bg-yellow-50 border-yellow-200'
                                                        : 'bg-red-50 border-red-200'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-2 rounded-lg ${
                                                                skillPoints >= 40 ? 'bg-green-100' : skillPoints >= 25 ? 'bg-yellow-100' : 'bg-red-100'
                                                            }`}>
                                                                <Code className={`w-4 h-4 ${
                                                                    skillPoints >= 40 ? 'text-green-600' : skillPoints >= 25 ? 'text-yellow-600' : 'text-red-600'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Kỹ năng</p>
                                                                <p className="text-xs text-gray-600">Tối đa 50 điểm</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-2xl font-bold ${
                                                                skillPoints >= 40 ? 'text-green-600' : skillPoints >= 25 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                                {skillPoints}
                                                            </p>
                                                            <p className="text-xs text-gray-500">/50</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                                            {skillMatchReason}
                                                        </p>
                                                        {match.matchedSkills.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-xs font-medium text-green-600 mb-1">✅ Kỹ năng có:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {match.matchedSkills.slice(0, 5).map((skill, idx) => (
                                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {match.matchedSkills.length > 5 && (
                                                                        <span className="text-xs text-gray-500">+{match.matchedSkills.length - 5} kỹ năng khác</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {match.missingSkills && 
                                                         Array.isArray(match.missingSkills) && 
                                                         match.missingSkills.length > 0 && (
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <p className="text-xs font-medium text-red-600 mb-1">❌ Còn thiếu:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {match.missingSkills
                                                                        .filter((skill: string) => skill && typeof skill === 'string' && skill.trim().length > 0)
                                                                        .slice(0, 5)
                                                                        .map((skill: string, idx: number) => (
                                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {match.missingSkills.filter((skill: string) => skill && typeof skill === 'string' && skill.trim().length > 0).length > 5 && (
                                                                        <span className="text-xs text-gray-500">+{match.missingSkills.filter((skill: string) => skill && typeof skill === 'string' && skill.trim().length > 0).length - 5} kỹ năng khác</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bonus Availability */}
                                            {availabilityBonus > 0 && (
                                                <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-purple-100">
                                                            <Clock className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">Bonus sẵn sàng làm việc</p>
                                                            <p className="text-sm text-gray-600">Sẵn sàng ngay hoặc linh hoạt, không có ràng buộc thời gian</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-purple-600">+{availabilityBonus}</p>
                                                            <p className="text-xs text-gray-500">điểm</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Total Score Summary */}
                                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-primary-100">
                                                            <Award className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg">Tổng điểm phù hợp</p>
                                                            <p className="text-sm text-gray-600">Tổng hợp tất cả các tiêu chí</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-4xl font-bold ${
                                                            match.matchScore >= 80 ? 'text-green-600' :
                                                            match.matchScore >= 60 ? 'text-blue-600' :
                                                            match.matchScore >= 40 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                            {match.matchScore}
                                                        </p>
                                                        <p className="text-sm text-gray-500">/100 điểm</p>
                                                        <p className={`text-xs font-medium mt-1 ${
                                                            match.matchScore >= 80 ? 'text-green-600' :
                                                            match.matchScore >= 60 ? 'text-blue-600' :
                                                            match.matchScore >= 40 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                            {getScoreLabel(match.matchScore)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="space-y-3">
                                            {/* Matched Skills */}
                                            {(match.matchedSkills?.length || 0) > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Kỹ năng phù hợp ({match.matchedSkills?.length || 0})
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(match.matchedSkills || []).map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-200">
                                            <Button
                                                onClick={() => window.open(match.talentCV.cvFileUrl, '_blank')}
                                                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transform hover:scale-105"
                                            >
                                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                Xem CV
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    navigate(`/ta/developers/${match.talentCV.talentId}`, {
                                                        state: { returnTo: currentMatchingPath },
                                                    })
                                                }
                                                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white transform hover:scale-105"
                                            >
                                                <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                Xem Talent
                                            </Button>
                                            <Button
                                                onClick={() => handleCreateApplication(match)}
                                                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transform hover:scale-105"
                                            >
                                                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                Tạo hồ sơ ứng tuyển
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-neutral-600">
                                Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredCVs.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredCVs.length}</span> CV
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-50 border border-primary-200 hover:bg-primary-100 text-black hover:text-green disabled:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                                                    currentPage === pageNum
                                                        ? 'bg-primary-600 text-white shadow-md'
                                                        : 'bg-white border border-neutral-200 text-gray-700 hover:bg-neutral-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-50 border border-primary-200 hover:bg-primary-100 text-black hover:text-green disabled:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, change }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    change: string;
}) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-primary-100 text-primary-600 group-hover:bg-primary-200';
            case 'green':
                return 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200';
            case 'purple':
                return 'bg-accent-100 text-accent-600 group-hover:bg-accent-200';
            case 'orange':
                return 'bg-warning-100 text-warning-600 group-hover:bg-warning-200';
            default:
                return 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200';
        }
    };

    return (
        <div className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(color)} transition-all duration-300`}>
                    {icon}
                </div>
            </div>
            <p className="text-sm text-neutral-500 mt-4 flex items-center">
                <span className="font-medium">{change}</span>
            </p>
        </div>
    );
}
