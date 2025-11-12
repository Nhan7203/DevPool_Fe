import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import {
  talentApplicationService,
  type TalentApplicationDetailed,
} from "../../../services/TalentApplication";
import { jobRequestService } from "../../../services/JobRequest";
import {
  applyActivityService,
  type ApplyActivity,
  ApplyActivityStatus,
  ApplyActivityType,
} from "../../../services/ApplyActivity";
import { applyProcessStepService, type ApplyProcessStep } from "../../../services/ApplyProcessStep";
import { locationService } from "../../../services/location";
import { WorkingMode as WorkingModeEnum } from "../../../types/WorkingMode";
import {
  ArrowLeft,
  FileText,
  Briefcase,
  User as UserIcon,
  Calendar,
  Mail,
  Phone,
  Building2,
  MapPin,
  History,
  AlertCircle,
} from "lucide-react";
import { projectService } from "../../../services/Project";
import { clientCompanyService } from "../../../services/ClientCompany";
import { jobRoleLevelService } from "../../../services/JobRoleLevel";
import { applyProcessTemplateService } from "../../../services/ApplyProcessTemplate";
import { clientCompanyCVTemplateService } from "../../../services/ClientCompanyTemplate";

interface SalesActivity extends ApplyActivity {
  processStepName?: string;
}

const statusLabels: Record<string, string> = {
  Submitted: "Đã nộp hồ sơ",
  Interviewing: "Đang xem xét phỏng vấn",
  Offered: "Đã bàn bạc",
  Hired: "Đã tuyển",
  Rejected: "Đã từ chối",
  Withdrawn: "Đã rút",
};

interface JobDisplayInfo {
  title: string;
  projectName?: string;
  clientCompany?: {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  jobRoleLevelName?: string;
  locationName?: string;
  clientCompanyCVTemplateName?: string;
  applyProcessTemplateName?: string;
  quantity?: number;
  budgetPerMonth?: number | null;
  workingMode?: number;
}

const workingModeLabels: Record<number, string> = {
  [WorkingModeEnum.Onsite]: "Tại văn phòng",
  [WorkingModeEnum.Remote]: "Làm từ xa",
  [WorkingModeEnum.Hybrid]: "Kết hợp",
  [WorkingModeEnum.Flexible]: "Linh hoạt",
  [WorkingModeEnum.None]: "—",
};

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

const activityTypeLabels: Record<number, string> = {
  [ApplyActivityType.Online]: "Trực tuyến",
  [ApplyActivityType.Offline]: "Trực tiếp",
};

const activityStatusLabels: Record<number, string> = {
  [ApplyActivityStatus.Scheduled]: "Đã lên lịch",
  [ApplyActivityStatus.Completed]: "Hoàn thành",
  [ApplyActivityStatus.Passed]: "Đạt",
  [ApplyActivityStatus.Failed]: "Không đạt",
  [ApplyActivityStatus.NoShow]: "Không có mặt",
};

export default function SalesApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<TalentApplicationDetailed | null>(null);
  const [jobInfo, setJobInfo] = useState<JobDisplayInfo | null>(null);
  const [talentLocationName, setTalentLocationName] = useState<string>("—");
  const [activities, setActivities] = useState<SalesActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const applicationData = await talentApplicationService.getDetailedById(Number(id));
        setApplication(applicationData);

        if (applicationData.talent?.locationId) {
          try {
            const location = await locationService.getById(applicationData.talent.locationId);
            setTalentLocationName(location.name);
          } catch {
            setTalentLocationName("—");
          }
        } else {
          setTalentLocationName("—");
        }

        try {
          const jobReqRaw = await jobRequestService.getById(applicationData.jobRequestId);
          const display: JobDisplayInfo = {
            title: jobReqRaw.title,
            quantity: jobReqRaw.quantity,
            budgetPerMonth: jobReqRaw.budgetPerMonth ?? null,
            workingMode: jobReqRaw.workingMode,
          };

          if (jobReqRaw.projectId) {
            try {
              const project = await projectService.getById(jobReqRaw.projectId);
              display.projectName = project?.name ?? "—";

              if (project?.clientCompanyId) {
                try {
                  const company = await clientCompanyService.getById(project.clientCompanyId);
                  display.clientCompany = {
                    name: company?.name ?? "—",
                    contactPerson: company?.contactPerson ?? "—",
                    email: company?.email ?? "—",
                    phone: company?.phone ?? "—",
                    address: company?.address ?? "—",
                  };

                  try {
                    const templates =
                      await clientCompanyCVTemplateService.listEffectiveTemplates(project.clientCompanyId);
                    const matched = templates.find(
                      (tpl) => tpl.templateId === jobReqRaw.clientCompanyCVTemplateId,
                    );
                    display.clientCompanyCVTemplateName = matched?.templateName ?? "—";
                  } catch {
                    display.clientCompanyCVTemplateName = "—";
                  }
                } catch {
                  display.clientCompany = { name: "—" };
                  display.clientCompanyCVTemplateName = "—";
                }
              }
            } catch {
              display.projectName = "—";
              display.clientCompany = { name: "—" };
              display.clientCompanyCVTemplateName = "—";
            }
          } else {
            display.projectName = "—";
            display.clientCompany = { name: "—" };
            display.clientCompanyCVTemplateName = "—";
          }

          if (jobReqRaw.jobRoleLevelId) {
            try {
              const level = await jobRoleLevelService.getById(jobReqRaw.jobRoleLevelId);
              display.jobRoleLevelName = level?.name ?? "—";
            } catch {
              display.jobRoleLevelName = "—";
            }
          } else {
            display.jobRoleLevelName = "—";
          }

          if (jobReqRaw.locationId) {
            try {
              const loc = await locationService.getById(jobReqRaw.locationId);
              display.locationName = loc?.name ?? display.clientCompany?.address ?? "—";
            } catch {
              display.locationName = display.clientCompany?.address ?? "—";
            }
          } else {
            display.locationName = display.clientCompany?.address ?? "—";
          }

          if (jobReqRaw.applyProcessTemplateId) {
            try {
              const template = await applyProcessTemplateService.getById(
                jobReqRaw.applyProcessTemplateId,
              );
              display.applyProcessTemplateName = template?.name ?? "—";
            } catch {
              display.applyProcessTemplateName = "—";
            }
          } else {
            display.applyProcessTemplateName = "—";
          }

          setJobInfo(display);
        } catch (err) {
          console.error("❌ Lỗi tải thông tin job request:", err);
          setJobInfo(null);
        }

        try {
          const acts = await applyActivityService.getAll({ applyId: applicationData.id });
          const steps = await applyProcessStepService.getAll();
          const stepMap: Record<number, ApplyProcessStep> = {};
          steps.forEach((step: ApplyProcessStep) => {
            stepMap[step.id] = step;
          });
          const enhanced = acts.map<SalesActivity>((activity) => ({
            ...activity,
            processStepName: stepMap[activity.processStepId]?.stepName,
          }));
          setActivities(enhanced);
        } catch (err) {
          console.error("❌ Lỗi tải hoạt động:", err);
          setActivities([]);
        }
      } catch (err) {
        console.error("❌ Lỗi tải hồ sơ:", err);
        navigate("/sales/applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const timeline = useMemo(() => {
    if (!application) return [];

    const events: Array<{ date: Date; title: string; description: string }> = [
      {
        date: new Date(application.createdAt),
        title: "Hồ sơ được tạo",
        description: `${application.submitterName ?? application.submittedBy} đã tạo hồ sơ.`,
      },
    ];

    activities
      .filter((activity) => activity.scheduledDate)
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
      .forEach((activity) => {
        events.push({
          date: new Date(activity.scheduledDate!),
          title: `${activityTypeLabels[activity.activityType] ?? "Hoạt động"} - ${
            activityStatusLabels[activity.status] ?? "Trạng thái"
          }`,
          description: activity.processStepName
            ? `Bước quy trình: ${activity.processStepName}`
            : `Hoạt động ID #${activity.id}`,
        });
      });

    return events;
  }, [activities, application]);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-neutral-500">Đang tải dữ liệu hồ sơ...</div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-neutral-600">Không tìm thấy hồ sơ ứng tuyển.</p>
            <Link
              to="/sales/applications"
              className="mt-3 inline-flex items-center gap-2 text-primary-600 hover:text-primary-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const workingModeText =
    jobInfo && jobInfo.workingMode !== undefined
      ? workingModeLabels[jobInfo.workingMode] ?? "—"
      : "—";

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/sales/applications"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ #{application.id}</h1>
              <p className="text-neutral-600">Thông tin tổng quan hồ sơ ứng tuyển</p>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                statusLabels[application.status] ? "bg-teal-50 text-teal-700" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {statusLabels[application.status] ?? application.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin hồ sơ</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow label="Mã hồ sơ" value={`#${application.id}`} icon={<FileText className="w-4 h-4" />} />
                <InfoRow
                  label="Vị trí tuyển dụng"
                  value={jobInfo?.title ?? "—"}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoRow
                  label="Tên ứng viên"
                  value={application.talent?.fullName ?? "—"}
                  icon={<UserIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="HR phụ trách"
                  value={application.submitterName ?? application.submittedBy}
                  icon={<UserIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Ngày nộp"
                  value={new Date(application.createdAt).toLocaleString("vi-VN")}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoRow
                  label="Cập nhật gần nhất"
                  value={
                    application.updatedAt ? new Date(application.updatedAt).toLocaleString("vi-VN") : "—"
                  }
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-secondary-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin tuyển dụng</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow
                  label="Công ty khách hàng"
                  value={jobInfo?.clientCompany?.name ?? "—"}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoRow
                  label="Dự án"
                  value={jobInfo?.projectName ?? "—"}
                  icon={<UserIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Vị trí tuyển dụng"
                  value={jobInfo?.title ?? "—"}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoRow
                  label="Cấp độ chuyên môn"
                  value={jobInfo?.jobRoleLevelName ?? "—"}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoRow
                  label="Số lượng tuyển dụng"
                  value={jobInfo?.quantity !== undefined ? String(jobInfo.quantity) : "—"}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoRow
                  label="Ngân sách/tháng"
                  value={formatCurrency(jobInfo?.budgetPerMonth)}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoRow
                  label="Khu vực làm việc"
                  value={
                    jobInfo?.locationName ??
                    jobInfo?.clientCompany?.address ??
                    "—"
                  }
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoRow
                  label="Chế độ làm việc"
                  value={workingModeText}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoRow
                  label="Mẫu CV khách hàng"
                  value={jobInfo?.clientCompanyCVTemplateName ?? "—"}
                  icon={<FileText className="w-4 h-4" />}
                />
                <InfoRow
                  label="Quy trình Apply"
                  value={jobInfo?.applyProcessTemplateName ?? "—"}
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <History className="w-5 h-5 text-accent-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Lịch sử hoạt động</h2>
                </div>
              </div>
              <div className="p-6">
                {timeline.length === 0 ? (
                  <p className="text-sm text-neutral-500">Chưa có hoạt động nào được ghi nhận.</p>
                ) : (
                  <ol className="relative border-l border-neutral-200 ml-3 space-y-6">
                    {timeline.map((event, idx) => (
                      <li key={`${event.title}-${idx}`} className="ml-6">
                        <div className="absolute -left-1.5 w-3 h-3 bg-primary-500 rounded-full border border-white" />
                        <p className="text-xs text-neutral-400">
                          {event.date.toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                        <p className="text-sm text-neutral-600">{event.description}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin ứng viên</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <InfoRow
                  label="Tên ứng viên"
                  value={application.talent?.fullName ?? "—"}
                  icon={<UserIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Email"
                  value={application.talent?.email ?? "—"}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoRow
                  label="Số điện thoại"
                  value={application.talent?.phone ?? "—"}
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoRow
                  label="Địa điểm mong muốn"
                  value={talentLocationName}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="bg-white border border-neutral-100 rounded-2xl shadow-soft">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-neutral-500">Chưa có hoạt động nào.</p>
                ) : (
                  activities
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((activity) => (
                      <div key={activity.id} className="border border-neutral-200 rounded-xl p-4 bg-neutral-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-neutral-900">
                            {activityTypeLabels[activity.activityType] ?? "Hoạt động"} #{activity.id}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {activity.scheduledDate
                              ? new Date(activity.scheduledDate).toLocaleString("vi-VN")
                              : "—"}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Trạng thái: {activityStatusLabels[activity.status] ?? activity.status}
                        </p>
                        {activity.processStepName && (
                          <p className="text-sm text-neutral-600">Bước quy trình: {activity.processStepName}</p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-neutral-400">{icon}</div>}
      <div>
        <p className="text-xs uppercase text-neutral-400 tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{value || "—"}</p>
      </div>
    </div>
  );
}

