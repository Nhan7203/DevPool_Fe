import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyActivityService, type ApplyActivity, ApplyActivityStatus, ApplyActivityType } from "../../../services/ApplyActivity";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { applyService } from "../../../services/Apply";
import { jobRequestService } from "../../../services/JobRequest";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Tag,
  XCircle
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
    [ApplyActivityType.Online]: "Trực tuyến",
    [ApplyActivityType.Offline]: "Trực tiếp"
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

const getActivityStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    [ApplyActivityStatus.Scheduled]: "bg-yellow-100 text-yellow-800",
    [ApplyActivityStatus.Completed]: "bg-blue-100 text-blue-800",
    [ApplyActivityStatus.Passed]: "bg-green-100 text-green-800",
    [ApplyActivityStatus.Failed]: "bg-red-100 text-red-800",
    [ApplyActivityStatus.NoShow]: "bg-orange-100 text-orange-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getActivityTypeColor = (type: number): string => {
  const colors: Record<number, string> = {
    [ApplyActivityType.Online]: "bg-blue-100 text-blue-800",
    [ApplyActivityType.Offline]: "bg-green-100 text-green-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

export default function ApplyActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ApplyActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<ApplyActivity[]>([]);
  const [currentStepOrder, setCurrentStepOrder] = useState<number>(0);
  const [activityIndex, setActivityIndex] = useState<number | null>(null);
  const [processSteps, setProcessSteps] = useState<ApplyProcessStep[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const quickRejectNotes = [
    "Ứng viên không đáp ứng yêu cầu kỹ năng kỹ thuật.",
    "Ứng viên thiếu kinh nghiệm làm việc cần thiết.",
    "Ứng viên không phù hợp với văn hóa công ty.",
    "Kết quả phỏng vấn không đạt yêu cầu.",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const activityData = await applyActivityService.getById(Number(id));

      // Fetch process step name
      let processStepName = "—";
      let stepOrder = 0;
      try {
        const step = await applyProcessStepService.getById(activityData.processStepId);
        processStepName = step.stepName;
        stepOrder = step.stepOrder;
      } catch { }
      setCurrentStepOrder(stepOrder);

      // Fetch application info & related process steps
      let applicationInfo;
      try {
        const app = await applyService.getById(activityData.applyId);
        applicationInfo = {
          id: app.id,
          status: app.status
        };

        let resolvedSteps: ApplyProcessStep[] = [];
        try {
          const jobRequest = await jobRequestService.getById(app.jobRequestId);
          if (jobRequest?.applyProcessTemplateId) {
            const stepsResponse = await applyProcessStepService.getAll({
              templateId: jobRequest.applyProcessTemplateId,
              excludeDeleted: true
            });
            resolvedSteps = Array.isArray(stepsResponse)
              ? stepsResponse
              : Array.isArray(stepsResponse?.data)
                ? stepsResponse.data
                : [];
          }
        } catch (err) {
          console.error("⚠️ Không thể tải quy trình áp dụng cho activity:", err);
        }

        if (!resolvedSteps.length) {
          const fallbackSteps = await applyProcessStepService.getAll();
          resolvedSteps = Array.isArray(fallbackSteps)
            ? fallbackSteps
            : Array.isArray(fallbackSteps?.data)
              ? fallbackSteps.data
              : [];
        }
        setProcessSteps(resolvedSteps);
      } catch { }

      const activityWithExtra: ApplyActivityDetail = {
        ...activityData,
        processStepName,
        applicationInfo
      };

      setActivity(activityWithExtra);

      // Fetch all activities của application này để kiểm tra bước trước
      try {
        const activitiesData = await applyActivityService.getAll({ applyId: activityData.applyId });
        setAllActivities(activitiesData);

        const sortedActivities = [...activitiesData].sort((a, b) => a.id - b.id);
        const index = sortedActivities.findIndex(act => act.id === activityData.id);
        if (index >= 0) {
          setActivityIndex(index + 1);
        } else {
          setActivityIndex(null);
        }
      } catch (err) {
        console.error("❌ Lỗi tải activities:", err);
        setActivityIndex(null);
      }
    } catch (err) {
      console.error("❌ Lỗi tải chi tiết Apply Activity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEdit = () => {
    if (!activity) return;

    const canEdit =
      (activity.applicationInfo?.status === 'Interviewing' ||
        activity.applicationInfo?.status === 'Submitted') &&
      activity.status === ApplyActivityStatus.Scheduled;

    if (!canEdit) {
      alert("⚠️ Chỉ có thể chỉnh sửa hoạt động khi hồ sơ đang xem xét phỏng vấn hoặc đã nộp hồ sơ và hoạt động đang ở trạng thái Đã lên lịch!");
      return;
    }

    navigate(`/hr/apply-activities/edit/${id}`);
  };

  // Kiểm tra xem bước trước đã pass chưa
  const checkCanUpdateStep = async (stepOrder: number): Promise<boolean> => {
    const stepOrders = processSteps.map(step => step.stepOrder);
    const minStepOrder = stepOrders.length > 0 ? Math.min(...stepOrders) : 1;
    if (stepOrder <= minStepOrder) return true;

    let relevantSteps = processSteps;
    if (!relevantSteps.length) {
      const allSteps = await applyProcessStepService.getAll();
      relevantSteps = Array.isArray(allSteps)
        ? allSteps
        : Array.isArray(allSteps?.data)
          ? allSteps.data
          : [];
    }

    const previousStep = relevantSteps.find(step => step.stepOrder === stepOrder - 1);
    if (!previousStep) return true;

    const previousStepActivity = allActivities.find(act => act.processStepId === previousStep.id);
    if (!previousStepActivity) return true;

    return previousStepActivity.status === ApplyActivityStatus.Passed;
  };

  const getAllowedNextStatuses = (currentStatus: number): number[] => {
    if (activity?.applicationInfo?.status === 'Withdrawn') {
      return [];
    }

    // Không cho đổi trạng thái cho tới khi TẤT CẢ các bước của quy trình đã được tạo activity
    try {
      if (processSteps.length > 0) {
        const requiredStepIds = new Set(processSteps.map(s => s.id));
        const createdStepIds = new Set(allActivities.map(a => a.processStepId));
        const allCreated = Array.from(requiredStepIds).every(id => createdStepIds.has(id));
        if (!allCreated) {
          return [];
        }
      }
    } catch {}

    const canUpdateStep = () => {
      if (currentStepOrder <= 1) return true;
      const previousStep = processSteps.find(step => step.stepOrder === currentStepOrder - 1);
      if (!previousStep) return true;
      const previousActivity = allActivities.find(act => act.processStepId === previousStep.id);
      return previousActivity?.status === ApplyActivityStatus.Passed;
    };

    const canUpdate = canUpdateStep();

    switch (currentStatus) {
      case ApplyActivityStatus.Scheduled:
        return canUpdate ? [ApplyActivityStatus.Completed] : [];
      case ApplyActivityStatus.Completed:
        return [ApplyActivityStatus.Failed, ApplyActivityStatus.Passed];
      case ApplyActivityStatus.Failed:
      case ApplyActivityStatus.Passed:
      case ApplyActivityStatus.NoShow:
        return [];
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (newStatus: ApplyActivityStatus) => {
    if (!id || !activity) return;

    // Nếu là trạng thái "Không đạt", hiển thị modal dialog
    if (newStatus === ApplyActivityStatus.Failed) {
      setShowRejectDialog(true);
      setRejectNote("");
      return;
    }

    const confirm = window.confirm(`⚠️ Bạn có chắc muốn thay đổi trạng thái thành "${getActivityStatusLabel(newStatus)}"?`);
    if (!confirm) return;

    await performStatusUpdate(newStatus);
  };

  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setRejectNote("");
  };

  const handleConfirmReject = async () => {
    const note = rejectNote.trim();
    if (!note) {
      alert("⚠️ Vui lòng ghi rõ lý do từ chối");
      return;
    }
    
    await performStatusUpdate(ApplyActivityStatus.Failed, note);
    setShowRejectDialog(false);
    setRejectNote("");
  };

  const performStatusUpdate = async (newStatus: ApplyActivityStatus, notes?: string) => {
    if (!id || !activity) return;

    try {
      setIsUpdatingStatus(true);
      // Kiểm tra xem bước trước đã pass chưa (chỉ khi đổi sang Completed hoặc Passed)
      if (newStatus === ApplyActivityStatus.Completed && currentStepOrder > 1) {
        const canUpdate = await checkCanUpdateStep(currentStepOrder);
        if (!canUpdate) {
          alert("⚠️ Không thể cập nhật! Bước trước chưa đạt. Vui lòng hoàn thành bước trước trước.");
          setIsUpdatingStatus(false);
          return;
        }
      }

      await applyActivityService.updateStatus(Number(id), { 
        status: newStatus,
        ...(notes ? { notes } : {})
      });

      // Nếu status là Completed, tự động cập nhật application status thành Interviewing
      if (newStatus === ApplyActivityStatus.Completed && activity.applicationInfo) {
        try {
          const currentAppStatus = activity.applicationInfo.status;
          // Chỉ cập nhật nếu application chưa ở trạng thái Interviewing hoặc sau đó
          if (currentAppStatus !== 'Interviewing' && currentAppStatus !== 'Hired' && currentAppStatus !== 'Rejected' && currentAppStatus !== 'Withdrawn') {
            await applyService.updateStatus(activity.applicationInfo.id, { status: 'Interviewing' });
          }
        } catch (err) {
          console.error("❌ Lỗi cập nhật trạng thái application:", err);
        }
      }

      // Kiểm tra nếu tất cả các bước trong quy trình của JobRequest đều pass, tự động chuyển application sang Hired
      if (newStatus === ApplyActivityStatus.Passed && activity.applicationInfo) {
        try {
          // Reload activities để lấy dữ liệu mới nhất
          const activitiesData = await applyActivityService.getAll({ applyId: activity.applyId });
          setAllActivities(activitiesData);

          // Lấy danh sách bước thuộc template của JobRequest liên quan
          let relevantSteps: ApplyProcessStep[] = [];
          try {
            const app = await applyService.getById(activity.applyId);
            const jobReq = await jobRequestService.getById(app.jobRequestId);
            if (jobReq?.applyProcessTemplateId) {
              const stepsResponse = await applyProcessStepService.getAll({
                templateId: jobReq.applyProcessTemplateId,
                excludeDeleted: true
              });
              relevantSteps = Array.isArray(stepsResponse)
                ? stepsResponse
                : Array.isArray(stepsResponse?.data)
                  ? stepsResponse.data
                  : [];
            }
          } catch {
            relevantSteps = [];
          }

          // Fallback: nếu không lấy được theo template, dùng processSteps đã có trong state (nếu có)
          if (!relevantSteps.length && processSteps.length) {
            relevantSteps = processSteps;
          }

          // Nếu vẫn không có danh sách bước, không tự động chuyển Hired
          if (!relevantSteps.length) {
            await fetchData();
            return;
          }

          // Kiểm tra tất cả bước trong quy trình đều đã có activity và ở trạng thái Passed
          let allStepsPassed = true;
          for (const step of relevantSteps) {
            const stepActivity = activitiesData.find(act => act.processStepId === step.id);
            if (!stepActivity || stepActivity.status !== ApplyActivityStatus.Passed) {
              allStepsPassed = false;
              break;
            }
          }

          // Nếu tất cả bước đều pass và application đang ở Interviewing, chuyển sang Hired
          if (allStepsPassed && activity.applicationInfo.status === 'Interviewing') {
            await applyService.updateStatus(activity.applicationInfo.id, { status: 'Hired' });

            alert(`✅ Đã cập nhật trạng thái thành công!\n🎉 Tất cả các bước đã hoàn thành, tự động chuyển application sang trạng thái Hired (Đã tuyển)!`);
            // Reload dữ liệu để cập nhật UI
            await fetchData();
            return;
          }
        } catch (err) {
          console.error("❌ Lỗi kiểm tra tất cả bước:", err);
        }
      }

      // Reload dữ liệu để cập nhật UI, đặc biệt quan trọng cho bước đầu tiên
      await fetchData();
      alert(`✅ Đã cập nhật trạng thái thành công!`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái!");
    } finally {
      setIsUpdatingStatus(false);
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
    : "—";

  const canModifyActivity = activity.status === ApplyActivityStatus.Scheduled;

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hoạt động {activityIndex ? `#${activityIndex}` : `#${activity.id}`}
              </h1>
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
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                disabled={!canModifyActivity}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${!canModifyActivity
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                  }`}
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
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
                let message = "Không thể cập nhật trạng thái từ trạng thái hiện tại";
                if (activity.applicationInfo?.status === 'Withdrawn') {
                  message = "Không thể cập nhật trạng thái vì ứng viên đã rút khỏi quy trình tuyển dụng";
                } else if (activity.status === ApplyActivityStatus.Scheduled && currentStepOrder > 1) {
                  message = "⚠️ Vui lòng hoàn thành bước trước (đạt trạng thái Đạt)";
                }

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
                      disabled={isUpdatingStatus}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Hoàn thành
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.Passed) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Passed)}
                      disabled={isUpdatingStatus}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Đạt
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.Failed) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.Failed)}
                      disabled={isUpdatingStatus}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Không đạt
                    </button>
                  )}
                  {allowedStatuses.includes(ApplyActivityStatus.NoShow) && (
                    <button
                      onClick={() => handleStatusUpdate(ApplyActivityStatus.NoShow)}
                      disabled={isUpdatingStatus}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Không có mặt
                    </button>
                  )}
                </div>
              );
            })()}
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
              {activity.processStepName && (
                <InfoItem
                  label="Bước quy trình"
                  value={activity.processStepName}
                  icon={<Briefcase className="w-4 h-4" />}
                />
              )}
              <InfoItem
                label="Ngày lên lịch"
                value={formattedDate}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
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

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isUpdatingStatus) {
                handleCancelReject();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ghi rõ lý do từ chối</h3>
                <button
                  onClick={handleCancelReject}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Đóng"
                  disabled={isUpdatingStatus}
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <p className="text-sm text-neutral-600">
                  Vui lòng nhập lý do để ứng viên và các bộ phận liên quan dễ dàng xử lý và điều chỉnh.
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickRejectNotes.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setRejectNote((prev) => (prev ? `${prev}\n${note}` : note))}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {note}
                    </button>
                  ))}
                </div>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                  disabled={isUpdatingStatus}
                />
              </div>
              <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelReject}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingStatus ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
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