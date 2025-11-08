import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyActivityService, ApplyActivityType, ApplyActivityStatus } from "../../../services/ApplyActivity";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  FileText, 
  AlertCircle,
  Clock
} from "lucide-react";

export default function ApplyActivityEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [processSteps, setProcessSteps] = useState<ApplyProcessStep[]>([]);
  
  const [form, setForm] = useState({
    applyId: 0,
    processStepId: 0,
    activityType: "" as any,
    scheduledDate: "",
    status: ApplyActivityStatus.Scheduled,
    notes: "",
  });
  const [existingActivities, setExistingActivities] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Fetch activity data
        const activityData = await applyActivityService.getById(Number(id));

        // Convert UTC to local datetime for input
        let localDateTime = "";
        if (activityData.scheduledDate) {
          const utcDate = new Date(activityData.scheduledDate);
          const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
          localDateTime = localDate.toISOString().slice(0, 16);
        }

        setForm({
          applyId: activityData.applyId,
          processStepId: activityData.processStepId,
          activityType: activityData.activityType,
          scheduledDate: localDateTime,
          status: activityData.status,
          notes: activityData.notes || "",
        });

        // Fetch process steps
        const steps = await applyProcessStepService.getAll();
        setProcessSteps(steps);

        // Fetch existing activities of this applyId to disable used steps (excluding current activity's step)
        try {
          const activities = await applyActivityService.getAll({ applyId: activityData.applyId });
          const usedSteps = activities
            .filter(activity => activity.id !== activityData.id && activity.processStepId > 0)
            .map(activity => activity.processStepId);
          setExistingActivities(usedSteps);
        } catch (err) {
          console.error("❌ Lỗi tải danh sách hoạt động để disable bước:", err);
          setExistingActivities([]);
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải thông tin hoạt động!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'processStepId' || name === 'status' ? Number(value) : 
              name === 'activityType' ? (value === "" ? "" : Number(value)) : 
              value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    if (form.activityType === "" || form.activityType === undefined) {
      setError("⚠️ Vui lòng chọn loại hoạt động.");
      setSaving(false);
      return;
    }

    try {
      // Convert local datetime to UTC
      let scheduledDateUTC: string | undefined = undefined;
      if (form.scheduledDate) {
        const localDate = new Date(form.scheduledDate);
        const minAllowed = new Date();
        minAllowed.setDate(minAllowed.getDate() + 1);

        if (localDate.getTime() < minAllowed.getTime()) {
          setError("⚠️ Ngày lên lịch phải từ ngày mai trở đi.");
          setSaving(false);
          return;
        }

        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        scheduledDateUTC = utcDate.toISOString();
      }

      const payload = {
        applyId: form.applyId,
        processStepId: form.processStepId || 0,
        activityType: form.activityType as ApplyActivityType,
        scheduledDate: scheduledDateUTC,
        status: form.status as ApplyActivityStatus,
        notes: form.notes || undefined,
      };

      await applyActivityService.update(Number(id), payload);
      setSuccess(true);
      setTimeout(() => navigate(`/hr/apply-activities/${id}`), 1500);
    } catch (err) {
      console.error("❌ Error updating Apply Activity:", err);
      setError("Không thể cập nhật hoạt động. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/hr/apply-activities/${id}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa hoạt động tuyển dụng</h1>
              <p className="text-neutral-600 mb-4">
                Cập nhật thông tin hoạt động tuyển dụng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Chỉnh sửa hoạt động
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
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Loại hoạt động */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Loại hoạt động <span className="text-red-500">*</span>
                </label>
                <select
                  name="activityType"
                  value={form.activityType}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  required
                >
                  <option value="">-- Chọn loại hoạt động --</option>
                  <option value={ApplyActivityType.Online}>Online - Trực tuyến</option>
                  <option value={ApplyActivityType.Offline}>Offline - Trực tiếp</option>
                </select>
              </div>

              {/* Bước quy trình */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bước quy trình
                </label>
                <select
                  name="processStepId"
                  value={form.processStepId}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="0">-- Không chọn bước --</option>
                  {processSteps.map(step => {
                    const isDisabled = existingActivities.includes(step.id);
                    return (
                      <option
                        key={step.id}
                        value={step.id.toString()}
                        disabled={isDisabled}
                        className={isDisabled ? "text-neutral-400" : ""}
                      >
                        {step.stepOrder}. {step.stepName}
                        {isDisabled ? " (đã chọn)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-100 cursor-not-allowed"
                  disabled
                >
                  <option value="0">Scheduled - Đã lên lịch</option>
                  <option value="1">Completed - Hoàn thành</option>
                  <option value="2">Passed - Đạt</option>
                  <option value="3">Failed - Không đạt</option>
                  <option value="4">NoShow - Không có mặt</option>
                </select>
                <p className="text-sm text-neutral-500 mt-2">
                  ⚠️ Trạng thái không thể chỉnh sửa. Vui lòng sử dụng trang chi tiết để thay đổi trạng thái.
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Clock className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin lịch trình</h2>
              </div>
            </div>
            <div className="p-6">
              {/* Ngày đã lên lịch */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày đã lên lịch
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  min={(() => {
                    const minDate = new Date();
                    minDate.setDate(minDate.getDate() + 1);
                    const tzOffset = minDate.getTimezoneOffset() * 60000;
                    return new Date(minDate.getTime() - tzOffset).toISOString().slice(0, 16);
                  })()}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <FileText className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
              </div>
            </div>
            <div className="p-6">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={6}
                placeholder="Nhập ghi chú về hoạt động này..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
              />
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
                  <AlertCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Cập nhật hoạt động thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/apply-activities/${id}`}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}