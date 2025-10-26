import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentJobRoleLevelService, type TalentJobRoleLevelCreate } from "../../../services/TalentJobRoleLevel";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Target, 
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react";

export default function TalentJobRoleLevelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allJobRoleLevels, setAllJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentJobRoleLevelCreate>({
    talentId: 0,
    jobRoleLevelId: 0,
    yearsOfExp: 0,
    ratePerMonth: undefined,
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent Job Role Level
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentJobRoleLevelService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          jobRoleLevelId: data.jobRoleLevelId,
          yearsOfExp: data.yearsOfExp,
          ratePerMonth: data.ratePerMonth,
        });
        setTalentId(data.talentId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin vị trí công việc!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách Job Role Levels
  useEffect(() => {
    const fetchJobRoleLevels = async () => {
      try {
        const jobRoleLevels = await jobRoleLevelService.getAll({ excludeDeleted: true });
        setAllJobRoleLevels(jobRoleLevels);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách vị trí công việc:", err);
      }
    };
    fetchJobRoleLevels();
  }, []);

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "jobRoleLevelId" || name === "yearsOfExp" || name === "ratePerMonth" ? 
              (value === "" ? undefined : Number(value)) : value,
    }));
  };

  // 💾 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.jobRoleLevelId || formData.jobRoleLevelId === 0) {
      alert("⚠️ Vui lòng chọn vị trí công việc trước khi lưu!");
      return;
    }

    if (formData.yearsOfExp < 0) {
      alert("⚠️ Số năm kinh nghiệm không được âm!");
      return;
    }

    if (formData.ratePerMonth && formData.ratePerMonth < 0) {
      alert("⚠️ Mức lương không được âm!");
      return;
    }

    try {
      console.log("Payload gửi đi:", formData);
      await talentJobRoleLevelService.update(Number(id), formData);

      alert("✅ Cập nhật vị trí công việc thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật vị trí công việc!");
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
              <span className="font-medium">Quay lại chi tiết talent</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa vị trí công việc</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin vị trí công việc của talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa vị trí công việc
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
                  <Target className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin vị trí công việc</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Vị trí công việc */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Vị trí công việc
                </label>
                <div className="relative">
                  <select
                    name="jobRoleLevelId"
                    value={formData.jobRoleLevelId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="0">-- Chọn vị trí công việc --</option>
                    {allJobRoleLevels.map(jobRoleLevel => (
                      <option key={jobRoleLevel.id} value={jobRoleLevel.id}>
                        {jobRoleLevel.name} - Level {jobRoleLevel.level}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.jobRoleLevelId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Mô tả: <span className="font-medium text-neutral-700">
                      {allJobRoleLevels.find(jrl => jrl.id === formData.jobRoleLevelId)?.description || "Không có mô tả"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Số năm kinh nghiệm */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Số năm kinh nghiệm
                  </label>
                  <Input
                    type="number"
                    name="yearsOfExp"
                    value={formData.yearsOfExp}
                    onChange={handleChange}
                    min={0}
                    max={50}
                    placeholder="Nhập số năm kinh nghiệm..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                    required
                  />
                </div>

                {/* Mức lương */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Mức lương/tháng (VNĐ)
                  </label>
                  <Input
                    type="number"
                    name="ratePerMonth"
                    value={formData.ratePerMonth || ""}
                    onChange={handleChange}
                    min={0}
                    placeholder="Nhập mức lương..."
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Để trống nếu chưa xác định mức lương
                  </p>
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
