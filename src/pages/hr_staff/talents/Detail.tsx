import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentService, type Talent, type TalentProjectCreateModel, type TalentSkillCreateModel, type TalentWorkExperienceCreateModel, type TalentCertificateCreateModel, type TalentJobRoleLevelCreateModel } from "../../../services/Talent";
import { locationService } from "../../../services/location";
import { partnerService, type Partner } from "../../../services/Partner";
import { talentCVService, type TalentCV, type CVAnalysisComparisonResponse } from "../../../services/TalentCV";
import { talentProjectService, type TalentProject } from "../../../services/TalentProject";
import { talentSkillService, type TalentSkill } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { skillGroupService, type SkillGroup } from "../../../services/SkillGroup";
import { talentWorkExperienceService, type TalentWorkExperience } from "../../../services/TalentWorkExperience";
import { talentJobRoleLevelService, type TalentJobRoleLevel } from "../../../services/TalentJobRoleLevel";
import { jobRoleLevelService, type JobRoleLevel, TalentLevel as TalentLevelEnum } from "../../../services/JobRoleLevel";
import { talentCertificateService, type TalentCertificate } from "../../../services/TalentCertificate";
import { certificateTypeService, type CertificateType } from "../../../services/CertificateType";
import { talentAvailableTimeService, type TalentAvailableTime } from "../../../services/TalentAvailableTime";
import { notificationService, NotificationPriority, NotificationType } from "../../../services/Notification";
import { userService } from "../../../services/User";
import { decodeJWT } from "../../../services/Auth";
import { WorkingMode } from "../../../types/WorkingMode";
import { uploadFile } from "../../../utils/firebaseStorage";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../configs/firebase";
import { Button } from "../../../components/ui/button";
import {
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
  Filter,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Save,
  Search,
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
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const [talent, setTalent] = useState<Talent | null>(null);
  const [locationName, setLocationName] = useState<string>("—");
  const [partnerName, setPartnerName] = useState<string>("—");
  const [talentCVs, setTalentCVs] = useState<(TalentCV & { jobRoleLevelName?: string })[]>([]);
  const [talentProjects, setTalentProjects] = useState<TalentProject[]>([]);
  const [talentSkills, setTalentSkills] = useState<(TalentSkill & { skillName: string })[]>([]);
  const [workExperiences, setWorkExperiences] = useState<TalentWorkExperience[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<(TalentJobRoleLevel & { jobRoleLevelName: string })[]>([]);
  const [certificates, setCertificates] = useState<(TalentCertificate & { certificateTypeName: string })[]>([]);
  const [availableTimes, setAvailableTimes] = useState<TalentAvailableTime[]>([]);
  const [lookupSkills, setLookupSkills] = useState<Skill[]>([]);
  const [lookupSkillGroups, setLookupSkillGroups] = useState<SkillGroup[]>([]);
  const [lookupJobRoleLevels, setLookupJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [lookupCertificateTypes, setLookupCertificateTypes] = useState<CertificateType[]>([]);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisComparisonResponse | null>(null);
  const [analysisResultCVId, setAnalysisResultCVId] = useState<number | null>(null);
  type SuggestionCategory = "skill" | "jobRoleLevel" | "certificate";
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [sentSuggestionKeys, setSentSuggestionKeys] = useState<Set<string>>(new Set());
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
  const [activeTab, setActiveTab] = useState<"projects" | "cvs" | "jobRoleLevels" | "skills" | "availableTimes" | "certificates" | "experiences">("projects");

  // Inline form states
  const [showInlineForm, setShowInlineForm] = useState<"project" | "skill" | "certificate" | "experience" | "jobRoleLevel" | "availableTime" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineProjectForm, setInlineProjectForm] = useState<Partial<TalentProjectCreateModel>>({
    projectName: "",
    position: "",
    technologies: "",
    description: "",
  });
  const [inlineSkillForm, setInlineSkillForm] = useState<Partial<TalentSkillCreateModel>>({
    skillId: 0,
    level: "Beginner",
    yearsExp: 1,
  });
  const [inlineCertificateForm, setInlineCertificateForm] = useState<Partial<TalentCertificateCreateModel>>({
    certificateTypeId: 0,
    certificateName: "",
    certificateDescription: "",
    issuedDate: undefined,
    isVerified: false,
    imageUrl: "",
  });
  const [inlineExperienceForm, setInlineExperienceForm] = useState<Partial<TalentWorkExperienceCreateModel>>({
    company: "",
    position: "",
    startDate: "",
    endDate: undefined,
    description: "",
  });
  const [inlineJobRoleLevelForm, setInlineJobRoleLevelForm] = useState<Partial<TalentJobRoleLevelCreateModel>>({
    jobRoleLevelId: 0,
    yearsOfExp: 1,
    ratePerMonth: undefined,
  });
  const [inlineAvailableTimeForm, setInlineAvailableTimeForm] = useState<Partial<TalentAvailableTime>>({
    startTime: "",
    endTime: undefined,
    notes: "",
  });
  const [availableTimeFormErrors, setAvailableTimeFormErrors] = useState<Record<string, string>>({});
  // Certificate image upload states
  const [certificateImageFile, setCertificateImageFile] = useState<File | null>(null);
  const [uploadingCertificateImage, setUploadingCertificateImage] = useState(false);
  const [certificateUploadProgress, setCertificateUploadProgress] = useState<number>(0);
  const [uploadedCertificateUrl, setUploadedCertificateUrl] = useState<string | null>(null);
  const [certificateFormErrors, setCertificateFormErrors] = useState<Record<string, string>>({});
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [skillGroupSearchQuery, setSkillGroupSearchQuery] = useState<string>("");
  const [isSkillGroupDropdownOpen, setIsSkillGroupDropdownOpen] = useState(false);
  const [selectedSkillGroupId, setSelectedSkillGroupId] = useState<number | undefined>(undefined);
  const [certificateTypeSearch, setCertificateTypeSearch] = useState<string>("");
  const [isCertificateTypeDropdownOpen, setIsCertificateTypeDropdownOpen] = useState(false);
  const [jobRoleLevelSearch, setJobRoleLevelSearch] = useState<string>("");
  const [isJobRoleLevelDropdownOpen, setIsJobRoleLevelDropdownOpen] = useState(false);
  const [workExperiencePositionSearch, setWorkExperiencePositionSearch] = useState<string>("");
  const [isWorkExperiencePositionDropdownOpen, setIsWorkExperiencePositionDropdownOpen] = useState(false);
  
  // Danh sách vị trí công việc cho Kinh Nghiệm
  const workExperiencePositions = [
    "Frontend Developer (React, Angular, Vue)",
    "Backend Developer (Node.js, .NET, Java, Go)",
    "Fullstack Developer",
    "Mobile Developer (iOS/Android/Flutter/React Native)",
    "AI/ML Engineer",
    "Data Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Cloud Engineer",
    "QA/QC Engineer (Manual / Automation)",
    "Test Lead",
    "Solution Architect",
    "Technical Lead (Tech Lead)",
    "Software Architect"
  ];

  // Tự động đóng form khi chuyển tab (nếu form không thuộc tab hiện tại)
  useEffect(() => {
    if (isSubmitting) return; // Không đóng form khi đang submit
    
    const formTabMap: Record<string, string> = {
      "project": "projects",
      "skill": "skills",
      "certificate": "certificates",
      "experience": "experiences",
      "jobRoleLevel": "jobRoleLevels",
      "availableTime": "availableTimes"
    };
    
    if (showInlineForm) {
      const formTab = formTabMap[showInlineForm];
      if (formTab && formTab !== activeTab) {
        // Form không thuộc tab hiện tại, đóng form
        setShowInlineForm(null);
      }
    }
  }, [activeTab, showInlineForm, isSubmitting]);

  // Chỉ khôi phục kết quả phân tích CV sau khi đã load danh sách CVs và xác nhận CV ID tồn tại
  useEffect(() => {
    if (!ANALYSIS_RESULT_STORAGE_KEY || talentCVs.length === 0) return;
    try {
      const stored = sessionStorage.getItem(ANALYSIS_RESULT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        cvId: number | null;
        result: CVAnalysisComparisonResponse | null;
      };
      // Chỉ khôi phục nếu có kết quả phân tích VÀ CV ID tồn tại trong danh sách CVs hiện tại
      if (parsed?.result && parsed?.cvId) {
        const cvExists = talentCVs.some(cv => cv.id === parsed.cvId);
        if (cvExists) {
          setAnalysisResult(parsed.result);
          setAnalysisResultCVId(parsed.cvId);
        } else {
          // CV không tồn tại, xóa dữ liệu phân tích cũ
          sessionStorage.removeItem(ANALYSIS_RESULT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn("Không thể khôi phục kết quả phân tích CV:", error);
    }
  }, [ANALYSIS_RESULT_STORAGE_KEY, talentCVs]);

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
  // State để quản lý việc collapse/expand CV không hoạt động theo từng jobRoleLevelName
  const [collapsedInactiveCVGroups, setCollapsedInactiveCVGroups] = useState<Set<string>>(new Set());

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

        // Fetch job role levels once and reuse for both CVs and job role levels mapping
        const allJobRoleLevels = await jobRoleLevelService.getAll({ excludeDeleted: true, distinctByName: true });
        const jobRoleLevelsArray = Array.isArray(allJobRoleLevels) ? allJobRoleLevels : [];
        setLookupJobRoleLevels(jobRoleLevelsArray);
        
        // Map CVs with job role level names
        const cvsWithJobRoleLevelNames = cvs.map((cv: TalentCV) => {
          const jobRoleLevelInfo = jobRoleLevelsArray.find((jrl: JobRoleLevel) => jrl.id === cv.jobRoleLevelId);
          return { ...cv, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Chưa xác định" };
        });
        // Sắp xếp CV: nhóm theo jobRoleLevelName, active trước, sau đó theo version giảm dần
        const sortedCVs = cvsWithJobRoleLevelNames.sort((a: TalentCV & { jobRoleLevelName?: string }, b: TalentCV & { jobRoleLevelName?: string }) => {
          // Ưu tiên 1: Sắp xếp theo jobRoleLevelName
          const nameA = a.jobRoleLevelName || "";
          const nameB = b.jobRoleLevelName || "";
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB);
          }
          // Ưu tiên 2: Active trước, inactive sau
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }
          // Ưu tiên 3: Version giảm dần (mới nhất trước)
          return (b.version || 0) - (a.version || 0);
        });
        setTalentCVs(sortedCVs);
        
        // Thu gọn tất cả các nhóm CV không hoạt động mặc định
        const inactiveGroups = new Set<string>();
        sortedCVs.forEach((cv: TalentCV & { jobRoleLevelName?: string }) => {
        if (!cv.isActive && cv.jobRoleLevelName) {
          inactiveGroups.add(cv.jobRoleLevelName);
        }
      });

      // Fetch skill names
        const allSkills = await skillService.getAll();
        setLookupSkills(allSkills);
        
        // Fetch skill groups
        try {
          const skillGroupsData = await skillGroupService.getAll({ excludeDeleted: true });
          const skillGroupsArray = Array.isArray(skillGroupsData)
            ? skillGroupsData
            : (Array.isArray((skillGroupsData as any)?.items)
              ? (skillGroupsData as any).items
              : (Array.isArray((skillGroupsData as any)?.data)
                ? (skillGroupsData as any).data
                : []));
          setLookupSkillGroups(skillGroupsArray);
        } catch (skillGroupsError) {
          console.error("❌ Lỗi khi tải nhóm kỹ năng:", skillGroupsError);
          setLookupSkillGroups([]);
        }
        const skillsWithNames = skills.map((skill: TalentSkill) => {
          const skillInfo = allSkills.find((s: Skill) => s.id === skill.skillId);
          return { ...skill, skillName: skillInfo?.name ?? "Unknown Skill" };
        });
        setTalentSkills(skillsWithNames);

        // Map job role levels with names (reuse allJobRoleLevels)
        const jobRoleLevelsWithNames = jobRoleLevelsData.map((jrl: TalentJobRoleLevel) => {
          const jobRoleLevelInfo = jobRoleLevelsArray.find((j: JobRoleLevel) => j.id === jrl.jobRoleLevelId);
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

  // 🗑️ Xóa nhân sự
  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa nhân sự này?");
    if (!confirm) return;

    try {
      await talentService.deleteById(Number(id));
      alert("✅ Đã xóa nhân sự thành công!");
      navigate("/ta/developers");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa nhân sự!");
    }
  };

  // ✏️ Chuyển sang trang sửa
  const handleEdit = () => {
    navigate(`/ta/developers/edit/${id}`);
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
      const allJobRoleLevels = await jobRoleLevelService.getAll({ excludeDeleted: true, distinctByName: true });
      const jobRoleLevelsArray = Array.isArray(allJobRoleLevels) ? allJobRoleLevels : [];
      const cvsWithJobRoleLevelNames = cvs.map((cv: TalentCV) => {
        const jobRoleLevelInfo = jobRoleLevelsArray.find((jrl: JobRoleLevel) => jrl.id === cv.jobRoleLevelId);
        return { ...cv, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Chưa xác định" };
      });
      // Sắp xếp CV: nhóm theo jobRoleLevelName, active trước, sau đó theo version giảm dần
      const sortedCVs = cvsWithJobRoleLevelNames.sort((a: TalentCV & { jobRoleLevelName?: string }, b: TalentCV & { jobRoleLevelName?: string }) => {
        // Ưu tiên 1: Sắp xếp theo jobRoleLevelName
        const nameA = a.jobRoleLevelName || "";
        const nameB = b.jobRoleLevelName || "";
        if (nameA !== nameB) {
          return nameA.localeCompare(nameB);
        }
        // Ưu tiên 2: Active trước, inactive sau
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        // Ưu tiên 3: Version giảm dần (mới nhất trước)
        return (b.version || 0) - (a.version || 0);
      });
      setTalentCVs(sortedCVs);
      
      // Thu gọn tất cả các nhóm CV không hoạt động mặc định
      const inactiveGroups = new Set<string>();
      sortedCVs.forEach((cv: TalentCV & { jobRoleLevelName?: string }) => {
        if (!cv.isActive && cv.jobRoleLevelName) {
          inactiveGroups.add(cv.jobRoleLevelName);
        }
      });
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

  const handleAnalyzeCVFromUrl = async (cv: TalentCV & { jobRoleLevelName?: string }) => {
    if (!id) return;
    if (!cv.cvFileUrl) {
      alert("⚠️ Không tìm thấy đường dẫn CV để phân tích.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn phân tích CV "v${cv.version}"?\n` +
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
      const sanitizedVersionName = `v${cv.version}`.replace(/[^a-zA-Z0-9-_]/g, "_");
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
      return sentSuggestionKeys.has(key);
    },
    [sentSuggestionKeys]
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
        const requesterName = decoded?.unique_name || decoded?.email || decoded?.name || "TA Staff";
        const messageLines = displayItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n");

        await notificationService.create({
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

        // Đánh dấu đã gửi đề xuất này
        setSentSuggestionKeys((prev) => new Set(prev).add(suggestionKey));

        alert("Đã gửi đề xuất tới Admin thành công!");
      } catch (error) {
        console.error("Không thể gửi đề xuất tới Admin:", error);
        alert("Không thể gửi đề xuất tới Admin.");
      }
    },
    [adminUserIds, id, isSuggestionPending, talentName]
  );


  // Helper function để lưu CV ID đang được phân tích vào sessionStorage
  const saveAnalysisCVId = () => {
    if (!id || !analysisResultCVId) return;
    try {
      const cvIdStorageKey = `${ANALYSIS_STORAGE_PREFIX}-cv-id-${id}`;
      sessionStorage.setItem(cvIdStorageKey, JSON.stringify(analysisResultCVId));
    } catch (error) {
      console.error("Không thể lưu CV ID vào bộ nhớ tạm:", error);
    }
  };



  const handlePreparePrefillAndNavigate = (type: PrefillType, data: unknown, targetPath: string) => {
    if (!id) return;
    if (Array.isArray(data) && data.length === 0) {
      alert("Không có gợi ý phù hợp để dùng cho việc tạo mới.");
      return;
    }
    try {
      sessionStorage.setItem(getPrefillStorageKey(type), JSON.stringify(data));
      // Lưu CV ID đang được phân tích cho projects và experiences
      if ((type === "projects" || type === "experiences") && analysisResultCVId) {
        saveAnalysisCVId();
      }
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
      const allJobRoleLevels = await jobRoleLevelService.getAll({ excludeDeleted: true, distinctByName: true });
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

  // Inline form handlers
  const handleOpenInlineForm = (type: "project" | "skill" | "certificate" | "experience" | "jobRoleLevel" | "availableTime") => {
    if (isSubmitting) {
      return; // Chỉ chặn khi đang submit
    }
    // Cho phép mở form của tab khác (sẽ tự động đóng form cũ)
    setShowInlineForm(type);
    // Reset form based on type
    if (type === "project") {
      setInlineProjectForm({ projectName: "", position: "", technologies: "", description: "" });
    } else if (type === "skill") {
      setInlineSkillForm({ skillId: 0, level: "Beginner", yearsExp: 1 });
    } else if (type === "certificate") {
      setInlineCertificateForm({ certificateTypeId: 0, certificateName: "", certificateDescription: "", issuedDate: undefined, isVerified: false, imageUrl: "" });
      setCertificateImageFile(null);
      setUploadedCertificateUrl(null);
      setCertificateFormErrors({});
    } else if (type === "experience") {
      setInlineExperienceForm({ company: "", position: "", startDate: "", endDate: undefined, description: "" });
    } else if (type === "jobRoleLevel") {
      setInlineJobRoleLevelForm({ jobRoleLevelId: 0, yearsOfExp: 1, ratePerMonth: undefined });
    } else if (type === "availableTime") {
      setInlineAvailableTimeForm({ startTime: "", endTime: undefined, notes: "" });
      setAvailableTimeFormErrors({});
    }
  };

  const handleCloseInlineForm = () => {
    setShowInlineForm(null);
    setAvailableTimeFormErrors({});
    setCertificateImageFile(null);
    setUploadedCertificateUrl(null);
    setCertificateFormErrors({});
  };

  const handleSubmitInlineProject = async () => {
    if (!id || isSubmitting) return;
    if (!inlineProjectForm.projectName?.trim()) {
      alert("⚠️ Vui lòng nhập tên dự án!");
      return;
    }
    try {
      setIsSubmitting(true);
      const activeCV = talentCVs.find(cv => cv.isActive) || talentCVs[0];
      if (!activeCV) {
        alert("⚠️ Vui lòng tạo CV trước khi thêm dự án!");
        return;
      }
      await talentProjectService.create({
        talentId: Number(id),
        talentCVId: activeCV.id,
        projectName: inlineProjectForm.projectName!,
        position: inlineProjectForm.position || "",
        technologies: inlineProjectForm.technologies || "",
        description: inlineProjectForm.description || "",
      });
      alert("✅ Đã tạo dự án thành công!");
      handleCloseInlineForm();
      // Refresh data
      const projects = await talentProjectService.getAll({ talentId: Number(id), excludeDeleted: true });
      setTalentProjects(projects);
    } catch (err) {
      console.error("❌ Lỗi khi tạo dự án:", err);
      alert("Không thể tạo dự án!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInlineSkill = async () => {
    if (!id || isSubmitting) return;
    if (!inlineSkillForm.skillId || inlineSkillForm.skillId === 0) {
      alert("⚠️ Vui lòng chọn kỹ năng!");
      return;
    }
    try {
      setIsSubmitting(true);
      await talentSkillService.create({
        talentId: Number(id),
        skillId: inlineSkillForm.skillId!,
        level: inlineSkillForm.level || "Beginner",
        yearsExp: inlineSkillForm.yearsExp || 1,
      });
      alert("✅ Đã thêm kỹ năng thành công!");
      handleCloseInlineForm();
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
      console.error("❌ Lỗi khi thêm kỹ năng:", err);
      alert("Không thể thêm kỹ năng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInlineCertificate = async () => {
    if (!id || isSubmitting) return;
    if (!inlineCertificateForm.certificateTypeId || inlineCertificateForm.certificateTypeId === 0) {
      setCertificateFormErrors({ certificateTypeId: "⚠️ Vui lòng chọn loại chứng chỉ!" });
      return;
    }
    if (!inlineCertificateForm.certificateName?.trim()) {
      setCertificateFormErrors({ certificateName: "⚠️ Vui lòng nhập tên chứng chỉ!" });
      return;
    }
    // Validate issued date
    if (inlineCertificateForm.issuedDate && !validateIssuedDate(inlineCertificateForm.issuedDate)) {
      setCertificateFormErrors({ issuedDate: "⚠️ Ngày cấp không được là ngày trong tương lai." });
      return;
    }
    try {
      setIsSubmitting(true);
      await talentCertificateService.create({
        talentId: Number(id),
        certificateTypeId: inlineCertificateForm.certificateTypeId!,
        certificateName: inlineCertificateForm.certificateName!,
        certificateDescription: inlineCertificateForm.certificateDescription,
        issuedDate: inlineCertificateForm.issuedDate,
        isVerified: inlineCertificateForm.isVerified || false,
        imageUrl: inlineCertificateForm.imageUrl || "",
      });
      alert("✅ Đã thêm chứng chỉ thành công!");
      handleCloseInlineForm();
      setCertificateFormErrors({});
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
      console.error("❌ Lỗi khi thêm chứng chỉ:", err);
      alert("Không thể thêm chứng chỉ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInlineExperience = async () => {
    if (!id || isSubmitting) return;
    if (!inlineExperienceForm.company?.trim() || !inlineExperienceForm.position?.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin công ty và vị trí!");
      return;
    }
    if (!inlineExperienceForm.startDate) {
      alert("⚠️ Vui lòng nhập ngày bắt đầu!");
      return;
    }
    try {
      setIsSubmitting(true);
      const activeCV = talentCVs.find(cv => cv.isActive) || talentCVs[0];
      if (!activeCV) {
        alert("⚠️ Vui lòng tạo CV trước khi thêm kinh nghiệm!");
        return;
      }
      await talentWorkExperienceService.create({
        talentId: Number(id),
        talentCVId: activeCV.id,
        company: inlineExperienceForm.company!,
        position: inlineExperienceForm.position!,
        startDate: inlineExperienceForm.startDate!,
        endDate: inlineExperienceForm.endDate,
        description: inlineExperienceForm.description || "",
      });
      alert("✅ Đã thêm kinh nghiệm thành công!");
      handleCloseInlineForm();
      // Refresh data
      const experiences = await talentWorkExperienceService.getAll({ talentId: Number(id), excludeDeleted: true });
      setWorkExperiences(experiences);
    } catch (err) {
      console.error("❌ Lỗi khi thêm kinh nghiệm:", err);
      alert("Không thể thêm kinh nghiệm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInlineJobRoleLevel = async () => {
    if (!id || isSubmitting) return;
    if (!inlineJobRoleLevelForm.jobRoleLevelId || inlineJobRoleLevelForm.jobRoleLevelId === 0) {
      alert("⚠️ Vui lòng chọn vị trí!");
      return;
    }
    try {
      setIsSubmitting(true);
      await talentJobRoleLevelService.create({
        talentId: Number(id),
        jobRoleLevelId: inlineJobRoleLevelForm.jobRoleLevelId!,
        yearsOfExp: inlineJobRoleLevelForm.yearsOfExp || 1,
        ratePerMonth: inlineJobRoleLevelForm.ratePerMonth,
      });
      alert("✅ Đã thêm vị trí thành công!");
      handleCloseInlineForm();
      // Refresh data
      const jobRoleLevelsData = await talentJobRoleLevelService.getAll({ talentId: Number(id), excludeDeleted: true });
      const allJobRoleLevels = await jobRoleLevelService.getAll({ excludeDeleted: true, distinctByName: true });
      setLookupJobRoleLevels(allJobRoleLevels);
      const jobRoleLevelsWithNames = jobRoleLevelsData.map((jrl: TalentJobRoleLevel) => {
        const jobRoleLevelInfo = allJobRoleLevels.find((j: JobRoleLevel) => j.id === jrl.jobRoleLevelId);
        return { ...jrl, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Unknown Level" };
      });
      setJobRoleLevels(jobRoleLevelsWithNames);
    } catch (err) {
      console.error("❌ Lỗi khi thêm vị trí:", err);
      alert("Không thể thêm vị trí!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation functions for available time
  const validateStartTime = (dateTime: string): boolean => {
    if (!dateTime) return false;
    const startDateTime = new Date(dateTime);
    const now = new Date();
    return startDateTime > now;
  };

  const validateEndTime = (startDateTime: string, endDateTime: string | undefined): boolean => {
    if (!endDateTime) return true; // End time is optional
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    
    // End time phải sau start time
    if (end <= start) return false;
    
    return true;
  };

  const findOverlappingSlot = (existing: TalentAvailableTime[], newStart: Date, newEnd?: Date) => {
    const effectiveNewEnd = newEnd ?? new Date(8640000000000000); // ~ Infinity

    for (const slot of existing) {
      const slotStart = new Date(slot.startTime);
      const slotEnd = slot.endTime ? new Date(slot.endTime) : new Date(8640000000000000);

      if (newStart < slotEnd && slotStart < effectiveNewEnd) {
        return slot;
      }
    }
    return null;
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "Không xác định";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Không xác định";
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const formatRange = (slot: TalentAvailableTime) => {
    const start = formatDateTime(slot.startTime);
    const end = slot.endTime ? formatDateTime(slot.endTime) : "Không xác định";
    return `${start} - ${end}`;
  };

  const handleSubmitInlineAvailableTime = async () => {
    if (!id || isSubmitting) return;
    
    // Validate startTime
    if (!inlineAvailableTimeForm.startTime) {
      setAvailableTimeFormErrors({ startTime: "⚠️ Vui lòng nhập thời gian bắt đầu!" });
      return;
    }

    // Validate startTime hợp lý
    if (!validateStartTime(inlineAvailableTimeForm.startTime)) {
      setAvailableTimeFormErrors({ startTime: "⚠️ Thời gian bắt đầu phải nằm trong tương lai." });
      return;
    }

    // Validate endTime hợp lý
    if (inlineAvailableTimeForm.endTime && !validateEndTime(inlineAvailableTimeForm.startTime, inlineAvailableTimeForm.endTime)) {
      setAvailableTimeFormErrors({ endTime: "⚠️ Thời gian kết thúc phải sau thời gian bắt đầu." });
      return;
    }
    try {
      setIsSubmitting(true);
      setAvailableTimeFormErrors({});

      const newStart = new Date(inlineAvailableTimeForm.startTime!);
      const newEnd = inlineAvailableTimeForm.endTime ? new Date(inlineAvailableTimeForm.endTime) : undefined;

      // Kiểm tra trùng lặp với các slot đã có
      const existingTimes = await talentAvailableTimeService.getAll({
        talentId: Number(id),
        excludeDeleted: true,
      });

      if (Array.isArray(existingTimes)) {
        const overlappingSlot = findOverlappingSlot(existingTimes, newStart, newEnd);
        if (overlappingSlot) {
          setAvailableTimeFormErrors({
            startTime: `⚠️ Khung giờ này trùng với khoảng đã có: ${formatRange(overlappingSlot)}. Vui lòng chọn khung khác.`
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Convert datetime-local to UTC ISO string for PostgreSQL
      await talentAvailableTimeService.create({
        talentId: Number(id),
        startTime: newStart.toISOString(),
        endTime: newEnd ? newEnd.toISOString() : undefined,
        notes: inlineAvailableTimeForm.notes || "",
      });
      alert("✅ Đã thêm thời gian thành công!");
      handleCloseInlineForm();
      setAvailableTimeFormErrors({});
      // Refresh data
      const availableTimesData = await talentAvailableTimeService.getAll({ talentId: Number(id), excludeDeleted: true });
      setAvailableTimes(availableTimesData);
    } catch (err) {
      console.error("❌ Lỗi khi thêm thời gian:", err);
      setAvailableTimeFormErrors({ submit: "Không thể thêm thời gian!" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function để chuyển đổi level từ tiếng Anh sang tiếng Việt
  const getLevelLabel = (level: string | null | undefined): string => {
    const levelMap: { [key: string]: string } = {
      "Beginner": "Mới bắt đầu",
      "Intermediate": "Trung bình",
      "Advanced": "Nâng cao",
      "Expert": "Chuyên gia",
    };
    return levelMap[level || "Beginner"] || "Mới bắt đầu";
  };

  // Helper function để format số tiền
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value && value !== 0) return "";
    const numValue = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
    if (isNaN(numValue)) return "";
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle rate per month change cho inline form
  const handleInlineRatePerMonthChange = (value: string) => {
    // Chỉ cho phép nhập số (loại bỏ tất cả ký tự không phải số)
    const cleaned = value.replace(/\D/g, "");
    // Nếu rỗng, set về undefined
    if (cleaned === "") {
      setInlineJobRoleLevelForm({ ...inlineJobRoleLevelForm, ratePerMonth: undefined });
      return;
    }
    // Parse và lưu số vào state
    const numValue = parseInt(cleaned, 10);
    if (!isNaN(numValue)) {
      setInlineJobRoleLevelForm({ ...inlineJobRoleLevelForm, ratePerMonth: numValue });
    }
  };

  // Handle certificate image file change
  const handleCertificateImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        alert("⚠️ Vui lòng chọn file ảnh (jpg, png, gif, etc.)");
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("⚠️ Kích thước file không được vượt quá 10MB");
        e.target.value = '';
        return;
      }

      setCertificateImageFile(file);
      const newErrors = { ...certificateFormErrors };
      delete newErrors.imageFile;
      setCertificateFormErrors(newErrors);
    }
  };

  // Handle certificate image upload to Firebase
  const handleUploadCertificateImage = async () => {
    if (!certificateImageFile) {
      alert("Vui lòng chọn file ảnh trước!");
      return;
    }

    // Xác nhận trước khi upload
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn upload ảnh "${certificateImageFile.name}" lên Firebase không?\n\n` +
      `Kích thước file: ${(certificateImageFile.size / 1024).toFixed(2)} KB`
    );

    if (!confirmed) {
      return;
    }

    setUploadingCertificateImage(true);
    setCertificateUploadProgress(0);

    try {
      // Upload to certificates folder
      const timestamp = Date.now();
      const sanitizedFileName = certificateImageFile.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
      const fileName = `cert_${timestamp}_${sanitizedFileName}`;
      const filePath = `certificates/${fileName}`;

      const downloadURL = await uploadFile(
        certificateImageFile,
        filePath,
        (progress) => setCertificateUploadProgress(progress)
      );

      // Update the certificate form with the download URL
      setInlineCertificateForm({ ...inlineCertificateForm, imageUrl: downloadURL });
      setUploadedCertificateUrl(downloadURL);

      // Clear the file from state after successful upload
      setCertificateImageFile(null);
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      alert("✅ Upload ảnh chứng chỉ thành công!");
    } catch (err: any) {
      console.error("❌ Error uploading certificate image:", err);
      alert(`❌ Lỗi khi upload ảnh: ${err.message || 'Vui lòng thử lại.'}`);
    } finally {
      setUploadingCertificateImage(false);
      setCertificateUploadProgress(0);
    }
  };

  // Handle delete certificate image
  const handleDeleteCertificateImage = async () => {
    const currentUrl = inlineCertificateForm.imageUrl;
    if (!currentUrl) return;

    const uploadedUrl = uploadedCertificateUrl;
    if (!uploadedUrl || uploadedUrl !== currentUrl) {
      // URL không phải từ Firebase upload, chỉ cần xóa URL
      setInlineCertificateForm({ ...inlineCertificateForm, imageUrl: "" });
      return;
    }

    // Xác nhận trước khi xóa
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa ảnh chứng chỉ này không? File sẽ bị xóa khỏi Firebase.");
    if (!confirmed) return;

    try {
      // Extract Firebase path from URL
      const extractFirebasePath = (url: string): string | null => {
        try {
          const urlObj = new URL(url);
          const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            return decodeURIComponent(pathMatch[1]);
          }
        } catch {
          return null;
        }
        return null;
      };

      const firebasePath = extractFirebasePath(currentUrl);
      if (firebasePath) {
        const fileRef = ref(storage, firebasePath);
        await deleteObject(fileRef);
      }

      setInlineCertificateForm({ ...inlineCertificateForm, imageUrl: "" });
      setUploadedCertificateUrl(null);
      alert("✅ Đã xóa ảnh chứng chỉ thành công!");
    } catch (err) {
      console.error("❌ Error deleting certificate image:", err);
      alert("Không thể xóa ảnh chứng chỉ!");
    }
  };

  // Validate issued date
  const validateIssuedDate = (date: string | undefined): boolean => {
    if (!date) return true; // Optional field
    const issuedDate = new Date(date);
    const now = new Date();
    // Issued date should not be in the future
    return issuedDate <= now;
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="TA Staff" />
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
        <Sidebar items={sidebarItems} title="TA Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy nhân sự</p>
            <Link
              to="/ta/developers"
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
  const isDisabled = talent.status === "Applying" || talent.status === "Working";
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
      <Sidebar items={sidebarItems} title="TA Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Breadcrumb
            items={[
              { label: "Nhân sự", to: returnTo || "/ta/developers" },
              { label: talent?.fullName || "Chi tiết nhân sự" }
            ]}
          />

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
                title={isDisabled ? "Không thể sửa khi nhân sự đang ứng tuyển hoặc đang làm việc" : ""}
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
                title={isDisabled ? "Không thể xóa khi nhân sự đang ứng tuyển hoặc đang làm việc" : ""}
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-8 animate-fade-in">
          <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm rounded-t-2xl">
            <div className="flex overflow-x-auto scrollbar-hide">
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "projects"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Dự án
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cvs")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "cvs"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <FileText className="w-4 h-4" />
                CV
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("jobRoleLevels")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "jobRoleLevels"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Target className="w-4 h-4" />
                Vị trí & Lương
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "skills"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Star className="w-4 h-4" />
                Kỹ năng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("availableTimes")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "availableTimes"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Lịch sẵn sàng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("certificates")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "certificates"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Award className="w-4 h-4" />
                Chứng chỉ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === "experiences"
                    ? "border-primary-500 text-primary-600 bg-white"
                    : "border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-100/50"
                }`}
              >
                <Workflow className="w-4 h-4" />
                Kinh nghiệm
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab: Dự án */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                {/* Inline Project Form */}
                {showInlineForm === "project" && (
                  <div className="bg-white rounded-xl border-2 border-primary-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tạo dự án mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Tên dự án <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={inlineProjectForm.projectName || ""}
                          onChange={(e) => setInlineProjectForm({ ...inlineProjectForm, projectName: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          placeholder="Nhập tên dự án"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Vị trí</label>
                          <input
                            type="text"
                            value={inlineProjectForm.position || ""}
                            onChange={(e) => setInlineProjectForm({ ...inlineProjectForm, position: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="Nhập vị trí"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Công nghệ sử dụng</label>
                          <input
                            type="text"
                            value={inlineProjectForm.technologies || ""}
                            onChange={(e) => setInlineProjectForm({ ...inlineProjectForm, technologies: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="Nhập công nghệ sử dụng"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Mô tả</label>
                        <textarea
                          value={inlineProjectForm.description || ""}
                          onChange={(e) => setInlineProjectForm({ ...inlineProjectForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                          placeholder="Nhập mô tả dự án"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineProject}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách dự án</h3>
                  <div className="flex gap-2">
                    {showInlineForm !== "project" && (
                      <Button
                        onClick={() => handleOpenInlineForm("project")}
                        disabled={isSubmitting}
                        className={`group flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isSubmitting ? "Đang xử lý..." : "Tạo dự án"}
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      </Button>
                    )}
                    {selectedProjects.length > 0 && (
                      <Button
                        onClick={handleDeleteProjects}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        Xóa dự án ({selectedProjects.length})
                      </Button>
                    )}
                  </div>
                </div>
                {talentProjects.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                              <input
                                type="checkbox"
                                checked={selectedProjects.length === talentProjects.slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage).length && talentProjects.slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage).length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const currentPageItems = talentProjects.slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage).map(project => project.id);
                                    setSelectedProjects([...new Set([...selectedProjects, ...currentPageItems])]);
                                  } else {
                                    const currentPageItems = talentProjects.slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage).map(project => project.id);
                                    setSelectedProjects(selectedProjects.filter(id => !currentPageItems.includes(id)));
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Tên dự án</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Vị trí</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Công nghệ</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {talentProjects
                            .slice((pageProjects - 1) * itemsPerPage, pageProjects * itemsPerPage)
                            .map((project) => (
                              <tr 
                                key={project.id} 
                                className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                                onClick={() => navigate(`/ta/talent-projects/edit/${project.id}`)}
                              >
                                <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={selectedProjects.includes(project.id)}
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
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-primary-800">{project.projectName}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-primary-700">{project.position}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-primary-600">{project.technologies}</div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
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

            {/* Tab: CV */}
            {activeTab === "cvs" && (
              <div className="space-y-6">
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
                <Link to={`/ta/talent-cvs/create?talentId=${id}`}>
                  <Button
                    className="group flex items-center justify-center bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                    title="Tải lên CV"
                  >
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </Link>
                {selectedCVs.length > 0 && (
                  <Button
                    onClick={handleDeleteCVs}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Xóa CV ({selectedCVs.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
          {isCVsExpanded && (
            <div className="p-6">
              {talentCVs.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                            <input
                              type="checkbox"
                              checked={selectedCVs.length === talentCVs.slice((pageCVs - 1) * itemsPerPage, pageCVs * itemsPerPage).length && talentCVs.slice((pageCVs - 1) * itemsPerPage, pageCVs * itemsPerPage).length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const currentPageItems = talentCVs.slice((pageCVs - 1) * itemsPerPage, pageCVs * itemsPerPage).map(cv => cv.id);
                                  setSelectedCVs([...new Set([...selectedCVs, ...currentPageItems])]);
                                } else {
                                  const currentPageItems = talentCVs.slice((pageCVs - 1) * itemsPerPage, pageCVs * itemsPerPage).map(cv => cv.id);
                                  setSelectedCVs(selectedCVs.filter(id => !currentPageItems.includes(id)));
                                }
                              }}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Vị trí</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Phiên bản</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {(() => {
                          // Nhóm CV theo jobRoleLevelName
                          const groupedCVs = new Map<string, (TalentCV & { jobRoleLevelName?: string })[]>();
                          talentCVs.forEach((cv) => {
                            const key = cv.jobRoleLevelName || "Chưa xác định";
                            if (!groupedCVs.has(key)) {
                              groupedCVs.set(key, []);
                            }
                            groupedCVs.get(key)!.push(cv);
                          });

                          // Lấy danh sách các nhóm đã sắp xếp
                          const sortedGroups = Array.from(groupedCVs.entries()).sort((a, b) => a[0].localeCompare(b[0]));

                          // Lấy CV cho trang hiện tại
                          const startIndex = (pageCVs - 1) * itemsPerPage;
                          const endIndex = startIndex + itemsPerPage;
                          let currentIndex = 0;
                          const rows: React.ReactNode[] = [];

                          sortedGroups.forEach(([jobRoleLevelName, cvs]) => {
                            // Sắp xếp CV: active trước (version giảm dần), inactive sau (version giảm dần)
                            const sortedCVs = [...cvs].sort((a, b) => {
                              if (a.isActive !== b.isActive) {
                                return a.isActive ? -1 : 1; // Active trước
                              }
                              return b.version - a.version; // Version giảm dần
                            });

                            const activeCVs = sortedCVs.filter(cv => cv.isActive);
                            const inactiveCVs = sortedCVs.filter(cv => !cv.isActive);
                            const isCollapsed = collapsedInactiveCVGroups.has(jobRoleLevelName);

                            // Hiển thị CV active
                            activeCVs.forEach((cv, index) => {
                              if (currentIndex >= startIndex && currentIndex < endIndex) {
                                const isLoading = analysisLoadingId === cv.id;
                                const isCurrentAnalysis = analysisResultCVId === cv.id && !!analysisResult;
                                const hasOtherAnalysis = !!analysisResult && analysisResultCVId !== null && analysisResultCVId !== cv.id;
                                const canAnalyze = !hasOtherAnalysis;
                                const analysisControls = isCurrentAnalysis
                                  ? (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelAnalysis();
                                      }}
                                      className="group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 text-white text-xs"
                                    >
                                      <Workflow className="w-3 h-3" />
                                      Hủy
                                    </Button>
                                  )
                                  : (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnalyzeCVFromUrl(cv);
                                      }}
                                      disabled={isLoading || !canAnalyze}
                                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 text-xs ${
                                        isLoading || !canAnalyze
                                          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                      }`}
                                      title={!canAnalyze ? "Vui lòng hủy phân tích CV đang hiển thị trước khi phân tích CV khác" : ""}
                                    >
                                      <Workflow className="w-3 h-3" />
                                      {isLoading ? "Đang phân tích..." : "Phân tích"}
                                    </Button>
                                  );

                                // Thêm nút collapse/expand vào phiên bản mới nhất (đầu tiên) nếu có phiên bản cũ
                                const isNewestVersion = index === 0 && inactiveCVs.length > 0;
                                const collapseButton = isNewestVersion ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCollapsedInactiveCVGroups(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(jobRoleLevelName)) {
                                          newSet.delete(jobRoleLevelName);
                                        } else {
                                          newSet.add(jobRoleLevelName);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors duration-200"
                                    title={isCollapsed ? `Hiển thị ${inactiveCVs.length} phiên bản cũ` : `Ẩn ${inactiveCVs.length} phiên bản cũ`}
                                  >
                                    {isCollapsed ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronUp className="w-4 h-4" />
                                    )}
                                    <span className="text-xs">({inactiveCVs.length})</span>
                                  </button>
                                ) : null;

                                rows.push(
                                  <tr 
                                    key={cv.id} 
                                    className="hover:bg-accent-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => navigate(`/ta/talent-cvs/edit/${cv.id}`)}
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={selectedCVs.includes(cv.id)}
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
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm font-medium text-accent-800">{cv.jobRoleLevelName || "Chưa xác định"}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm text-accent-700">v{cv.version}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        Đang hoạt động
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={cv.cvFileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group flex items-center gap-1.5 px-3 py-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 text-sm font-medium"
                                        >
                                          <Eye className="w-4 h-4" />
                                          Xem PDF
                                        </a>
                                        {analysisControls}
                                        {collapseButton}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                              currentIndex++;
                            });

                            // Hiển thị các phiên bản cũ nếu không bị collapse
                            if (inactiveCVs.length > 0) {
                              if (!isCollapsed) {
                                inactiveCVs.forEach((cv) => {
                                  if (currentIndex >= startIndex && currentIndex < endIndex) {
                                    rows.push(
                                      <tr 
                                        key={cv.id} 
                                        className="hover:bg-neutral-50 transition-colors duration-200 cursor-pointer bg-neutral-50/50"
                                        onClick={() => navigate(`/ta/talent-cvs/edit/${cv.id}`)}
                                      >
                                        <td className="px-4 py-3 whitespace-nowrap pl-8" onClick={(e) => e.stopPropagation()}>
                                          <input
                                            type="checkbox"
                                            checked={selectedCVs.includes(cv.id)}
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
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="text-sm font-medium text-neutral-600">{cv.jobRoleLevelName || "Chưa xác định"}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="text-sm text-neutral-500">v{cv.version}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                            Không hoạt động
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                          <div className="flex items-center gap-2">
                                            <a
                                              href={cv.cvFileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="group flex items-center gap-1.5 px-3 py-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 text-sm font-medium"
                                            >
                                              <Eye className="w-4 h-4" />
                                              Xem PDF
                                            </a>
                                            {/* Không hiển thị nút phân tích cho CV không hoạt động */}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  }
                                  currentIndex++;
                                });
                              } else {
                                // Nếu bị collapse, vẫn đếm số lượng để pagination đúng
                                currentIndex += inactiveCVs.length;
                              }
                            }
                          });

                          return rows;
                        })()}
                      </tbody>
                    </table>
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
                  <p className="mt-1 text-lg font-bold text-amber-900">
                    {skillsRecognizedForAddition.length + matchedSkillsDetails.length + unmatchedSkillSuggestions.length}
                  </p>
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
              </div>
            )}

            {/* Tab: Vị trí và mức lương */}
            {activeTab === "jobRoleLevels" && (
              <div className="space-y-4">
                {/* Inline JobRoleLevel Form */}
                {showInlineForm === "jobRoleLevel" && (
                  <div className="bg-white rounded-xl border-2 border-warning-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Thêm vị trí mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Vị trí <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsJobRoleLevelDropdownOpen(!isJobRoleLevelDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white text-left focus:ring-2 focus:ring-warning-500/20 transition-all border-neutral-300 focus:border-warning-500"
                          >
                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                              <Target className="w-4 h-4 text-neutral-400" />
                              <span>
                                {inlineJobRoleLevelForm.jobRoleLevelId && inlineJobRoleLevelForm.jobRoleLevelId > 0
                                  ? lookupJobRoleLevels.find(j => j.id === inlineJobRoleLevelForm.jobRoleLevelId)?.name || "Chọn vị trí"
                                  : "Chọn vị trí"}
                              </span>
                            </div>
                          </button>
                          {isJobRoleLevelDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                              <div className="p-3 border-b border-neutral-100">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    value={jobRoleLevelSearch}
                                    onChange={(e) => setJobRoleLevelSearch(e.target.value)}
                                    placeholder="Tìm vị trí..."
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-warning-500 focus:ring-warning-500"
                                  />
                                </div>
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {(() => {
                                  const filtered = jobRoleLevelSearch
                                    ? lookupJobRoleLevels.filter(j => j.name.toLowerCase().includes(jobRoleLevelSearch.toLowerCase()))
                                    : lookupJobRoleLevels;
                                  if (filtered.length === 0) {
                                    return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy vị trí nào</p>;
                                  }
                                  
                                  // Get selected job role level IDs (excluding current form)
                                  const selectedJobRoleLevelIds = jobRoleLevels
                                    .map(jrl => jrl.jobRoleLevelId)
                                    .filter(id => id > 0);
                                  
                                  return filtered.map((jobRoleLevel) => {
                                    const isDisabled = selectedJobRoleLevelIds.includes(jobRoleLevel.id);
                                    return (
                                      <button
                                        type="button"
                                        key={jobRoleLevel.id}
                                        onClick={() => {
                                          if (!isDisabled) {
                                            setInlineJobRoleLevelForm({ ...inlineJobRoleLevelForm, jobRoleLevelId: jobRoleLevel.id });
                                            setIsJobRoleLevelDropdownOpen(false);
                                            setJobRoleLevelSearch("");
                                          }
                                        }}
                                        disabled={isDisabled}
                                        className={`w-full text-left px-4 py-2.5 text-sm ${
                                          inlineJobRoleLevelForm.jobRoleLevelId === jobRoleLevel.id
                                            ? "bg-warning-50 text-warning-700"
                                            : isDisabled
                                              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed italic"
                                              : "hover:bg-neutral-50 text-neutral-700"
                                        }`}
                                      >
                                        {jobRoleLevel.name}{isDisabled ? ' (đã chọn)' : ''}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Kinh nghiệm (năm)</label>
                          <input
                            type="number"
                            value={inlineJobRoleLevelForm.yearsOfExp || 1}
                            onChange={(e) => setInlineJobRoleLevelForm({ ...inlineJobRoleLevelForm, yearsOfExp: Number(e.target.value) })}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-warning-500/20 focus:border-warning-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Mức lương mong muốn</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formatCurrency(inlineJobRoleLevelForm.ratePerMonth)}
                              onChange={(e) => handleInlineRatePerMonthChange(e.target.value)}
                              placeholder="VD: 5.000.000"
                              className="w-full py-2 px-3 pr-12 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-warning-500/20 focus:border-warning-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                              VNĐ
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineJobRoleLevel}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vị trí và mức lương</h3>
                    <div className="flex gap-2">
                      {showInlineForm !== "jobRoleLevel" && (
                        <Button
                          onClick={() => handleOpenInlineForm("jobRoleLevel")}
                          disabled={isSubmitting}
                          className={`group flex items-center justify-center bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSubmitting ? "Đang xử lý..." : "Thêm vị trí"}
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                      )}
                      {selectedJobRoleLevels.length > 0 && (
                        <Button
                          onClick={handleDeleteJobRoleLevels}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          Xóa vị trí ({selectedJobRoleLevels.length})
                        </Button>
                      )}
                    </div>
                  </div>
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
                                              `/ta/talent-job-role-levels/create?talentId=${id}`
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
                            </div>
                          )}
                          {jobRoleLevelsUnmatched.length > 0 && (
                            <div className="rounded-xl border border-dashed border-amber-300 bg-white p-3 text-xs text-amber-700">
                              <p className="font-semibold text-amber-900">Thiếu trong hồ sơ (chưa có trong hệ thống):</p>
                              <ul className="mt-2 space-y-1">
                                {jobRoleLevelsUnmatched.map((suggestion, index) => (
                                  <li key={`jobrole-unmatched-${index}`}>
                                    - {suggestion.position ?? "Vị trí chưa rõ"}{" "}
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
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedJobRoleLevels.length === jobRoleLevels.slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage).length && jobRoleLevels.slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage).length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentPageItems = jobRoleLevels.slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage).map(jrl => jrl.id);
                                      setSelectedJobRoleLevels([...new Set([...selectedJobRoleLevels, ...currentPageItems])]);
                                    } else {
                                      const currentPageItems = jobRoleLevels.slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage).map(jrl => jrl.id);
                                      setSelectedJobRoleLevels(selectedJobRoleLevels.filter(id => !currentPageItems.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 text-warning-600 bg-gray-100 border-gray-300 rounded focus:ring-warning-500 focus:ring-2"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Vị trí</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Kinh nghiệm</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Mức lương</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {jobRoleLevels
                              .slice((pageJobRoleLevels - 1) * itemsPerPage, pageJobRoleLevels * itemsPerPage)
                              .map((jrl) => (
                                <tr 
                                  key={jrl.id} 
                                  className="hover:bg-warning-50 transition-colors duration-200 cursor-pointer"
                                  onClick={() => navigate(`/ta/talent-job-role-levels/edit/${jrl.id}`)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedJobRoleLevels.includes(jrl.id)}
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
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-warning-800">{jrl.jobRoleLevelName}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-warning-700">{jrl.yearsOfExp === 0 ? 'không có' : `${jrl.yearsOfExp} năm`}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-warning-600">{jrl.ratePerMonth ? `${jrl.ratePerMonth.toLocaleString('vi-VN')} VNĐ/tháng` : 'Chưa xác định'}</div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
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

            {/* Tab: Kỹ năng của nhân sự */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                {/* Inline Skill Form */}
                {showInlineForm === "skill" && (
                  <div className="bg-white rounded-xl border-2 border-secondary-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Thêm kỹ năng mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {/* Skill Filter - Lọc theo nhóm kỹ năng */}
                      {lookupSkills.length > 0 && lookupSkillGroups.length > 0 && (
                        <div className="mb-4">
                          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                            <label className="block text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                              <Filter className="w-3.5 h-3.5" />
                              Lọc danh sách kỹ năng theo nhóm
                            </label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsSkillGroupDropdownOpen(!isSkillGroupDropdownOpen)}
                                className="w-full flex items-center justify-between px-3 py-1.5 border rounded-lg bg-white text-left focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all border-neutral-300"
                              >
                                <div className="flex items-center gap-2 text-xs text-neutral-700">
                                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>
                                    {selectedSkillGroupId
                                      ? lookupSkillGroups.find(g => g.id === selectedSkillGroupId)?.name || "Nhóm kỹ năng"
                                      : "Tất cả nhóm kỹ năng"}
                                  </span>
                                </div>
                              </button>
                              {isSkillGroupDropdownOpen && (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                                  <div className="p-3 border-b border-neutral-100">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                      <input
                                        type="text"
                                        value={skillGroupSearchQuery}
                                        onChange={(e) => setSkillGroupSearchQuery(e.target.value)}
                                        placeholder="Tìm nhóm kỹ năng..."
                                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-56 overflow-y-auto">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSkillGroupId(undefined);
                                        setIsSkillGroupDropdownOpen(false);
                                        setSkillGroupSearchQuery("");
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-sm ${
                                        !selectedSkillGroupId
                                          ? "bg-primary-50 text-primary-700"
                                          : "hover:bg-neutral-50 text-neutral-700"
                                      }`}
                                    >
                                      Tất cả nhóm kỹ năng
                                    </button>
                                    {(() => {
                                      const filtered = skillGroupSearchQuery
                                        ? lookupSkillGroups.filter(g =>
                                          g.name.toLowerCase().includes(skillGroupSearchQuery.toLowerCase()) ||
                                          (g.description && g.description.toLowerCase().includes(skillGroupSearchQuery.toLowerCase()))
                                        )
                                        : lookupSkillGroups;
                                      if (filtered.length === 0) {
                                        return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy nhóm kỹ năng</p>;
                                      }
                                      return filtered.map((group) => (
                                        <button
                                          type="button"
                                          key={group.id}
                                          onClick={() => {
                                            setSelectedSkillGroupId(group.id);
                                            setIsSkillGroupDropdownOpen(false);
                                            setSkillGroupSearchQuery("");
                                          }}
                                          className={`w-full text-left px-4 py-2.5 text-sm ${
                                            selectedSkillGroupId === group.id
                                              ? "bg-primary-50 text-primary-700"
                                              : "hover:bg-neutral-50 text-neutral-700"
                                          }`}
                                        >
                                          {group.name}
                                        </button>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Kỹ năng <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white text-left focus:ring-2 focus:ring-secondary-500/20 transition-all border-neutral-300 focus:border-secondary-500"
                          >
                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                              <Star className="w-4 h-4 text-neutral-400" />
                              <span>
                                {inlineSkillForm.skillId && inlineSkillForm.skillId > 0
                                  ? lookupSkills.find(s => s.id === inlineSkillForm.skillId)?.name || "Chọn kỹ năng"
                                  : "Chọn kỹ năng"}
                              </span>
                            </div>
                          </button>
                          {isSkillDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                              <div className="p-3 border-b border-neutral-100">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    value={skillSearchQuery}
                                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                                    placeholder="Tìm kỹ năng..."
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-secondary-500 focus:ring-secondary-500"
                                  />
                                </div>
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {(() => {
                                  // Filter skills theo search query và skill group
                                  const filteredSkills = lookupSkills.filter((s) => {
                                    const matchesSearch = !skillSearchQuery ||
                                      s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                                      (s.description && s.description.toLowerCase().includes(skillSearchQuery.toLowerCase()));
                                    const matchesGroup = !selectedSkillGroupId || s.skillGroupId === selectedSkillGroupId;
                                    return matchesSearch && matchesGroup;
                                  });

                                  if (filteredSkills.length === 0) {
                                    return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy kỹ năng nào</p>;
                                  }

                                  // Check if skill is already selected
                                  const selectedSkillIds = talentSkills
                                    .map(skill => skill.skillId)
                                    .filter(id => id > 0);

                                  return filteredSkills.map((skill) => {
                                    const isDisabled = selectedSkillIds.includes(skill.id);
                                    return (
                                      <button
                                        type="button"
                                        key={skill.id}
                                        onClick={() => {
                                          if (!isDisabled) {
                                            setInlineSkillForm({ ...inlineSkillForm, skillId: skill.id });
                                            // Tự động set nhóm kỹ năng theo skill đã chọn
                                            if (skill.skillGroupId) {
                                              setSelectedSkillGroupId(skill.skillGroupId);
                                            }
                                            setIsSkillDropdownOpen(false);
                                            setSkillSearchQuery("");
                                          }
                                        }}
                                        disabled={isDisabled}
                                        className={`w-full text-left px-4 py-2.5 text-sm ${
                                          inlineSkillForm.skillId === skill.id
                                            ? "bg-secondary-50 text-secondary-700"
                                            : isDisabled
                                              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed italic"
                                              : "hover:bg-neutral-50 text-neutral-700"
                                        }`}
                                      >
                                        {skill.name}{isDisabled ? ' (đã chọn)' : ''}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Trình độ</label>
                          <select
                            value={inlineSkillForm.level || "Beginner"}
                            onChange={(e) => setInlineSkillForm({ ...inlineSkillForm, level: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500"
                          >
                            <option value="Beginner">Mới bắt đầu</option>
                            <option value="Intermediate">Trung bình</option>
                            <option value="Advanced">Nâng cao</option>
                            <option value="Expert">Chuyên gia</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Số năm kinh nghiệm</label>
                          <input
                            type="number"
                            value={inlineSkillForm.yearsExp || 1}
                            onChange={(e) => setInlineSkillForm({ ...inlineSkillForm, yearsExp: Number(e.target.value) })}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineSkill}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Kỹ năng của nhân sự</h3>
                    <div className="flex gap-2">
                      {showInlineForm !== "skill" && (
                        <Button
                          onClick={() => handleOpenInlineForm("skill")}
                          disabled={isSubmitting}
                          className={`group flex items-center justify-center bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSubmitting ? "Đang xử lý..." : "Thêm kỹ năng"}
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                      )}
                      {selectedSkills.length > 0 && (
                        <Button
                          onClick={handleDeleteSkills}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          Xóa kỹ năng ({selectedSkills.length})
                        </Button>
                      )}
                    </div>
                  </div>
                  {analysisResult && (analysisResult.skills.newFromCV.length > 0 || analysisResult.skills.matched.length > 0) && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Đề xuất kỹ năng</h3>
                        <span className="text-xs text-amber-700">
                          {skillsRecognizedForAddition.length} đề xuất thêm · {matchedSkillsDetails.length} trùng CV · {unmatchedSkillSuggestions.length} cần tạo mới
                        </span>
                      </div>
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
                                    </div>
                                    <Button
                                      onClick={() =>
                                        handlePreparePrefillAndNavigate(
                                          "skills",
                                          [skill],
                                          `/ta/talent-skills/create?talentId=${id}`
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
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.length === talentSkills.slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage).length && talentSkills.slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage).length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentPageItems = talentSkills.slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage).map(skill => skill.id);
                                      setSelectedSkills([...new Set([...selectedSkills, ...currentPageItems])]);
                                    } else {
                                      const currentPageItems = talentSkills.slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage).map(skill => skill.id);
                                      setSelectedSkills(selectedSkills.filter(id => !currentPageItems.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 text-secondary-600 bg-gray-100 border-gray-300 rounded focus:ring-secondary-500 focus:ring-2"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Kỹ năng</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Trình độ</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Kinh nghiệm</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {talentSkills
                              .slice((pageSkills - 1) * itemsPerPage, pageSkills * itemsPerPage)
                              .map((skill) => (
                                <tr 
                                  key={skill.id} 
                                  className="hover:bg-secondary-50 transition-colors duration-200 cursor-pointer"
                                  onClick={() => navigate(`/ta/talent-skills/edit/${skill.id}`)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedSkills.includes(skill.id)}
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
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-secondary-800">{skill.skillName}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-secondary-700">{getLevelLabel(skill.level)}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-secondary-600">{skill.yearsExp === 0 ? 'không có' : `${skill.yearsExp} năm`}</div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
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

            {/* Tab: Lịch sẵn sàng của nhân sự */}
            {activeTab === "availableTimes" && (
              <div className="space-y-4">
                {/* Inline AvailableTime Form */}
                {showInlineForm === "availableTime" && (
                  <div className="bg-white rounded-xl border-2 border-secondary-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Thêm thời gian sẵn sàng mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Thời gian bắt đầu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={inlineAvailableTimeForm.startTime || ""}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => {
                              const value = e.target.value;
                              setInlineAvailableTimeForm({ ...inlineAvailableTimeForm, startTime: value });
                              // Validate startTime
                              const newErrors = { ...availableTimeFormErrors };
                              if (value && !validateStartTime(value)) {
                                newErrors.startTime = "⚠️ Thời gian bắt đầu phải nằm trong tương lai.";
                              } else {
                                delete newErrors.startTime;
                              }
                              // Re-validate endTime if startTime changes
                              if (inlineAvailableTimeForm.endTime && value) {
                                if (!validateEndTime(value, inlineAvailableTimeForm.endTime)) {
                                  newErrors.endTime = "⚠️ Thời gian kết thúc phải sau thời gian bắt đầu.";
                                } else {
                                  delete newErrors.endTime;
                                }
                              }
                              setAvailableTimeFormErrors(newErrors);
                            }}
                            className={`w-full px-4 py-2 border rounded-lg bg-white ${
                              availableTimeFormErrors.startTime
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : "border-neutral-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500"
                            }`}
                          />
                          {availableTimeFormErrors.startTime && (
                            <p className="text-xs text-red-600 mt-1">{availableTimeFormErrors.startTime}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            Chọn ngày và giờ bắt đầu có sẵn (phải lớn hơn thời điểm hiện tại)
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Thời gian kết thúc (tùy chọn)</label>
                          <input
                            type="datetime-local"
                            value={inlineAvailableTimeForm.endTime || ""}
                            min={inlineAvailableTimeForm.startTime ? (() => {
                              const startDate = new Date(inlineAvailableTimeForm.startTime);
                              startDate.setMinutes(startDate.getMinutes() + 1);
                              return startDate.toISOString().slice(0, 16);
                            })() : undefined}
                            onChange={(e) => {
                              const value = e.target.value || undefined;
                              setInlineAvailableTimeForm({ ...inlineAvailableTimeForm, endTime: value });
                              // Validate endTime
                              const newErrors = { ...availableTimeFormErrors };
                              if (value && inlineAvailableTimeForm.startTime) {
                                if (!validateEndTime(inlineAvailableTimeForm.startTime, value)) {
                                  newErrors.endTime = "⚠️ Thời gian kết thúc phải sau thời gian bắt đầu.";
                                } else {
                                  delete newErrors.endTime;
                                }
                              } else if (value && !inlineAvailableTimeForm.startTime) {
                                newErrors.endTime = "⚠️ Vui lòng chọn thời gian bắt đầu trước.";
                              } else {
                                delete newErrors.endTime;
                              }
                              setAvailableTimeFormErrors(newErrors);
                            }}
                            className={`w-full px-4 py-2 border rounded-lg bg-white ${
                              availableTimeFormErrors.endTime
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : "border-neutral-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500"
                            }`}
                          />
                          {availableTimeFormErrors.endTime && (
                            <p className="text-xs text-red-600 mt-1">{availableTimeFormErrors.endTime}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            Để trống nếu không có thời gian kết thúc cụ thể
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Ghi chú</label>
                        <textarea
                          value={inlineAvailableTimeForm.notes || ""}
                          onChange={(e) => setInlineAvailableTimeForm({ ...inlineAvailableTimeForm, notes: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 resize-none"
                          placeholder="Nhập ghi chú"
                        />
                      </div>
                      {availableTimeFormErrors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">{availableTimeFormErrors.submit}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineAvailableTime}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lịch sẵn sàng của nhân sự</h3>
                    <div className="flex gap-2">
                      {showInlineForm !== "availableTime" && (
                        <Button
                          onClick={() => handleOpenInlineForm("availableTime")}
                          disabled={isSubmitting}
                          className={`group flex items-center justify-center bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSubmitting ? "Đang xử lý..." : "Thêm thời gian"}
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                      )}
                      {selectedAvailableTimes.length > 0 && (
                        <Button
                          onClick={handleDeleteAvailableTimes}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          Xóa thời gian ({selectedAvailableTimes.length})
                        </Button>
                      )}
                    </div>
                  </div>
                  {availableTimes.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedAvailableTimes.length === availableTimes.slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage).length && availableTimes.slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage).length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentPageItems = availableTimes.slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage).map(time => time.id);
                                      setSelectedAvailableTimes([...new Set([...selectedAvailableTimes, ...currentPageItems])]);
                                    } else {
                                      const currentPageItems = availableTimes.slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage).map(time => time.id);
                                      setSelectedAvailableTimes(selectedAvailableTimes.filter(id => !currentPageItems.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 text-secondary-600 bg-gray-100 border-gray-300 rounded focus:ring-secondary-500 focus:ring-2"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Từ ngày</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Đến ngày</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {availableTimes
                              .slice((pageAvailableTimes - 1) * itemsPerPage, pageAvailableTimes * itemsPerPage)
                              .map((time) => (
                                <tr 
                                  key={time.id} 
                                  className="hover:bg-secondary-50 transition-colors duration-200 cursor-pointer"
                                  onClick={() => navigate(`/ta/talent-available-times/edit/${time.id}`)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedAvailableTimes.includes(time.id)}
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
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-secondary-700">{new Date(time.startTime).toLocaleDateString('vi-VN')}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-secondary-600">{time.endTime ? new Date(time.endTime).toLocaleDateString('vi-VN') : 'Không giới hạn'}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-700">{time.notes || '—'}</div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
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

            {/* Tab: Chứng chỉ */}
            {activeTab === "certificates" && (
              <div className="space-y-4">
                {/* Inline Certificate Form */}
                {showInlineForm === "certificate" && (
                  <div className="bg-white rounded-xl border-2 border-primary-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Thêm chứng chỉ mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Loại chứng chỉ <span className="text-red-500">*</span>
                        </label>
                        {certificateFormErrors.certificateTypeId && (
                          <p className="text-xs text-red-600 mb-1">{certificateFormErrors.certificateTypeId}</p>
                        )}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCertificateTypeDropdownOpen(!isCertificateTypeDropdownOpen);
                              const newErrors = { ...certificateFormErrors };
                              delete newErrors.certificateTypeId;
                              setCertificateFormErrors(newErrors);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white text-left focus:ring-2 transition-all ${
                              certificateFormErrors.certificateTypeId
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : "border-neutral-300 focus:ring-primary-500/20 focus:border-primary-500"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                              <Award className="w-4 h-4 text-neutral-400" />
                              <span>
                                {inlineCertificateForm.certificateTypeId && inlineCertificateForm.certificateTypeId > 0
                                  ? lookupCertificateTypes.find(t => t.id === inlineCertificateForm.certificateTypeId)?.name || "Chọn loại chứng chỉ"
                                  : "Chọn loại chứng chỉ"}
                              </span>
                            </div>
                          </button>
                          {isCertificateTypeDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                              <div className="p-3 border-b border-neutral-100">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    value={certificateTypeSearch}
                                    onChange={(e) => setCertificateTypeSearch(e.target.value)}
                                    placeholder="Tìm loại chứng chỉ..."
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                                  />
                                </div>
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {(() => {
                                  const filtered = certificateTypeSearch
                                    ? lookupCertificateTypes.filter(t => t.name.toLowerCase().includes(certificateTypeSearch.toLowerCase()))
                                    : lookupCertificateTypes;
                                  if (filtered.length === 0) {
                                    return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy loại chứng chỉ nào</p>;
                                  }
                                  return filtered.map((type) => (
                                    <button
                                      type="button"
                                      key={type.id}
                                      onClick={() => {
                                        setInlineCertificateForm({ ...inlineCertificateForm, certificateTypeId: type.id });
                                        setIsCertificateTypeDropdownOpen(false);
                                        setCertificateTypeSearch("");
                                        const newErrors = { ...certificateFormErrors };
                                        delete newErrors.certificateTypeId;
                                        setCertificateFormErrors(newErrors);
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-sm ${
                                        inlineCertificateForm.certificateTypeId === type.id
                                          ? "bg-primary-50 text-primary-700"
                                          : "hover:bg-neutral-50 text-neutral-700"
                                      }`}
                                    >
                                      {type.name}
                                    </button>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Tên chứng chỉ <span className="text-red-500">*</span>
                        </label>
                        {certificateFormErrors.certificateName && (
                          <p className="text-xs text-red-600 mb-1">{certificateFormErrors.certificateName}</p>
                        )}
                        <input
                          type="text"
                          value={inlineCertificateForm.certificateName || ""}
                          onChange={(e) => {
                            setInlineCertificateForm({ ...inlineCertificateForm, certificateName: e.target.value });
                            const newErrors = { ...certificateFormErrors };
                            delete newErrors.certificateName;
                            setCertificateFormErrors(newErrors);
                          }}
                          maxLength={255}
                          className={`w-full px-4 py-2 border rounded-lg bg-white ${
                            certificateFormErrors.certificateName
                              ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                              : "border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          }`}
                          placeholder="Nhập tên chứng chỉ"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Ngày cấp</label>
                          <input
                            type="date"
                            value={inlineCertificateForm.issuedDate || ""}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const value = e.target.value || undefined;
                              setInlineCertificateForm({ ...inlineCertificateForm, issuedDate: value });
                              // Validate issued date
                              const newErrors = { ...certificateFormErrors };
                              if (value && !validateIssuedDate(value)) {
                                newErrors.issuedDate = "⚠️ Ngày cấp không được là ngày trong tương lai.";
                              } else {
                                delete newErrors.issuedDate;
                              }
                              setCertificateFormErrors(newErrors);
                            }}
                            className={`w-full px-4 py-2 border rounded-lg bg-white ${
                              certificateFormErrors.issuedDate
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : "border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            }`}
                          />
                          {certificateFormErrors.issuedDate && (
                            <p className="text-xs text-red-600 mt-1">{certificateFormErrors.issuedDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">URL hình ảnh</label>
                          <input
                            type="url"
                            value={inlineCertificateForm.imageUrl || ""}
                            onChange={(e) => {
                              // Only allow manual URL input if not uploaded from Firebase
                              if (!uploadedCertificateUrl || uploadedCertificateUrl !== inlineCertificateForm.imageUrl) {
                                setInlineCertificateForm({ ...inlineCertificateForm, imageUrl: e.target.value });
                              }
                            }}
                            disabled={!!(inlineCertificateForm.imageUrl && uploadedCertificateUrl === inlineCertificateForm.imageUrl)}
                            className={`w-full px-4 py-2 border rounded-lg bg-white ${
                              inlineCertificateForm.imageUrl && uploadedCertificateUrl === inlineCertificateForm.imageUrl
                                ? "bg-gray-100 cursor-not-allowed opacity-75 border-gray-300"
                                : "border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            }`}
                            placeholder="https://... hoặc upload từ file ảnh đã chọn"
                          />
                          {inlineCertificateForm.imageUrl && uploadedCertificateUrl === inlineCertificateForm.imageUrl && (
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              URL này được upload từ Firebase. Để thay đổi, hãy xóa và upload ảnh mới.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Upload ảnh chứng chỉ */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Upload ảnh chứng chỉ
                        </label>
                        <div className="space-y-2">
                          {/* File Input */}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCertificateImageFileChange}
                              disabled={uploadingCertificateImage}
                              className="w-full text-xs py-1.5 px-2 border rounded-lg bg-white border-neutral-300 focus:ring-1 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {certificateImageFile && (
                              <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                                <FileText className="w-3 h-3" />
                                <span>Đã chọn: <span className="font-medium">{certificateImageFile.name}</span> ({(certificateImageFile.size / 1024).toFixed(2)} KB)</span>
                              </div>
                            )}
                          </div>

                          {/* Upload Progress */}
                          {uploadingCertificateImage && (
                            <div className="space-y-1">
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse"
                                  style={{ width: `${certificateUploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-center text-primary-700 font-medium">
                                Đang upload... {certificateUploadProgress}%
                              </p>
                            </div>
                          )}

                          {/* Upload Button */}
                          <button
                            type="button"
                            onClick={handleUploadCertificateImage}
                            disabled={!certificateImageFile || uploadingCertificateImage}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            {uploadingCertificateImage ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang upload...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                Upload ảnh lên Firebase
                              </>
                            )}
                          </button>
                        </div>
                        {inlineCertificateForm.imageUrl && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={handleDeleteCertificateImage}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-xs"
                              title={uploadedCertificateUrl === inlineCertificateForm.imageUrl ? "Xóa URL và file trong Firebase" : "Xóa URL"}
                            >
                              <X className="w-3.5 h-3.5" />
                              Xóa ảnh
                            </button>
                            <a
                              href={inlineCertificateForm.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem ảnh
                            </a>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Mô tả</label>
                        <textarea
                          value={inlineCertificateForm.certificateDescription || ""}
                          onChange={(e) => setInlineCertificateForm({ ...inlineCertificateForm, certificateDescription: e.target.value })}
                          rows={3}
                          maxLength={1000}
                          className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                          placeholder="Nhập mô tả về chứng chỉ..."
                        />
                      </div>
                      {/* Error messages */}
                      {(certificateFormErrors.certificateTypeId || certificateFormErrors.certificateName || certificateFormErrors.issuedDate) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                          {certificateFormErrors.certificateTypeId && (
                            <p className="text-sm text-red-700">{certificateFormErrors.certificateTypeId}</p>
                          )}
                          {certificateFormErrors.certificateName && (
                            <p className="text-sm text-red-700">{certificateFormErrors.certificateName}</p>
                          )}
                          {certificateFormErrors.issuedDate && (
                            <p className="text-sm text-red-700">{certificateFormErrors.issuedDate}</p>
                          )}
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineCertificate}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Chứng chỉ</h3>
                    <div className="flex gap-2">
                      {showInlineForm !== "certificate" && (
                        <Button
                          onClick={() => handleOpenInlineForm("certificate")}
                          disabled={isSubmitting}
                          className={`group flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSubmitting ? "Đang xử lý..." : "Thêm chứng chỉ"}
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                      )}
                      {selectedCertificates.length > 0 && (
                        <Button
                          onClick={handleDeleteCertificates}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          Xóa chứng chỉ ({selectedCertificates.length})
                        </Button>
                      )}
                    </div>
                  </div>
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
                                              `/ta/talent-certificates/create?talentId=${id}`
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
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedCertificates.length === certificates.slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage).length && certificates.slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage).length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentPageItems = certificates.slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage).map(cert => cert.id);
                                      setSelectedCertificates([...new Set([...selectedCertificates, ...currentPageItems])]);
                                    } else {
                                      const currentPageItems = certificates.slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage).map(cert => cert.id);
                                      setSelectedCertificates(selectedCertificates.filter(id => !currentPageItems.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Loại chứng chỉ</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Tên chứng chỉ</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Ngày cấp</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Trạng thái</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {certificates
                              .slice((pageCertificates - 1) * itemsPerPage, pageCertificates * itemsPerPage)
                              .map((cert) => (
                                <tr 
                                  key={cert.id} 
                                  className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                                  onClick={() => navigate(`/ta/talent-certificates/edit/${cert.id}`)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedCertificates.includes(cert.id)}
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
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-primary-800">{cert.certificateTypeName}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-primary-800">{cert.certificateName || '—'}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-primary-700">{cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${cert.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {cert.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    {cert.imageUrl && (
                                      <a
                                        href={cert.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        Xem
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
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

            {/* Tab: Kinh nghiệm làm việc */}
            {activeTab === "experiences" && (
              <div className="space-y-4">
                {/* Inline Experience Form */}
                {showInlineForm === "experience" && (
                  <div className="bg-white rounded-xl border-2 border-accent-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Thêm kinh nghiệm mới</h3>
                      <button
                        onClick={handleCloseInlineForm}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded hover:bg-neutral-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Công ty <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={inlineExperienceForm.company || ""}
                            onChange={(e) => setInlineExperienceForm({ ...inlineExperienceForm, company: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                            placeholder="Nhập tên công ty"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Vị trí <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsWorkExperiencePositionDropdownOpen(!isWorkExperiencePositionDropdownOpen)}
                              className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white text-left focus:ring-2 focus:ring-accent-500/20 transition-all border-neutral-300 focus:border-accent-500"
                            >
                              <div className="flex items-center gap-2 text-sm text-neutral-700">
                                <Target className="w-4 h-4 text-neutral-400" />
                                <span className={inlineExperienceForm.position ? "text-neutral-800" : "text-neutral-500"}>
                                  {inlineExperienceForm.position || "Chọn vị trí"}
                                </span>
                              </div>
                            </button>
                            {isWorkExperiencePositionDropdownOpen && (
                              <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                                <div className="p-3 border-b border-neutral-100">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                    <input
                                      type="text"
                                      value={workExperiencePositionSearch}
                                      onChange={(e) => setWorkExperiencePositionSearch(e.target.value)}
                                      placeholder="Tìm vị trí..."
                                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-accent-500 focus:ring-accent-500"
                                    />
                                  </div>
                                </div>
                                <div className="max-h-56 overflow-y-auto">
                                  {(() => {
                                    const filtered = workExperiencePositionSearch
                                      ? workExperiencePositions.filter(p => p.toLowerCase().includes(workExperiencePositionSearch.toLowerCase()))
                                      : workExperiencePositions;
                                    if (filtered.length === 0) {
                                      return <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy vị trí nào</p>;
                                    }
                                    return filtered.map((position) => (
                                      <button
                                        type="button"
                                        key={position}
                                        onClick={() => {
                                          setInlineExperienceForm({ ...inlineExperienceForm, position: position });
                                          setIsWorkExperiencePositionDropdownOpen(false);
                                          setWorkExperiencePositionSearch("");
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm ${
                                          inlineExperienceForm.position === position
                                            ? "bg-accent-50 text-accent-700"
                                            : "hover:bg-neutral-50 text-neutral-700"
                                        }`}
                                      >
                                        {position}
                                      </button>
                                    ));
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Ngày bắt đầu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={inlineExperienceForm.startDate || ""}
                            onChange={(e) => setInlineExperienceForm({ ...inlineExperienceForm, startDate: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Ngày kết thúc</label>
                          <input
                            type="date"
                            value={inlineExperienceForm.endDate || ""}
                            onChange={(e) => setInlineExperienceForm({ ...inlineExperienceForm, endDate: e.target.value || undefined })}
                            className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Mô tả</label>
                        <textarea
                          value={inlineExperienceForm.description || ""}
                          onChange={(e) => setInlineExperienceForm({ ...inlineExperienceForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg bg-white border-neutral-300 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
                          placeholder="Nhập mô tả kinh nghiệm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCloseInlineForm}
                          className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitInlineExperience}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Kinh nghiệm làm việc</h3>
                    <div className="flex gap-2">
                      {showInlineForm !== "experience" && (
                        <Button
                          onClick={() => handleOpenInlineForm("experience")}
                          disabled={isSubmitting}
                          className={`group flex items-center justify-center bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSubmitting ? "Đang xử lý..." : "Thêm kinh nghiệm"}
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                      )}
                      {selectedExperiences.length > 0 && (
                        <Button
                          onClick={handleDeleteExperiences}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          Xóa kinh nghiệm ({selectedExperiences.length})
                        </Button>
                      )}
                    </div>
                  </div>
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
                    </div>
                  )}
                  {workExperiences.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedExperiences.length === workExperiences.slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage).length && workExperiences.slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage).length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentPageItems = workExperiences.slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage).map(exp => exp.id);
                                      setSelectedExperiences([...new Set([...selectedExperiences, ...currentPageItems])]);
                                    } else {
                                      const currentPageItems = workExperiences.slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage).map(exp => exp.id);
                                      setSelectedExperiences(selectedExperiences.filter(id => !currentPageItems.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 text-accent-600 bg-gray-100 border-gray-300 rounded focus:ring-accent-500 focus:ring-2"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Vị trí</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Công ty</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {workExperiences
                              .slice((pageExperiences - 1) * itemsPerPage, pageExperiences * itemsPerPage)
                              .map((exp) => (
                                <tr 
                                  key={exp.id} 
                                  className="hover:bg-accent-50 transition-colors duration-200 cursor-pointer"
                                  onClick={() => navigate(`/ta/talent-work-experiences/edit/${exp.id}`)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedExperiences.includes(exp.id)}
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
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-accent-800">{exp.position}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-accent-700">{exp.company}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-accent-600">{new Date(exp.startDate).toLocaleDateString('vi-VN')} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}</div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
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
