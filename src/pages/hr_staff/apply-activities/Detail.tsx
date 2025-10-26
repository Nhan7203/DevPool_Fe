import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyActivityService, type ApplyActivity, ApplyActivityStatus } from "../../../services/ApplyActivity";
import { applyProcessStepService } from "../../../services/ApplyProcessStep";
import { applyService } from "../../../services/Apply";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Briefcase,
  Tag
} from "lucide-react";

interface ApplyActivityDetail extends ApplyActivity {
  processStepName?: string;
  applicationInfo?: {
    id: number;
    status: string;
  };
}

const getActivityTypeLabel = (type: number): string => {
  const labels: Record<number, string> = {
    0: "Phỏng vấn",
    1: "Kiểm tra",
    2: "Cuộc họp",
    3: "Đánh giá"
  };
  return labels[type] || `Loại ${type}`;
};

const getActivityStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    0: "Đã lên lịch",
    1: "Hoàn thành",
    2: "Đạt",
    3: "Không đạt",
    4: "Đã chấp nhận",
    5: "Không có mặt"
  };
  return labels[status] || `Trạng thái ${status}`;
};

const getActivityTypeColor = (type: number): string => {
  const colors: Record<number, string> = {
    0: "bg-blue-100 text-blue-800",
    1: "bg-yellow-100 text-yellow-800",
    2: "bg-green-100 text-green-800",
    3: "bg-purple-100 text-purple-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const getActivityStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    0: "bg-gray-100 text-gray-800",
    1: "bg-blue-100 text-blue-800",
    2: "bg-green-100 text-green-800",
    3: "bg-red-100 text-red-800",
    4: "bg-yellow-100 text-yellow-800",
    5: "bg-orange-100 text-orange-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function ApplyActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ApplyActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const activityData = await applyActivityService.getById(Number(id));
        
        // Fetch process step name
        let processStepName = "—";
        try {
          const step = await applyProcessStepService.getById(activityData.processStepId);
          processStepName = step.stepName;
        } catch {}

        // Fetch application info
        let applicationInfo;
        try {
          const app = await applyService.getById(activityData.applyId);
          applicationInfo = {
            id: app.id,
            status: app.status
          };
        } catch {}

        const activityWithExtra: ApplyActivityDetail = {
          ...activityData,
          processStepName,
          applicationInfo
        };

        setActivity(activityWithExtra);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Apply Activity:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (activity?.applicationInfo?.status !== 'InterviewScheduled' && activity?.applicationInfo?.status !== 'Submitted') {
      alert("⚠️ Chỉ có thể xóa hoạt động khi đã lên lịch phỏng vấn!");
      return;
    }
    
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa hoạt động này?");
    if (!confirm) return;

    try {
      await applyActivityService.delete(Number(id));
      alert("✅ Đã xóa hoạt động thành công!");
      navigate(`/hr/applications/${activity?.applyId}`);
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa hoạt động!");
    }
  };

  const handleEdit = () => {
    if (activity?.applicationInfo?.status !== 'InterviewScheduled' && activity?.applicationInfo?.status !== 'Submitted') {
      alert("⚠️ Chỉ có thể chỉnh sửa hoạt động khi đã lên lịch phỏng vấn!");
      return;
    }
    navigate(`/hr/apply-activities/edit/${id}`);
  };

  const getAllowedNextStatuses = (currentStatus: number): number[] => {
    // Nếu application status là Withdrawn thì không cho cập nhật
    if (activity?.applicationInfo?.status === 'Withdrawn') {
      return [];
    }
    
    switch (currentStatus) {
      case ApplyActivityStatus.Scheduled: // 0
        return [ApplyActivityStatus.Completed]; // → 1
      case ApplyActivityStatus.Completed: // 1
        return [ApplyActivityStatus.Failed, ApplyActivityStatus.Passed]; // → 3, 2
      case ApplyActivityStatus.Failed: // 3
        return []; // Không cho cập nhật
      case ApplyActivityStatus.Passed: // 2
        return [ApplyActivityStatus.Approved]; // → 4
      case ApplyActivityStatus.Approved: // 4
        return []; // Không cho cập nhật
      case ApplyActivityStatus.NoShow: // 5
        return []; // Không cho cập nhật
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (newStatus: ApplyActivityStatus) => {
    if (!id || !activity) return;

    const confirm = window.confirm(`⚠️ Bạn có chắc muốn thay đổi trạng thái thành "${getActivityStatusLabel(newStatus)}"?`);
    if (!confirm) return;

    try {
      await applyActivityService.updateStatus(Number(id), { status: newStatus });
      setActivity({ ...activity, status: newStatus });
      
      // Nếu status là Completed, tự động cập nhật application status thành Interviewing
      if (newStatus === ApplyActivityStatus.Completed && activity.applicationInfo) {
        try {
          const currentAppStatus = activity.applicationInfo.status;
          // Chỉ cập nhật nếu application chưa ở trạng thái Interviewing hoặc sau đó
          if (currentAppStatus !== 'Interviewing' && currentAppStatus !== 'Offered' && currentAppStatus !== 'Hired' && currentAppStatus !== 'Rejected' && currentAppStatus !== 'Withdrawn') {
            await applyService.updateStatus(activity.applicationInfo.id, { status: 'Interviewing' });
            
            // Cập nhật applicationInfo trong state
            if (activity.applicationInfo) {
              setActivity({
                ...activity,
                applicationInfo: {
                  ...activity.applicationInfo,
                  status: 'Interviewing'
                }
              });
            }
          }
        } catch (err) {
          console.error("❌ Lỗi cập nhật trạng thái application:", err);
        }
      }
      
      alert(`✅ Đã cập nhật trạng thái thành công!`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu hoạt động...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy hoạt động</p>
            <Link 
              to="/hr/applications"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách hồ sơ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = activity.scheduledDate 
    ? new Date(activity.scheduledDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/hr/applications/${activity.applyId}`}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết hồ sơ</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoạt động #{activity.id}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết hoạt động tuyển dụng
              </p>
              
              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getActivityTypeColor(activity.activityType)}`}>
                  {getActivityTypeLabel(activity.activityType)}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getActivityStatusColor(activity.status)}`}>
                  {getActivityStatusLabel(activity.status)}
                </span>
                {activity.applicationInfo && (
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    activity.applicationInfo.status === 'InterviewScheduled' || activity.applicationInfo.status === 'Submitted'
                      ? 'bg-green-100 text-green-800' 
                      : activity.applicationInfo.status === 'Withdrawn'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.applicationInfo.status === 'InterviewScheduled' || activity.applicationInfo.status === 'Submitted'
                      ? '✓ Đã lên lịch' 
                      : activity.applicationInfo.status === 'Withdrawn'
                      ? '✗ Đã rút' 
                      : '⏳ ' + activity.applicationInfo.status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                disabled={activity.applicationInfo?.status !== 'InterviewScheduled' && activity.applicationInfo?.status !== 'Submitted'}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                  activity.applicationInfo?.status !== 'InterviewScheduled' && activity.applicationInfo?.status !== 'Submitted'
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                }`}
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                disabled={activity.applicationInfo?.status !== 'InterviewScheduled' && activity.applicationInfo?.status !== 'Submitted'}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                  activity.applicationInfo?.status !== 'InterviewScheduled' && activity.applicationInfo?.status !== 'Submitted'
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                }`}
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin chung</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                label="Loại hoạt động" 
                value={getActivityTypeLabel(activity.activityType)} 
                icon={<Tag className="w-4 h-4" />}
              />
              <InfoItem 
                label="Trạng thái" 
                value={getActivityStatusLabel(activity.status)} 
                icon={<CheckCircle className="w-4 h-4" />}
              />
              {activity.processStepName && (
                <InfoItem 
                  label="Bước quy trình" 
                  value={activity.processStepName} 
                  icon={<Briefcase className="w-4 h-4" />}
                />
              )}
              {formattedDate && (
                <InfoItem 
                  label="Ngày lên lịch" 
                  value={formattedDate} 
                  icon={<Calendar className="w-4 h-4" />}
                />
              )}
            </div>
          </div>
        </div>

        {/* Thay đổi trạng thái */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Tag className="w-5 h-5 text-accent-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thay đổi trạng thái</h2>
            </div>
          </div>
          <div className="p-6">
            {(() => {
              const allowedStatuses = getAllowedNextStatuses(activity.status);
              
              if (allowedStatuses.length === 0) {
                const message = activity.applicationInfo?.status === 'Withdrawn'
                  ? "Không thể cập nhật trạng thái vì ứng viên đã rút khỏi quy trình tuyển dụng"
                  : "Không thể cập nhật trạng thái từ trạng thái hiện tại";
                
                return (
                  <div className="text-center py-4">
                    <p className="text-neutral-500 font-medium">{message}</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-wrap gap-3">
                  {allowedStatuses.includes(ApplyActivityStatus.Completed) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Completed)}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Hoàn thành
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.Passed) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Passed)}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Đạt
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.Failed) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Failed)}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    >
                      <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Không đạt
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.Approved) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Approved)}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Đã chấp nhận
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Ghi chú */}
        {activity.notes && (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-secondary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {activity.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
        {value || "—"}
      </p>
    </div>
  );
}

