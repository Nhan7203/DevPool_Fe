import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCVService, type TalentCVMatchResult } from "../../../services/TalentCV";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentService, type Talent } from "../../../services/Talent";
import { applyService } from "../../../services/Apply";
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
    Calendar,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EnrichedMatchResult extends TalentCVMatchResult {
    talentInfo?: Talent;
}

export default function CVMatchingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const jobRequestId = searchParams.get("jobRequestId");

    const [matchResults, setMatchResults] = useState<EnrichedMatchResult[]>([]);
    const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
    const [loading, setLoading] = useState(true);

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

                // Fetch matching CVs
                console.log("🔍 Fetching matching CVs for Job Request ID:", jobRequestId);
                const matches = await talentCVService.getMatchesForJobRequest({
                    jobRequestId: Number(jobRequestId),
                    excludeDeleted: true,
                });
                console.log("✅ Matching CVs received:", matches);
                console.log("📊 Total matches found:", matches?.length || 0);

                // Enrich with talent information
                const enrichedMatches = await Promise.all(
                    matches.map(async (match: TalentCVMatchResult) => {
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

    const handleCreateApplication = async (match: EnrichedMatchResult) => {
        if (!jobRequestId) return;

        const confirm = window.confirm(
            `⚠️ Bạn có chắc muốn tạo hồ sơ ứng tuyển cho ${match.talentInfo?.fullName || 'talent này'}?\n\n` +
            `Điểm khớp: ${match.matchScore}%\n` +
            `CV: ${match.talentCV.versionName}`
        );
        
        if (!confirm) return;

        try {
            const submittedBy = match.talentInfo?.userId || "Unknown";
            
            await applyService.create({
                jobRequestId: Number(jobRequestId),
                cvId: match.talentCV.id,
                submittedBy: submittedBy,
                note: `Điểm khớp: ${match.matchScore}%`,
            });

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
                                    {totalMatched} CVs được tìm thấy từ {jobRequest?.quantity || 0} vị trí cần tuyển
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
                    <StatCard
                        title="Tổng CVs Matching"
                        value={totalMatched.toString()}
                        icon={<FileText className="w-6 h-6" />}
                        color="blue"
                        change={`Từ ${jobRequest?.quantity || 0} vị trí`}
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
                        matchResults.map((match, index) => (
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
                                                            <Calendar className="w-4 h-4" />
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
                                        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                                            <p className="text-sm text-neutral-700">{match.matchSummary}</p>
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
                        ))
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
