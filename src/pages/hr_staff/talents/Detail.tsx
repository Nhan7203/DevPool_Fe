import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentService, type Talent } from "../../../services/Talent";
import { locationService } from "../../../services/location";
import { partnerService, type Partner } from "../../../services/Partner";
import { talentCVService, type TalentCV, type CVAnalysisComparisonResponse } from "../../../services/TalentCV";
import { talentProjectService, type TalentProject } from "../../../services/TalentProject";
import { talentSkillService, type TalentSkill } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { talentWorkExperienceService, type TalentWorkExperience } from "../../../services/TalentWorkExperience";
import { talentJobRoleLevelService, type TalentJobRoleLevel } from "../../../services/TalentJobRoleLevel";
import { jobRoleLevelService, type JobRoleLevel, TalentLevel as TalentLevelEnum } from "../../../services/JobRoleLevel";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import { talentCertificateService, type TalentCertificate } from "../../../services/TalentCertificate";
import { certificateTypeService, type CertificateType } from "../../../services/CertificateType";
import { talentAvailableTimeService, type TalentAvailableTime } from "../../../services/TalentAvailableTime";
import { notificationService, NotificationPriority, NotificationType } from "../../../services/Notification";
import { userService } from "../../../services/User";
import { decodeJWT } from "../../../services/Auth";
import { WorkingMode } from "../../../types/WorkingMode";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  FileText,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Globe,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  Star,
  Workflow,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

// Mapping WorkingMode values to Vietnamese names
const workingModeLabels: Record<number, string> = {
  [WorkingMode.None]: "Không xác định",
  [WorkingMode.Onsite]: "Tại văn phòng",
  [WorkingMode.Remote]: "Từ xa",
  [WorkingMode.Hybrid]: "Kết hợp",
  [WorkingMode.Flexible]: "Linh hoạt",
};

export default function TalentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [locationName, setLocationName] = useState<string>("—");
  const [partnerName, setPartnerName] = useState<string>("—");
  const [talentCVs, setTalentCVs] = useState<(TalentCV & { jobRoleName?: string })[]>([]);
  const [talentProjects, setTalentProjects] = useState<TalentProject[]>([]);
  const [talentSkills, setTalentSkills] = useState<(TalentSkill & { skillName: string })[]>([]);
  const [workExperiences, setWorkExperiences] = useState<TalentWorkExperience[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<(TalentJobRoleLevel & { jobRoleLevelName: string })[]>([]);
  const [certificates, setCertificates] = useState<(TalentCertificate & { certificateTypeName: string })[]>([]);
  const [availableTimes, setAvailableTimes] = useState<TalentAvailableTime[]>([]);
  const [lookupSkills, setLookupSkills] = useState<Skill[]>([]);
  const [lookupJobRoleLevels, setLookupJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [lookupCertificateTypes, setLookupCertificateTypes] = useState<CertificateType[]>([]);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisComparisonResponse | null>(null);
  const [analysisResultCVId, setAnalysisResultCVId] = useState<number | null>(null);
  type SuggestionCategory = "skill" | "jobRoleLevel" | "certificate";
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [pendingSuggestionNotifications, setPendingSuggestionNotifications] = useState<
    Record<string, { ids: number[]; readMap: Record<number, boolean>; category: SuggestionCategory }>
  >({});
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoadingId, setAnalysisLoadingId] = useState<number | null>(null);
  type PrefillType = "projects" | "jobRoleLevels" | "skills" | "certificates" | "experiences";
  const ANALYSIS_STORAGE_PREFIX = "talent-analysis-prefill";
  const prefillTypes: PrefillType[] = ["projects", "jobRoleLevels", "skills", "certificates", "experiences"];
  const getPrefillStorageKey = (type: PrefillType) => `${ANALYSIS_STORAGE_PREFIX}-${type}-${id}`;
  const ANALYSIS_RESULT_STORAGE_KEY = id ? `talent-analysis-result-${id}` : null;
  const clearPrefillStorage = () => {
    prefillTypes.forEach((type) => {
      try {
        sessionStorage.removeItem(getPrefillStorageKey(type));
      } catch (storageError) {
        console.warn("Không thể xóa dữ liệu gợi ý", storageError);
      }
    });
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ANALYSIS_RESULT_STORAGE_KEY) return;
    try {
      const stored = sessionStorage.getItem(ANALYSIS_RESULT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        cvId: number | null;
        result: CVAnalysisComparisonResponse | null;
      };
      if (parsed?.result) {
        setAnalysisResult(parsed.result);
        setAnalysisResultCVId(parsed.cvId ?? null);
      }
    } catch (error) {
      console.warn("Không thể khôi phục kết quả phân tích CV:", error);
    }
  }, [ANALYSIS_RESULT_STORAGE_KEY]);

  // Multi-select states
  const [selectedCVs, setSelectedCVs] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>([]);
  const [selectedJobRoleLevels, setSelectedJobRoleLevels] = useState<number[]>([]);
  const [selectedCertificates, setSelectedCertificates] = useState<number[]>([]);
  const [selectedAvailableTimes, setSelectedAvailableTimes] = useState<number[]>([]);

  // Pagination states for each section
  const [pageCVs, setPageCVs] = useState(1);
  const [pageProjects, setPageProjects] = useState(1);
  const [pageSkills, setPageSkills] = useState(1);
  const [pageExperiences, setPageExperiences] = useState(1);
  const [pageJobRoleLevels, setPageJobRoleLevels] = useState(1);
  const [pageCertificates, setPageCertificates] = useState(1);
  const [pageAvailableTimes, setPageAvailableTimes] = useState(1);
  const itemsPerPage = 9;

  // Collapse/Expand states for each section
  const [isCVsExpanded, setIsCVsExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);
  const [isExperiencesExpanded, setIsExperiencesExpanded] = useState(true);
  const [isJobRoleLevelsExpanded, setIsJobRoleLevelsExpanded] = useState(true);
  const [isCertificatesExpanded, setIsCertificatesExpanded] = useState(true);
  const [isAvailableTimesExpanded, setIsAvailableTimesExpanded] = useState(true);

  const talentName = talent?.fullName ?? "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const talentData = await talentService.getById(Number(id));

        // Resolve location name
        if (talentData.locationId) {
          try {
            const location = await locationService.getById(talentData.locationId);
            setLocationName(location?.name ?? "—");
          } catch { }
        }

        // Resolve partner name
        try {
          const partner = await partnerService.getAll();
          const talentPartner = partner.find((p: Partner) => p.id === talentData.currentPartnerId);
          setPartnerName(talentPartner?.companyName ?? "—");
        } catch { }

        // Fetch all related data
        const [
          cvs,
          projects,
          skills,
          experiences,
          jobRoleLevelsData,
          certificatesData,
          availableTimesData
        ] = await Promise.all([
          talentCVService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentProjectService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentSkillService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentWorkExperienceService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentJobRoleLevelService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentCertificateService.getAll({ talentId: Number(id), excludeDeleted: true }),
          talentAvailableTimeService.getAll({ talentId: Number(id), excludeDeleted: true })
        ]);

        setTalentProjects(projects);
        setWorkExperiences(experiences);
        setAvailableTimes(availableTimesData);

        // Fetch job roles and map with CVs
        const allJobRoles = await jobRoleService.getAll({ excludeDeleted: true });
        const cvsWithJobRoleNames = cvs.map((cv: TalentCV) => {
          const jobRoleInfo = allJobRoles.find((jr: JobRole) => jr.id === cv.jobRoleId);
          return { ...cv, jobRoleName: jobRoleInfo?.name ?? "Chưa xác định" };
        });
        setTalentCVs(cvsWithJobRoleNames);

        // Fetch skill names
        const allSkills = await skillService.getAll();
        setLookupSkills(allSkills);
        const skillsWithNames = skills.map((skill: TalentSkill) => {
          const skillInfo = allSkills.find((s: Skill) => s.id === skill.skillId);
          return { ...skill, skillName: skillInfo?.name ?? "Unknown Skill" };
        });
        setTalentSkills(skillsWithNames);

        // Fetch job role level names
        const allJobRoleLevels = await jobRoleLevelService.getAll();
        setLookupJobRoleLevels(allJobRoleLevels);
        const jobRoleLevelsWithNames = jobRoleLevelsData.map((jrl: TalentJobRoleLevel) => {
          const jobRoleLevelInfo = allJobRoleLevels.find((j: JobRoleLevel) => j.id === jrl.jobRoleLevelId);
          return { ...jrl, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Unknown Level" };
        });
        setJobRoleLevels(jobRoleLevelsWithNames);

        // Fetch certificate type names
        const allCertificateTypes = await certificateTypeService.getAll();
        setLookupCertificateTypes(allCertificateTypes);
        const certificatesWithNames = certificatesData.map((cert: TalentCertificate) => {
          const certTypeInfo = allCertificateTypes.find((c: CertificateType) => c.id === cert.certificateTypeId);
          return { ...cert, certificateTypeName: certTypeInfo?.name ?? "Unknown Certificate" };
        });
        setCertificates(certificatesWithNames);

        setTalent(talentData);
        console.log("Nhân sự chi tiết:", talentData);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết nhân sự:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await userService.getAll({
          role: "Admin",
          excludeDeleted: true,
          pageNumber: 1,
          pageSize: 100,
        });
        const admins = (response.items ?? []).filter((user) =>
          (user.roles ?? []).some((role) => role.toLowerCase().includes("admin"))
        );
        setAdminUserIds(admins.map((user) => user.id));
      } catch (error) {
        console.error("Không thể tải danh sách Admin để gửi đề xuất:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setPageCVs(1);
  }, [talentCVs.length]);

  useEffect(() => {
    setPageProjects(1);
  }, [talentProjects.length]);

  useEffect(() => {
    setPageSkills(1);
  }, [talentSkills.length]);

  useEffect(() => {
    setPageExperiences(1);
  }, [workExperiences.length]);

  useEffect(() => {
    setPageJobRoleLevels(1);
  }, [jobRoleLevels.length]);

  useEffect(() => {
    setPageCertificates(1);
  }, [certificates.length]);

  useEffect(() => {
    setPageAvailableTimes(1);
  }, [availableTimes.length]);

  useEffect(() => {
    setIsCVsExpanded(talentCVs.length > 0);
  }, [talentCVs.length]);

  useEffect(() => {
    setIsProjectsExpanded(talentProjects.length > 0);
  }, [talentProjects.length]);

  useEffect(() => {
    setIsSkillsExpanded(talentSkills.length > 0);
  }, [talentSkills.length]);

  useEffect(() => {
    setIsExperiencesExpanded(workExperiences.length > 0);
  }, [workExperiences.length]);

  useEffect(() => {
    setIsJobRoleLevelsExpanded(jobRoleLevels.length > 0);
  }, [jobRoleLevels.length]);

  useEffect(() => {
    setIsCertificatesExpanded(certificates.length > 0);
  }, [certificates.length]);

  useEffect(() => {
    setIsAvailableTimesExpanded(availableTimes.length > 0);
  }, [availableTimes.length]);

  // 🗑️ Xóa nhân sự
  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa nhân sự này?");
    if (!confirm) return;

    try {
      await talentService.deleteById(Number(id));
      alert("✅ Đã xóa nhân sự thành công!");
      navigate("/hr/developers");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa nhân sự!");
    }
  };

  // ✏️ Chuyển sang trang sửa
  const handleEdit = () => {
    navigate(`/hr/developers/edit/${id}`);
  };

  // 🗑️ Delete handlers for each section
  const handleDeleteCVs = async () => {
    if (selectedCVs.length === 0) {
      alert("⚠️ Vui lòng chọn CV để xóa!");
      return;
    }

    const activeCVs = talentCVs.filter((cv) => selectedCVs.includes(cv.id) && cv.isActive);
    if (activeCVs.length > 0) {
      alert("⚠️ Không thể xóa các CV đang hoạt động. Vui lòng bỏ chọn hoặc hủy kích hoạt trước khi xóa.");
      setSelectedCVs((prev) => prev.filter((id) => !activeCVs.some((cv) => cv.id === id)));
      return;
    }

    const deletableCVIds = selectedCVs.filter((id) => {
      const cv = talentCVs.find((item) => item.id === id);
      return cv && !cv.isActive;
    });

    if (deletableCVIds.length === 0) {
      alert("⚠️ Không có CV nào hợp lệ để xóa.");
      return;
    }

    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedCVs.length} CV đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(deletableCVIds.map(id => talentCVService.deleteById(id)));
      alert("✅ Đã xóa CV thành công!");
      setSelectedCVs((prev) => prev.filter((id) => !deletableCVIds.includes(id)));
      // Refresh data
      const cvs = await talentCVService.getAll({ talentId: Number(id), excludeDeleted: true });
      const allJobRoles = await jobRoleService.getAll({ excludeDeleted: true });
      const cvsWithJobRoleNames = cvs.map((cv: TalentCV) => {
        const jobRoleInfo = allJobRoles.find((jr: JobRole) => jr.id === cv.jobRoleId);
        return { ...cv, jobRoleName: jobRoleInfo?.name ?? "Chưa xác định" };
      });
      setTalentCVs(cvsWithJobRoleNames);
    } catch (err) {
      console.error("❌ Lỗi khi xóa CV:", err);
      alert("Không thể xóa CV!");
    }
  };

  const normalizeFirebaseUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.endsWith(".firebasestorage.app")) {
        parsed.hostname = parsed.hostname.replace(".firebasestorage.app", ".appspot.com");
      }
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const handleAnalyzeCVFromUrl = async (cv: TalentCV & { jobRoleName?: string }) => {
    if (!id) return;
    if (!cv.cvFileUrl) {
      alert("⚠️ Không tìm thấy đường dẫn CV để phân tích.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn phân tích CV "${cv.versionName}"?\n` +
      "Hệ thống sẽ tải file CV hiện tại và tiến hành phân tích."
    );
    if (!confirmed) {
      return;
    }

    setAnalysisLoadingId(cv.id);
    setAnalysisError(null);

    try {
      const downloadUrl = normalizeFirebaseUrl(cv.cvFileUrl);
      const response = await fetch(downloadUrl, { cache: "no-cache", mode: "cors" });
      if (!response.ok || response.type === "opaque") {
        throw new Error("Không thể tải CV từ đường dẫn hiện có (CORS).");
      }

      const blob = await response.blob();
      const sanitizedVersionName = cv.versionName.replace(/[^a-zA-Z0-9-_]/g, "_");
      const file = new File([blob], `${sanitizedVersionName || "cv"}_${cv.id}.pdf`, { type: blob.type || "application/pdf" });

      const result = await talentCVService.analyzeCVForUpdate(Number(id), file);
      setAnalysisResult(result);
      setAnalysisResultCVId(cv.id);
      if (ANALYSIS_RESULT_STORAGE_KEY) {
        try {
          sessionStorage.setItem(
            ANALYSIS_RESULT_STORAGE_KEY,
            JSON.stringify({ cvId: cv.id, result })
          );
        } catch (storageError) {
          console.warn("Không thể lưu kết quả phân tích CV:", storageError);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi phân tích CV:", error);
      const message = (error as { message?: string }).message ?? "Không thể phân tích CV";
      setAnalysisError(message);
      if ((error as Error).message?.includes("CORS")) {
        alert("⚠️ Không thể tải CV tự động do giới hạn CORS. Vui lòng tải file CV xuống và sử dụng lại nút phân tích thủ công.");
      } else {
        alert(`❌ ${message}`);
      }
    } finally {
      setAnalysisLoadingId(null);
    }
  };

  const handleCancelAnalysis = () => {
    clearPrefillStorage();
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisLoadingId(null);
    setAnalysisResultCVId(null);
    if (ANALYSIS_RESULT_STORAGE_KEY) {
      try {
        sessionStorage.removeItem(ANALYSIS_RESULT_STORAGE_KEY);
      } catch (storageError) {
        console.warn("Không thể xóa kết quả phân tích CV đã lưu:", storageError);
      }
    }
  };

  const isSuggestionPending = useCallback(
    (key: string) => {
      if (!key) return false;
      const entry = pendingSuggestionNotifications[key];
      if (!entry) return false;
      return entry.ids.some((notificationId) => !entry.readMap[notificationId]);
    },
    [pendingSuggestionNotifications]
  );

  const handleSuggestionRequest = useCallback(
    async (
      category: SuggestionCategory,
      suggestionKey: string,
      displayItems: string[],
      detailItems: Array<Record<string, string>>,
      actionUrl?: string
    ) => {
      if (!suggestionKey || !displayItems.length) {
        alert("Không có dữ liệu đề xuất hợp lệ.");
        return;
      }
      if (!adminUserIds.length) {
        alert("Không tìm thấy người dùng Admin để gửi đề xuất.");
        return;
      }
      if (!id) {
        alert("Thiếu thông tin nhân sự để gửi đề xuất.");
        return;
      }
      if (isSuggestionPending(suggestionKey)) {
        alert("Đã gửi đề xuất này trước đó và đang chờ Admin xử lý.");
        return;
      }

      const categoryConfig: Record<SuggestionCategory, { label: string; title: string; actionUrl: string }> = {
        skill: {
          label: "kỹ năng mới",
          title: "[Đề xuất] Thêm kỹ năng mới",
          actionUrl: "/admin/categories/skill",
        },
        jobRoleLevel: {
          label: "vị trí/level mới",
          title: "[Đề xuất] Thêm vị trí/level mới",
          actionUrl: "/admin/categories/job-role-levels",
        },
        certificate: {
          label: "loại chứng chỉ mới",
          title: "[Đề xuất] Thêm loại chứng chỉ mới",
          actionUrl: "/admin/categories/certificate-types",
        },
      };

      const config = categoryConfig[category];
      const confirmMessage = `Bạn có chắc muốn gửi đề xuất tới Admin để bổ sung ${config.label}?\n${displayItems
        .map((item, idx) => ` ${idx + 1}. ${item}`)
        .join("\n")}`;

      if (!window.confirm(confirmMessage)) return;

      try {
        const token = localStorage.getItem("accessToken");
        const decoded = token ? decodeJWT(token) : null;
        const requesterName = decoded?.unique_name || decoded?.email || decoded?.name || "HR Staff";
        const messageLines = displayItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n");

        const response = await notificationService.create({
          title: config.title,
          message: `${requesterName} đề xuất thêm ${config.label} cho nhân sự ${talentName}:\n${messageLines}`,
          type: NotificationType.DocumentUploaded,
          priority: NotificationPriority.Medium,
          userIds: adminUserIds,
          entityType: "Talent",
          entityId: Number(id),
          actionUrl: actionUrl ?? config.actionUrl,
          metaData: {
            category,
            talentId: id ?? "",
            talentName,
            suggestions: JSON.stringify(detailItems),
          },
        });

        const notifications = Array.isArray(response) ? response : [response];
        const ids = notifications
          .map((notification) => notification.id)
          .filter((notificationId): notificationId is number => typeof notificationId === "number");

        if (ids.length) {
          setPendingSuggestionNotifications((prev) => ({
            ...prev,
            [suggestionKey]: {
              ids,
              readMap: ids.reduce<Record<number, boolean>>((acc, notificationId) => {
                acc[notificationId] = false;
                return acc;
              }, {}),
              category,
            },
          }));
        }

        alert("Đã gửi đề xuất tới Admin. Bạn sẽ được thông báo khi Admin xử lý.");
      } catch (error) {
        console.error("Không thể gửi đề xuất tới Admin:", error);
        alert("Không thể gửi đề xuất tới Admin.");
      }
    },
    [adminUserIds, id, isSuggestionPending, talentName]
  );

  useEffect(() => {
    const entries = Object.entries(pendingSuggestionNotifications).filter(([_, entry]) =>
      entry.ids.some((notificationId) => !entry.readMap[notificationId])
    );

    if (!entries.length) return;

    let cancelled = false;

    const checkStatuses = async () => {
      if (cancelled) return;
      const updates: Array<{ key: string; notificationId: number }> = [];

      for (const [key, entry] of entries) {
        for (const notificationId of entry.ids) {
          if (entry.readMap[notificationId]) continue;
          try {
            const notification = await notificationService.getById(notificationId);
            if (notification?.isRead) {
              updates.push({ key, notificationId });
            }
          } catch (error) {
            console.error("Không thể kiểm tra trạng thái thông báo đề xuất:", error);
          }
        }
      }

      if (!updates.length || cancelled) return;

      setPendingSuggestionNotifications((prev) => {
        let changed = false;
        const next = { ...prev };

        updates.forEach(({ key, notificationId }) => {
          const entry = next[key];
          if (!entry) return;
          if (entry.readMap[notificationId]) return;
          changed = true;
          const newReadMap = { ...entry.readMap, [notificationId]: true };
          if (Object.values(newReadMap).every(Boolean)) {
            delete next[key];
          } else {
            next[key] = { ...entry, readMap: newReadMap };
          }
        });

        return changed ? next : prev;
      });
    };

    checkStatuses();
    const intervalId = window.setInterval(checkStatuses, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pendingSuggestionNotifications]);

  const handlePreparePrefillAndNavigate = (type: PrefillType, data: unknown, targetPath: string) => {
    if (!id) return;
    if (Array.isArray(data) && data.length === 0) {
      alert("Không có gợi ý phù hợp để dùng cho việc tạo mới.");
      return;
    }
    try {
      sessionStorage.setItem(getPrefillStorageKey(type), JSON.stringify(data));
    } catch (error) {
      console.error("Không thể lưu dữ liệu gợi ý vào bộ nhớ tạm:", error);
    }
    const url = `${targetPath}${targetPath.includes("?") ? "&" : "?"}fromAnalysis=1`;
    navigate(url);
  };

  const systemSkillMap = useMemo(() => {
    const map = new Map<string, Skill>();
    lookupSkills.forEach((skill) => {
      const key = skill.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, skill);
    });
    return map;
  }, [lookupSkills]);

  const talentSkillLookup = useMemo(() => {
    const byId = new Map<number, (TalentSkill & { skillName: string })>();
    const byName = new Map<string, (TalentSkill & { skillName: string })>();
    const normalizedNames = new Set<string>();

    talentSkills.forEach((skill) => {
      byId.set(skill.skillId, skill);
      const normalized = skill.skillName?.trim().toLowerCase();
      if (normalized) {
        byName.set(normalized, skill);
        normalizedNames.add(normalized);
      }
    });

    return { byId, byName, normalizedNames };
  }, [talentSkills]);

  const skillsRecognizedForAddition = useMemo(() => {
    if (!analysisResult) return [];

    const suggestionsByName = new Map<string, { skillName: string; level?: string; yearsExp?: number | null }>();

    const considerSuggestion = (skillName?: string, level?: string | null, yearsExp?: number | null) => {
      const normalized = skillName?.trim().toLowerCase();
      if (!skillName || !normalized) return;
      if (!systemSkillMap.has(normalized)) return;
      if (talentSkillLookup.normalizedNames.has(normalized)) return;

      if (!suggestionsByName.has(normalized)) {
        suggestionsByName.set(normalized, {
          skillName,
          level: level ?? undefined,
          yearsExp,
        });
      }
    };

    analysisResult.skills.newFromCV.forEach((suggestion) => {
      considerSuggestion(suggestion.skillName, suggestion.level, suggestion.yearsExp ?? null);
    });

    analysisResult.skills.matched.forEach((match) => {
      const normalized = match.skillName.trim().toLowerCase();
      const attr = talentSkillLookup.byId.get(match.skillId ?? NaN) ?? talentSkillLookup.byName.get(normalized);
      if (!attr) {
        considerSuggestion(match.skillName, match.cvLevel, match.cvYearsExp ?? null);
      }
    });

    return Array.from(suggestionsByName.values());
  }, [analysisResult, systemSkillMap, talentSkillLookup]);

  const unmatchedSkillSuggestions = useMemo(() => {
    if (!analysisResult) return [];
    return analysisResult.skills.newFromCV.filter((suggestion) => {
      const name = suggestion.skillName?.trim().toLowerCase() ?? "";
      if (!name) return false;
      return !systemSkillMap.has(name);
    });
  }, [analysisResult, systemSkillMap]);

  const matchedSkillsDetails = useMemo(() => {
    if (!analysisResult) return [];
    return analysisResult.skills.matched
      .filter((match) => {
        const normalized = match.skillName.trim().toLowerCase();
        return (
          (match.skillId !== undefined && talentSkillLookup.byId.has(match.skillId)) ||
          talentSkillLookup.byName.has(normalized)
        );
      })
      .map((match) => {
        const normalized = match.skillName.trim().toLowerCase();
        const existing =
          (match.skillId !== undefined && talentSkillLookup.byId.get(match.skillId)) ||
          talentSkillLookup.byName.get(normalized);
        return {
          skillName: match.skillName,
          cvLevel: match.cvLevel ?? "—",
          cvYearsExp: match.cvYearsExp ?? "—",
          matchConfidence: Math.round(match.matchConfidence * 100),
          systemLevel: existing?.level ?? "—",
          systemYearsExp: existing?.yearsExp ?? "—",
        };
      });
  }, [analysisResult, talentSkillLookup]);

  const cvSkillNames = useMemo(() => {
    const set = new Set<string>();
    if (!analysisResult) return set;
    analysisResult.skills.newFromCV.forEach((skill) => {
      const name = skill.skillName?.trim().toLowerCase();
      if (name) set.add(name);
    });
    analysisResult.skills.matched.forEach((match) => {
      const name = match.skillName.trim().toLowerCase();
      if (name) set.add(name);
    });
    return set;
  }, [analysisResult]);

  const talentSkillsNotInCV = useMemo(
    () =>
      talentSkills.filter((skill) => {
        const normalized = skill.skillName?.trim().toLowerCase();
        if (!normalized) return false;
        return !cvSkillNames.has(normalized);
      }),
    [talentSkills, cvSkillNames]
  );

  const getTalentLevelName = (levelValue: number | undefined) => {
    if (levelValue === undefined) return "";
    const match = Object.entries(TalentLevelEnum).find(([, value]) => value === levelValue);
    return match?.[0]?.toLowerCase() ?? "";
  };

  const normalizeJobRoleKey = (position?: string | null, level?: string | null) => {
    const normalizedPosition = (position ?? "").trim().toLowerCase();
    const normalizedLevel = (level ?? "").trim().toLowerCase();
    return `${normalizedPosition}|${normalizedLevel}`;
  };

  const jobRoleLevelSystemMap = useMemo(() => {
    const map = new Map<string, JobRoleLevel>();
    lookupJobRoleLevels.forEach((jobRoleLevel) => {
      const key = normalizeJobRoleKey(jobRoleLevel.name, getTalentLevelName(jobRoleLevel.level));
      if (key !== "|") {
        map.set(key, jobRoleLevel);
      }
    });
    return map;
  }, [lookupJobRoleLevels]);

  const talentJobRoleLevelMap = useMemo(() => {
    const map = new Map<
      string,
      {
        existing: TalentJobRoleLevel & { jobRoleLevelName: string };
        system?: JobRoleLevel;
      }
    >();
    jobRoleLevels.forEach((record) => {
      const system = lookupJobRoleLevels.find((jobRoleLevel) => jobRoleLevel.id === record.jobRoleLevelId);
      const key = normalizeJobRoleKey(system?.name ?? record.jobRoleLevelName, system ? getTalentLevelName(system.level) : undefined);
      if (key !== "|") {
        map.set(key, { existing: record, system });
      }
    });
    return map;
  }, [jobRoleLevels, lookupJobRoleLevels]);

  type JobRoleLevelSuggestion = CVAnalysisComparisonResponse["jobRoleLevels"]["newFromCV"][number];

  const jobRoleLevelComparisons = useMemo(() => {
    const result = {
      recognized: [] as Array<{ suggestion: JobRoleLevelSuggestion; system: JobRoleLevel }>,
      matched: [] as Array<{ suggestion: JobRoleLevelSuggestion; existing: TalentJobRoleLevel & { jobRoleLevelName: string }; system?: JobRoleLevel }>,
      unmatched: [] as JobRoleLevelSuggestion[],
      onlyInTalent: [] as Array<{ existing: TalentJobRoleLevel & { jobRoleLevelName: string }; system?: JobRoleLevel }>,
    };

    if (!analysisResult) return result;

    const cvKeys = new Set<string>();

    analysisResult.jobRoleLevels.newFromCV.forEach((suggestion) => {
      const key = normalizeJobRoleKey(suggestion.position, suggestion.level);
      if (key === "|") return;
      cvKeys.add(key);

      const system = jobRoleLevelSystemMap.get(key);
      const existingInfo = talentJobRoleLevelMap.get(key);

      if (existingInfo) {
        result.matched.push({ suggestion, existing: existingInfo.existing, system: existingInfo.system });
      } else if (system) {
        result.recognized.push({ suggestion, system });
      } else {
        result.unmatched.push(suggestion);
      }
    });

    talentJobRoleLevelMap.forEach((value, key) => {
      if (!cvKeys.has(key)) {
        result.onlyInTalent.push(value);
      }
    });

    return result;
  }, [analysisResult, jobRoleLevelSystemMap, talentJobRoleLevelMap]);

  const normalizeCertificateName = (name?: string | null) => (name ?? "").trim().toLowerCase();

  const certificateSystemMap = useMemo(() => {
    const map = new Map<string, CertificateType>();
    lookupCertificateTypes.forEach((type) => {
      const key = normalizeCertificateName(type.name);
      if (key) map.set(key, type);
    });
    return map;
  }, [lookupCertificateTypes]);

  const talentCertificateMap = useMemo(() => {
    const map = new Map<string, (TalentCertificate & { certificateTypeName: string })>();
    certificates.forEach((certificate) => {
      const key = normalizeCertificateName(certificate.certificateTypeName);
      if (key) map.set(key, certificate);
    });
    return map;
  }, [certificates]);

  type CertificateSuggestion = CVAnalysisComparisonResponse["certificates"]["newFromCV"][number];

  const certificateComparisons = useMemo(() => {
    const result = {
      recognized: [] as Array<{ suggestion: CertificateSuggestion; system: CertificateType }>,
      matched: [] as Array<{ suggestion: CertificateSuggestion; existing: TalentCertificate & { certificateTypeName: string }; system?: CertificateType }>,
      unmatched: [] as CertificateSuggestion[],
      onlyInTalent: [] as Array<TalentCertificate & { certificateTypeName: string }>,
    };

    if (!analysisResult) return result;

    const cvKeys = new Set<string>();

    analysisResult.certificates.newFromCV.forEach((suggestion) => {
      const key = normalizeCertificateName(suggestion.certificateName);
      if (!key) return;
      cvKeys.add(key);

      const system = certificateSystemMap.get(key);
      const existing = talentCertificateMap.get(key);

      if (existing) {
        result.matched.push({ suggestion, existing, system });
      } else if (system) {
        result.recognized.push({ suggestion, system });
      } else {
        result.unmatched.push(suggestion);
      }
    });

    talentCertificateMap.forEach((existing, key) => {
      if (!cvKeys.has(key)) {
        result.onlyInTalent.push(existing);
      }
    });

    return result;
  }, [analysisResult, certificateSystemMap, talentCertificateMap]);

  const {
    recognized: jobRoleLevelsRecognized,
    matched: jobRoleLevelsMatched,
    unmatched: jobRoleLevelsUnmatched,
    onlyInTalent: jobRoleLevelsOnlyInTalent,
  } = jobRoleLevelComparisons;

  const {
    recognized: certificatesRecognized,
    matched: certificatesMatched,
    unmatched: certificatesUnmatched,
    onlyInTalent: certificatesOnlyInTalent,
  } = certificateComparisons;

  const skillSuggestionRequestKey = useMemo(() => {
    if (!unmatchedSkillSuggestions.length) return "";
    return `skill:${unmatchedSkillSuggestions
      .map((suggestion, index) => {
        const normalized = (suggestion.skillName ?? "").trim().toLowerCase();
        return normalized.length > 0 ? normalized : `__unknown-skill-${index}`;
      })
      .sort()
      .join("|")}`;
  }, [unmatchedSkillSuggestions]);

  const skillSuggestionDisplayItems = useMemo(
    () =>
      unmatchedSkillSuggestions.map((suggestion, index) => {
        const name = suggestion.skillName?.trim();
        return name && name.length > 0 ? name : `Kỹ năng chưa rõ #${index + 1}`;
      }),
    [unmatchedSkillSuggestions]
  );

  const skillSuggestionDetailItems = useMemo(
    () =>
      unmatchedSkillSuggestions.map((suggestion) => ({
        skillName: suggestion.skillName ?? "",
        level: suggestion.level ?? "",
        yearsExp: suggestion.yearsExp != null ? String(suggestion.yearsExp) : "",
      })),
    [unmatchedSkillSuggestions]
  );

  const jobRoleSuggestionRequestKey = useMemo(() => {
    if (!jobRoleLevelsUnmatched.length) return "";
    return `jobRole:${jobRoleLevelsUnmatched
      .map((suggestion, index) => {
        const key = normalizeJobRoleKey(suggestion.position, suggestion.level);
        return !key || key === "|" ? `__unknown-jobrole-${index}` : key;
      })
      .sort()
      .join("|")}`;
  }, [jobRoleLevelsUnmatched]);

  const jobRoleSuggestionDisplayItems = useMemo(
    () =>
      jobRoleLevelsUnmatched.map((suggestion) => {
        const parts: string[] = [];
        if (suggestion.position) parts.push(suggestion.position);
        if (suggestion.level) parts.push(`Level ${suggestion.level}`);
        return parts.join(" · ") || "Vị trí chưa rõ";
      }),
    [jobRoleLevelsUnmatched]
  );

  const jobRoleSuggestionDetailItems = useMemo(
    () =>
      jobRoleLevelsUnmatched.map((suggestion) => ({
        position: suggestion.position ?? "",
        level: suggestion.level ?? "",
        yearsOfExp: suggestion.yearsOfExp != null ? String(suggestion.yearsOfExp) : "",
        ratePerMonth: suggestion.ratePerMonth != null ? String(suggestion.ratePerMonth) : "",
      })),
    [jobRoleLevelsUnmatched]
  );

  const certificateSuggestionRequestKey = useMemo(() => {
    if (!certificatesUnmatched.length) return "";
    return `certificate:${certificatesUnmatched
      .map((suggestion, index) => {
        const key = normalizeCertificateName(suggestion.certificateName);
        return key.length > 0 ? key : `__unknown-certificate-${index}`;
      })
      .sort()
      .join("|")}`;
  }, [certificatesUnmatched]);

  const certificateSuggestionDisplayItems = useMemo(
    () =>
      certificatesUnmatched.map((suggestion) => suggestion.certificateName?.trim() || "Chứng chỉ chưa rõ"),
    [certificatesUnmatched]
  );

  const certificateSuggestionDetailItems = useMemo(
    () =>
      certificatesUnmatched.map((suggestion) => ({
        certificateName: suggestion.certificateName ?? "",
        issuedDate: suggestion.issuedDate ?? "",
        imageUrl: suggestion.imageUrl ?? "",
      })),
    [certificatesUnmatched]
  );

  const handleDeleteProjects = async () => {
    if (selectedProjects.length === 0) {
      alert("⚠️ Vui lòng chọn dự án để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedProjects.length} dự án đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedProjects.map(id => talentProjectService.deleteById(id)));
      alert("✅ Đã xóa dự án thành công!");
      setSelectedProjects([]);
      // Refresh data
      const projects = await talentProjectService.getAll({ talentId: Number(id), excludeDeleted: true });
      setTalentProjects(projects);
    } catch (err) {
      console.error("❌ Lỗi khi xóa dự án:", err);
      alert("Không thể xóa dự án!");
    }
  };

  const handleDeleteSkills = async () => {
    if (selectedSkills.length === 0) {
      alert("⚠️ Vui lòng chọn kỹ năng để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedSkills.length} kỹ năng đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedSkills.map(id => talentSkillService.deleteById(id)));
      alert("✅ Đã xóa kỹ năng thành công!");
      setSelectedSkills([]);
      // Refresh data
      const skills = await talentSkillService.getAll({ talentId: Number(id), excludeDeleted: true });
      const allSkills = await skillService.getAll();
      setLookupSkills(allSkills);
      const skillsWithNames = skills.map((skill: TalentSkill) => {
        const skillInfo = allSkills.find((s: Skill) => s.id === skill.skillId);
        return { ...skill, skillName: skillInfo?.name ?? "Unknown Skill" };
      });
      setTalentSkills(skillsWithNames);
    } catch (err) {
      console.error("❌ Lỗi khi xóa kỹ năng:", err);
      alert("Không thể xóa kỹ năng!");
    }
  };

  const handleDeleteExperiences = async () => {
    if (selectedExperiences.length === 0) {
      alert("⚠️ Vui lòng chọn kinh nghiệm để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedExperiences.length} kinh nghiệm đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedExperiences.map(id => talentWorkExperienceService.deleteById(id)));
      alert("✅ Đã xóa kinh nghiệm thành công!");
      setSelectedExperiences([]);
      // Refresh data
      const experiences = await talentWorkExperienceService.getAll({ talentId: Number(id), excludeDeleted: true });
      setWorkExperiences(experiences);
    } catch (err) {
      console.error("❌ Lỗi khi xóa kinh nghiệm:", err);
      alert("Không thể xóa kinh nghiệm!");
    }
  };

  const handleDeleteJobRoleLevels = async () => {
    if (selectedJobRoleLevels.length === 0) {
      alert("⚠️ Vui lòng chọn vị trí để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedJobRoleLevels.length} vị trí đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedJobRoleLevels.map(id => talentJobRoleLevelService.deleteById(id)));
      alert("✅ Đã xóa vị trí thành công!");
      setSelectedJobRoleLevels([]);
      // Refresh data
      const jobRoleLevelsData = await talentJobRoleLevelService.getAll({ talentId: Number(id), excludeDeleted: true });
      const allJobRoleLevels = await jobRoleLevelService.getAll();
      setLookupJobRoleLevels(allJobRoleLevels);
      const jobRoleLevelsWithNames = jobRoleLevelsData.map((jrl: TalentJobRoleLevel) => {
        const jobRoleLevelInfo = allJobRoleLevels.find((j: JobRoleLevel) => j.id === jrl.jobRoleLevelId);
        return { ...jrl, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Unknown Level" };
      });
      setJobRoleLevels(jobRoleLevelsWithNames);
    } catch (err) {
      console.error("❌ Lỗi khi xóa vị trí:", err);
      alert("Không thể xóa vị trí!");
    }
  };

  const handleDeleteCertificates = async () => {
    if (selectedCertificates.length === 0) {
      alert("⚠️ Vui lòng chọn chứng chỉ để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedCertificates.length} chứng chỉ đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedCertificates.map(id => talentCertificateService.deleteById(id)));
      alert("✅ Đã xóa chứng chỉ thành công!");
      setSelectedCertificates([]);
      // Refresh data
      const certificatesData = await talentCertificateService.getAll({ talentId: Number(id), excludeDeleted: true });
      const allCertificateTypes = await certificateTypeService.getAll();
      setLookupCertificateTypes(allCertificateTypes);
      const certificatesWithNames = certificatesData.map((cert: TalentCertificate) => {
        const certTypeInfo = allCertificateTypes.find((c: CertificateType) => c.id === cert.certificateTypeId);
        return { ...cert, certificateTypeName: certTypeInfo?.name ?? "Unknown Certificate" };
      });
      setCertificates(certificatesWithNames);
    } catch (err) {
      console.error("❌ Lỗi khi xóa chứng chỉ:", err);
      alert("Không thể xóa chứng chỉ!");
    }
  };

  const handleDeleteAvailableTimes = async () => {
    if (selectedAvailableTimes.length === 0) {
      alert("⚠️ Vui lòng chọn thời gian để xóa!");
      return;
    }
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedAvailableTimes.length} thời gian đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedAvailableTimes.map(id => talentAvailableTimeService.deleteById(id)));
      alert("✅ Đã xóa thời gian thành công!");
      setSelectedAvailableTimes([]);
      // Refresh data
      const availableTimesData = await talentAvailableTimeService.getAll({ talentId: Number(id), excludeDeleted: true });
      setAvailableTimes(availableTimesData);
    } catch (err) {
      console.error("❌ Lỗi khi xóa thời gian:", err);
      alert("Không thể xóa thời gian!");
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu nhân sự...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy nhân sự</p>
            <Link
              to="/hr/developers"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Available":
        return {
          label: "Đang rảnh",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-50"
        };
      case "Busy":
        return {
          label: "Đang bận",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-yellow-50"
        };
      case "Working":
        return {
          label: "Đang làm việc",
          color: "bg-blue-100 text-blue-800",
          icon: <Briefcase className="w-4 h-4" />,
          bgColor: "bg-blue-50"
        };
      case "Applying":
        return {
          label: "Đang ứng tuyển",
          color: "bg-purple-100 text-purple-800",
          icon: <Target className="w-4 h-4" />,
          bgColor: "bg-purple-50"
        };
      case "Unavailable":
        return {
          label: "Không sẵn sàng",
          color: "bg-gray-100 text-gray-800",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-gray-50"
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-gray-50"
        };
    }
  };

  const statusConfig = getStatusConfig(talent.status);
  const isDisabled = false;
  const formatLinkDisplay = (url?: string) => {
    if (!url) return "—";
    try {
      const parsed = new URL(url);
      let display = parsed.hostname;
      if (parsed.pathname && parsed.pathname !== "/") {
        display += parsed.pathname.length > 20 ? `${parsed.pathname.slice(0, 20)}…` : parsed.pathname;
      }
      return display.length > 30 ? `${display.slice(0, 30)}…` : display;
    } catch {
      return url.length > 30 ? `${url.slice(0, 30)}…` : url;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/hr/developers"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{talent.fullName}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết nhân sự trong hệ thống DevPool
              </p>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgColor} border border-neutral-200`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                disabled={isDisabled}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isDisabled
                  ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                  }`}
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDisabled}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isDisabled
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <InfoItem
                label="Họ và tên"
                value={talent.fullName}
                icon={<User className="w-4 h-4" />}
              />
              <InfoItem
                label="Email"
                value={talent.email || "—"}
                icon={<Mail className="w-4 h-4" />}
              />
              <InfoItem
                label="Số điện thoại"
                value={talent.phone || "—"}
                icon={<Phone className="w-4 h-4" />}
              />
              <InfoItem
                label="Ngày sinh"
                value={talent.dateOfBirth ? new Date(talent.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa xác định"}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem
                label="Công ty"
                value={partnerName}
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoItem
                label="Khu vực làm việc"
                value={locationName}
                icon={<MapPin className="w-4 h-4" />}
              />
              <InfoItem
                label="Chế độ làm việc"
                value={workingModeLabels[talent.workingMode] || "Không xác định"}
                icon={<Globe className="w-4 h-4" />}
              />
              <InfoItem
                label="GitHub"
                value={talent.githubUrl ? (
                  <a
                    href={talent.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={talent.githubUrl}
                    className="text-primary-600 hover:text-primary-800 inline-block max-w-full truncate"
                  >
                    {formatLinkDisplay(talent.githubUrl)}
                  </a>
                ) : "—"}
                icon={<ExternalLink className="w-4 h-4" />}
              />
              <InfoItem
                label="Portfolio"
                value={talent.portfolioUrl ? (
                  <a
                    href={talent.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={talent.portfolioUrl}
                    className="text-primary-600 hover:text-primary-800 inline-block max-w-full truncate"
                  >
                    {formatLinkDisplay(talent.portfolioUrl)}
                  </a>
                ) : "—"}
                icon={<ExternalLink className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* CV của nhân sự */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsCVsExpanded(!isCVsExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isCVsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-accent-100 rounded-lg">
                  <FileText className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">CV của nhân sự</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-cvs/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Tải lên CV
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteCVs}
                  disabled={selectedCVs.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedCVs.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa CV ({selectedCVs.length})
                </Button>
              </div>
            </div>
          </div>
          {isCVsExpanded && (
            <div className="p-6">
              {talentCVs.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {talentCVs
                      .slice((pageCVs - 1) * itemsPerPage, pageCVs * itemsPerPage)
                      .map((cv) => {
                        const isLoading = analysisLoadingId === cv.id;
                        const isCurrentAnalysis = analysisResultCVId === cv.id && !!analysisResult;
                        const analysisControls = cv.isActive
                          ? isCurrentAnalysis
                            ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAnalysis();
                                }}
                                className="group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 text-white"
                              >
                                <Workflow className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                Hủy phân tích
                              </Button>
                            )
                            : (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeCVFromUrl(cv);
                                }}
                                disabled={isLoading}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${
                                  isLoading
                                    ? "bg-neutral-200 text-neutral-500 cursor-wait"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                }`}
                              >
                                <Workflow className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                {isLoading ? "Đang phân tích..." : "Phân tích CV"}
                              </Button>
                            )
                          : null;

                        return (
                          <div key={cv.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedCVs.includes(cv.id)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedCVs([...selectedCVs, cv.id]);
                                } else {
                                  setSelectedCVs(selectedCVs.filter(id => id !== cv.id));
                                }
                              }}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => navigate(`/hr/talent-cvs/edit/${cv.id}`)}
                            >
                              <FileText className="w-5 h-5 text-primary-600" />
                              <div>
                                <p className="font-medium text-gray-900 hover:text-primary-700 transition-colors duration-200">
                                  {cv.jobRoleName ? `${cv.jobRoleName} ${cv.versionName}` : cv.versionName}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {cv.isActive ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Đang hoạt động</span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Không hoạt động</span>
                            )}
                            <a
                              href={cv.cvFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="group flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium">Xem PDF</span>
                            </a>
                            {analysisControls}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <SectionPagination
                    currentPage={pageCVs}
                    totalItems={talentCVs.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageCVs}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có CV nào</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa upload CV</p>
                </div>
              )}
            </div>
          )}
        </div>
        {analysisError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            <p className="font-semibold">Lỗi phân tích CV</p>
            <p className="text-sm mt-1">{analysisError}</p>
          </div>
        )}
        {analysisResult && (
          <div className="bg-white rounded-2xl shadow-soft border border-primary-100 mb-8 animate-fade-in">
            <div className="p-6 border-b border-primary-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Workflow className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Kết quả phân tích CV</h2>
              </div>
              {/* <Button
                onClick={handleCancelAnalysis}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all duration-300"
              >
                <XCircle className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors duration-300" />
                Hủy kết quả phân tích
              </Button> */}
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-neutral-600">
                Hệ thống đã so sánh CV mới với dữ liệu hiện có của nhân sự. Các gợi ý chi tiết được hiển thị ngay trong từng phần bên dưới để bạn thao tác nhanh chóng.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-primary-100 bg-primary-50/70">
                  <p className="text-xs uppercase tracking-wide text-primary-600 font-semibold">Thông tin cơ bản</p>
                  <p className="mt-1 text-lg font-bold text-primary-900">{analysisResult.basicInfo.hasChanges ? "Có thay đổi" : "Không thay đổi"}</p>
                  <p className="mt-2 text-xs text-primary-700">Xem phần Thông tin chung để cập nhật</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/70">
                  <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold">Kỹ năng</p>
                  <p className="mt-1 text-lg font-bold text-amber-900">{analysisResult.skills.newFromCV.length}</p>
                  <p className="mt-2 text-xs text-amber-700">
                    {skillsRecognizedForAddition.length} đề xuất thêm · {matchedSkillsDetails.length} trùng CV · {unmatchedSkillSuggestions.length} cần tạo mới
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-green-100 bg-green-50/70">
                  <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Vị trí & mức lương</p>
                  <p className="mt-1 text-lg font-bold text-green-900">
                    {jobRoleLevelsRecognized.length + jobRoleLevelsMatched.length + jobRoleLevelsUnmatched.length}
                  </p>
                  <p className="mt-2 text-xs text-green-700">
                    {jobRoleLevelsRecognized.length} đề xuất thêm · {jobRoleLevelsMatched.length} trùng CV · {jobRoleLevelsUnmatched.length} cần tạo mới
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/70">
                  <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Dự án</p>
                  <p className="mt-1 text-lg font-bold text-purple-900">{analysisResult.projects.newEntries.length}</p>
                  <p className="mt-2 text-xs text-purple-700">Dự án mới cần xem xét</p>
                </div>
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/70">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Kinh nghiệm</p>
                  <p className="mt-1 text-lg font-bold text-blue-900">{analysisResult.workExperiences.newEntries.length}</p>
                  <p className="mt-2 text-xs text-blue-700">Kinh nghiệm làm việc mới phát hiện</p>
                </div>
                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/70">
                  <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold">Chứng chỉ</p>
                  <p className="mt-1 text-lg font-bold text-rose-900">
                    {certificatesRecognized.length + certificatesMatched.length + certificatesUnmatched.length}
                  </p>
                  <p className="mt-2 text-xs text-rose-700">
                    {certificatesRecognized.length} đề xuất thêm · {certificatesMatched.length} trùng CV · {certificatesUnmatched.length} cần tạo mới
                  </p>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">So sánh thông tin cơ bản</h3>
                <p className="text-sm text-neutral-600 mb-1">
                  <span className="font-medium">Có thay đổi:</span> {analysisResult.basicInfo.hasChanges ? "Có" : "Không"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">Hiện tại</p>
                    <ul className="space-y-1 mt-1">
                      <li>Họ tên: {analysisResult.basicInfo.current.fullName ?? "—"}</li>
                      <li>Email: {analysisResult.basicInfo.current.email ?? "—"}</li>
                      <li>Điện thoại: {analysisResult.basicInfo.current.phone ?? "—"}</li>
                      <li>Nơi ở: {analysisResult.basicInfo.current.locationName ?? "—"}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Gợi ý</p>
                    <ul className="space-y-1 mt-1">
                      <li>Họ tên: {analysisResult.basicInfo.suggested.fullName ?? "—"}</li>
                      <li>Email: {analysisResult.basicInfo.suggested.email ?? "—"}</li>
                      <li>Điện thoại: {analysisResult.basicInfo.suggested.phone ?? "—"}</li>
                      <li>Nơi ở: {analysisResult.basicInfo.suggested.locationName ?? "—"}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <details className="bg-neutral-50 rounded-xl border border-neutral-200">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700 hover:text-primary-600">
                  Xem toàn bộ dữ liệu phân tích (JSON)
                </summary>
                <pre className="overflow-auto text-xs bg-black text-green-300 p-4 rounded-b-xl">
{JSON.stringify(analysisResult, null, 2)}
                </pre>
              </details>
              {analysisResult.rawExtractedText && (
                <details className="bg-neutral-50 rounded-xl border border-neutral-200">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700 hover:text-primary-600">
                    Raw Extracted Text
                  </summary>
                  <pre className="overflow-auto text-xs bg-neutral-900 text-neutral-100 p-4 rounded-b-xl whitespace-pre-wrap">
{analysisResult.rawExtractedText}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Dự án của nhân sự */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isProjectsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dự án của nhân sự</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-projects/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Tạo dự án
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteProjects}
                  disabled={selectedProjects.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedProjects.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa dự án ({selectedProjects.length})
                </Button>
              </div>
            </div>
          </div>
          {isProjectsExpanded && (
            <div className="p-6">
              {analysisResult && (analysisResult.projects.newEntries.length > 0 || analysisResult.projects.potentialDuplicates.length > 0) && (
                <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Gợi ý từ CV mới</h3>
                    <span className="text-xs text-purple-700">{analysisResult.projects.newEntries.length} dự án mới · {analysisResult.projects.potentialDuplicates.length} dự án có thể trùng</span>
                  </div>
                  {analysisResult.projects.newEntries.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-purple-700 font-medium">Đề xuất thêm dự án:</p>
                      {analysisResult.projects.newEntries.map((project, index) => (
                        <div key={`suggested-project-${index}`} className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{project.projectName}</span>
                            {project.position && <span className="text-xs text-purple-700">Vai trò: {project.position}</span>}
                          </div>
                          {project.technologies && (
                            <p className="mt-1 text-xs text-purple-600">Công nghệ: {project.technologies}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysisResult.projects.potentialDuplicates.length > 0 && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                      <p className="font-medium mb-1">Kiểm tra trùng lặp:</p>
                      <ul className="space-y-1">
                        {analysisResult.projects.potentialDuplicates.map((dup, index) => (
                          <li key={`dup-project-${index}`}>
                            - {dup.fromCV.projectName} · Khuyến nghị: <span className="font-semibold">{dup.recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      onClick={() =>
                        handlePreparePrefillAndNavigate(
                          "projects",
                          analysisResult.projects.newEntries,
                          `/hr/talent-projects/create?talentId=${id}`
                        )
                      }
                      disabled={analysisResult.projects.newEntries.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        analysisResult.projects.newEntries.length === 0
                          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-soft hover:shadow-glow"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Dùng gợi ý để tạo dự án
                    </Button>
                  </div>
                </div>
              )}
              {talentProjects.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {talentProjects
                      .slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage)
                      .map((project) => (
                        <div key={project.id} className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:from-primary-100 hover:to-primary-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-projects/edit/${project.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedProjects.includes(project.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedProjects([...selectedProjects, project.id]);
                                  } else {
                                    setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                              />
                              <h3 className="font-semibold text-primary-800 hover:text-primary-900 transition-colors duration-200">{project.projectName}</h3>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-primary-700">
                              <span className="font-medium">Vị trí:</span> {project.position}
                            </p>
                            <p className="text-sm text-primary-600">
                              <span className="font-medium">Công nghệ:</span> {project.technologies}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageProjects}
                    totalItems={talentProjects.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageProjects}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có dự án nào</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa tham gia dự án</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vị trí và mức lương */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsJobRoleLevelsExpanded(!isJobRoleLevelsExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isJobRoleLevelsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Target className="w-5 h-5 text-warning-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Vị trí và mức lương</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-job-role-levels/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Thêm vị trí
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteJobRoleLevels}
                  disabled={selectedJobRoleLevels.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedJobRoleLevels.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa vị trí ({selectedJobRoleLevels.length})
                </Button>
              </div>
            </div>
          </div>
          {isJobRoleLevelsExpanded && (
            <div className="p-6">
              {(jobRoleLevelsRecognized.length > 0 || jobRoleLevelsMatched.length > 0 || jobRoleLevelsOnlyInTalent.length > 0 || jobRoleLevelsUnmatched.length > 0) && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Đề xuất vị trí & mức lương</h3>
                    <span className="text-xs text-green-700">
                      {jobRoleLevelsRecognized.length} đề xuất thêm · {jobRoleLevelsMatched.length} trùng CV · {jobRoleLevelsUnmatched.length} cần tạo mới
                    </span>
                  </div>
                  {jobRoleLevelsMatched.length > 0 && (
                    <div className="rounded-lg border border-green-300 bg-white px-3 py-2 text-xs text-green-900">
                      <p className="font-medium mb-1">So sánh trùng với hồ sơ hiện tại:</p>
                      <ul className="space-y-1">
                        {jobRoleLevelsMatched.map(({ suggestion, existing, system }, index) => {
                          const systemLevelName = system ? getTalentLevelName(system.level) : undefined;
                          const formattedSystemLevel = systemLevelName ? systemLevelName.charAt(0).toUpperCase() + systemLevelName.slice(1) : "—";
                          return (
                            <li key={`jobrole-match-${index}`} className="leading-relaxed">
                              - {suggestion.position ?? system?.name ?? "Vị trí chưa rõ"}: CV Level {suggestion.level ?? "—"} ({suggestion.yearsOfExp ? `${suggestion.yearsOfExp} năm` : "Chưa rõ"}) · Hồ sơ Level {formattedSystemLevel} ({existing.yearsOfExp ?? "—"} năm) · Lương CV {suggestion.ratePerMonth ? `${suggestion.ratePerMonth.toLocaleString("vi-VN")}đ/tháng` : "Chưa rõ"} · Hồ sơ {existing.ratePerMonth ? `${existing.ratePerMonth.toLocaleString("vi-VN")}đ/tháng` : "Chưa rõ"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {jobRoleLevelsOnlyInTalent.length > 0 && (
                    <div className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs text-green-800">
                      <p className="font-medium mb-1">Hồ sơ hiện có nhưng CV mới không đề cập:</p>
                      <ul className="space-y-1">
                        {jobRoleLevelsOnlyInTalent.map(({ existing, system }, index) => {
                          const systemLevelName = system ? getTalentLevelName(system.level) : undefined;
                          const formattedSystemLevel = systemLevelName ? systemLevelName.charAt(0).toUpperCase() + systemLevelName.slice(1) : "—";
                          return (
                            <li key={`jobrole-only-${index}`}>
                              - {(system?.name ?? existing.jobRoleLevelName) || "Vị trí chưa rõ"}: Level {formattedSystemLevel} ({existing.yearsOfExp ?? "—"} năm) · Lương {existing.ratePerMonth ? `${existing.ratePerMonth.toLocaleString("vi-VN")}đ/tháng` : "Chưa rõ"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {(jobRoleLevelsRecognized.length > 0 || jobRoleLevelsUnmatched.length > 0) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-3">
                      {jobRoleLevelsRecognized.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (đã có trong hệ thống):</p>
                          <ul className="space-y-2">
                            {jobRoleLevelsRecognized.map(({ suggestion, system }, index) => (
                              <li key={`jobrole-recognized-${index}`} className="flex flex-col rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-semibold text-sm">{suggestion.position ?? system?.name ?? "Vị trí chưa rõ"}</span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() =>
                                        handlePreparePrefillAndNavigate(
                                          "jobRoleLevels",
                                          [suggestion],
                                          `/hr/talent-job-role-levels/create?talentId=${id}`
                                        )
                                      }
                                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-warning-600 to-warning-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-warning-700 hover:to-warning-800"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Tạo nhanh
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-amber-600 mt-1">
                                  Gợi ý CV: Level {suggestion.level ?? "—"} · {suggestion.yearsOfExp ? `${suggestion.yearsOfExp} năm` : "Chưa rõ"} · Lương {suggestion.ratePerMonth ? `${suggestion.ratePerMonth.toLocaleString("vi-VN")}đ/tháng` : "Chưa rõ"}
                                </p>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-end">
                            <Button
                              onClick={() =>
                                handlePreparePrefillAndNavigate(
                                  "jobRoleLevels",
                                  jobRoleLevelsRecognized.map((item) => item.suggestion),
                                  `/hr/talent-job-role-levels/create?talentId=${id}`
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-warning-500 to-warning-600 px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:from-warning-600 hover:to-warning-700"
                            >
                              <Plus className="w-4 h-4" />
                              Dùng gợi ý để tạo vị trí
                            </Button>
                          </div>
                        </div>
                      )}
                      {jobRoleLevelsUnmatched.length > 0 && (
                        <div className="rounded-xl border border-dashed border-amber-300 bg-white p-3 text-xs text-amber-700">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (chưa có trong hệ thống):</p>
                          <ul className="mt-2 space-y-1">
                            {jobRoleLevelsUnmatched.map((suggestion, index) => (
                              <li key={`jobrole-unmatched-${index}`}>
                                - {suggestion.position ?? "Vị trí chưa rõ"}{" "}
                                {suggestion.level ? `· Level ${suggestion.level}` : ""}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex flex-col items-end gap-1">
                            <Button
                              onClick={() =>
                                handleSuggestionRequest(
                                  "jobRoleLevel",
                                  jobRoleSuggestionRequestKey,
                                  jobRoleSuggestionDisplayItems,
                                  jobRoleSuggestionDetailItems
                                )
                              }
                              disabled={
                                !jobRoleSuggestionDisplayItems.length || isSuggestionPending(jobRoleSuggestionRequestKey)
                              }
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 ${
                                !jobRoleSuggestionDisplayItems.length || isSuggestionPending(jobRoleSuggestionRequestKey)
                                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              {isSuggestionPending(jobRoleSuggestionRequestKey)
                                ? "Đã gửi đề xuất"
                                : "Đề xuất thêm vị trí/level vào hệ thống"}
                            </Button>
                            {isSuggestionPending(jobRoleSuggestionRequestKey) && (
                              <span className="text-xs text-amber-600">
                                Đang chờ Admin xem xét đề xuất này.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {jobRoleLevels.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobRoleLevels
                      .slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage)
                      .map((jrl) => (
                        <div key={jrl.id} className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-200 hover:from-warning-100 hover:to-warning-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-job-role-levels/edit/${jrl.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedJobRoleLevels.includes(jrl.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedJobRoleLevels([...selectedJobRoleLevels, jrl.id]);
                                  } else {
                                    setSelectedJobRoleLevels(selectedJobRoleLevels.filter(id => id !== jrl.id));
                                  }
                                }}
                                className="w-4 h-4 text-warning-600 bg-gray-100 border-gray-300 rounded focus:ring-warning-500 focus:ring-2"
                              />
                              <h3 className="font-semibold text-warning-800 hover:text-warning-900 transition-colors duration-200">{jrl.jobRoleLevelName}</h3>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-warning-700">
                              <span className="font-medium">Kinh nghiệm:</span> {jrl.yearsOfExp === 0 ? 'không có' : `${jrl.yearsOfExp} năm`}
                            </p>
                            <p className="text-sm text-warning-600">
                              <span className="font-medium">Mức lương:</span> {jrl.ratePerMonth ? `${jrl.ratePerMonth.toLocaleString('vi-VN')} VNĐ/tháng` : 'Chưa xác định'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageJobRoleLevels}
                    totalItems={jobRoleLevels.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageJobRoleLevels}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có thông tin vị trí</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa cập nhật vị trí làm việc</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kỹ năng của nhân sự */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isSkillsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Star className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Kỹ năng của nhân sự</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-skills/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Thêm kỹ năng
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteSkills}
                  disabled={selectedSkills.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedSkills.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa kỹ năng ({selectedSkills.length})
                </Button>
              </div>
            </div>
          </div>
          {isSkillsExpanded && (
            <div className="p-6">
              {analysisResult && (analysisResult.skills.newFromCV.length > 0 || analysisResult.skills.matched.length > 0) && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Đề xuất kỹ năng</h3>
                    <span className="text-xs text-amber-700">
                      {skillsRecognizedForAddition.length} đề xuất thêm · {matchedSkillsDetails.length} trùng CV · {unmatchedSkillSuggestions.length} cần tạo mới
                    </span>
                  </div>
                  {matchedSkillsDetails.length > 0 && (
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                      <p className="font-medium mb-1">So sánh trùng với hồ sơ hiện tại:</p>
                      <ul className="space-y-1">
                        {matchedSkillsDetails.map((item, index) => (
                          <li key={`matched-skill-${index}`}>
                            - {item.skillName}: CV {item.cvLevel} ({item.cvYearsExp} năm) · Hồ sơ {item.systemLevel} ({item.systemYearsExp} năm) · Độ tin cậy {item.matchConfidence}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {talentSkillsNotInCV.length > 0 && (
                    <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                      <p className="font-medium mb-1">Kỹ năng hồ sơ hiện có nhưng CV mới không đề cập:</p>
                      <ul className="space-y-1">
                        {talentSkillsNotInCV.map((skill) => (
                          <li key={`talent-only-skill-${skill.id}`}>
                            - {skill.skillName}: Level {skill.level} ({skill.yearsExp ?? "—"} năm)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(skillsRecognizedForAddition.length > 0 || unmatchedSkillSuggestions.length > 0) && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                      <p className="font-medium mb-2 text-sm text-amber-900">So sánh khác với hồ sơ hiện tại:</p>
                      {skillsRecognizedForAddition.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (đã có trong hệ thống):</p>
                          <ul className="space-y-1">
                            {skillsRecognizedForAddition.map((skill, index) => (
                              <li key={`missing-skill-system-${index}`} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 shadow-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm">{skill.skillName}</span>
                                  <span className="text-xs text-amber-600">
                                    Gợi ý CV: Level {skill.level ?? "—"} · {skill.yearsExp ? `${skill.yearsExp} năm` : "Chưa rõ"}
                                  </span>
                                </div>
                                <Button
                                  onClick={() =>
                                    handlePreparePrefillAndNavigate(
                                      "skills",
                                      [skill],
                                      `/hr/talent-skills/create?talentId=${id}`
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-secondary-700 hover:to-secondary-800"
                                >
                                  <Plus className="w-4 h-4" />
                                  Tạo nhanh
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 flex justify-end">
                            <Button
                              onClick={() =>
                                handlePreparePrefillAndNavigate(
                                  "skills",
                                  skillsRecognizedForAddition,
                                  `/hr/talent-skills/create?talentId=${id}`
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-700 px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:from-secondary-700 hover:to-secondary-800"
                            >
                              <Plus className="w-4 h-4" />
                              Dùng gợi ý để tạo kỹ năng
                            </Button>
                          </div>
                        </div>
                      )}
                      {unmatchedSkillSuggestions.length > 0 && (
                        <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-white p-3 text-xs text-amber-700">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (chưa có trong hệ thống):</p>
                          <ul className="mt-2 space-y-1">
                            {unmatchedSkillSuggestions.map((skill, index) => (
                              <li key={`unmatched-skill-${index}`}>- {skill.skillName}</li>
                            ))}
                          </ul>
                          <div className="mt-3 flex flex-col items-end gap-1">
                            <Button
                              onClick={() =>
                                handleSuggestionRequest(
                                  "skill",
                                  skillSuggestionRequestKey,
                                  skillSuggestionDisplayItems,
                                  skillSuggestionDetailItems
                                )
                              }
                              disabled={
                                !skillSuggestionDisplayItems.length || isSuggestionPending(skillSuggestionRequestKey)
                              }
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 ${
                                !skillSuggestionDisplayItems.length || isSuggestionPending(skillSuggestionRequestKey)
                                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              {isSuggestionPending(skillSuggestionRequestKey)
                                ? "Đã gửi đề xuất"
                                : "Đề xuất thêm kỹ năng vào hệ thống"}
                            </Button>
                            {isSuggestionPending(skillSuggestionRequestKey) && (
                              <span className="text-xs text-amber-600">
                                Đang chờ Admin xem xét đề xuất này.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {talentSkills.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {talentSkills
                      .slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage)
                      .map((skill) => (
                        <div key={skill.id} className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 hover:from-secondary-100 hover:to-secondary-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-skills/edit/${skill.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedSkills.includes(skill.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedSkills([...selectedSkills, skill.id]);
                                  } else {
                                    setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                                  }
                                }}
                                className="w-4 h-4 text-secondary-600 bg-gray-100 border-gray-300 rounded focus:ring-secondary-500 focus:ring-2"
                              />
                              <h3 className="font-semibold text-secondary-800 hover:text-secondary-900 transition-colors duration-200">{skill.skillName}</h3>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-secondary-700">
                              <span className="font-medium">Level:</span> {skill.level}
                            </p>
                            <p className="text-sm text-secondary-600">
                              <span className="font-medium">Kinh nghiệm:</span> {skill.yearsExp === 0 ? 'không có' : `${skill.yearsExp} năm`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageSkills}
                    totalItems={talentSkills.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageSkills}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có kỹ năng nào</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa cập nhật kỹ năng</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lịch sẵn sàng của nhân sự */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsAvailableTimesExpanded(!isAvailableTimesExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isAvailableTimesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Lịch sẵn sàng của nhân sự</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-available-times/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Thêm thời gian
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteAvailableTimes}
                  disabled={selectedAvailableTimes.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedAvailableTimes.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa thời gian ({selectedAvailableTimes.length})
                </Button>
              </div>
            </div>
          </div>
          {isAvailableTimesExpanded && (
            <div className="p-6">
              {availableTimes.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {availableTimes
                      .slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage)
                      .map((time) => (
                        <div key={time.id} className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 hover:from-secondary-100 hover:to-secondary-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-available-times/edit/${time.id}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedAvailableTimes.includes(time.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedAvailableTimes([...selectedAvailableTimes, time.id]);
                                  } else {
                                    setSelectedAvailableTimes(selectedAvailableTimes.filter(id => id !== time.id));
                                  }
                                }}
                                className="w-4 h-4 text-secondary-600 bg-gray-100 border-gray-300 rounded focus:ring-secondary-500 focus:ring-2"
                              />
                              <div>
                                <p className="text-sm text-secondary-700">
                                  <span className="font-medium">Từ:</span> {new Date(time.startTime).toLocaleDateString('vi-VN')}
                                </p>
                                <p className="text-sm text-secondary-600">
                                  <span className="font-medium">Đến:</span> {time.endTime ? new Date(time.endTime).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                                </p>
                              </div>
                            </div>
                          </div>
                          {time.notes && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 font-medium mb-1">Ghi chú:</p>
                              <p className="text-sm text-gray-700">{time.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageAvailableTimes}
                    totalItems={availableTimes.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageAvailableTimes}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có thông tin thời gian</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa cập nhật thời gian có sẵn</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chứng chỉ */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsCertificatesExpanded(!isCertificatesExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isCertificatesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Award className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Chứng chỉ</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-certificates/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Thêm chứng chỉ
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteCertificates}
                  disabled={selectedCertificates.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedCertificates.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa chứng chỉ ({selectedCertificates.length})
                </Button>
              </div>
            </div>
          </div>
          {isCertificatesExpanded && (
            <div className="p-6">
              {(certificatesRecognized.length > 0 || certificatesMatched.length > 0 || certificatesOnlyInTalent.length > 0 || certificatesUnmatched.length > 0) && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-rose-900 uppercase tracking-wide">Đề xuất chứng chỉ</h3>
                    <span className="text-xs text-rose-700">
                      {certificatesRecognized.length} đề xuất thêm · {certificatesMatched.length} trùng CV · {certificatesUnmatched.length} cần tạo mới
                    </span>
                  </div>
                  {certificatesMatched.length > 0 && (
                    <div className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs text-rose-900">
                      <p className="font-medium mb-1">So sánh trùng với hồ sơ hiện tại:</p>
                      <ul className="space-y-1">
                        {certificatesMatched.map(({ suggestion, existing }, index) => (
                          <li key={`certificate-match-${index}`} className="leading-relaxed">
                            - {suggestion.certificateName}: CV ngày cấp {suggestion.issuedDate ?? "Chưa rõ"} · Hồ sơ ngày cấp {existing.issuedDate ? new Date(existing.issuedDate).toLocaleDateString("vi-VN") : "Chưa rõ"} · Trạng thái {existing.isVerified ? "đã xác thực" : "chưa xác thực"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {certificatesOnlyInTalent.length > 0 && (
                    <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-rose-800">
                      <p className="font-medium mb-1">Hồ sơ hiện có nhưng CV mới không đề cập:</p>
                      <ul className="space-y-1">
                        {certificatesOnlyInTalent.map((certificate) => (
                          <li key={`certificate-only-${certificate.id}`}>
                            - {certificate.certificateTypeName}: Ngày cấp {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString("vi-VN") : "Chưa rõ"} · {certificate.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(certificatesRecognized.length > 0 || certificatesUnmatched.length > 0) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-3">
                      {certificatesRecognized.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (đã có trong hệ thống):</p>
                          <ul className="space-y-2">
                            {certificatesRecognized.map(({ suggestion }, index) => (
                              <li key={`certificate-recognized-${index}`} className="flex flex-col rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-semibold text-sm">{suggestion.certificateName}</span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() =>
                                        handlePreparePrefillAndNavigate(
                                          "certificates",
                                          [suggestion],
                                          `/hr/talent-certificates/create?talentId=${id}`
                                        )
                                      }
                                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-primary-700 hover:to-primary-800"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Tạo nhanh
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-amber-600 mt-1">Gợi ý CV: Ngày cấp {suggestion.issuedDate ?? "Chưa rõ"}</p>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-end">
                            <Button
                              onClick={() =>
                                handlePreparePrefillAndNavigate(
                                  "certificates",
                                  certificatesRecognized.map((item) => item.suggestion),
                                  `/hr/talent-certificates/create?talentId=${id}`
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:from-primary-600 hover:to-primary-700"
                            >
                              <Plus className="w-4 h-4" />
                              Dùng gợi ý để tạo chứng chỉ
                            </Button>
                          </div>
                        </div>
                      )}
                      {certificatesUnmatched.length > 0 && (
                        <div className="rounded-xl border border-dashed border-amber-300 bg-white p-3 text-xs text-amber-700">
                          <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (chưa có trong hệ thống):</p>
                          <ul className="mt-2 space-y-1">
                            {certificatesUnmatched.map((suggestion, index) => (
                              <li key={`certificate-unmatched-${index}`}>- {suggestion.certificateName}</li>
                            ))}
                          </ul>
                          <div className="mt-3 flex flex-col items-end gap-1">
                            <Button
                              onClick={() =>
                                handleSuggestionRequest(
                                  "certificate",
                                  certificateSuggestionRequestKey,
                                  certificateSuggestionDisplayItems,
                                  certificateSuggestionDetailItems
                                )
                              }
                              disabled={
                                !certificateSuggestionDisplayItems.length ||
                                isSuggestionPending(certificateSuggestionRequestKey)
                              }
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-300 ${
                                !certificateSuggestionDisplayItems.length ||
                                isSuggestionPending(certificateSuggestionRequestKey)
                                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              {isSuggestionPending(certificateSuggestionRequestKey)
                                ? "Đã gửi đề xuất"
                                : "Đề xuất thêm chứng chỉ vào hệ thống"}
                            </Button>
                            {isSuggestionPending(certificateSuggestionRequestKey) && (
                              <span className="text-xs text-amber-600">
                                Đang chờ Admin xem xét đề xuất này.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {certificates.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates
                      .slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage)
                      .map((cert) => (
                        <div key={cert.id} className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:from-primary-100 hover:to-primary-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-certificates/edit/${cert.id}`)}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedCertificates.includes(cert.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedCertificates([...selectedCertificates, cert.id]);
                                  } else {
                                    setSelectedCertificates(selectedCertificates.filter(id => id !== cert.id));
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                              />
                              <h3 className="font-semibold text-primary-800 hover:text-primary-900 transition-colors duration-200">{cert.certificateTypeName}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${cert.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {cert.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-primary-700">
                              <span className="font-medium">Ngày cấp:</span> {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                            </p>
                          </div>
                          {cert.imageUrl && (
                            <a
                              href={cert.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Xem chứng chỉ
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageCertificates}
                    totalItems={certificates.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageCertificates}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có chứng chỉ nào</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa upload chứng chỉ</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kinh nghiệm làm việc */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsExperiencesExpanded(!isExperiencesExpanded)}>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  {isExperiencesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Workflow className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Kinh nghiệm làm việc</h2>
              </div>
              <div className="flex gap-2">
                <Link to={`/hr/talent-work-experiences/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center gap-2 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Thêm kinh nghiệm
                  </Button>
                </Link>
                <Button
                  onClick={handleDeleteExperiences}
                  disabled={selectedExperiences.length === 0}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${selectedExperiences.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    }`}
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Xóa kinh nghiệm ({selectedExperiences.length})
                </Button>
              </div>
            </div>
          </div>
          {isExperiencesExpanded && (
            <div className="p-6">
              {analysisResult && (analysisResult.workExperiences.newEntries.length > 0 || analysisResult.workExperiences.potentialDuplicates.length > 0) && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Đề xuất kinh nghiệm làm việc</h3>
                    <span className="text-xs text-blue-700">{analysisResult.workExperiences.newEntries.length} mục mới · {analysisResult.workExperiences.potentialDuplicates.length} mục có thể trùng</span>
                  </div>
                  {analysisResult.workExperiences.newEntries.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-blue-700 font-medium">Kinh nghiệm mới nên thêm:</p>
                      {analysisResult.workExperiences.newEntries.map((exp, index) => (
                        <div key={`suggested-exp-${index}`} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 shadow-sm">
                          <p className="font-semibold">{exp.position}</p>
                          <p className="text-xs text-blue-700">{exp.company}</p>
                          <p className="text-xs text-blue-600">{exp.startDate ?? "—"} - {exp.endDate ?? "Hiện tại"}</p>
                          {exp.description && <p className="mt-1 text-xs text-blue-700 line-clamp-2">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysisResult.workExperiences.potentialDuplicates.length > 0 && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                      <p className="font-medium mb-1">Mục cần rà soát trùng lặp:</p>
                      <ul className="space-y-1">
                        {analysisResult.workExperiences.potentialDuplicates.map((dup, index) => (
                          <li key={`dup-exp-${index}`}>
                            - {dup.fromCV.position} tại {dup.fromCV.company} · Khuyến nghị: <span className="font-semibold">{dup.recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      onClick={() =>
                        handlePreparePrefillAndNavigate(
                          "experiences",
                          analysisResult.workExperiences.newEntries,
                          `/hr/talent-work-experiences/create?talentId=${id}`
                        )
                      }
                      disabled={analysisResult.workExperiences.newEntries.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        analysisResult.workExperiences.newEntries.length === 0
                          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-soft hover:shadow-glow"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Dùng gợi ý để tạo kinh nghiệm
                    </Button>
                  </div>
                </div>
              )}
              {workExperiences.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {workExperiences
                      .slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage)
                      .map((exp) => (
                        <div key={exp.id} className="p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200 hover:from-accent-100 hover:to-accent-200 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/hr/talent-work-experiences/edit/${exp.id}`)}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedExperiences.includes(exp.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedExperiences([...selectedExperiences, exp.id]);
                                  } else {
                                    setSelectedExperiences(selectedExperiences.filter(id => id !== exp.id));
                                  }
                                }}
                                className="w-4 h-4 text-accent-600 bg-gray-100 border-gray-300 rounded focus:ring-accent-500 focus:ring-2"
                              />
                              <div>
                                <h3 className="font-semibold text-accent-800 hover:text-accent-900 transition-colors duration-200">{exp.position}</h3>
                                <p className="text-sm text-accent-700">
                                  <span className="font-medium">Công ty:</span> {exp.company}
                                </p>
                                <p className="text-sm text-accent-600">
                                  <span className="font-medium">Thời gian:</span> {new Date(exp.startDate).toLocaleDateString('vi-VN')} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 font-medium mb-1">Mô tả công việc:</p>
                            <p className="text-sm text-gray-700">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <SectionPagination
                    currentPage={pageExperiences}
                    totalItems={workExperiences.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPageExperiences}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-lg font-medium">Chưa có kinh nghiệm làm việc</p>
                  <p className="text-neutral-400 text-sm mt-1">Nhân sự chưa cập nhật kinh nghiệm</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


function InfoItem({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-neutral-400">{icon}</div>}
        <p className="text-neutral-500 text-sm font-medium">{label}</p>
      </div>
      <div className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300 break-words max-w-full overflow-hidden">
        {value || "—"}
      </div>
    </div>
  );
}

// Pagination component for sections
function SectionPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const startItem = totalItems > 0 ? startIndex + 1 : 0;
  const endItem = endIndex;

  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
      <p className="text-sm text-neutral-600">
        {startItem}-{endItem} của {totalItems} mục
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-200 ${currentPage === 1
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-primary-600"
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-200 ${currentPage === totalPages
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-primary-600"
            }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
