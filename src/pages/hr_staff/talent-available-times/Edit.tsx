import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentAvailableTimeService, type TalentAvailableTimeCreate } from "../../../services/TalentAvailableTime";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  Clock,
  AlertCircle
} from "lucide-react";

export default function TalentAvailableTimeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [talentId, setTalentId] = useState<number>(0);
  const [formData, setFormData] = useState<TalentAvailableTimeCreate>({
    talentId: 0,
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);

  // 🧭 Load dữ liệu Talent Available Time
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await talentAvailableTimeService.getById(Number(id));

        // Convert ISO datetime to datetime-local format
        const formatDateTime = (isoString: string) => {
          const date = new Date(isoString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          talentId: data.talentId,
          startTime: formatDateTime(data.startTime),
          endTime: data.endTime ? formatDateTime(data.endTime) : "",
          notes: data.notes,
        });
        setTalentId(data.talentId);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin thời gian có sẵn!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Validation functions
  const validateStartTime = (dateTime: string): boolean => {
    if (!dateTime) return false;
    const startDateTime = new Date(dateTime);
    const now = new Date();
    
    // Không được quá xa trong quá khứ (ví dụ: không quá 1 năm trước)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    if (startDateTime < oneYearAgo) return false;
    
    // Không được quá xa trong tương lai (ví dụ: không quá 2 năm sau)
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(now.getFullYear() + 2);
    
    if (startDateTime > twoYearsLater) return false;
    
    return true;
  };

  const validateEndTime = (startDateTime: string, endDateTime: string | undefined): boolean => {
    if (!endDateTime) return true; // End time is optional
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    
    // End time phải sau start time
    if (end <= start) return false;
    
    // End time không được quá xa trong tương lai (ví dụ: không quá 2 năm sau)
    const now = new Date();
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(now.getFullYear() + 2);
    
    if (end > twoYearsLater) return false;
    
    return true;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✍️ Cập nhật dữ liệu form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    
    // Validate startTime
    if (name === 'startTime') {
      if (value && !validateStartTime(value)) {
        newErrors.startTime = 'Thời gian bắt đầu không hợp lệ (phải trong khoảng 1 năm trước đến 2 năm sau)';
      } else {
        delete newErrors.startTime;
      }
      // Re-validate endTime if startTime changes
      if (formData.endTime && value) {
        if (!validateEndTime(value, formData.endTime)) {
          newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu và không quá 2 năm sau';
        } else {
          delete newErrors.endTime;
        }
      }
    }
    
    // Validate endTime
    if (name === 'endTime') {
      if (value && formData.startTime) {
        if (!validateEndTime(formData.startTime, value)) {
          newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu và không quá 2 năm sau';
        } else {
          delete newErrors.endTime;
        }
      } else if (value && !formData.startTime) {
        newErrors.endTime = 'Vui lòng chọn thời gian bắt đầu trước';
      } else {
        delete newErrors.endTime;
      }
    }
    
    setErrors(newErrors);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Validate talentId
    if (!talentId || talentId === 0) {
      alert("⚠️ Không tìm thấy thông tin talent. Vui lòng quay lại trang trước.");
      return;
    }

    if (!formData.startTime) {
      alert("⚠️ Vui lòng chọn thời gian bắt đầu!");
      return;
    }

    // Validate startTime hợp lý
    if (!validateStartTime(formData.startTime)) {
      alert("⚠️ Thời gian bắt đầu không hợp lệ (phải trong khoảng 1 năm trước đến 2 năm sau)!");
      return;
    }

    // Validate endTime hợp lý
    if (formData.endTime && !validateEndTime(formData.startTime, formData.endTime)) {
      alert("⚠️ Thời gian kết thúc phải sau thời gian bắt đầu và không quá 2 năm sau!");
      return;
    }

    try {
      // Convert datetime-local to UTC ISO string for PostgreSQL
      const updateData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
      };
      
      console.log("Payload gửi đi:", updateData);
      await talentAvailableTimeService.update(Number(id), updateData);

      alert("✅ Cập nhật thời gian có sẵn thành công!");
      navigate(`/hr/developers/${talentId}`);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật thời gian có sẵn!");
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa thời gian có sẵn</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin thời gian có sẵn của talent
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa thời gian có sẵn
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
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin thời gian có sẵn</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thời gian bắt đầu */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className={`w-full focus:ring-primary-500 rounded-xl ${
                      errors.startTime ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>
                  )}
                  {!errors.startTime && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Chọn ngày và giờ bắt đầu có sẵn (trong khoảng 1 năm trước đến 2 năm sau)
                    </p>
                  )}
                </div>

                {/* Thời gian kết thúc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Thời gian kết thúc (tùy chọn)
                  </label>
                  <Input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`w-full focus:ring-primary-500 rounded-xl ${
                      errors.endTime ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>
                  )}
                  {!errors.endTime && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Để trống nếu không có thời gian kết thúc cụ thể
                    </p>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về thời gian có sẵn, điều kiện đặc biệt..."
                  rows={4}
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
