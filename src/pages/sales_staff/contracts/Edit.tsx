import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  Eye,
  Trash2,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import {
  clientContractService,
  type ClientContract,
  type ClientContractPayload,
} from "../../../services/ClientContract";
import {
  clientCompanyService,
  type ClientCompany,
} from "../../../services/ClientCompany";
import { projectService, type Project } from "../../../services/Project";
import { talentService, type Talent } from "../../../services/Talent";
import { uploadFile } from "../../../utils/firebaseStorage";

export default function EditClientContractPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [existingContracts, setExistingContracts] = useState<string[]>([]);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [currentContract, setCurrentContract] =
    useState<ClientContract | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | undefined>(
    undefined
  );

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
      if (!id) {
        setError("ID hợp đồng không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [
          clientsData,
          projectsData,
          talentsData,
          contractsData,
          contractDetail,
        ] = await Promise.all([
          clientCompanyService.getAll({ excludeDeleted: true }),
          projectService.getAll({ excludeDeleted: true }),
          talentService.getAll({ excludeDeleted: true }),
          clientContractService.getAll({ excludeDeleted: true }),
          clientContractService.getById(Number(id)),
        ]);

        const contractList: ClientContract[] = Array.isArray(contractsData)
          ? contractsData
          : contractsData?.items || [];

        const normalizedContractNumber = (contractDetail.contractNumber || "")
          .toString()
          .toUpperCase();

        setExistingContracts(
          contractList
            .map((contract) => (contract.contractNumber || "").toUpperCase())
            .filter(
              (code) => Boolean(code) && code !== normalizedContractNumber
            )
        );

        setClientCompanies(clientsData);
        setProjects(projectsData);
        setTalents(talentsData);
        setCurrentContract(contractDetail);
        setExistingFileUrl(contractDetail.contractFileUrl || undefined);

        setForm({
          contractNumber: normalizedContractNumber,
          clientCompanyId: contractDetail.clientCompanyId,
          talentId: contractDetail.talentId,
          projectId: contractDetail.projectId,
          startDate: contractDetail.startDate ?? "",
          endDate: contractDetail.endDate ?? undefined,
          status: contractDetail.status || "Draft",
          contractFileUrl: contractDetail.contractFileUrl || undefined,
        });

        if (contractDetail.clientCompanyId) {
          setFilteredProjects(
            projectsData.filter(
              (p: Project) => p.clientCompanyId === contractDetail.clientCompanyId
            )
          );
        }
      } catch (err: any) {
        console.error("❌ Lỗi tải dữ liệu hợp đồng:", err);
        setError(err.message || "Không thể tải dữ liệu hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (form.clientCompanyId) {
      setFilteredProjects(
        projects.filter(
          (project) => project.clientCompanyId === Number(form.clientCompanyId)
        )
      );
    } else {
      setFilteredProjects([]);
    }
  }, [form.clientCompanyId, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "clientCompanyId" || name === "projectId" || name === "talentId"
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
    } else {
      setContractFile(null);
      setFileError("❌ File quá lớn (tối đa 10MB)");
    }
  };

  const handleRemoveFile = () => {
    setContractFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn lưu thay đổi?");
    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setFileError("");
    setSuccess(false);

    try {
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
        setError("Mã hợp đồng không được để trống");
        setSubmitting(false);
        return;
      }

      if (existingContracts.includes(contractNumberUpper)) {
        setError(
          `Mã hợp đồng "${contractNumberUpper}" đã tồn tại. Vui lòng chọn mã khác.`
        );
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

      if (!contractFile && !existingFileUrl) {
        setFileError("⚠️ Vui lòng chọn file hợp đồng");
        setSubmitting(false);
        return;
      }

      let fileUrl: string = existingFileUrl || '';
      if (contractFile) {
        fileUrl = await uploadFile(
          contractFile,
          `contracts/${contractNumberUpper}-${Date.now()}`
        );
      }

      if (!fileUrl) {
        setFileError("⚠️ Vui lòng chọn file hợp đồng");
        setSubmitting(false);
        return;
      }

      const payload: ClientContractPayload = {
        contractNumber: contractNumberUpper,
        clientCompanyId: form.clientCompanyId!,
        talentId: form.talentId!,
        projectId: form.projectId!,
        talentApplicationId: currentContract?.talentApplicationId || null,
        billingRate: currentContract?.billingRate || 0,
        standardHoursPerMonth: currentContract?.standardHoursPerMonth || 160,
        rateType: currentContract?.rateType || 'ManMonth',
        startDate: form.startDate!,
        endDate: form.endDate || undefined,
        status: form.status || currentContract?.status || "Draft",
        contractFileUrl: fileUrl,
        notes: currentContract?.notes || null,
      };

      await clientContractService.update(Number(id), payload);
      setSuccess(true);
      setExistingFileUrl(fileUrl);
      setTimeout(() => navigate("/sales/contracts"), 1500);
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật hợp đồng:", err);
      setError(err.message || "Không thể cập nhật hợp đồng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-500">Đang tải dữ liệu hợp đồng...</p>
        </div>
      </div>
    </div>);
  }

  if (error && !currentContract) {
    return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <Link
            to="/sales/contracts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>);
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
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
              Chỉnh sửa hợp đồng khách hàng
            </h1>
            <p className="text-neutral-600">
              Cập nhật thông tin hợp đồng và lưu lại dưới dạng bản nháp
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">
              Cập nhật hợp đồng thành công! Đang chuyển hướng...
            </p>
          </div>
        )}

        {error && currentContract && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 animate-fade-in"
          noValidate
        >
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
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mã hợp đồng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contractNumber"
                    value={form.contractNumber || ""}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    placeholder="VD: CTR-2025-010"
                  />
                </div>
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
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn nhân sự --</option>
                    {talents.map((talent) => (
                      <option key={talent.id} value={talent.id}>
                        {talent.fullName} ({talent.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  File hợp đồng <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-neutral-50 hover:bg-primary-50">
                  {contractFile ? (
                    <div className="flex flex-col items-center text-primary-700">
                      <FileText className="w-8 h-8 mb-2" />
                      <p className="font-medium">{contractFile.name}</p>
                      <p className="text-sm text-neutral-600">
                        {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : existingFileUrl ? (
                    <div className="flex flex-col items-center text-neutral-600 space-y-3">
                      <Eye className="w-10 h-10" />
                      <p className="text-sm">
                        Đang sử dụng file đã tải lên trước đó.
                      </p>
                      <a
                        href={existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 underline"
                      >
                        <FileText className="w-4 h-4" />
                        Xem file hiện tại
                      </a>
                      <button
                        type="button"
                        onClick={() => setExistingFileUrl(undefined)}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Gỡ file hiện tại
                      </button>
                      <label className="mt-4 text-sm text-primary-600 cursor-pointer">
                        <span className="underline">Chọn file mới</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center text-neutral-500 cursor-pointer">
                      <Upload className="w-10 h-10 mb-4" />
                      <span className="text-lg font-medium mb-2">
                        Chọn hoặc kéo thả file vào đây
                      </span>
                      <span className="text-sm">
                        Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                {fileError && (
                  <p className="text-sm text-red-600 mt-2">{fileError}</p>
                )}
              </div>
            </div>
          </div>

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
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

