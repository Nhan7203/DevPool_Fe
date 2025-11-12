import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentSkillService, type TalentSkillCreate } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
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
  Search
} from "lucide-react";

export default function TalentSkillEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
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

  // 🧭 Load danh sách Skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await skillService.getAll({ excludeDeleted: true });
        setAllSkills(skills);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách kỹ năng:", err);
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
          .map(skill => skill.skillId)
          .filter(id => id > 0 && id !== currentSkillId);
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
                    value={formData.skillId}
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
                    Level kỹ năng
                  </label>
                  <Input
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    placeholder="VD: Junior, Senior, Expert..."
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
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
