import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentSkillService, type TalentSkillCreate } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { skillGroupService, type SkillGroup } from "../../../services/SkillGroup";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Star, 
  Target, 
  Calendar,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";

export default function TalentSkillEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [skillGroupSearchQuery, setSkillGroupSearchQuery] = useState("");
  const [selectedSkillGroupId, setSelectedSkillGroupId] = useState<number | undefined>(undefined);
  const [talentId, setTalentId] = useState<number>(0);
  const [existingSkillIds, setExistingSkillIds] = useState<number[]>([]);
  const [currentSkillId, setCurrentSkillId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentSkillCreate>({
    talentId: 0,
    skillId: 0,
    level: "",
    yearsExp: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent Skill
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentSkillService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          skillId: data.skillId,
          level: data.level,
          yearsExp: data.yearsExp,
        });
        setTalentId(data.talentId);
        setCurrentSkillId(data.skillId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin kỹ năng nhân sự!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách Skills và Skill Groups
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skills, skillGroupsData] = await Promise.all([
          skillService.getAll({ excludeDeleted: true }),
          skillGroupService.getAll({ excludeDeleted: true })
        ]);
        setAllSkills(skills);
        const skillGroupsArray = Array.isArray(skillGroupsData)
          ? skillGroupsData
          : (Array.isArray((skillGroupsData as any)?.items)
            ? (skillGroupsData as any).items
            : (Array.isArray((skillGroupsData as any)?.data)
              ? (skillGroupsData as any).data
              : []));
        setSkillGroups(skillGroupsArray);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách kỹ năng hoặc nhóm kỹ năng:", err);
      }
    };
    fetchSkills();
  }, []);

  // Fetch existing skills for this talent to disable them in dropdown (except current one)
  useEffect(() => {
    const fetchExistingSkills = async () => {
      if (!talentId) return;
      try {
        const existingSkills = await talentSkillService.getAll({ talentId: talentId, excludeDeleted: true });
        // Exclude current skill ID from disabled list
        const skillIds = existingSkills
          .map((skill: any) => skill.skillId)
          .filter((id: number) => id > 0 && id !== currentSkillId);
        setExistingSkillIds(skillIds);
      } catch (error) {
        console.error("❌ Error loading existing skills", error);
      }
    };
    fetchExistingSkills();
  }, [talentId, currentSkillId]);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "skillId" || name === "yearsExp"
        ? Number(value)
        : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Xác nhận trước khi lưu
    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
    if (!confirmed) {
      return;
    }

    if (!formData.skillId || formData.skillId === 0) {
      alert("⚠️ Vui lòng chọn kỹ năng trước khi lưu!");
      return;
    }

    if (!formData.level.trim()) {
      alert("⚠️ Vui lòng nhập level kỹ năng!");
      return;
    }

    if (formData.yearsExp < 0) {
      alert("⚠️ Số năm kinh nghiệm không được âm!");
      return;
    }

    try {
      console.log("Payload gửi đi:", formData);
      await talentSkillService.update(Number(id), formData);

      alert("✅ Cập nhật kỹ năng nhân sự thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật kỹ năng nhân sự!");
    }
  };

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa kỹ năng nhân sự</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin kỹ năng của nhân sự
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa kỹ năng nhân sự
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
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
                
                {/* Skill Group Filter and Skill Search */}
                <div className="mb-3 space-y-3">
                  {/* Lọc theo nhóm kỹ năng */}
                  {skillGroups && skillGroups.length > 0 && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5" />
                        Lọc danh sách kỹ năng theo nhóm
                      </label>
                      <div className="space-y-2">
                        {/* Search nhóm kỹ năng - Chỉ hiển thị khi có nhiều nhóm */}
                        {skillGroups.length > 5 && (
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                            <input
                              type="text"
                              placeholder={`Tìm kiếm nhóm kỹ năng... (${skillGroups.length} nhóm)`}
                              value={skillGroupSearchQuery}
                              onChange={(e) => setSkillGroupSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-7 py-1.5 text-xs border rounded-lg bg-white border-neutral-300 focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {skillGroupSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setSkillGroupSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Dropdown chọn nhóm kỹ năng */}
                        <div className="relative">
                          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5 pointer-events-none z-10" />
                          <select
                            value={selectedSkillGroupId || ""}
                            onChange={(e) => setSelectedSkillGroupId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full pl-8 pr-4 py-1.5 text-xs border rounded-lg bg-white border-neutral-300 focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          >
                            <option value="">Tất cả nhóm kỹ năng</option>
                            {(() => {
                              // Filter skill groups theo search query
                              const filteredGroups = skillGroupSearchQuery
                                ? skillGroups.filter(g =>
                                  g.name.toLowerCase().includes(skillGroupSearchQuery.toLowerCase()) ||
                                  (g.description && g.description.toLowerCase().includes(skillGroupSearchQuery.toLowerCase()))
                                )
                                : skillGroups;

                              if (filteredGroups.length === 0) {
                                return <option value="" disabled>Không tìm thấy nhóm kỹ năng</option>;
                              }

                              return filteredGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tìm kiếm kỹ năng để chọn */}
                  <div className="bg-green-50/50 border border-green-200 rounded-lg p-3">
                    <label className="block text-xs font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" />
                      Tìm kiếm kỹ năng để chọn
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Nhập tên kỹ năng để tìm kiếm..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs border rounded-lg bg-white border-neutral-300 focus:ring-1 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      />
                      {skillSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSkillSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filtered Skills Dropdown */}
                {(() => {
                  const filteredSkills = allSkills.filter(skill => {
                    const matchesSearch = !skillSearchQuery ||
                      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      skill.description?.toLowerCase().includes(skillSearchQuery.toLowerCase());
                    const matchesGroup = !selectedSkillGroupId || skill.skillGroupId === selectedSkillGroupId;
                    return matchesSearch && matchesGroup;
                  });

                  return filteredSkills.length > 0 ? (
                    <select
                      name="skillId"
                      value={formData.skillId}
                      onChange={handleChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="0">-- Chọn kỹ năng --</option>
                      {filteredSkills.map(skill => {
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
                  );
                })()}
                
                {formData.skillId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Mô tả: <span className="font-medium text-neutral-700">
                      {allSkills.find(s => s.id === formData.skillId)?.description || "Không có mô tả"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Cấp độ
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn cấp độ --</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {/* Số năm kinh nghiệm */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Số năm kinh nghiệm
                  </label>
                  <Input
                    type="number"
                    name="yearsExp"
                    value={formData.yearsExp}
                    onChange={handleChange}
                    min={0}
                    max={50}
                    placeholder="Nhập số năm kinh nghiệm..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <Button
              type="submit"
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
            >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
