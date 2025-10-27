import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { applyService, type Apply } from "../../../services/Apply";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { userService } from "../../../services/User";
import { applyActivityService, type ApplyActivity, ApplyActivityType, ApplyActivityStatus } from "../../../services/ApplyActivity";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User as UserIcon,
  Calendar,
  Briefcase,
  Eye,
  AlertCircle,
  X,
  Send
} from "lucide-react";

const statusLabels: Record<string, string> = {
  "Rejected": "Đã từ chối",
  "Interview": "Phỏng vấn",
  "InterviewScheduled": "Đã lên lịch phỏng vấn",
  "Submitted": "Đã lên lịch phỏng vấn",
  "Interviewing": "Đang phỏng vấn",
  "Hired": "Đã tuyển",
  "Withdrawn": "Đã rút",
  "Offered": "Đã đề xuất"
};

const getActivityTypeLabel = (type: number): string => {
  const labels: Record<number, string> = {
    0: "Phỏng vấn",   // Interview
    1: "Kiểm tra",     // Test
    2: "Cuộc họp",     // Meeting
    3: "Đánh giá"      // Review
  };
  return labels[type] || `Loại ${type}`;
};

const getActivityStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    0: "Đã lên lịch",   // Scheduled
    1: "Hoàn thành",    // Completed
    2: "Đạt",           // Passed
    3: "Không đạt",     // Failed
    4: "Đã duyệt",  // Approved
    5: "Không có mặt"    // NoShow
  };
  return labels[status] || `Trạng thái ${status}`;
};


export default function TalentCVApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Apply | null>(null);
  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [talentCV, setTalentCV] = useState<TalentCV | null>(null);
  const [submitterName, setSubmitterName] = useState<string>("");
  const [activities, setActivities] = useState<ApplyActivity[]>([]);
  const [processSteps, setProcessSteps] = useState<Record<number, ApplyProcessStep>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch application
        const appData = await applyService.getById(Number(id));
        setApplication(appData);

        // Fetch related data in parallel
        const [jobReqData, cvData] = await Promise.all([
          jobRequestService.getById(appData.jobRequestId),
          talentCVService.getById(appData.cvId)
        ]);

        setJobRequest(jobReqData);
        setTalentCV(cvData);

        // Fetch submitter name
        try {
          const user = await userService.getById(appData.submittedBy);
          setSubmitterName(user.fullName);
        } catch {
          setSubmitterName(appData.submittedBy);
        }

        // Fetch activities
        try {
          const activitiesData = await applyActivityService.getAll({ applyId: appData.id });
          setActivities(activitiesData);
          
          // Fetch process steps for activities
          const stepIds = [...new Set(activitiesData.map(a => a.processStepId).filter(id => id > 0))];
          if (stepIds.length > 0) {
            const stepPromises = stepIds.map(id => applyProcessStepService.getById(id).catch(() => null));
            const steps = await Promise.all(stepPromises);
            
            const stepsMap: Record<number, ApplyProcessStep> = {};
            steps.forEach(step => {
              if (step) {
                stepsMap[step.id] = step;
              }
            });
            setProcessSteps(stepsMap);
          }
        } catch (err) {
          console.error("❌ Lỗi tải activities:", err);
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Application:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id || !application) return;

    try {
      await applyService.updateStatus(Number(id), { status: newStatus });
      setApplication({ ...application, status: newStatus });
      
      // Nếu là Withdrawn, cập nhật tất cả activities thành NoShow
      if (newStatus === 'Withdrawn') {
        try {
          const activitiesToUpdate = activities.filter(
            activity => activity.status !== ApplyActivityStatus.NoShow
          );
          
          if (activitiesToUpdate.length > 0) {
            await Promise.all(
              activitiesToUpdate.map(activity =>
                applyActivityService.updateStatus(activity.id, { status: ApplyActivityStatus.NoShow })
              )
            );
            
            // Cập nhật state của activities
            setActivities(activities.map(activity => ({
              ...activity,
              status: ApplyActivityStatus.NoShow
            })));
          }
        } catch (err) {
          console.error("❌ Lỗi cập nhật trạng thái activities:", err);
        }
      }
      
      alert(`✅ Đã cập nhật trạng thái thành công!`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  // Helper functions to check activity statuses
  const hasCompletedActivity = () => {
    return activities.some(activity => activity.status === ApplyActivityStatus.Completed);
  };

  const hasFailedActivity = () => {
    return activities.some(activity => activity.status === ApplyActivityStatus.Failed);
  };

  const hasPassedActivity = () => {
    return activities.some(activity => activity.status === ApplyActivityStatus.Passed);
  };

  // const hasApprovedActivity = () => {
  //   return activities.some(activity_result => activity.status === ApplyActivityStatus.Approved);
  // };

  interface StatusConfig {
    label: string;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
  }

  const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
      "Rejected": {
        label: "Đã từ chối",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        bgColor: "bg-red-50"
      },
      "Interview": {
        label: "Phỏng vấn",
        color: "bg-blue-100 text-blue-800",
        icon: <Calendar className="w-4 h-4" />,
        bgColor: "bg-blue-50"
      },
      "InterviewScheduled": {
        label: "Đã lên lịch phỏng vấn",
        color: "bg-indigo-100 text-indigo-800",
        icon: <Calendar className="w-4 h-4" />,
        bgColor: "bg-indigo-50"
      },
      "Submitted": {
        label: "Đã lên lịch phỏng vấn",
        color: "bg-indigo-100 text-indigo-800",
        icon: <Calendar className="w-4 h-4" />,
        bgColor: "bg-indigo-50"
      },
      "Interviewing": {
        label: "Đang xem xét phỏng vấn",
        color: "bg-cyan-100 text-cyan-800",
        icon: <Calendar className="w-4 h-4" />,
        bgColor: "bg-cyan-50"
      },
      "Hired": {
        label: "Đã tuyển",
        color: "bg-purple-100 text-purple-800",
        icon: <CheckCircle className="w-4 h-4" />,
        bgColor: "bg-purple-50"
      },
      "Withdrawn": {
        label: "Đã rút",
        color: "bg-gray-100 text-gray-800",
        icon: <X className="w-4 h-4" />,
        bgColor: "bg-gray-50"
      },
      "Offered": {
        label: "Đã đề xuất",
        color: "bg-teal-100 text-teal-800",
        icon: <Send className="w-4 h-4" />,
        bgColor: "bg-teal-50"
      }
    };

    return configs[status] || configs["Rejected"];
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu hồ sơ ứng tuyển...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy hồ sơ ứng tuyển</p>
            <Link 
              to="/hr/applications"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/hr/applications"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ ứng tuyển #{application.id}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết hồ sơ ứng viên
              </p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Nếu đang ở trạng thái Interviewing, hiển thị các nút chọn trạng thái tiếp theo */}
              {application.status === 'Interviewing' ? (
                <>
                  {hasFailedActivity() && (
              <Button
                onClick={() => handleStatusUpdate('Rejected')}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Từ chối
              </Button>
                  )}
                  {hasPassedActivity() && (
                    <Button
                      onClick={() => handleStatusUpdate('Offered')}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                    >
                      <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Đề xuất
                    </Button>
                  )}
                  <Button
                    onClick={() => handleStatusUpdate('Withdrawn')}
                    className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Rút lui
                  </Button>
                </>
              ) : application.status === 'Offered' ? (
                <>
                  <Button
                    onClick={() => handleStatusUpdate('Hired')}
                    className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Đã tuyển
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('Withdrawn')}
                    className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Rút lui
                  </Button>
                </>
              ) : (
                <>
                  {hasCompletedActivity() && (
                    <Button
                      onClick={() => handleStatusUpdate('Interviewing')}
                      disabled={application.status === 'Interviewing'}
                      className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                        application.status === 'Interviewing'
                          ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
                      }`}
                    >
                      <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Đang xem xét phỏng vấn
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin hồ sơ */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin hồ sơ</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                label="Người nộp" 
                value={submitterName || application.submittedBy} 
                icon={<UserIcon className="w-4 h-4" />}
              />
              <InfoItem 
                label="Ngày nộp" 
                value={new Date(application.createdAt).toLocaleString('vi-VN')} 
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem 
                label="Trạng thái" 
                value={statusLabels[application.status] ?? application.status} 
                icon={<AlertCircle className="w-4 h-4" />}
              />
              {application.note && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <p className="text-neutral-500 text-sm font-medium">Ghi chú</p>
                  </div>
                  <p className="text-gray-900 font-semibold">{application.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Yêu cầu tuyển dụng */}
        {jobRequest && (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Yêu cầu tuyển dụng</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Tiêu đề" 
                  value={jobRequest.title} 
                  icon={<FileText className="w-4 h-4" />}
                />
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <p className="text-neutral-500 text-sm font-medium">Mô tả</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{jobRequest.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin CV */}
        {talentCV && (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <FileText className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin CV</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Phiên bản" 
                  value={talentCV.versionName} 
                  icon={<FileText className="w-4 h-4" />}
                />
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <p className="text-neutral-500 text-sm font-medium">Tóm tắt</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{talentCV.summary}</p>
                </div>
                {talentCV.cvFileUrl && (
                  <div className="md:col-span-2">
                    <Button
                      onClick={() => window.open(talentCV.cvFileUrl, '_blank')}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Xem CV
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activities */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Hoạt động tuyển dụng</h2>
              </div>
              <Button
                onClick={() => navigate(`/hr/apply-activities/create?applyId=${application.id}`)}
                disabled={application.status === 'Interviewing' || application.status === 'Offered' || (application.status !== 'InterviewScheduled' && application.status !== 'Submitted')}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  application.status === 'Interviewing' || application.status === 'Offered' || (application.status !== 'InterviewScheduled' && application.status !== 'Submitted')
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                }`}
              >
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Tạo hoạt động
              </Button>
            </div>
          </div>
          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-lg font-medium">Chưa có hoạt động nào</p>
                <p className="text-neutral-400 text-sm mt-1">Tạo hoạt động mới để theo dõi quy trình</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...activities].sort((a, b) => {
                  // Sắp xếp theo ngày: nếu không có scheduledDate thì xếp xuống cuối
                  if (!a.scheduledDate && !b.scheduledDate) return 0;
                  if (!a.scheduledDate) return 1;
                  if (!b.scheduledDate) return -1;
                  return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
                }).map((activity) => {
                  const processStep = processSteps[activity.processStepId];
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
                    <Link 
                      key={activity.id} 
                      to={`/hr/apply-activities/${activity.id}`}
                      className="block p-5 border border-neutral-200 rounded-xl hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-neutral-50 hover:shadow-medium"
                    >
                      {/* Header với badges */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          activity.activityType === ApplyActivityType.Interview ? 'bg-blue-100 text-blue-800' :
                          activity.activityType === ApplyActivityType.Test ? 'bg-yellow-100 text-yellow-800' :
                          activity.activityType === ApplyActivityType.Meeting ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                            {getActivityTypeLabel(activity.activityType)}
                        </span>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          activity.status === ApplyActivityStatus.Scheduled ? 'bg-gray-100 text-gray-800' :
                          activity.status === ApplyActivityStatus.Completed ? 'bg-blue-100 text-blue-800' :
                          activity.status === ApplyActivityStatus.Passed ? 'bg-green-100 text-green-800' :
                          activity.status === ApplyActivityStatus.Failed ? 'bg-red-100 text-red-800' :
                          activity.status === ApplyActivityStatus.NoShow ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                            {getActivityStatusLabel(activity.status)}
                          </span>
                        </div>
                        {formattedDate && (
                          <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4 text-neutral-500" />
                            <span className="text-xs text-neutral-700 font-medium">
                              {formattedDate}
                        </span>
                          </div>
                        )}
                      </div>

                      {/* Thông tin chi tiết */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {processStep && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                            <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-blue-600 font-medium mb-0.5">Bước quy trình</p>
                              <p className="text-sm text-blue-900 font-semibold">{processStep.stepName}</p>
                            </div>
                          </div>
                      )}
                    </div>

                      {/* Ghi chú */}
                    {activity.notes && (
                        <div className="mt-3 pt-3 border-t border-neutral-200">
                          <p className="text-xs text-neutral-500 font-semibold mb-1.5 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Ghi chú
                          </p>
                          <p className="text-sm text-neutral-700 leading-relaxed">{activity.notes}</p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
