import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  UserCheck,
  Building2,
  Briefcase,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import {
  clientContractService,
  type ClientContractPayload,
  type ClientContract,
} from "../../../services/ClientContract";
import {
  clientCompanyService,
  type ClientCompany,
} from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { talentService, type Talent } from "../../../services/Talent";
import { uploadFile } from "../../../utils/firebaseStorage";

export default function CreateClientContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [existingContracts, setExistingContracts] = useState<string[]>([]);
  const [allContracts, setAllContracts] = useState<ClientContract[]>([]);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [loadingTalents, setLoadingTalents] = useState(false);

  const [form, setForm] = useState<Partial<ClientContractPayload>>({
    contractNumber: "",
    clientCompanyId: undefined,
    talentId: undefined,
    projectId: undefined,
    startDate: "",
    endDate: undefined,
    status: "Draft",
    contractFileUrl: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsData, projectsData, contractsData] = await Promise.all([
          clientCompanyService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true }),
          clientContractService.getAll({ excludeDeleted: true }),
        ]);
         setClientCompanies(clientsData);
         setProjects(projectsData);
         // Không load tất cả talents ngay từ đầu, sẽ load theo clientCompanyId khi cần
         setFilteredTalents([]);
         const contractList: ClientContract[] = Array.isArray(contractsData)
           ? contractsData
           : contractsData?.items || [];
         setAllContracts(contractList);
         setExistingContracts(
           contractList
             .map((contract) =>
               (contract.contractNumber || "").toString().toUpperCase()
             )
             .filter((code) => Boolean(code))
         );

        // Pre-fill form từ query params nếu có
        const clientCompanyIdParam = searchParams.get("clientCompanyId");
        const talentIdParam = searchParams.get("talentId");
        const projectIdParam = searchParams.get("projectId");

        if (clientCompanyIdParam && talentIdParam) {
          const clientCompanyId = parseInt(clientCompanyIdParam, 10);
          const talentId = parseInt(talentIdParam, 10);
          const projectId = projectIdParam
            ? parseInt(projectIdParam, 10)
            : undefined;

          // Kiểm tra clientCompany có tồn tại không
          const companyExists = clientsData.some(
            (c: ClientCompany) => c.id === clientCompanyId
          );
          const projectExists = projectId
            ? projectsData.some((p: Project) => p.id === projectId)
            : true;

          if (companyExists && projectExists) {
            setForm((prev) => ({
              ...prev,
              clientCompanyId: clientCompanyId,
              talentId: talentId,
              projectId: projectId,
            }));

             // Load talents theo clientCompanyId
             try {
               setLoadingTalents(true);
               const talentsByClient = await talentService.getByClientOrProject(
                 clientCompanyId
               );
               let talentsArray = Array.isArray(talentsByClient)
                 ? talentsByClient
                 : [];

               // Lọc bỏ những talent đã có hợp đồng (trừ trạng thái Rejected)
               talentsArray = talentsArray.filter((talent: Talent) => {
                 // Tìm hợp đồng của talent này
                 const talentContracts = contractList.filter(c => c.talentId === talent.id);
                 
                 if (talentContracts.length === 0) {
                   // Chưa có hợp đồng nào, cho phép hiển thị
                   return true;
                 }
                 
                 // Lấy hợp đồng mới nhất
                 const latestContract = talentContracts.sort((a, b) => {
                   const dateA = new Date(a.startDate).getTime();
                   const dateB = new Date(b.startDate).getTime();
                   return dateB - dateA;
                 })[0];
                 
                 // Chỉ hiển thị nếu hợp đồng ở trạng thái Rejected
                 return latestContract.status === 'Rejected';
               });

               setFilteredTalents(talentsArray);

               // Kiểm tra talentId có trong danh sách không
               const talentExists = talentsArray.some(
                 (t: Talent) => t.id === talentId
               );
               if (!talentExists) {
                 // Nếu talent không tồn tại trong danh sách, reset talentId
                 setForm((prev) => ({ ...prev, talentId: undefined }));
               }
             } catch (err) {
               console.error("❌ Lỗi tải nhân sự theo công ty:", err);
               setFilteredTalents([]);
             } finally {
               setLoadingTalents(false);
             }
          }
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        setError("Không thể tải danh sách công ty, dự án và nhân viên");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (form.clientCompanyId) {
      const filtered = projects.filter(
        (p) => p.clientCompanyId === Number(form.clientCompanyId)
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [form.clientCompanyId, projects]);

   // Load talents theo clientCompanyId khi clientCompanyId thay đổi và filter bỏ những talent đã có hợp đồng (trừ Rejected)
   useEffect(() => {
     const fetchTalentsByClient = async () => {
       if (form.clientCompanyId) {
         try {
           setLoadingTalents(true);
           const talentsByClient = await talentService.getByClientOrProject(
             form.clientCompanyId
           );
           let talentsArray = Array.isArray(talentsByClient)
             ? talentsByClient
             : [];

           // Lọc bỏ những talent đã có hợp đồng (trừ trạng thái Rejected)
           talentsArray = talentsArray.filter((talent: Talent) => {
             // Tìm hợp đồng của talent này
             const talentContracts = allContracts.filter(c => c.talentId === talent.id);
             
             if (talentContracts.length === 0) {
               // Chưa có hợp đồng nào, cho phép hiển thị
               return true;
             }
             
             // Lấy hợp đồng mới nhất
             const latestContract = talentContracts.sort((a, b) => {
               const dateA = new Date(a.startDate).getTime();
               const dateB = new Date(b.startDate).getTime();
               return dateB - dateA;
             })[0];
             
             // Chỉ hiển thị nếu hợp đồng ở trạng thái Rejected
             return latestContract.status === 'Rejected';
           });

           setFilteredTalents(talentsArray);

           // Reset talentId nếu talent hiện tại không còn trong danh sách
           if (
             form.talentId &&
             !talentsArray.some((t: Talent) => t.id === form.talentId)
           ) {
             setForm((prev) => ({ ...prev, talentId: undefined }));
           }
         } catch (err) {
           console.error("❌ Lỗi tải nhân sự theo công ty:", err);
           setFilteredTalents([]);
         } finally {
           setLoadingTalents(false);
         }
       } else {
         setFilteredTalents([]);
         // Reset talentId khi không có clientCompanyId
         if (form.talentId) {
           setForm((prev) => ({ ...prev, talentId: undefined }));
         }
       }
     };

     fetchTalentsByClient();
   }, [form.clientCompanyId, form.talentId, allContracts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "clientCompanyId" ||
        name === "projectId" ||
        name === "talentId"
          ? value
            ? Number(value)
            : undefined
          : name === "contractNumber"
          ? value.toUpperCase()
          : value === "" && name === "endDate"
          ? undefined
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setContractFile(file);
      setFileError("");
      setError("");
    } else {
      setContractFile(null);
      setFileError("❌ File quá lớn (tối đa 10MB)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Xác nhận trước khi tạo
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn tạo hợp đồng mới không?"
    );
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");
    setFileError("");
    setSuccess(false);

    try {
      // Validate required fields
      if (
        !form.contractNumber ||
        !form.clientCompanyId ||
        !form.projectId ||
        !form.talentId ||
        !form.startDate
      ) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc");
        setSubmitting(false);
        return;
      }

      const trimmedContractNumber = form.contractNumber.trim();
      const contractNumberUpper = trimmedContractNumber.toUpperCase();

      if (!trimmedContractNumber) {
        setError("Số hợp đồng không được để trống");
        setSubmitting(false);
        return;
      }

      if (existingContracts.includes(contractNumberUpper)) {
        setError(
          `Số hợp đồng "${contractNumberUpper}" đã tồn tại. Vui lòng chọn số khác.`
        );
        setSubmitting(false);
        return;
      }

      if (!contractFile) {
        setFileError("⚠️ Vui lòng chọn file hợp đồng");
        setSubmitting(false);
        return;
      }

      if (form.endDate) {
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          setError("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
          setSubmitting(false);
          return;
        }
        if (end <= start) {
          setError("Ngày kết thúc phải sau ngày bắt đầu.");
          setSubmitting(false);
          return;
        }
      }

      // Upload file to Firebase Storage
      const fileUrl = await uploadFile(
        contractFile,
        `contracts/${contractNumberUpper}-${Date.now()}`
      );

      // Create contract payload
      const payload: ClientContractPayload = {
        contractNumber: contractNumberUpper,
        clientCompanyId: form.clientCompanyId!,
        talentId: form.talentId!,
        projectId: form.projectId!,
        startDate: form.startDate!,
        endDate: form.endDate || undefined,
        status: "Draft",
        contractFileUrl: fileUrl,
      };

      await clientContractService.create(payload);
      setSuccess(true);

      // Reset form
      setForm({
        contractNumber: "",
        clientCompanyId: undefined,
        talentId: undefined,
        projectId: undefined,
        startDate: "",
        endDate: undefined,
        status: "Draft",
        contractFileUrl: undefined,
      });
      setContractFile(null);

      // Nếu có applicationId trong query params, quay lại trang application detail
      const applicationId = searchParams.get("applicationId");
      setTimeout(() => {
        if (applicationId) {
          navigate(`/sales/applications/${applicationId}`);
        } else {
          navigate("/sales/contracts");
        }
      }, 1500);
     } catch (err: unknown) {
       console.error("❌ Lỗi tạo hợp đồng:", err);
       setError(err instanceof Error ? err.message : "Không thể tạo hợp đồng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/sales/contracts"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo Hợp Đồng Khách Hàng Mới
            </h1>
            <p className="text-neutral-600">
              Thêm hợp đồng khách hàng mới vào hệ thống
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">
              Tạo hợp đồng thành công! Đang chuyển hướng...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Thông tin hợp đồng
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Số hợp đồng */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Số hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contractNumber"
                      value={form.contractNumber}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                      placeholder="VD: CTR-2025-010"
                    />
                  </div>

                  {/* Mã dự án */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Mã dự án <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="projectId"
                      value={form.projectId || ""}
                      onChange={handleChange}
                      required
                      disabled={!form.clientCompanyId}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn dự án --</option>
                      {filteredProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    {!form.clientCompanyId && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Vui lòng chọn công ty khách hàng trước
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Công ty khách hàng */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Công ty khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="clientCompanyId"
                      value={form.clientCompanyId || ""}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">-- Chọn công ty --</option>
                      {clientCompanies.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nhân sự */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Nhân sự <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="talentId"
                      value={form.talentId || ""}
                      onChange={handleChange}
                      required
                      disabled={!form.clientCompanyId || loadingTalents}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingTalents
                          ? "Đang tải nhân sự..."
                          : "-- Chọn nhân sự --"}
                      </option>
                      {filteredTalents.map((talent) => (
                        <option key={talent.id} value={talent.id}>
                          {talent.fullName} ({talent.email})
                        </option>
                      ))}
                    </select>
                    {!form.clientCompanyId && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Vui lòng chọn công ty khách hàng trước
                      </p>
                    )}
                    {form.clientCompanyId &&
                      filteredTalents.length === 0 &&
                      !loadingTalents && (
                        <p className="text-xs text-neutral-500 mt-2">
                          Không có nhân sự nào làm việc với công ty khách hàng
                          này
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ngày bắt đầu */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate || ""}
                      onChange={handleChange}
                      required
                      max={form.endDate || undefined}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    />
                  </div>

                  {/* Ngày kết thúc */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate || ""}
                      onChange={handleChange}
                      min={form.startDate || undefined}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                      Để trống nếu hợp đồng không có thời hạn
                    </p>
                  </div>
                </div>

                {/* Upload File Hợp Đồng */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File Hợp Đồng <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-neutral-50 hover:bg-primary-50">
                    {contractFile ? (
                      <div className="flex flex-col items-center text-primary-700">
                        <FileText className="w-8 h-8 mb-2" />
                        <p className="font-medium">{contractFile.name}</p>
                        <p className="text-sm text-neutral-600">
                          {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setContractFile(null);
                            setFileError("");
                          }}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Xóa file
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center text-neutral-500 cursor-pointer">
                        <Upload className="w-12 h-12 mb-4" />
                        <span className="text-lg font-medium mb-2">
                          Chọn hoặc kéo thả file vào đây
                        </span>
                        <span className="text-sm">
                          Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link
                to="/sales/contracts"
                className="px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 font-medium transition-all duration-300"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={submitting || success}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Tạo hợp đồng</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
