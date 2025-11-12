import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentSkillService, type TalentSkillCreate, type TalentSkill } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { type ExtractedSkill } from "../../../services/TalentCV";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Star, 
  Target, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  X,
  Search
} from "lucide-react";

export default function TalentSkillCreatePage() {
  const [searchParams] = useSearchParams();
  const talentId = searchParams.get('talentId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TalentSkillCreate>({
    talentId: talentId ? Number(talentId) : 0,
    skillId: 0,
    level: "",
    yearsExp: 0,
  });

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [existingSkillIds, setExistingSkillIds] = useState<number[]>([]);
  const [analysisSuggestions, setAnalysisSuggestions] = useState<ExtractedSkill[]>([]);
  const analysisStorageKey = talentId ? `talent-analysis-prefill-skills-${talentId}` : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skills = await skillService.getAll({ excludeDeleted: true });
        setAllSkills(skills);
      } catch (error) {
        console.error("❌ Error loading skills", error);
      }
    };
    fetchData();
  }, []);

  // Fetch existing skills for this talent to disable them in dropdown
  useEffect(() => {
    const fetchExistingSkills = async () => {
      if (!talentId) return;
      try {
        const existingSkills = await talentSkillService.getAll({ talentId: Number(talentId), excludeDeleted: true });
        const skillIds = existingSkills.map((skill: TalentSkill) => skill.skillId).filter((id: number) => id > 0);
        setExistingSkillIds(skillIds);
      } catch (error) {
        console.error("❌ Error loading existing skills", error);
      }
    };
    fetchExistingSkills();
  }, [talentId]);

  useEffect(() => {
    if (!analysisStorageKey) return;
    try {
      const raw = sessionStorage.getItem(analysisStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ExtractedSkill[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAnalysisSuggestions(parsed);
      }
    } catch (storageError) {
      console.error("❌ Không thể đọc gợi ý kỹ năng từ phân tích CV", storageError);
    }
  }, [analysisStorageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "skillId" || name === "yearsExp" ? Number(value) : value 
    }));
  };

  const applySkillSuggestion = (suggestion: ExtractedSkill) => {
    if (!suggestion) return;
    if (allSkills.length === 0) {
      setError("⚠️ Danh sách kỹ năng chưa được tải xong. Vui lòng thử lại sau.");
      return;
    }
    const matchingSkill = allSkills.find(
      (skill) => skill.name.toLowerCase() === suggestion.skillName.toLowerCase()
    );
    if (!matchingSkill) {
      setError(`⚠️ Không tìm thấy kỹ năng "${suggestion.skillName}" trong hệ thống. Vui lòng chọn thủ công.`);
      return;
    }
    setError("");
    setSuccess(false);
    setSkillSearchQuery(suggestion.skillName);
    setForm((prev) => ({
      ...prev,
      skillId: matchingSkill.id,
      level: suggestion.level ?? prev.level,
      yearsExp: suggestion.yearsExp ?? prev.yearsExp,
    }));
  };

  const clearSkillSuggestions = () => {
    if (analysisStorageKey) {
      sessionStorage.removeItem(analysisStorageKey);
    }
    setAnalysisSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn thêm kỹ năng cho nhân sự không?");
    if (!confirmed) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.skillId || form.skillId === 0) {
      setError("⚠️ Vui lòng chọn kỹ năng trước khi tạo.");
      setLoading(false);
      return;
    }

    if (!form.level.trim()) {
      setError("⚠️ Vui lòng nhập level kỹ năng.");
      setLoading(false);
      return;
    }

    if (form.yearsExp < 0) {
      setError("⚠️ Số năm kinh nghiệm không được âm.");
      setLoading(false);
      return;
    }

    try {
      await talentSkillService.create(form);
      clearSkillSuggestions();
      setSuccess(true);
      setTimeout(() => navigate(`/hr/developers/${talentId}`), 1500);
    } catch (err) {
      console.error("❌ Error creating Talent Skill:", err);
      setError("Không thể tạo kỹ năng cho nhân sự. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết nhân sự</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm kỹ năng cho nhân sự</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm kỹ năng mới cho nhân sự
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Thêm kỹ năng mới
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {analysisSuggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">Gợi ý từ phân tích CV</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Chọn một gợi ý bên dưới để tự động điền thông tin vào biểu mẫu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearSkillSuggestions}
                  className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Bỏ gợi ý
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {analysisSuggestions.map((suggestion, index) => (
                  <div
                    key={`analysis-skill-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-amber-900">{suggestion.skillName}</span>
                      <span className="text-xs text-amber-700">
                        Level: {suggestion.level ?? "Chưa rõ"} · Kinh nghiệm:{" "}
                        {suggestion.yearsExp != null ? `${suggestion.yearsExp} năm` : "Chưa rõ"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => applySkillSuggestion(suggestion)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:from-secondary-700 hover:to-secondary-800"
                    >
                      <Plus className="w-4 h-4" />
                      Điền form
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Star className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin kỹ năng</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Kỹ năng */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Kỹ năng <span className="text-red-500">*</span>
                </label>
                
                {/* Search Box */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm để lọc danh sách kỹ năng..."
                      className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 bg-white"
                    />
                  </div>
                  {/* Hint text */}
                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Nhập từ khóa để tìm kiếm và lọc danh sách kỹ năng bên dưới
                    {skillSearchQuery && (
                      <span className="ml-1 text-primary-600 font-medium">
                        ({allSkills.filter(skill => 
                          skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                          skill.description?.toLowerCase().includes(skillSearchQuery.toLowerCase())
                        ).length} kết quả)
                      </span>
                    )}
                  </p>
                </div>

                {/* Filtered Skills Dropdown */}
                {allSkills.filter(skill => 
                  skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                  skill.description?.toLowerCase().includes(skillSearchQuery.toLowerCase())
                ).length > 0 ? (
                  <select
                    name="skillId"
                    value={form.skillId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="0">-- Chọn kỹ năng --</option>
                    {allSkills
                      .filter(skill => 
                        skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                        skill.description?.toLowerCase().includes(skillSearchQuery.toLowerCase())
                      )
                      .map(skill => {
                        const isDisabled = existingSkillIds.includes(skill.id);
                        return (
                          <option 
                            key={skill.id} 
                            value={skill.id}
                            disabled={isDisabled}
                            style={isDisabled ? { color: '#999', fontStyle: 'italic' } : {}}
                          >
                            {skill.name}{isDisabled ? ' (đã chọn)' : ''}
                          </option>
                        );
                      })}
                  </select>
                ) : (
                  <div className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 text-neutral-500 text-center">
                    Không tìm thấy kỹ năng nào
                  </div>
                )}
                
                {form.skillId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Mô tả: <span className="font-medium text-neutral-700">
                      {allSkills.find(s => s.id === form.skillId)?.description || "Không có mô tả"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Level kỹ năng
                  </label>
                  <input
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    placeholder="VD: Junior, Senior, Expert..."
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Số năm kinh nghiệm */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    name="yearsExp"
                    value={form.yearsExp}
                    onChange={handleChange}
                    min={0}
                    max={50}
                    placeholder="Nhập số năm kinh nghiệm..."
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {(error || success) && (
            <div className="animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Thêm kỹ năng thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Thêm kỹ năng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}