import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type ProjectDetailedModel } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { talentAssignmentService, type TalentAssignmentModel, type TalentAssignmentCreateModel } from "../../../services/TalentAssignment";
import { talentApplicationService, type TalentApplication } from "../../../services/TalentApplication";
import { talentService, type Talent } from "../../../services/Talent";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { partnerService, type Partner } from "../../../services/Partner";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { locationService, type Location } from "../../../services/location";
import { WorkingMode } from "../../../types/WorkingMode";
import { uploadFile } from "../../../utils/firebaseStorage";
import { 
  Briefcase, 
  Edit, 
  Trash2, 
  FileText, 
  CalendarDays, 
  Building2, 
  Globe2, 
  Factory, 
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  UserCheck,
  Clock,
  Download,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  Upload,
  User,
  Eye,
  ExternalLink
} from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailedModel | null>(null);
  const [company, setCompany] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('info');
  
  // Job Requests search, filter, pagination
  const [jobRequestSearch, setJobRequestSearch] = useState("");
  const [jobRequestStatusFilter, setJobRequestStatusFilter] = useState<string>("");
  const [jobRequestPage, setJobRequestPage] = useState(1);
  const jobRequestPageSize = 5;
  
  // Contracts search, filter, pagination
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState<string>("");
  const [contractPage, setContractPage] = useState(1);
  const contractPageSize = 5;

  // Talent Assignment states
  const [talentAssignments, setTalentAssignments] = useState<TalentAssignmentModel[]>([]);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showUpdateAssignmentModal, setShowUpdateAssignmentModal] = useState(false);
  const [showDetailAssignmentModal, setShowDetailAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TalentAssignmentModel | null>(null);
  const [hiredApplications, setHiredApplications] = useState<TalentApplication[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [jobRoleLevels, setJobRoleLevels] = useState<JobRoleLevel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [assignmentErrors, setAssignmentErrors] = useState<{ endDate?: string }>({});
  const [updateErrors, setUpdateErrors] = useState<{ startDate?: string; endDate?: string }>({});
  
  // Form state for creating assignment
  const [assignmentForm, setAssignmentForm] = useState<TalentAssignmentCreateModel>({
    talentId: 0,
    projectId: Number(id) || 0,
    partnerId: 0,
    talentApplicationId: null,
    startDate: "",
    endDate: null,
    commitmentFileUrl: null,
    status: "Active",
    notes: null
  });
  const [commitmentFile, setCommitmentFile] = useState<File | null>(null);
  const [updateCommitmentFile, setUpdateCommitmentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state for updating/extending assignment
  const [updateForm, setUpdateForm] = useState<{
    startDate: string;
    endDate: string;
    commitmentFileUrl?: string | null;
    notes?: string | null;
  }>({
    startDate: "",
    endDate: "",
    commitmentFileUrl: null,
    notes: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Lấy thông tin chi tiết dự án
        const detailedProject = await projectService.getDetailedById(Number(id));
        setProject(detailedProject);

        // Lấy thông tin công ty khách hàng nếu có
        if (detailedProject.clientCompanyId) {
          try {
            const comp = await clientCompanyService.getById(detailedProject.clientCompanyId);
        setCompany(comp);
          } catch (err) {
            console.error("❌ Lỗi tải thông tin công ty:", err);
          }
        }

        // Lấy danh sách TalentAssignment cho project
        try {
          const assignments = await talentAssignmentService.getAll({ projectId: Number(id) });
          setTalentAssignments(assignments);
        } catch (err) {
          console.error("❌ Lỗi tải danh sách phân công nhân sự:", err);
        }

        // Lấy danh sách talents, partners, jobRoleLevels và locations để hiển thị
        try {
          const [allTalents, allPartners, allJobRoleLevels, allLocations] = await Promise.all([
            talentService.getAll({ excludeDeleted: true }),
            partnerService.getAll(),
            jobRoleLevelService.getAll({ excludeDeleted: true }),
            locationService.getAll({ excludeDeleted: true })
          ]);
          setTalents(allTalents);
          setPartners(allPartners);
          setJobRoleLevels(allJobRoleLevels);
          setLocations(allLocations);
        } catch (err) {
          console.error("❌ Lỗi tải danh sách talents/partners/jobRoleLevels/locations:", err);
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết dự án:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch data for create assignment modal
  useEffect(() => {
    const fetchModalData = async () => {
      if (!showCreateAssignmentModal || !id) return;
      
      try {
        setLoadingAssignments(true);
        
        // Lấy danh sách applications có status = "Hired" và thuộc project này
        const allApplications = await talentApplicationService.getAll({ excludeDeleted: true });
        const projectJobRequestIds = project?.jobRequests?.map((jr: any) => jr.id) || [];
        const hiredApps = allApplications.filter((app: TalentApplication) => 
          app.status === "Hired" && projectJobRequestIds.includes(app.jobRequestId)
        );
        setHiredApplications(hiredApps);

        // Lấy CVs từ applications để lấy talentIds
        const cvIds = [...new Set(hiredApps.map(app => app.cvId))];
        const cvs = await Promise.all(
          cvIds.map(id => talentCVService.getById(id).catch(() => null))
        );
        const validCvs = cvs.filter((cv): cv is TalentCV => cv !== null);
        const talentIdsFromApps = [...new Set(validCvs.map(cv => cv.talentId))];

        // Lấy tất cả talents và partners
        const [allTalents, allPartners] = await Promise.all([
          talentService.getAll({ excludeDeleted: true }),
          partnerService.getAll()
        ]);
        
        // Ưu tiên hiển thị talents từ applications đã hired, sau đó là tất cả
        const talentsFromApps = allTalents.filter((t: any) => talentIdsFromApps.includes(t.id));
        const otherTalents = allTalents.filter((t: any) => !talentIdsFromApps.includes(t.id));
        setTalents([...talentsFromApps, ...otherTalents]);
        setPartners(allPartners);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu cho modal:", err);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchModalData();
  }, [showCreateAssignmentModal, id, project]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa dự án này?");
    if (!confirmDelete) return;

    try {
      await projectService.delete(Number(id));
      alert("✅ Đã xóa dự án thành công!");
      navigate("/sales/projects");
    } catch (err) {
      console.error("❌ Lỗi khi xóa dự án:", err);
      alert("Không thể xóa dự án!");
    }
  };

  const handleEdit = () => {
    navigate(`/sales/projects/edit/${id}`);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Validation: End date must be >= start date
    setAssignmentErrors({});
    if (assignmentForm.startDate && assignmentForm.endDate) {
      const startDate = new Date(assignmentForm.startDate);
      const endDate = new Date(assignmentForm.endDate);
      if (endDate < startDate) {
        setAssignmentErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu" });
        return;
      }
    }

    // Confirmation dialog
    const talentName = talents.find(t => t.id === assignmentForm.talentId)?.fullName || `Talent #${assignmentForm.talentId}`;
    const partnerName = partners.find(p => p.id === assignmentForm.partnerId)?.companyName || `Partner #${assignmentForm.partnerId}`;
    const startDateStr = assignmentForm.startDate ? formatViDate(assignmentForm.startDate) : "—";
    const endDateStr = assignmentForm.endDate ? formatViDate(assignmentForm.endDate) : "—";
    
    const confirmMessage = `Xác nhận tạo phân công nhân sự?\n\n` +
      `Talent: ${talentName}\n` +
      `Partner: ${partnerName}\n` +
      `Ngày bắt đầu: ${startDateStr}\n` +
      `Ngày kết thúc: ${endDateStr}`;
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    try {
      setSubmittingAssignment(true);

      // Upload commitment file if exists
      let commitmentFileUrl = null;
      if (commitmentFile) {
        const path = `talent-assignments/${id}/${Date.now()}_${commitmentFile.name}`;
        commitmentFileUrl = await uploadFile(commitmentFile, path, setUploadProgress);
      }

      // Create assignment
      const payload: TalentAssignmentCreateModel = {
        ...assignmentForm,
        projectId: Number(id),
        commitmentFileUrl
      };

      await talentAssignmentService.create(payload);

      // Refresh assignments list
      const assignments = await talentAssignmentService.getAll({ projectId: Number(id) });
      setTalentAssignments(assignments);

      // Reset form and close modal
      setAssignmentForm({
        talentId: 0,
        projectId: Number(id),
        partnerId: 0,
        talentApplicationId: null,
        startDate: "",
        endDate: null,
        commitmentFileUrl: null,
        status: "Active",
        notes: null
      });
      setCommitmentFile(null);
      setUploadProgress(0);
      setAssignmentErrors({});
      setShowCreateAssignmentModal(false);

      alert("✅ Tạo phân công nhân sự thành công!");
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo phân công:", error);
      alert(error.message || "Không thể tạo phân công nhân sự");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedAssignment) return;

    // Validation
    setUpdateErrors({});
    
    // Check if start date is not in the past (always check when status is Draft)
    if (selectedAssignment.status === "Draft" && updateForm.startDate) {
      const startDate = new Date(updateForm.startDate);
      const today = getTodayDateInVietnam();
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        setUpdateErrors({ startDate: "Ngày bắt đầu không được nhỏ hơn ngày hôm nay" });
        return;
      }
    }
    
    // Check if end date >= start date
    const startDateToCheck = selectedAssignment.status === "Draft" 
      ? (updateForm.startDate ? new Date(updateForm.startDate) : (isValidDate(selectedAssignment.startDate) ? new Date(selectedAssignment.startDate) : new Date()))
      : (isValidDate(selectedAssignment.startDate) ? new Date(selectedAssignment.startDate) : new Date());
    
    if (updateForm.endDate) {
      const endDate = new Date(updateForm.endDate);
      
      // End date must be >= start date
      if (endDate < startDateToCheck) {
        setUpdateErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu" });
        return;
      }
      
      // End date must be >= current end date (if exists)
      if (selectedAssignment.endDate) {
        const currentEndDate = new Date(selectedAssignment.endDate);
        if (endDate < currentEndDate) {
          setUpdateErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày kết thúc hiện tại" });
          return;
        }
      }
    }

    // Confirmation dialog
    const talentName = talents.find(t => t.id === selectedAssignment.talentId)?.fullName || `Talent #${selectedAssignment.talentId}`;
    const startDateStr = selectedAssignment.status === "Draft" 
      ? (updateForm.startDate ? formatViDate(updateForm.startDate) : formatViDate(selectedAssignment.startDate))
      : formatViDate(selectedAssignment.startDate);
    const endDateStr = updateForm.endDate ? formatViDate(updateForm.endDate) : "—";
    const currentEndDateStr = selectedAssignment.endDate ? formatViDate(selectedAssignment.endDate) : "—";
    
    const actionText = selectedAssignment.status === "Draft" ? "cập nhật" : "gia hạn";
    let confirmMessage = `Xác nhận ${actionText} phân công nhân sự?\n\n` +
      `Talent: ${talentName}\n` +
      `Ngày bắt đầu: ${startDateStr}\n`;
    
    if (selectedAssignment.status === "Active" && currentEndDateStr !== "—") {
      confirmMessage += `Ngày kết thúc hiện tại: ${currentEndDateStr}\n`;
    }
    confirmMessage += `Ngày kết thúc mới: ${endDateStr}`;
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    try {
      setSubmittingUpdate(true);

      // Upload commitment file if exists
      let commitmentFileUrl = selectedAssignment.commitmentFileUrl || null;
      if (updateCommitmentFile) {
        const path = `talent-assignments/${id}/${Date.now()}_${updateCommitmentFile.name}`;
        commitmentFileUrl = await uploadFile(updateCommitmentFile, path, setUploadProgress);
      }

      const isDraft = selectedAssignment.status === "Draft";
      const isActiveWithStartDate = selectedAssignment.status === "Active" && selectedAssignment.startDate;

      if (isDraft) {
        // Use update API for Draft status
        // Note: We need to include startDate even though it's not in the interface
        const payload: any = {
          startDate: updateForm.startDate ? `${updateForm.startDate}T00:00:00Z` : selectedAssignment.startDate,
          endDate: updateForm.endDate ? `${updateForm.endDate}T00:00:00Z` : null,
          commitmentFileUrl,
          status: "Active", // Change status to Active
          notes: updateForm.notes || null
        };

        await talentAssignmentService.update(selectedAssignment.id, payload);
      } else if (isActiveWithStartDate) {
        // Use extend API for Active status with startDate
        const payload = {
          endDate: updateForm.endDate ? `${updateForm.endDate}T00:00:00Z` : "",
          commitmentFileUrl,
          notes: updateForm.notes || null
        };

        await talentAssignmentService.extend(selectedAssignment.id, payload);
      } else {
        throw new Error("Không thể cập nhật phân công này");
      }

      // Refresh assignments list
      const assignments = await talentAssignmentService.getAll({ projectId: Number(id) });
      setTalentAssignments(assignments);

      // Reset form and close modal
      setUpdateForm({
        startDate: "",
        endDate: "",
        commitmentFileUrl: null,
        notes: null
      });
      setUpdateCommitmentFile(null);
      setUploadProgress(0);
      setUpdateErrors({});
      setSelectedAssignment(null);
      setShowUpdateAssignmentModal(false);

      alert("✅ Cập nhật phân công nhân sự thành công!");
    } catch (error: any) {
      console.error("❌ Lỗi khi cập nhật phân công:", error);
      alert(error.message || "Không thể cập nhật phân công nhân sự");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const formatViDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Helper function to check if a date string is valid (year >= 1900)
  const isValidDate = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    try {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && date.getFullYear() >= 1900;
    } catch {
      return false;
    }
  };

  // Helper function to get today's date in Vietnam timezone (UTC+7)
  const getTodayInVietnam = (): string => {
    const now = new Date();
    const vietnamTimeString = now.toLocaleString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    // Format: "MM/DD/YYYY" -> "YYYY-MM-DD"
    const [month, day, year] = vietnamTimeString.split('/');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get today's Date object in Vietnam timezone
  const getTodayDateInVietnam = (): Date => {
    const todayStr = getTodayInVietnam();
    const [year, month, day] = todayStr.split('-').map(Number);
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatViDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      // Kiểm tra date hợp lệ (không phải Invalid Date và năm >= 1900)
      if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
        return "—";
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  const statusLabels: Record<string, string> = {
  Planned: "Đã lên kế hoạch",
  Ongoing: "Đang thực hiện",
  Completed: "Đã hoàn thành",
};

  const contractStatusLabels: Record<string, string> = {
    Draft: "Nháp",
    Pending: "Chờ duyệt",
    Active: "Đang hoạt động",
    Expired: "Hết hạn",
    Terminated: "Đã chấm dứt",
  };

  // Job Request Status Labels and Colors (support both number and string)
  const jobRequestStatusLabels: Record<string | number, string> = {
    // String keys
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
    Closed: "Đã đóng",
    // Number keys (from API)
    0: "Chờ duyệt",
    1: "Đã duyệt",
    2: "Đã đóng",
    3: "Bị từ chối",
  };

  const jobRequestStatusColors: Record<string | number, string> = {
    // String keys
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Closed: "bg-gray-100 text-gray-700",
    // Number keys (from API)
    0: "bg-yellow-100 text-yellow-800",
    1: "bg-green-100 text-green-800",
    2: "bg-gray-100 text-gray-700",
    3: "bg-red-100 text-red-800",
  };

  // Helper function to format WorkingMode
  const formatWorkingMode = (mode?: number | null): string => {
    if (!mode || mode === WorkingMode.None) return "—";
    const options = [
      { value: WorkingMode.Onsite, label: "Tại văn phòng" },
      { value: WorkingMode.Remote, label: "Làm từ xa" },
      { value: WorkingMode.Hybrid, label: "Kết hợp" },
      { value: WorkingMode.Flexible, label: "Linh hoạt" },
    ];
    const matched = options
      .filter((item) => (mode & item.value) === item.value)
      .map((item) => item.label);
    return matched.length > 0 ? matched.join(", ") : "—";
  };

  // Filter và paginate Job Requests
  const filteredJobRequests = (project?.jobRequests || []).filter((jr: any) => {
    const matchesSearch = !jobRequestSearch || 
      (jr.title?.toLowerCase().includes(jobRequestSearch.toLowerCase()) ||
       jr.jobPositionName?.toLowerCase().includes(jobRequestSearch.toLowerCase()));
    const matchesStatus = !jobRequestStatusFilter || jr.status === jobRequestStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedJobRequests = filteredJobRequests.slice(
    (jobRequestPage - 1) * jobRequestPageSize,
    jobRequestPage * jobRequestPageSize
  );
  const totalJobRequestPages = Math.ceil(filteredJobRequests.length / jobRequestPageSize);

  // Filter và paginate Contracts
  const filteredContracts = (project?.clientContracts || []).filter((contract: any) => {
    const matchesSearch = !contractSearch || 
      (contract.contractNumber?.toLowerCase().includes(contractSearch.toLowerCase()) ||
       contract.talentName?.toLowerCase().includes(contractSearch.toLowerCase()));
    const matchesStatus = !contractStatusFilter || contract.status === contractStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedContracts = filteredContracts.slice(
    (contractPage - 1) * contractPageSize,
    contractPage * contractPageSize
  );
  const totalContractPages = Math.ceil(filteredContracts.length / contractPageSize);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Sales Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-500 text-lg font-medium">Không tìm thấy dự án</p>
            <Link 
              to="/sales/projects"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Breadcrumb
            items={[
              { label: "Dự án", to: "/sales/projects" },
              { label: project ? project.name : "Chi tiết dự án" }
            ]}
          />

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-neutral-600 mb-4">
                Thông tin chi tiết dự án khách hàng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {project.status ? statusLabels[project.status] || project.status : "Đang hoạt động"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="group flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          {/* Tab Headers */}
          <div className="border-b border-neutral-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'info'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Thông tin dự án
              </button>
              <button
                onClick={() => setActiveTab('job-requests')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'job-requests'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Yêu cầu tuyển dụng
                {project.jobRequests && project.jobRequests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.jobRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'contracts'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Hợp đồng khách hàng
                {project.clientContracts && project.clientContracts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.clientContracts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Nhân sự tham gia
                {project.staffAssignments && project.staffAssignments.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                    {project.staffAssignments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeTab === 'timeline'
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Dòng thời gian
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab: Thông tin dự án */}
            {activeTab === 'info' && (
              <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Tên dự án" 
                  value={project.name}
                  icon={<FileText className="w-4 h-4" />}
                />
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors duration-300" />
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                      Công ty khách hàng
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCompanyInfo(true)}
                    className="text-gray-900 font-semibold text-lg hover:text-primary-700 transition-colors duration-300 cursor-pointer text-left"
                  >
                    {project.clientCompanyName || company?.name || "—"}
                  </button>
                </div>
                <InfoItem 
                  label="Thị trường" 
                  value={project.marketName || "—"}
                  icon={<Globe2 className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngành nghề" 
                  value={
                    project.industryNames && project.industryNames.length > 0
                      ? project.industryNames.join(", ")
                      : "—"
                  }
                  icon={<Factory className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày bắt đầu" 
                  value={formatViDateTime(project.startDate)}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Ngày kết thúc" 
                  value={project.endDate ? formatViDateTime(project.endDate) : "Chưa xác định"}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              </div>

              {/* Mô tả với nút xem/ẩn */}
              {project.description && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-3"
                  >
                    {showDescription ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ẩn mô tả
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Xem mô tả
                      </>
                    )}
                  </button>
                  {showDescription && (
                    <div className="prose max-w-none text-neutral-700 bg-neutral-50 rounded-xl p-4">
                      <div dangerouslySetInnerHTML={{ __html: project.description }} />
                    </div>
                  )}
                </div>
              )}
              </div>
            )}

            {/* Tab: Yêu cầu tuyển dụng */}
            {activeTab === 'job-requests' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách yêu cầu tuyển dụng</h3>
                  <span className="text-sm text-neutral-500">
                    ({filteredJobRequests.length} / {project.jobRequests?.length || 0} yêu cầu)
                  </span>
                </div>
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={jobRequestSearch}
                    onChange={(e) => {
                      setJobRequestSearch(e.target.value);
                      setJobRequestPage(1);
                    }}
                    placeholder="Tìm kiếm theo tiêu đề, vị trí..."
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                  {jobRequestSearch && (
                    <button
                      onClick={() => setJobRequestSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={jobRequestStatusFilter}
                    onChange={(e) => {
                      setJobRequestStatusFilter(e.target.value);
                      setJobRequestPage(1);
                    }}
                    className="pl-9 pr-8 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Approved">Đã duyệt</option>
                    <option value="Rejected">Từ chối</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </div>
              </div>

              {paginatedJobRequests.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tiêu đề</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Vị trí tuyển dụng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Số lượng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngân sách/tháng (VND)</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Khu vực làm việc</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Chế độ làm việc</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedJobRequests.map((jr: any) => {
                          const jobRoleLevel = jobRoleLevels.find(jrl => jrl.id === jr.jobRoleLevelId);
                          const location = locations.find(loc => loc.id === jr.locationId);
                          return (
                            <tr
                              key={jr.id}
                              onClick={() => navigate(`/sales/job-requests/${jr.id}`)}
                              className="border-b border-neutral-100 hover:bg-primary-50 cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{jr.title || "—"}</td>
                              <td className="py-3 px-4 text-sm text-neutral-700">{jobRoleLevel?.name || jr.jobPositionName || "—"}</td>
                              <td className="py-3 px-4 text-sm text-neutral-700">{jr.quantity || 0}</td>
                              <td className="py-3 px-4 text-sm text-neutral-700">
                                {jr.budgetPerMonth ? `${jr.budgetPerMonth.toLocaleString('vi-VN')} VNĐ` : "—"}
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-700">{location?.name || "—"}</td>
                              <td className="py-3 px-4 text-sm text-neutral-700">{formatWorkingMode(jr.workingMode)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  jr.status !== undefined && jr.status !== null 
                                    ? (jobRequestStatusColors[jr.status] || "bg-gray-100 text-gray-700")
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {jr.status !== undefined && jr.status !== null
                                    ? (jobRequestStatusLabels[jr.status] || String(jr.status))
                                    : "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalJobRequestPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-neutral-600">
                        Trang {jobRequestPage} / {totalJobRequestPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setJobRequestPage(prev => Math.max(1, prev - 1))}
                          disabled={jobRequestPage === 1}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setJobRequestPage(prev => Math.min(totalJobRequestPages, prev + 1))}
                          disabled={jobRequestPage === totalJobRequestPages}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>{filteredJobRequests.length === 0 && (jobRequestSearch || jobRequestStatusFilter) ? "Không tìm thấy kết quả" : "Chưa có yêu cầu tuyển dụng nào"}</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Hợp đồng khách hàng */}
            {activeTab === 'contracts' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách hợp đồng khách hàng</h3>
                  <span className="text-sm text-neutral-500">
                    ({filteredContracts.length} / {project.clientContracts?.length || 0} hợp đồng)
                  </span>
                </div>
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={contractSearch}
                    onChange={(e) => {
                      setContractSearch(e.target.value);
                      setContractPage(1);
                    }}
                    placeholder="Tìm kiếm theo mã hợp đồng, ứng viên..."
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                  {contractSearch && (
                    <button
                      onClick={() => setContractSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={contractStatusFilter}
                    onChange={(e) => {
                      setContractStatusFilter(e.target.value);
                      setContractPage(1);
                    }}
                    className="pl-9 pr-8 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Draft">Nháp</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Active">Đang hoạt động</option>
                    <option value="Expired">Hết hạn</option>
                    <option value="Terminated">Đã chấm dứt</option>
                  </select>
                </div>
              </div>

              {paginatedContracts.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Mã hợp đồng</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ứng viên</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Thời gian</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tệp</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Đơn ứng tuyển</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedContracts.map((contract: any) => (
                          <tr key={contract.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{contract.contractNumber || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">{contract.talentName || "—"}</td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {contract.startDate && contract.endDate 
                                ? `${formatViDate(contract.startDate)} - ${formatViDate(contract.endDate)}`
                                : contract.startDate 
                                  ? `Từ ${formatViDate(contract.startDate)}`
                                  : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                contract.status === "Active" ? "bg-green-100 text-green-800" :
                                contract.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                contract.status === "Expired" ? "bg-red-100 text-red-800" :
                                "bg-neutral-100 text-neutral-800"
                              }`}>
                                {contractStatusLabels[contract.status] || contract.status || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {contract.contractFileUrl ? (
                                <a
                                  href={contract.contractFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="text-sm">Tải xuống</span>
                                </a>
                              ) : (
                                <span className="text-sm text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {contract.talentApplicationId ? (
                                <Link
                                  to={`/sales/applications/${contract.talentApplicationId}`}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Xem chi tiết
                                </Link>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalContractPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-neutral-600">
                        Trang {contractPage} / {totalContractPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setContractPage(prev => Math.max(1, prev - 1))}
                          disabled={contractPage === 1}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setContractPage(prev => Math.min(totalContractPages, prev + 1))}
                          disabled={contractPage === totalContractPages}
                          className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>{filteredContracts.length === 0 && (contractSearch || contractStatusFilter) ? "Không tìm thấy kết quả" : "Chưa có hợp đồng nào"}</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Nhân sự tham gia */}
            {activeTab === 'staff' && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách nhân sự tham gia</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-500">
                      ({talentAssignments.length} nhân sự)
                    </span>
                    <button
                      onClick={() => setShowCreateAssignmentModal(true)}
                      className="group flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-300 shadow-soft hover:shadow-glow"
                    >
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Thêm nhân sự
                    </button>
                  </div>
                </div>
              {talentAssignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Talent</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Partner</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày bắt đầu</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày kết thúc</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng thái</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">File cam kết</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Ngày cập nhật gần nhất</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...talentAssignments]
                        .sort((a, b) => {
                          // Sắp xếp theo ngày cập nhật gần nhất (mới nhất trước)
                          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                          return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
                        })
                        .map((assignment) => {
                        const talent = talents.find(t => t.id === assignment.talentId);
                        const partner = partners.find(p => p.id === assignment.partnerId);
                        return (
                          <tr 
                            key={assignment.id} 
                            className="border-b border-neutral-100 hover:bg-neutral-50"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 font-medium">
                              {talent?.fullName || `Talent #${assignment.talentId}`}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {partner?.companyName || `Partner #${assignment.partnerId}`}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {assignment.startDate ? formatViDate(assignment.startDate) : "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {assignment.endDate ? formatViDate(assignment.endDate) : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                assignment.status === "Active" ? "bg-green-100 text-green-800" :
                                assignment.status === "Completed" ? "bg-blue-100 text-blue-800" :
                                assignment.status === "Terminated" ? "bg-red-100 text-red-800" :
                                assignment.status === "Inactive" ? "bg-gray-100 text-gray-800" :
                                "bg-neutral-100 text-neutral-800"
                              }`}>
                                {assignment.status || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {assignment.commitmentFileUrl ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={assignment.commitmentFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Xem file trong tab mới"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Xem
                                  </a>
                                  <a
                                    href={assignment.commitmentFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded text-xs font-medium transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Tải file xuống"
                                  >
                                    <Download className="w-3 h-3" />
                                    Tải xuống
                                  </a>
                                </div>
                              ) : (
                                <span className="text-sm text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {assignment.updatedAt 
                                ? formatViDateTime(assignment.updatedAt)
                                : assignment.createdAt 
                                  ? formatViDateTime(assignment.createdAt)
                                  : "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAssignment(assignment);
                                  setShowDetailAssignmentModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>Chưa có nhân sự nào được phân công</p>
                </div>
              )}
              </div>
            )}

            {/* Tab: Dòng thời gian */}
            {activeTab === 'timeline' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dòng thời gian hoạt động</h3>
                <div className="space-y-4">
                  {/* Tạo dự án */}
                  <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-600">
                        {formatViDateTime(project.createdAt)} - Tạo dự án
                      </p>
                    </div>
                  </div>

                  {/* Cập nhật dự án */}
                  {project.updatedAt && project.updatedAt !== project.createdAt && (
                    <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">
                          {formatViDateTime(project.updatedAt)} - Cập nhật dự án
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Các hoạt động khác có thể thêm sau */}
                  {(!project.updatedAt || project.updatedAt === project.createdAt) && (
                    <div className="text-center py-4 text-neutral-400 text-sm">
                      Chưa có hoạt động nào khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Info Popover */}
      {showCompanyInfo && company && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCompanyInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Thông tin khách hàng
              </h3>
              <button
                onClick={() => setShowCompanyInfo(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Tên công ty</p>
                <p className="text-gray-900 font-semibold">{company.name}</p>
              </div>
              {company.contactPerson && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Người liên hệ</p>
                  <p className="text-gray-900">{company.contactPerson}</p>
                </div>
              )}
              {company.email && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Email</p>
                  <p className="text-gray-900">{company.email}</p>
                </div>
              )}
              {company.phone && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Điện thoại</p>
                  <p className="text-gray-900">{company.phone}</p>
                </div>
              )}
              {company.address && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Địa chỉ</p>
                  <p className="text-gray-900">{company.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Talent Assignment Modal */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateAssignmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Thêm nhân sự vào dự án
              </h3>
              <button
                onClick={() => setShowCreateAssignmentModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAssignments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                {/* Talent Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Talent <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignmentForm.talentId || ""}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, talentId: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Chọn talent...</option>
                    {talents.map((talent) => (
                      <option key={talent.id} value={talent.id}>
                        {talent.fullName} ({talent.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Partner Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignmentForm.partnerId || ""}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, partnerId: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Chọn partner...</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Talent Application (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn ứng tuyển (Tùy chọn)
                  </label>
                  <select
                    value={assignmentForm.talentApplicationId || ""}
                    onChange={(e) => setAssignmentForm({ 
                      ...assignmentForm, 
                      talentApplicationId: e.target.value ? Number(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Không chọn</option>
                    {hiredApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        Application #{app.id} - {app.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.startDate ? assignmentForm.startDate.split('T')[0] : ""}
                    onChange={(e) => setAssignmentForm({ 
                      ...assignmentForm, 
                      startDate: e.target.value ? `${e.target.value}T00:00:00Z` : "" 
                    })}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc (Tùy chọn)
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.endDate ? assignmentForm.endDate.split('T')[0] : ""}
                    min={assignmentForm.startDate ? assignmentForm.startDate.split('T')[0] : undefined}
                    onChange={(e) => {
                      setAssignmentForm({ 
                        ...assignmentForm, 
                        endDate: e.target.value ? `${e.target.value}T00:00:00Z` : null 
                      });
                      // Clear error when user changes value
                      if (assignmentErrors.endDate) {
                        setAssignmentErrors({});
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 ${
                      assignmentErrors.endDate 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {assignmentErrors.endDate && (
                    <p className="mt-1 text-sm text-red-500">{assignmentErrors.endDate}</p>
                  )}
                </div>

                {/* Commitment File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File cam kết (Tùy chọn)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Chọn file</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCommitmentFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {commitmentFile && (
                      <span className="text-sm text-neutral-600">{commitmentFile.name}</span>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <span className="text-sm text-primary-600">Đang upload: {uploadProgress}%</span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (Tùy chọn)
                  </label>
                  <textarea
                    value={assignmentForm.notes || ""}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value || null })}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Nhập ghi chú..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAssignmentModal(false)}
                    className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssignment}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAssignment ? "Đang tạo..." : "Tạo phân công"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Update/Extend Talent Assignment Modal */}
      {showUpdateAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUpdateAssignmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary-600" />
                {selectedAssignment.status === "Draft" ? "Cập nhật phân công nhân sự" : "Gia hạn phân công nhân sự"}
              </h3>
              <button
                onClick={() => setShowUpdateAssignmentModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAssignment} className="space-y-4">
              {selectedAssignment.status === "Draft" && (
                <>
                  {/* Start Date - Required for Draft */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={updateForm.startDate ? updateForm.startDate.split('T')[0] : ""}
                      onChange={(e) => {
                        setUpdateForm({ 
                          ...updateForm, 
                          startDate: e.target.value ? `${e.target.value}T00:00:00Z` : "" 
                        });
                        // Clear error when user changes value
                        if (updateErrors.startDate) {
                          setUpdateErrors({ ...updateErrors, startDate: undefined });
                        }
                      }}
                      min={getTodayInVietnam()}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 ${
                        updateErrors.startDate 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-neutral-200 focus:border-primary-500'
                      }`}
                    />
                    {updateErrors.startDate && (
                      <p className="mt-1 text-sm text-red-500">{updateErrors.startDate}</p>
                    )}
                    {!selectedAssignment.startDate && !updateErrors.startDate && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Ngày bắt đầu phải từ hôm nay trở đi
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* End Date - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={updateForm.endDate ? updateForm.endDate.split('T')[0] : ""}
                  min={(() => {
                    // Min date should be the later of: start date or current end date
                    const startDate = selectedAssignment.status === "Draft" 
                      ? (updateForm.startDate ? updateForm.startDate.split('T')[0] : selectedAssignment.startDate?.split('T')[0])
                      : selectedAssignment.startDate?.split('T')[0];
                    const currentEndDate = selectedAssignment.endDate?.split('T')[0];
                    
                    if (startDate && currentEndDate) {
                      return new Date(startDate) > new Date(currentEndDate) ? startDate : currentEndDate;
                    }
                    return startDate || currentEndDate;
                  })()}
                  onChange={(e) => {
                    setUpdateForm({ 
                      ...updateForm, 
                      endDate: e.target.value ? `${e.target.value}T00:00:00Z` : "" 
                    });
                    // Clear error when user changes value
                    if (updateErrors.endDate) {
                      setUpdateErrors({});
                    }
                  }}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 ${
                    updateErrors.endDate 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 focus:border-primary-500'
                  }`}
                />
                {updateErrors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{updateErrors.endDate}</p>
                )}
              </div>

              {/* Commitment File - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File cam kết (Tùy chọn)
                </label>
                {selectedAssignment.commitmentFileUrl && !updateCommitmentFile && (
                  <div className="mb-2">
                    <a
                      href={selectedAssignment.commitmentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>File hiện tại</span>
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{updateCommitmentFile ? "Thay đổi file" : "Chọn file mới"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUpdateCommitmentFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {updateCommitmentFile && (
                    <span className="text-sm text-neutral-600">{updateCommitmentFile.name}</span>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <span className="text-sm text-primary-600">Đang upload: {uploadProgress}%</span>
                  )}
                </div>
              </div>

              {/* Notes - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  value={updateForm.notes || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value || null })}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Nhập ghi chú..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateAssignmentModal(false);
                              setSelectedAssignment(null);
                    setUpdateForm({ startDate: "", endDate: "", commitmentFileUrl: null, notes: null });
                    setUpdateCommitmentFile(null);
                  }}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingUpdate}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingUpdate ? "Đang cập nhật..." : selectedAssignment.status === "Draft" ? "Cập nhật" : "Gia hạn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Talent Assignment Modal */}
      {showDetailAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailAssignmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Chi tiết phân công nhân sự
              </h3>
              <button
                onClick={() => {
                  setShowDetailAssignmentModal(false);
                  setSelectedAssignment(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Talent Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Talent</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {talents.find(t => t.id === selectedAssignment.talentId)?.fullName || `Talent #${selectedAssignment.talentId}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Partner</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {partners.find(p => p.id === selectedAssignment.partnerId)?.companyName || `Partner #${selectedAssignment.partnerId}`}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày bắt đầu</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedAssignment.startDate ? formatViDate(selectedAssignment.startDate) : "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày kết thúc</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedAssignment.endDate ? formatViDate(selectedAssignment.endDate) : "—"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${
                  selectedAssignment.status === "Active" ? "bg-green-100 text-green-800" :
                  selectedAssignment.status === "Completed" ? "bg-blue-100 text-blue-800" :
                  selectedAssignment.status === "Terminated" ? "bg-red-100 text-red-800" :
                  selectedAssignment.status === "Inactive" ? "bg-gray-100 text-gray-800" :
                  selectedAssignment.status === "Draft" ? "bg-yellow-100 text-yellow-800" :
                  "bg-neutral-100 text-neutral-800"
                }`}>
                  {selectedAssignment.status || "—"}
                </span>
              </div>

              {/* Talent Application */}
              {selectedAssignment.talentApplicationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Đơn ứng tuyển</label>
                  <Link
                    to={`/sales/applications/${selectedAssignment.talentApplicationId}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Xem đơn ứng tuyển #{selectedAssignment.talentApplicationId}
                  </Link>
                </div>
              )}

              {/* Commitment File */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">File cam kết</label>
                {selectedAssignment.commitmentFileUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedAssignment.commitmentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      title="Xem file trong tab mới"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem file
                    </a>
                    <a
                      href={selectedAssignment.commitmentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                      title="Tải file xuống"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">Chưa có file</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ghi chú</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedAssignment.notes || "—"}
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                  <p className="text-sm text-gray-600">
                    {selectedAssignment.createdAt ? formatViDateTime(selectedAssignment.createdAt) : "—"}
                  </p>
                </div>
                {selectedAssignment.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày cập nhật</label>
                    <p className="text-sm text-gray-600">
                      {formatViDateTime(selectedAssignment.updatedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    setShowDetailAssignmentModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Đóng
                </button>
                {(selectedAssignment.status === "Draft" || (selectedAssignment.status === "Active" && selectedAssignment.startDate)) && (
                  <button
                    onClick={() => {
                      // Nếu chưa có startDate hợp lệ, tự động fill hôm nay (theo giờ Việt Nam)
                      let initialStartDate = "";
                      if (selectedAssignment.status === "Draft" && !isValidDate(selectedAssignment.startDate)) {
                        const today = getTodayDateInVietnam();
                        initialStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00Z`;
                      } else {
                        initialStartDate = isValidDate(selectedAssignment.startDate) ? selectedAssignment.startDate : "";
                      }
                      
                      setUpdateForm({
                        startDate: initialStartDate,
                        endDate: selectedAssignment.endDate || "",
                        commitmentFileUrl: selectedAssignment.commitmentFileUrl || null,
                        notes: selectedAssignment.notes || null
                      });
                      setUpdateCommitmentFile(null);
                      setShowDetailAssignmentModal(false);
                      setShowUpdateAssignmentModal(true);
                    }}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className="text-neutral-400 group-hover:text-primary-600 transition-colors duration-300">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
          {label}
        </p>
      </div>
      <p className="text-gray-900 font-semibold text-lg group-hover:text-primary-700 transition-colors duration-300">
        {value}
      </p>
    </div>
  );
}
