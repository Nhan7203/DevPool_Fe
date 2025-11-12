import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCVService, type TalentCVMatchResult } from "../../../services/TalentCV";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentService, type Talent } from "../../../services/Talent";
import { applyService } from "../../../services/Apply";
import { talentApplicationService, TalentApplicationStatusConstants, type TalentApplication } from "../../../services/TalentApplication";
import { decodeJWT } from "../../../services/Auth";
import { useAuth } from "../../../contexts/AuthContext";
import {
    ArrowLeft,
    Sparkles,
    Target,
    CheckCircle2,
    XCircle,
    Users,
    TrendingUp,
    Award,
    Eye,
    FileText,
    Phone,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { WorkingMode } from "../../../types/WorkingMode";

interface EnrichedMatchResult extends TalentCVMatchResult {
    talentInfo?: Talent;
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

export default function CVMatchingPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const jobRequestId = searchParams.get("jobRequestId");

    const [matchResults, setMatchResults] = useState<EnrichedMatchResult[]>([]);
    const [allMatchResults, setAllMatchResults] = useState<EnrichedMatchResult[]>([]);
    const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter states
    const [minScore, setMinScore] = useState(0);
    const [showMissingSkillsOnly, setShowMissingSkillsOnly] = useState(false);
    const [hideLowScore, setHideLowScore] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!jobRequestId) {
                navigate("/hr/job-requests");
                return;
            }

            try {
                setLoading(true);
                
                // Fetch job request details
                const jobReq = await jobRequestService.getById(Number(jobRequestId));
                console.log("✅ Job Request loaded:", jobReq);
                setJobRequest(jobReq);

                // Tính số lượng match mong muốn: quantity + 5
                const desiredMatchCount = jobReq.quantity ? jobReq.quantity + 5 : 5;

                // Fetch matching CVs
                console.log("🔍 Fetching matching CVs for Job Request ID:", jobRequestId);
                console.log("📊 Desired match count:", desiredMatchCount, "(Quantity:", jobReq.quantity, "+ 5)");
                const matches = await talentCVService.getMatchesForJobRequest({
                    jobRequestId: Number(jobRequestId),
                    excludeDeleted: true,
                    maxResults: desiredMatchCount, // Gửi số lượng mong muốn cho backend
                });
                console.log("✅ Matching CVs received:", matches);
                console.log("📊 Total matches found:", matches?.length || 0);
                
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

                const filteredMatches = matches.filter((match: TalentCVMatchResult) => {
                    const alreadyApplied = excludedCvIds.has(match.talentCV.id);
                    if (alreadyApplied) {
                        console.log(
                            "ℹ️ Bỏ qua CV có hồ sơ ứng tuyển ở trạng thái Hired:",
                            match.talentCV.id,
                            match.talentCV.versionName
                        );
                    }
                    return !alreadyApplied;
                });
                console.log("📉 Số CV sau khi loại trừ đã ứng tuyển:", filteredMatches.length);

                // Enrich with talent information
                const enrichedMatches = await Promise.all(
                    filteredMatches.map(async (match: TalentCVMatchResult) => {
                        try {
                            const talent = await talentService.getById(match.talentCV.talentId);
                            console.log("✅ Talent info loaded for ID:", match.talentCV.talentId, talent);
                            return { ...match, talentInfo: talent };
                        } catch (err) {
                            console.warn("⚠️ Failed to load talent info for ID:", match.talentCV.talentId, err);
                            return { ...match, talentInfo: undefined };
                        }
                    })
                );

                console.log("✅ Final enriched matches:", enrichedMatches);
                setAllMatchResults(enrichedMatches);
                setMatchResults(enrichedMatches);
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

    // Apply filters
    useEffect(() => {
        let filtered = [...allMatchResults];
        
        // Filter by min score
        filtered = filtered.filter(r => r.matchScore >= minScore);
        
        // Filter by hiding low score
        if (hideLowScore) {
            filtered = filtered.filter(r => r.matchScore >= 60);
        }
        
        // Filter by missing skills only
        if (showMissingSkillsOnly) {
            filtered = filtered.filter(r => r.missingSkills.length === 0);
        }
        
        setMatchResults(filtered);
    }, [minScore, showMissingSkillsOnly, hideLowScore, allMatchResults]);

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
            `CV: ${match.talentCV.versionName}`
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
            navigate(`/hr/applications`);
        } catch (err) {
            console.error("❌ Lỗi tạo hồ sơ ứng tuyển:", err);
            alert("Không thể tạo hồ sơ ứng tuyển!");
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="HR Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang phân tích và matching CV với AI...</p>
                    </div>
                </div>
            </div>
        );
    }

    const avgScore = matchResults.length > 0
        ? Math.round(matchResults.reduce((sum, r) => sum + r.matchScore, 0) / matchResults.length)
        : 0;

    const excellentCount = matchResults.filter(r => r.matchScore >= 80).length;
    const totalMatched = matchResults.length;

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="HR Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            to={`/hr/job-requests/${jobRequestId}`}
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
                                    {totalMatched} CVs được tìm thấy (yêu cầu: {jobRequest?.quantity || 0} vị trí, match: {jobRequest?.quantity ? jobRequest.quantity + 5 : 5} CVs)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Cấu hình lọc</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                >
                                    {showFilters ? 'Ẩn' : 'Hiện'} Filter
                                </button>
                            </div>
                        </div>
                        
                        {showFilters && (
                            <div className="space-y-4 pt-4 border-t border-neutral-200">
                                {/* Min Score Slider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Điểm tối thiểu: {minScore}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={minScore}
                                        onChange={(e) => setMinScore(Number(e.target.value))}
                                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                
                                {/* Checkboxes */}
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hideLowScore}
                                            onChange={(e) => setHideLowScore(e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Ẩn CV có điểm thấp (&lt;60%)</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showMissingSkillsOnly}
                                            onChange={(e) => setShowMissingSkillsOnly(e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Chỉ hiện CV đủ kỹ năng</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
                    <StatCard
                        title="Tổng CVs Matching"
                        value={totalMatched.toString()}
                        icon={<FileText className="w-6 h-6" />}
                        color="blue"
                        change={`Yêu cầu: ${jobRequest?.quantity || 0}, Match: ${jobRequest?.quantity ? jobRequest.quantity + 5 : 5}`}
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
                    {matchResults.length === 0 ? (
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
                        matchResults.map((match, index) => {
                            const totalRequiredSkills = match.matchedSkills.length + match.missingSkills.length;
                            const skillMatchPercent = totalRequiredSkills > 0
                                ? Math.round((match.matchedSkills.length / totalRequiredSkills) * 100)
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

                            const workingModeAnalysis = workingModeRequired
                                ? `Chế độ làm việc yêu cầu: ${workingModeRequirementText}. ${talentWorkingModeText ? `Nhân sự sẵn sàng: ${talentWorkingModeText}.` : "Nhân sự chưa cập nhật chế độ làm việc."} ${workingModeMatch ? "Hai bên tương thích." : "Chưa tương thích, cần trao đổi thêm."}`
                                : "Job không yêu cầu chế độ làm việc cụ thể, mọi chế độ đều được chấp nhận.";

                            const locationAnalysis = isRemoteOrFlexible
                                ? "Job cho phép làm Remote/Hybrid nên không yêu cầu nhân sự cố định địa điểm."
                                : locationRequired
                                    ? talentLocationId
                                        ? locationMatch
                                            ? "Nhân sự đang ở đúng địa điểm yêu cầu."
                                            : "Nhân sự ở khác địa điểm yêu cầu, cần cân nhắc."
                                        : "Job yêu cầu địa điểm cụ thể nhưng nhân sự chưa cập nhật thông tin địa điểm."
                                    : "Job không yêu cầu địa điểm cụ thể.";

                            const analysisPoints = [
                                `Điểm tổng hợp: ${match.matchScore}/100.`,
                                totalRequiredSkills > 0
                                    ? `Kỹ năng: ${match.matchedSkills.length}/${totalRequiredSkills} (${skillMatchPercent}%) kỹ năng yêu cầu đã đáp ứng${match.missingSkills.length ? `. Cần bổ sung: ${match.missingSkills.join(", ")}` : "."}`
                                    : "Kỹ năng: Yêu cầu tuyển dụng không chỉ định kỹ năng cụ thể, nhân sự được tính 100%.",
                                workingModeAnalysis,
                                locationAnalysis,
                                match.levelMatch
                                    ? "Cấp độ/kinh nghiệm: Nhân sự phù hợp với cấp độ mà yêu cầu tuyển dụng mong muốn."
                                    : "Cấp độ/kinh nghiệm: Nhân sự khác cấp độ yêu cầu, nên trao đổi thêm trước khi gửi khách hàng."
                            ].filter(Boolean);

                            return (
                            <div
                                key={match.talentCV.id}
                                className="group bg-white rounded-2xl shadow-soft hover:shadow-medium border border-neutral-100 hover:border-primary-200 p-6 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-6">
                                    {/* Rank Badge */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-300' :
                                            index === 1 ? 'bg-gray-100 text-gray-600 border-2 border-gray-300' :
                                            index === 2 ? 'bg-orange-100 text-orange-600 border-2 border-orange-300' :
                                            'bg-neutral-100 text-neutral-600'
                                        }`}>
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* CV Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                                                    {match.talentInfo?.fullName || `Talent #${match.talentCV.talentId}`}
                                                </h3>
                                                <p className="text-neutral-600 text-sm mb-2">{match.talentCV.versionName}</p>
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
                                        <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                                            <p className="text-sm font-semibold text-neutral-800 mb-2">Phân tích mức độ phù hợp</p>
                                            <ul className="space-y-2 text-sm text-neutral-700">
                                                {analysisPoints.map((point, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Skills */}
                                        <div className="space-y-3">
                                            {/* Matched Skills */}
                                            {match.matchedSkills.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Kỹ năng phù hợp ({match.matchedSkills.length})
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {match.matchedSkills.map((skill, idx) => (
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

                                            {/* Missing Skills */}
                                            {match.missingSkills.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Kỹ năng còn thiếu ({match.missingSkills.length})
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {match.missingSkills.map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                                                            >
                                                                <XCircle className="w-3 h-3" />
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
                                                onClick={() => navigate(`/hr/developers/${match.talentCV.talentId}`)}
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
