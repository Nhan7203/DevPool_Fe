import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentService, type Talent } from "../../../services/Talent";
import { locationService } from "../../../services/location";
import { partnerService, type Partner } from "../../../services/Partner";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { talentProjectService, type TalentProject } from "../../../services/TalentProject";
import { talentSkillService, type TalentSkill } from "../../../services/TalentSkill";
import { skillService, type Skill } from "../../../services/Skill";
import { talentWorkExperienceService, type TalentWorkExperience } from "../../../services/TalentWorkExperience";
import { talentJobRoleLevelService, type TalentJobRoleLevel } from "../../../services/TalentJobRoleLevel";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import { talentCertificateService, type TalentCertificate } from "../../../services/TalentCertificate";
import { certificateTypeService, type CertificateType } from "../../../services/CertificateType";
import { talentAvailableTimeService, type TalentAvailableTime } from "../../../services/TalentAvailableTime";
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
  Download,
  Star,
  Workflow,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Mapping WorkingMode values to Vietnamese names
const workingModeLabels: Record<number, string> = {
  [WorkingMode.None]: "Không xác định",
  [WorkingMode.Onsite]: "Tại công ty",
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
  const [loading, setLoading] = useState(true);

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
  const itemsPerPage = 10;

  // Collapse/Expand states for each section
  const [isCVsExpanded, setIsCVsExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);
  const [isExperiencesExpanded, setIsExperiencesExpanded] = useState(true);
  const [isJobRoleLevelsExpanded, setIsJobRoleLevelsExpanded] = useState(true);
  const [isCertificatesExpanded, setIsCertificatesExpanded] = useState(true);
  const [isAvailableTimesExpanded, setIsAvailableTimesExpanded] = useState(true);

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
        const skillsWithNames = skills.map((skill: TalentSkill) => {
          const skillInfo = allSkills.find((s: Skill) => s.id === skill.skillId);
          return { ...skill, skillName: skillInfo?.name ?? "Unknown Skill" };
        });
        setTalentSkills(skillsWithNames);

        // Fetch job role level names
        const allJobRoleLevels = await jobRoleLevelService.getAll();
        const jobRoleLevelsWithNames = jobRoleLevelsData.map((jrl: TalentJobRoleLevel) => {
          const jobRoleLevelInfo = allJobRoleLevels.find((j: JobRoleLevel) => j.id === jrl.jobRoleLevelId);
          return { ...jrl, jobRoleLevelName: jobRoleLevelInfo?.name ?? "Unknown Level" };
        });
        setJobRoleLevels(jobRoleLevelsWithNames);

        // Fetch certificate type names
        const allCertificateTypes = await certificateTypeService.getAll();
        const certificatesWithNames = certificatesData.map((cert: TalentCertificate) => {
          const certTypeInfo = allCertificateTypes.find((c: CertificateType) => c.id === cert.certificateTypeId);
          return { ...cert, certificateTypeName: certTypeInfo?.name ?? "Unknown Certificate" };
        });
        setCertificates(certificatesWithNames);

        setTalent(talentData);
        console.log("Talent chi tiết:", talentData);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết Talent:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // 🗑️ Xóa talent
  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("⚠️ Bạn có chắc muốn xóa talent này?");
    if (!confirm) return;

    try {
      await talentService.deleteById(Number(id));
      alert("✅ Đã xóa talent thành công!");
      navigate("/hr/developers");
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa talent!");
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
    const confirm = window.confirm(`⚠️ Bạn có chắc muốn xóa ${selectedCVs.length} CV đã chọn?`);
    if (!confirm) return;

    try {
      await Promise.all(selectedCVs.map(id => talentCVService.deleteById(id)));
      alert("✅ Đã xóa CV thành công!");
      setSelectedCVs([]);
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
            <p className="text-gray-500">Đang tải dữ liệu talent...</p>
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
            <p className="text-red-500 text-lg font-medium">Không tìm thấy talent</p>
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
      case "Unavailable":
        return {
          label: "Tạm ngưng",
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
                Thông tin chi tiết talent trong hệ thống DevPool
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                label="Trạng thái"
                value={statusConfig.label}
                icon={<Target className="w-4 h-4" />}
              />
              <InfoItem
                label="GitHub"
                value={talent.githubUrl ? (
                  <a href={talent.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                    {talent.githubUrl}
                  </a>
                ) : "Chưa có"}
                icon={<ExternalLink className="w-4 h-4" />}
              />
              <InfoItem
                label="Portfolio"
                value={talent.portfolioUrl ? (
                  <a href={talent.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                    {talent.portfolioUrl}
                  </a>
                ) : "Chưa có"}
                icon={<ExternalLink className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* CV của Talent */}
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
                <h2 className="text-xl font-semibold text-gray-900">CV của Talent</h2>
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
                      .map((cv) => (
                        <div key={cv.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200">
                          <div className="flex items-center gap-3 flex-1">
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
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => navigate(`/hr/talent-cvs/edit/${cv.id}`)}
                            >
                              <FileText className="w-5 h-5 text-primary-600" />
                              <div>
                                <p className="font-medium text-gray-900 hover:text-primary-700 transition-colors duration-200">
                                  {cv.jobRoleName ? `${cv.jobRoleName} ${cv.versionName}` : cv.versionName}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  <span className="font-medium">Trạng thái:</span> {cv.isActive ? "Đang hoạt động" : "Không hoạt động"}
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
                              <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium">Xem PDF</span>
                            </a>
                          </div>
                        </div>
                      ))}
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa upload CV</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dự án của Talent */}
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
                <h2 className="text-xl font-semibold text-gray-900">Dự án của Talent</h2>
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
                            <div>
                              <p className="text-sm text-gray-600 font-medium mb-1">Mô tả dự án:</p>
                              <p className="text-sm text-gray-700">{project.description}</p>
                            </div>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa tham gia dự án</p>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa cập nhật vị trí làm việc</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kỹ năng của Talent */}
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
                <h2 className="text-xl font-semibold text-gray-900">Kỹ năng của Talent</h2>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa cập nhật kỹ năng</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thời gian có sẵn */}
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
                <h2 className="text-xl font-semibold text-gray-900">Thời gian có sẵn</h2>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa cập nhật thời gian có sẵn</p>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa upload chứng chỉ</p>
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
                  <p className="text-neutral-400 text-sm mt-1">Talent chưa cập nhật kinh nghiệm</p>
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
      <div className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors duration-300">
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
