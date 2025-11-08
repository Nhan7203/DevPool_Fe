import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentWorkExperienceService, type TalentWorkExperienceCreate } from "../../../services/TalentWorkExperience";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Workflow, 
  Building2, 
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";

export default function TalentWorkExperienceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [talentCVs, setTalentCVs] = useState<TalentCV[]>([]);
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentWorkExperienceCreate>({
    talentId: 0,
    talentCVId: 0,
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent Work Experience
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentWorkExperienceService.getById(Number(id));

        setFormData({
          talentId: data.talentId,
          talentCVId: data.talentCVId,
          company: data.company,
          position: data.position,
          startDate: data.startDate.split('T')[0], // Convert to date format
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          description: data.description,
        });
        setTalentId(data.talentId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin kinh nghiệm làm việc!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🧭 Load danh sách CVs của Talent
  useEffect(() => {
    const fetchCVs = async () => {
      try {
        if (talentId > 0) {
          const cvs = await talentCVService.getAll({ talentId, excludeDeleted: true });
          setTalentCVs(cvs);
        }
      } catch (err) {
        console.error("❌ Lỗi tải danh sách CV:", err);
      }
    };
    fetchCVs();
  }, [talentId]);

  // Validate start date similar to talents/Create.tsx
  const validateStartDate = (date: string): boolean => {
    if (!date) return false;
    const startDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (startDate > today) return false;
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    return startDate >= hundredYearsAgo;
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // realtime validation for dates
    if (name === 'startDate') {
      const newErrors = { ...fieldErrors };
      if (value && !validateStartDate(value)) {
        newErrors.startDate = 'Ngày bắt đầu không hợp lệ (không sau hiện tại, không quá 100 năm trước)';
      } else {
        delete newErrors.startDate;
        if (formData.endDate) {
          if (new Date(formData.endDate) <= new Date(value)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
          } else {
            delete newErrors.endDate;
          }
        }
      }
      setFieldErrors(newErrors);
    }

    if (name === 'endDate') {
      const newErrors = { ...fieldErrors };
      if (value && formData.startDate) {
        if (new Date(value) <= new Date(formData.startDate)) {
          newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        } else {
          delete newErrors.endDate;
        }
      } else {
        delete newErrors.endDate;
      }
      setFieldErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "talentCVId" ? Number(value) : value,
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

    if (!formData.talentCVId || formData.talentCVId === 0) {
      alert("⚠️ Vui lòng chọn CV trước khi lưu!");
      return;
    }

    if (!formData.company.trim()) {
      alert("⚠️ Vui lòng nhập tên công ty!");
      return;
    }

    if (!formData.position.trim()) {
      alert("⚠️ Vui lòng nhập vị trí làm việc!");
      return;
    }

    if (!formData.startDate) {
      alert("⚠️ Vui lòng chọn ngày bắt đầu!");
      return;
    }
    if (!validateStartDate(formData.startDate)) {
      alert("⚠️ Ngày bắt đầu không hợp lệ (không sau hiện tại, không quá 100 năm trước)!");
      return;
    }

    if (!formData.description.trim()) {
      alert("⚠️ Vui lòng nhập mô tả công việc!");
      return;
    }

    // Validate date logic
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert("⚠️ Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    try {
      // Convert date strings to UTC ISO strings for PostgreSQL
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };
      
      console.log("Payload gửi đi:", updateData);
      await talentWorkExperienceService.update(Number(id), updateData);

      alert("✅ Cập nhật kinh nghiệm làm việc thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật kinh nghiệm làm việc!");
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa kinh nghiệm làm việc</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin kinh nghiệm làm việc của talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa kinh nghiệm làm việc
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
                  <Workflow className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin kinh nghiệm làm việc</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* CV của Talent */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV của Talent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="talentCVId"
                    value={formData.talentCVId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="0">-- Chọn CV --</option>
                    {talentCVs.map(cv => (
                      <option key={cv.id} value={cv.id}>{cv.versionName}</option>
                    ))}
                  </select>
                </div>
                {formData.talentCVId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Tóm tắt: <span className="font-medium text-neutral-700">
                      {talentCVs.find(cv => cv.id === formData.talentCVId)?.summary || "Không có tóm tắt"}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Công ty */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Công ty <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="VD: Google, Microsoft, Facebook..."
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>

                {/* Vị trí */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="VD: Software Engineer, Product Manager..."
                    required
                    className="w-full border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className={`w-full focus:ring-primary-500 rounded-xl ${
                      fieldErrors.startDate ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.startDate}</p>
                  )}
                </div>

                {/* Ngày kết thúc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày kết thúc (tùy chọn)
                  </label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full focus:ring-primary-500 rounded-xl ${
                      fieldErrors.endDate ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.endDate}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    Để trống nếu vẫn đang làm việc
                  </p>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm và thành tựu..."
                  rows={4}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                />
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
