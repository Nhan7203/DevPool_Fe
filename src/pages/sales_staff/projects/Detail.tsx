import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type ProjectDetailedModel } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { projectPeriodService, type ProjectPeriodModel } from "../../../services/ProjectPeriod";
import { talentAssignmentService, type TalentAssignmentModel, type TalentAssignmentCreateModel, type TalentAssignmentUpdateModel } from "../../../services/TalentAssignment";
import { clientContractPaymentService, type ClientContractPaymentModel } from "../../../services/ClientContractPayment";
import { partnerContractPaymentService, type PartnerContractPaymentModel } from "../../../services/PartnerContractPayment";
import { talentApplicationService, type TalentApplication } from "../../../services/TalentApplication";
import { applyActivityService, ApplyActivityStatus } from "../../../services/ApplyActivity";
import { talentService, type Talent } from "../../../services/Talent";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { partnerService, type Partner } from "../../../services/Partner";
import { jobRoleLevelService, type JobRoleLevel } from "../../../services/JobRoleLevel";
import { locationService, type Location } from "../../../services/location";
import { type JobRequest } from "../../../services/JobRequest";
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
  ExternalLink,
  Hash
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
  
  // ProjectPeriod states
  const [projectPeriods, setProjectPeriods] = useState<ProjectPeriodModel[]>([]);
  const [filteredPeriods, setFilteredPeriods] = useState<ProjectPeriodModel[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [showClosedPeriods, setShowClosedPeriods] = useState<boolean>(false);

  // Contract Payments states
  const [clientContractPayments, setClientContractPayments] = useState<ClientContractPaymentModel[]>([]);
  const [partnerContractPayments, setPartnerContractPayments] = useState<PartnerContractPaymentModel[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [talentNamesMap, setTalentNamesMap] = useState<Record<number, string>>({});

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
  const [assignmentErrors, setAssignmentErrors] = useState<{ startDate?: string; endDate?: string }>({});
  const [assignmentWarnings, setAssignmentWarnings] = useState<{ startDate?: string }>({});
  const [completedActivityDate, setCompletedActivityDate] = useState<string | null>(null); // Lưu CompletedDate của ApplyActivity
  const [updateErrors, setUpdateErrors] = useState<{ startDate?: string; endDate?: string }>({});
  const [editLastActivityScheduledDate, setEditLastActivityScheduledDate] = useState<string | null>(null);
  
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
          // Filter client-side để đảm bảo chỉ lấy assignments của dự án này
          const filteredAssignments = assignments.filter(a => a.projectId === Number(id));
          setTalentAssignments(filteredAssignments);
        } catch (err) {
          console.error("❌ Lỗi tải danh sách phân công nhân sự:", err);
        }

        // Lấy danh sách ProjectPeriods cho project
        try {
          const periodsData = await projectPeriodService.getAll({ projectId: Number(id), excludeDeleted: true });
          const filteredByProject = periodsData.filter(p => p.projectId === Number(id));
          const sortedPeriods = [...filteredByProject].sort((a, b) => {
            if (a.periodYear !== b.periodYear) {
              return a.periodYear - b.periodYear;
            }
            return a.periodMonth - b.periodMonth;
          });
          setProjectPeriods(sortedPeriods);
          setFilteredPeriods(sortedPeriods);
          
          // Tự động chọn chu kỳ của tháng hiện tại, nếu không có thì chọn chu kỳ mới nhất
          if (sortedPeriods.length > 0) {
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11, cần +1 để có 1-12
            const currentYear = now.getFullYear();
            
            // Tìm chu kỳ của tháng hiện tại
            const currentPeriod = sortedPeriods.find(
              p => p.periodMonth === currentMonth && p.periodYear === currentYear
            );
            
            if (currentPeriod) {
              setSelectedPeriodId(currentPeriod.id);
            } else {
              // Fallback về chu kỳ mới nhất nếu không tìm thấy chu kỳ tháng hiện tại
              setSelectedPeriodId(sortedPeriods[sortedPeriods.length - 1].id);
            }
          }
        } catch (err) {
          console.error("❌ Lỗi tải danh sách chu kỳ thanh toán:", err);
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
        const projectJobRequestIds = (project?.jobRequests as JobRequest[] | undefined)?.map((jr) => jr.id) || [];
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
        const talentsFromApps = allTalents.filter((t: Talent) => talentIdsFromApps.includes(t.id));
        const otherTalents = allTalents.filter((t: Talent) => !talentIdsFromApps.includes(t.id));
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

  // Lấy CompletedDate của ApplyActivity khi talentApplicationId thay đổi
  useEffect(() => {
    const fetchCompletedActivityDate = async () => {
      if (!assignmentForm.talentApplicationId) {
        setCompletedActivityDate(null);
        setAssignmentWarnings({});
        return;
      }

      try {
        // Lấy tất cả activities của application này
        const activities = await applyActivityService.getAll({ 
          applyId: assignmentForm.talentApplicationId,
          excludeDeleted: true 
        });
        
        // Tìm activity có status Completed với scheduledDate gần nhất (activity cuối cùng đã hoàn thành)
        const completedActivities = activities
          .filter(activity => activity.status === ApplyActivityStatus.Completed && activity.scheduledDate)
          .sort((a, b) => {
            const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
            const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
            return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
          });
        
        if (completedActivities.length > 0) {
          setCompletedActivityDate(completedActivities[0].scheduledDate || null);
        } else {
          setCompletedActivityDate(null);
        }
      } catch (err) {
        console.error("❌ Lỗi tải CompletedDate của ApplyActivity:", err);
        setCompletedActivityDate(null);
      }
    };

    fetchCompletedActivityDate();
  }, [assignmentForm.talentApplicationId]);

  // Check warning khi completedActivityDate hoặc assignmentForm.startDate thay đổi
  useEffect(() => {
    if (assignmentForm.startDate && completedActivityDate) {
      const startDate = new Date(assignmentForm.startDate);
      const completedDate = new Date(completedActivityDate);
      startDate.setHours(0, 0, 0, 0);
      completedDate.setHours(0, 0, 0, 0);
      
      if (startDate < completedDate) {
        setAssignmentWarnings({ 
          startDate: "Nhân sự vào làm trước khi thủ tục hoàn tất. Vui lòng kiểm tra lại." 
        });
      } else {
        setAssignmentWarnings({});
      }
    } else {
      setAssignmentWarnings({});
    }
  }, [assignmentForm.startDate, completedActivityDate]);

  // Fetch activity khi mở update modal và assignment có talentApplicationId
  useEffect(() => {
    const fetchActivityForUpdate = async () => {
      if (!showUpdateAssignmentModal || !selectedAssignment || !selectedAssignment.talentApplicationId) {
        setEditLastActivityScheduledDate(null);
        return;
      }

      try {
        const activities = await applyActivityService.getAll({
          applyId: selectedAssignment.talentApplicationId,
          excludeDeleted: true,
        });
        const activitiesWithDate = activities.filter(a => a.scheduledDate);
        if (activitiesWithDate.length > 0) {
          const lastActivity = activitiesWithDate.reduce((latest, current) => {
            if (!latest.scheduledDate) return current;
            if (!current.scheduledDate) return latest;
            return new Date(current.scheduledDate) > new Date(latest.scheduledDate) ? current : latest;
          });
          setEditLastActivityScheduledDate(lastActivity.scheduledDate || null);
        } else {
          setEditLastActivityScheduledDate(null);
        }
      } catch (error) {
        console.error("❌ Lỗi tải activity của đơn ứng tuyển:", error);
        setEditLastActivityScheduledDate(null);
      }
    };

    fetchActivityForUpdate();
  }, [showUpdateAssignmentModal, selectedAssignment?.talentApplicationId]);

  const handleDelete = async () => {
    if (!id || !project) return;
    
    // Chỉ cho phép xóa khi status là "Planned"
    if (project.status !== "Planned") {
      alert("⚠️ Chỉ có thể xóa dự án khi ở trạng thái 'Planned'!");
      return;
    }
    
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
    if (!id || !project) return;

    // Validation
    setAssignmentErrors({});
    
    // Validation: StartDate ≤ EndDate
    if (assignmentForm.startDate && assignmentForm.endDate) {
      const startDate = new Date(assignmentForm.startDate);
      const endDate = new Date(assignmentForm.endDate);
      if (endDate < startDate) {
        setAssignmentErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu" });
        return;
      }
    }

    // Validation: Assignment phải nằm trong Project.StartDate – Project.EndDate
    if (assignmentForm.startDate) {
      const assignmentStartDate = new Date(assignmentForm.startDate);
      assignmentStartDate.setHours(0, 0, 0, 0);
      
      if (project.startDate) {
        const projectStartDate = new Date(project.startDate);
        projectStartDate.setHours(0, 0, 0, 0);
        
        if (assignmentStartDate < projectStartDate) {
          setAssignmentErrors({ 
            startDate: `Ngày bắt đầu không được nhỏ hơn ngày bắt đầu dự án (${formatViDate(project.startDate)})` 
          });
          return;
        }
      }

      if (project.endDate) {
        const projectEndDate = new Date(project.endDate);
        projectEndDate.setHours(23, 59, 59, 999);
        
        if (assignmentStartDate > projectEndDate) {
          setAssignmentErrors({ 
            startDate: `Ngày bắt đầu không được lớn hơn ngày kết thúc dự án (${formatViDate(project.endDate)})` 
          });
          return;
        }
      }

      if (assignmentForm.endDate) {
        const assignmentEndDate = new Date(assignmentForm.endDate);
        assignmentEndDate.setHours(23, 59, 59, 999);
        
        if (project.endDate) {
          const projectEndDate = new Date(project.endDate);
          projectEndDate.setHours(23, 59, 59, 999);
          
          if (assignmentEndDate > projectEndDate) {
            setAssignmentErrors({ 
              endDate: `Ngày kết thúc không được lớn hơn ngày kết thúc dự án (${formatViDate(project.endDate)})` 
            });
            return;
          }
        }
      }
    }

    // Confirmation dialog
    const talentName = talents.find(t => t.id === assignmentForm.talentId)?.fullName || `Nhân sự #${assignmentForm.talentId}`;
    const partnerName = partners.find(p => p.id === assignmentForm.partnerId)?.companyName || `Đối tác #${assignmentForm.partnerId}`;
    const startDateStr = assignmentForm.startDate ? formatViDate(assignmentForm.startDate) : "—";
    const endDateStr = assignmentForm.endDate ? formatViDate(assignmentForm.endDate) : "—";
    
    const confirmMessage = `Xác nhận tạo phân công nhân sự?\n\n` +
      `Nhân sự: ${talentName}\n` +
      `Đối tác: ${partnerName}\n` +
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
      // Convert dates to UTC ISO string for PostgreSQL
      const payload: TalentAssignmentCreateModel = {
        ...assignmentForm,
        projectId: Number(id),
        startDate: assignmentForm.startDate ? toUTCISOString(assignmentForm.startDate) || "" : "",
        endDate: assignmentForm.endDate ? toUTCISOString(assignmentForm.endDate) : null,
        commitmentFileUrl
      };

      await talentAssignmentService.create(payload);

      // Refresh assignments list
      const assignments = await talentAssignmentService.getAll({ projectId: Number(id) });
      // Filter client-side để đảm bảo chỉ lấy assignments của dự án này
      const filteredAssignments = assignments.filter(a => a.projectId === Number(id));
      setTalentAssignments(filteredAssignments);

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
      setAssignmentWarnings({});
      setCompletedActivityDate(null);
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
    
    // Khi ở trạng thái Draft: ngày bắt đầu phải >= ngày lên lịch của activity cuối cùng của application gắn với TalentAssignment (nếu có)
    if (selectedAssignment.status === "Draft" && editLastActivityScheduledDate) {
      const effectiveStartIso = updateForm.startDate || selectedAssignment.startDate;
      if (effectiveStartIso && isValidDate(effectiveStartIso)) {
        const effectiveStart = new Date(effectiveStartIso);
        const lastActivityDate = new Date(editLastActivityScheduledDate);
        effectiveStart.setHours(0, 0, 0, 0);
        lastActivityDate.setHours(0, 0, 0, 0);

        if (effectiveStart < lastActivityDate) {
          setUpdateErrors({
            startDate: `Ngày bắt đầu phải lớn hơn hoặc bằng ngày đã thuê nhân sự (${formatViDate(editLastActivityScheduledDate)})`
          });
          return;
        }
      }
    }
    
    // Check if end date >= start date
    const startDateToCheck = selectedAssignment.status === "Draft" 
      ? (updateForm.startDate ? new Date(updateForm.startDate) : (isValidDate(selectedAssignment.startDate) ? new Date(selectedAssignment.startDate) : new Date()))
      : (isValidDate(selectedAssignment.startDate) ? new Date(selectedAssignment.startDate) : new Date());
    
    if (updateForm.endDate) {
      const endDate = new Date(updateForm.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      // End date must be >= start date
      if (endDate < startDateToCheck) {
        setUpdateErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu" });
        return;
      }
      
      // End date must be >= current end date (if exists)
      if (selectedAssignment.endDate) {
        const currentEndDate = new Date(selectedAssignment.endDate);
        currentEndDate.setHours(23, 59, 59, 999);
        if (endDate < currentEndDate) {
          setUpdateErrors({ endDate: "Ngày kết thúc không được nhỏ hơn ngày kết thúc hiện tại" });
          return;
        }
      }

      // End date must be <= project end date (nếu dự án có ngày kết thúc)
      if (project?.endDate) {
        const projectEndDate = new Date(project.endDate);
        projectEndDate.setHours(23, 59, 59, 999);
        if (endDate > projectEndDate) {
          setUpdateErrors({
            endDate: `Ngày kết thúc không được lớn hơn ngày kết thúc dự án (${formatViDate(project.endDate)})`
          });
          return;
        }
      }
    }

    // Confirmation dialog
    const talentName = talents.find(t => t.id === selectedAssignment.talentId)?.fullName || `Nhân sự #${selectedAssignment.talentId}`;
    const startDateStr = selectedAssignment.status === "Draft" 
      ? (updateForm.startDate ? formatViDate(updateForm.startDate) : formatViDate(selectedAssignment.startDate))
      : formatViDate(selectedAssignment.startDate);
    const endDateStr = updateForm.endDate ? formatViDate(updateForm.endDate) : "—";
    const currentEndDateStr = selectedAssignment.endDate ? formatViDate(selectedAssignment.endDate) : "—";
    
    const actionText = selectedAssignment.status === "Draft" ? "cập nhật" : "gia hạn";
    let confirmMessage = `Xác nhận ${actionText} phân công nhân sự?\n\n` +
      `Nhân sự: ${talentName}\n` +
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
        // Note: We need to include startDate even though it's not in the standard interface
        // Convert dates to UTC ISO string for PostgreSQL
        const payload: TalentAssignmentUpdateModel & { startDate?: string | null; status?: string } = {
          startDate: updateForm.startDate ? toUTCISOString(updateForm.startDate) : (selectedAssignment.startDate ? toUTCISOString(selectedAssignment.startDate) : null),
          endDate: updateForm.endDate ? toUTCISOString(updateForm.endDate) : null,
          commitmentFileUrl,
          status: "Active", // Change status to Active
          notes: updateForm.notes || null
        };

        await talentAssignmentService.update(selectedAssignment.id, payload);
      } else if (isActiveWithStartDate) {
        // Use extend API for Active status with startDate
        // Convert endDate to UTC ISO string for PostgreSQL
        const endDateUTC = updateForm.endDate ? toUTCISOString(updateForm.endDate) : null;
        const payload = {
          endDate: endDateUTC || "",
          commitmentFileUrl,
          notes: updateForm.notes || null
        };

        await talentAssignmentService.extend(selectedAssignment.id, payload);
      } else {
        throw new Error("Không thể cập nhật phân công này");
      }

      // Refresh assignments list
      const assignments = await talentAssignmentService.getAll({ projectId: Number(id) });
      // Filter client-side để đảm bảo chỉ lấy assignments của dự án này
      const filteredAssignments = assignments.filter(a => a.projectId === Number(id));
      setTalentAssignments(filteredAssignments);

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

  // Chuyển ISO date string sang giá trị 'YYYY-MM-DD' cho input date, theo giờ local (VN)
  const toVietnamDateInputValue = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime()) || d.getFullYear() < 1900) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Chuyển date string sang UTC ISO string để gửi lên API
  const toUTCISOString = (dateStr?: string | null): string | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime()) || date.getFullYear() < 1900) return null;
      // Convert sang UTC và trả về ISO string
      return date.toISOString();
    } catch {
      return null;
    }
  };

  const statusLabels: Record<string, string> = {
  Planned: "Đã lên kế hoạch",
  Ongoing: "Đang thực hiện",
  Completed: "Đã hoàn thành",
};

  const assignmentStatusLabels: Record<string, string> = {
    Active: "Đang hoạt động",
    Completed: "Đã hoàn thành",
    Terminated: "Đã chấm dứt",
    Inactive: "Không hoạt động",
    Draft: "Nháp",
  };

  const applicationStatusLabels: Record<string, string> = {
    Hired: "Đã tuyển",
    Submitted: "Đã nộp hồ sơ",
    Interviewing: "Đang phỏng vấn",
    Withdrawn: "Đã rút",
    Rejected: "Từ chối",
    Expired: "Đã hết hạn",
    ClosedBySystem: "Đã đóng bởi hệ thống",
  };

  // Filter periods by year and status
  useEffect(() => {
    let filtered = projectPeriods;
    
    // Filter by year
    if (yearFilter !== null) {
      filtered = filtered.filter(p => p.periodYear === yearFilter);
    }
    
    // Filter by status (hide closed periods by default)
    if (!showClosedPeriods) {
      filtered = filtered.filter(p => p.status !== "Closed");
    }
    
    setFilteredPeriods(filtered);
  }, [yearFilter, projectPeriods, showClosedPeriods]);

  // Reset selected period if it's not in filtered list
  useEffect(() => {
    if (selectedPeriodId && !filteredPeriods.find(p => p.id === selectedPeriodId)) {
      if (filteredPeriods.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const currentPeriod = filteredPeriods.find(
          p => p.periodMonth === currentMonth && p.periodYear === currentYear
        );
        setSelectedPeriodId(currentPeriod ? currentPeriod.id : filteredPeriods[filteredPeriods.length - 1].id);
      } else {
        setSelectedPeriodId(null);
      }
    }
  }, [filteredPeriods, selectedPeriodId]);

  // Fetch contract payments when a period is selected
  useEffect(() => {
    const fetchContractPayments = async () => {
      if (!selectedPeriodId || !id) {
        setClientContractPayments([]);
        setPartnerContractPayments([]);
        return;
      }

      const selectedPeriod = projectPeriods.find(p => p.id === selectedPeriodId);
      if (!selectedPeriod || selectedPeriod.projectId !== Number(id)) {
        setClientContractPayments([]);
        setPartnerContractPayments([]);
        return;
      }

      try {
        setLoadingPayments(true);
        const [clientPayments, partnerPayments] = await Promise.all([
          clientContractPaymentService.getAll({ 
            projectPeriodId: selectedPeriodId, 
            excludeDeleted: true 
          }),
          partnerContractPaymentService.getAll({ 
            projectPeriodId: selectedPeriodId, 
            excludeDeleted: true 
          })
        ]);

        const filteredClientPayments = Array.isArray(clientPayments) 
          ? clientPayments.filter(p => p.projectPeriodId === selectedPeriodId)
          : [];
        const filteredPartnerPayments = Array.isArray(partnerPayments) 
          ? partnerPayments.filter(p => p.projectPeriodId === selectedPeriodId)
          : [];

        setClientContractPayments(filteredClientPayments);
        setPartnerContractPayments(filteredPartnerPayments);

        // Fetch talent names
        const allTalentAssignmentIds = [
          ...new Set([
            ...filteredClientPayments.map(p => p.talentAssignmentId),
            ...filteredPartnerPayments.map(p => p.talentAssignmentId)
          ])
        ];

        if (allTalentAssignmentIds.length > 0) {
          const assignments = await Promise.all(
            allTalentAssignmentIds.map(id => 
              talentAssignmentService.getById(id).catch(() => null)
            )
          );

          const talentIds = assignments
            .filter((a): a is TalentAssignmentModel => a !== null)
            .map(a => a.talentId);

          if (talentIds.length > 0) {
            const fetchedTalents = await Promise.all(
              talentIds.map(id => 
                talentService.getById(id).catch(() => null)
              )
            );

            const newTalentNamesMap: Record<number, string> = {};
            assignments.forEach((assignment) => {
              if (assignment) {
                const talent = fetchedTalents.find(t => t && t.id === assignment.talentId);
                if (talent) {
                  newTalentNamesMap[assignment.id] = talent.fullName || "—";
                }
              }
            });

            setTalentNamesMap(prev => ({ ...prev, ...newTalentNamesMap }));
          }
        }
      } catch (err) {
        console.error("❌ Lỗi tải hợp đồng thanh toán:", err);
        setClientContractPayments([]);
        setPartnerContractPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchContractPayments();
  }, [selectedPeriodId, id, projectPeriods]);

  const contractStatusLabels: Record<string, string> = {
    Draft: "Nháp",
    NeedMoreInformation: "Cần thêm thông tin",
    Submitted: "Đã gửi",
    Verified: "Đã xác minh",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
  };

  const paymentStatusLabels: Record<string, string> = {
    Pending: "Chờ thanh toán",
    Processing: "Đang xử lý",
    Invoiced: "Đã xuất hóa đơn",
    PartiallyPaid: "Đã thanh toán một phần",
    Paid: "Đã thanh toán",
  };

  const contractStatusColors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-800",
    NeedMoreInformation: "bg-yellow-100 text-yellow-800",
    Submitted: "bg-blue-100 text-blue-800",
    Verified: "bg-purple-100 text-purple-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const paymentStatusColors: Record<string, string> = {
    Pending: "bg-gray-100 text-gray-800",
    Processing: "bg-yellow-100 text-yellow-800",
    Invoiced: "bg-blue-100 text-blue-800",
    PartiallyPaid: "bg-orange-100 text-orange-800",
    Paid: "bg-green-100 text-green-800",
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
  const filteredJobRequests = ((project?.jobRequests || []) as JobRequest[]).filter((jr) => {
    const matchesSearch = !jobRequestSearch || 
      (jr.title?.toLowerCase().includes(jobRequestSearch.toLowerCase()) ||
       (jr as any).jobPositionName?.toLowerCase().includes(jobRequestSearch.toLowerCase()));
    // Convert status to string for comparison (status can be number or string)
    const statusStr = typeof jr.status === 'number' ? String(jr.status) : jr.status;
    const statusNum = typeof jr.status === 'number' ? jr.status : undefined;
    const matchesStatus = !jobRequestStatusFilter || statusStr === jobRequestStatusFilter || 
      (jobRequestStatusFilter === "Pending" && statusNum === 0) ||
      (jobRequestStatusFilter === "Approved" && statusNum === 1) ||
      (jobRequestStatusFilter === "Closed" && statusNum === 2) ||
      (jobRequestStatusFilter === "Rejected" && (statusNum === 3 || statusStr === "Rejected"));
    return matchesSearch && matchesStatus;
  });
  const paginatedJobRequests = filteredJobRequests.slice(
    (jobRequestPage - 1) * jobRequestPageSize,
    jobRequestPage * jobRequestPageSize
  );
  const totalJobRequestPages = Math.ceil(filteredJobRequests.length / jobRequestPageSize);


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
                disabled={project?.status !== "Planned"}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft transform hover:scale-105 ${
                  project?.status === "Planned"
                    ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-glow"
                    : "bg-gray-400 text-white cursor-not-allowed opacity-50"
                }`}
                title={project?.status !== "Planned" ? "Chỉ có thể xóa dự án khi ở trạng thái 'Planned'" : "Xóa dự án"}
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
                Hợp đồng
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
                  label="Mã dự án" 
                  value={project.code || "—"}
                  icon={<Hash className="w-4 h-4" />}
                />
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
                        {paginatedJobRequests.map((jr) => {
                          const jobRoleLevel = jobRoleLevels.find(jrl => jrl.id === jr.jobRoleLevelId);
                          const location = locations.find(loc => loc.id === jr.locationId);
                          return (
                            <tr
                              key={jr.id}
                              onClick={() => navigate(`/sales/job-requests/${jr.id}`)}
                              className="border-b border-neutral-100 hover:bg-primary-50 cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{jr.title || "—"}</td>
                              <td className="py-3 px-4 text-sm text-neutral-700">{jobRoleLevel?.name || (jr as any).jobPositionName || "—"}</td>
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

            {/* Tab: Hợp đồng */}
            {activeTab === 'contracts' && (
              <div className="space-y-6">
                {/* Header với filter năm */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Danh sách chu kỳ thanh toán</h2>
                  <div className="flex items-center gap-3">
                    {/* Checkbox hiển thị chu kỳ đã đóng */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showClosedPeriods}
                        onChange={(e) => setShowClosedPeriods(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">Hiển thị chu kỳ đã đóng</span>
                    </label>
                    {/* Filter theo năm */}
                    <select
                      value={yearFilter || ""}
                      onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                      className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Tất cả các năm</option>
                      {Array.from(new Set(projectPeriods.map(p => p.periodYear)))
                        .sort((a, b) => b - a)
                        .map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Tabs ngang cho các chu kỳ */}
                {filteredPeriods.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl">
                    <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Chưa có chu kỳ thanh toán nào</p>
                  </div>
                ) : (
                  <div>
                    {/* Tab Navigation - Horizontal Scroll */}
                    <div className="border-b border-neutral-200 mb-6 overflow-x-auto">
                      <div className="flex space-x-1 min-w-max">
                        {filteredPeriods.map((period) => {
                          const statusLabels: Record<string, string> = {
                            "Open": "Mở",
                            "Closed": "Đã đóng",
                            "Pending": "Chờ xử lý",
                            "Processing": "Đang xử lý"
                          };
                          const statusColors: Record<string, string> = {
                            "Open": "bg-green-100 text-green-700",
                            "Closed": "bg-gray-100 text-gray-700",
                            "Pending": "bg-yellow-100 text-yellow-700",
                            "Processing": "bg-blue-100 text-blue-700"
                          };
                          const statusLabel = statusLabels[period.status] || period.status;
                          const statusColor = statusColors[period.status] || "bg-neutral-100 text-neutral-700";
                          
                          return (
                            <button
                              key={period.id}
                              onClick={() => setSelectedPeriodId(period.id)}
                              className={`px-6 py-3 font-medium text-sm transition-all duration-300 whitespace-nowrap relative flex flex-col items-center gap-1 ${
                                selectedPeriodId === period.id
                                  ? 'text-primary-600'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              <span>Tháng {period.periodMonth}/{period.periodYear}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>
                                {statusLabel}
                              </span>
                              {selectedPeriodId === period.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content của chu kỳ được chọn */}
                    {selectedPeriodId && (
                      <div className="animate-fade-in">
                        {loadingPayments ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Đang tải hợp đồng...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Client Contract Payments */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <Building2 className="w-5 h-5 text-primary-600" />
                                  Hợp đồng khách hàng
                                </h3>
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                  {clientContractPayments.length} hợp đồng
                                </span>
                              </div>
                              {clientContractPayments.length === 0 ? (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <FileCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                  <p className="text-sm text-neutral-500">Chưa có hợp đồng khách hàng</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Nhóm theo talentAssignmentId */}
                                  {Array.from(new Set(clientContractPayments.map(p => p.talentAssignmentId))).map((talentAssignmentId) => {
                                    const clientPayments = clientContractPayments.filter(p => p.talentAssignmentId === talentAssignmentId);
                                    return (
                                      <div key={talentAssignmentId} className="border border-neutral-200 rounded-lg p-4">
                                        <div className="mb-3 pb-3 border-b border-neutral-200">
                                          <p className="text-sm font-medium text-neutral-600">
                                            Phân công nhân sự ID: {talentAssignmentId}
                                          </p>
                                        </div>
                                        {clientPayments.map((payment) => (
                                          <div 
                                            key={payment.id} 
                                            onClick={() => navigate(`/sales/contracts/clients/${payment.id}`)}
                                            className="mb-4 last:mb-0 border border-neutral-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                                          >
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-1">{payment.contractNumber}</p>
                                                <p className="text-sm text-neutral-600">{payment.talentName || "—"}</p>
                                              </div>
                                              <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${contractStatusColors[payment.contractStatus] || 'bg-gray-100 text-gray-800'}`}>
                                                  {contractStatusLabels[payment.contractStatus] || payment.contractStatus}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusColors[payment.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                                                  {paymentStatusLabels[payment.paymentStatus] || payment.paymentStatus}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                                              <div>
                                                <p className="text-xs text-neutral-600 mb-1">Số tiền</p>
                                                <p className="font-semibold text-gray-900">{formatCurrency(payment.finalAmountVND || payment.finalAmount)}</p>
                                              </div>
                                              <div>
                                                <p className="text-xs text-neutral-600 mb-1">Đã thanh toán</p>
                                                <p className="font-semibold text-gray-900">{formatCurrency(payment.totalPaidAmount)}</p>
                                              </div>
                                            </div>
                                            {payment.billableHours && (
                                              <div className="mt-3 pt-3 border-t border-neutral-100">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                  <Clock className="w-4 h-4" />
                                                  <span>Giờ billable: {payment.billableHours}h</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Partner Contract Payments */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <FileCheck className="w-5 h-5 text-secondary-600" />
                                  Hợp đồng đối tác
                                </h3>
                                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
                                  {partnerContractPayments.length} hợp đồng
                                </span>
                              </div>
                              {partnerContractPayments.length === 0 ? (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <FileCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                  <p className="text-sm text-neutral-500">Chưa có hợp đồng đối tác</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Nhóm theo talentAssignmentId */}
                                  {Array.from(new Set(partnerContractPayments.map(p => p.talentAssignmentId))).map((talentAssignmentId) => {
                                    const partnerPaymentsForTalent = partnerContractPayments.filter(p => p.talentAssignmentId === talentAssignmentId);
                                    return (
                                      <div key={talentAssignmentId} className="border border-neutral-200 rounded-lg p-4">
                                        <div className="mb-3 pb-3 border-b border-neutral-200">
                                          <p className="text-sm font-medium text-neutral-600">
                                            Phân công nhân sự ID: {talentAssignmentId}
                                          </p>
                                        </div>
                                        {partnerPaymentsForTalent.map((payment: PartnerContractPaymentModel) => (
                                          <div 
                                            key={payment.id} 
                                            onClick={() => navigate(`/sales/contracts/partners/${payment.id}`)}
                                            className="mb-4 last:mb-0 border border-neutral-200 rounded-lg p-4 hover:border-secondary-300 hover:shadow-sm transition-all cursor-pointer"
                                          >
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-1">{payment.contractNumber}</p>
                                                <p className="text-sm text-neutral-600">{talentNamesMap[payment.talentAssignmentId] || `Phân công nhân sự ID: ${payment.talentAssignmentId}`}</p>
                                              </div>
                                              <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  payment.contractStatus === 'Approved' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : payment.contractStatus === 'Verified'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {contractStatusLabels[payment.contractStatus] || payment.contractStatus}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  payment.paymentStatus === 'Paid' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : payment.paymentStatus === 'Processing'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {payment.paymentStatus === 'Paid' ? 'Đã thanh toán' : payment.paymentStatus === 'Processing' ? 'Đang xử lý' : 'Chờ thanh toán'}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                                              <div>
                                                <p className="text-xs text-neutral-600 mb-1">Số tiền</p>
                                                <p className="font-semibold text-gray-900">{formatCurrency(payment.actualAmountVND || payment.plannedAmountVND)}</p>
                                              </div>
                                              <div>
                                                <p className="text-xs text-neutral-600 mb-1">Đã thanh toán</p>
                                                <p className="font-semibold text-gray-900">{formatCurrency(payment.totalPaidAmount)}</p>
                                              </div>
                                            </div>
                                            {payment.reportedHours && (
                                              <div className="mt-3 pt-3 border-t border-neutral-100">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                  <Clock className="w-4 h-4" />
                                                  <span>Giờ làm việc: {payment.reportedHours}h</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Nhân sự</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Đối tác</th>
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
                        .filter(a => a.projectId === Number(id))
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
                              {talent?.fullName || `Nhân sự #${assignment.talentId}`}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-700">
                              {partner?.companyName || `Đối tác #${assignment.partnerId}`}
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
                                {assignment.status ? (assignmentStatusLabels[assignment.status] || assignment.status) : "—"}
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
                  <p className="text-sm font-medium text-neutral-600 mb-1">Người đại diện</p>
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
                    Nhân sự <span className="text-red-500">*</span>
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
                    Đối tác <span className="text-red-500">*</span>
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
                        Application #{app.id} - {app.status ? (applicationStatusLabels[app.status] || app.status) : app.status}
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
                    value={toVietnamDateInputValue(assignmentForm.startDate)}
                    min={toVietnamDateInputValue(project?.startDate)}
                    max={toVietnamDateInputValue(project?.endDate)}
                    onChange={(e) => {
                      const newStartDate = e.target.value 
                        ? `${e.target.value}T00:00:00`
                        : "";
                      setAssignmentForm({ 
                        ...assignmentForm, 
                        startDate: newStartDate
                      });
                      
                      // Check warning: Nếu StartDate < CompletedDate
                      if (newStartDate && completedActivityDate) {
                        const startDate = new Date(newStartDate);
                        const completedDate = new Date(completedActivityDate);
                        startDate.setHours(0, 0, 0, 0);
                        completedDate.setHours(0, 0, 0, 0);
                        
                        if (startDate < completedDate) {
                          setAssignmentWarnings({ 
                            startDate: "Nhân sự vào làm trước khi thủ tục hoàn tất. Vui lòng kiểm tra lại." 
                          });
                        } else {
                          setAssignmentWarnings({});
                        }
                      } else {
                        setAssignmentWarnings({});
                      }
                      
                      // Clear error when user changes value
                      if (assignmentErrors.startDate) {
                        setAssignmentErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.startDate;
                          return newErrors;
                        });
                      }
                    }}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 ${
                      assignmentErrors.startDate 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  {assignmentErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{assignmentErrors.startDate}</p>
                  )}
                  {assignmentWarnings.startDate && !assignmentErrors.startDate && (
                    <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {assignmentWarnings.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc (Tùy chọn)
                  </label>
                  <input
                    type="date"
                    value={toVietnamDateInputValue(assignmentForm.endDate)}
                    min={assignmentForm.startDate ? toVietnamDateInputValue(assignmentForm.startDate) : toVietnamDateInputValue(project?.startDate)}
                    max={toVietnamDateInputValue(project?.endDate)}
                    onChange={(e) => {
                      setAssignmentForm({ 
                        ...assignmentForm, 
                        endDate: e.target.value 
                          ? `${e.target.value}T00:00:00`
                          : null 
                      });
                      // Clear error when user changes value
                      if (assignmentErrors.endDate) {
                        setAssignmentErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.endDate;
                          return newErrors;
                        });
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
                      value={toVietnamDateInputValue(updateForm.startDate)}
                      onChange={(e) => {
                        setUpdateForm({ 
                          ...updateForm, 
                          startDate: e.target.value 
                            ? `${e.target.value}T00:00:00`
                            : "" 
                        });
                        // Clear error when user changes value
                        if (updateErrors.startDate) {
                          setUpdateErrors({ ...updateErrors, startDate: undefined });
                        }
                      }}
                      min={editLastActivityScheduledDate ? toVietnamDateInputValue(editLastActivityScheduledDate) : undefined}
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
                    {editLastActivityScheduledDate && !updateErrors.startDate && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Ngày bắt đầu phải lớn hơn hoặc bằng ngày lên lịch của hoạt động cuối cùng ({formatViDate(editLastActivityScheduledDate)})
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
                  value={toVietnamDateInputValue(updateForm.endDate)}
                  min={(() => {
                    // Min date should be the later of: start date or current end date
                    const startDate = selectedAssignment.status === "Draft" 
                      ? (updateForm.startDate ? toVietnamDateInputValue(updateForm.startDate) : toVietnamDateInputValue(selectedAssignment.startDate))
                      : toVietnamDateInputValue(selectedAssignment.startDate);
                    const currentEndDate = toVietnamDateInputValue(selectedAssignment.endDate);
                    
                    if (startDate && currentEndDate) {
                      return new Date(startDate) > new Date(currentEndDate) ? startDate : currentEndDate;
                    }
                    return startDate || currentEndDate;
                  })()}
                  onChange={(e) => {
                    setUpdateForm({ 
                      ...updateForm, 
                      endDate: e.target.value 
                        ? `${e.target.value}T00:00:00`
                        : "" 
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
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nhân sự</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {talents.find(t => t.id === selectedAssignment.talentId)?.fullName || `Nhân sự #${selectedAssignment.talentId}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Đối tác</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {partners.find(p => p.id === selectedAssignment.partnerId)?.companyName || `Đối tác #${selectedAssignment.partnerId}`}
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
                  {selectedAssignment.status ? (assignmentStatusLabels[selectedAssignment.status] || selectedAssignment.status) : "—"}
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
                  onClick={async () => {
                    // Lấy ngày lên lịch của activity cuối cùng cho application gắn với assignment (nếu có)
                    let lastActivityDate: string | null = null;
                    if (selectedAssignment.talentApplicationId) {
                      try {
                        const activities = await applyActivityService.getAll({
                          applyId: selectedAssignment.talentApplicationId,
                          excludeDeleted: true,
                        });
                        const activitiesWithDate = activities.filter(a => a.scheduledDate);
                        if (activitiesWithDate.length > 0) {
                          const lastActivity = activitiesWithDate.reduce((latest, current) => {
                            if (!latest.scheduledDate) return current;
                            if (!current.scheduledDate) return latest;
                            return new Date(current.scheduledDate) > new Date(latest.scheduledDate) ? current : latest;
                          });
                          lastActivityDate = lastActivity.scheduledDate || null;
                          setEditLastActivityScheduledDate(lastActivityDate);
                        } else {
                          setEditLastActivityScheduledDate(null);
                        }
                      } catch (error) {
                        console.error("❌ Lỗi tải activity của đơn ứng tuyển:", error);
                        setEditLastActivityScheduledDate(null);
                      }
                    } else {
                      setEditLastActivityScheduledDate(null);
                    }

                    // Xác định initialStartDate: ưu tiên startDate hiện tại (nếu hợp lệ), nếu không thì dùng activity date (nếu có)
                    let initialStartDate = "";
                    if (selectedAssignment.status === "Draft") {
                      if (isValidDate(selectedAssignment.startDate)) {
                        initialStartDate = selectedAssignment.startDate;
                      } else if (lastActivityDate) {
                        // Nếu không có startDate hợp lệ, dùng activity date
                        initialStartDate = lastActivityDate;
                      }
                      // Nếu không có cả hai, để trống (user sẽ phải nhập)
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
