import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { talentCVService, type TalentCVCreate } from "../../../services/TalentCV";
import { jobRoleService, type JobRole } from "../../../services/JobRole";
import { uploadTalentCV } from "../../../utils/firebaseStorage";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  FileText, 
  Upload, 
  Briefcase,
  CheckCircle,
  AlertCircle, 
  X,
  ExternalLink,
  FileCheck,
  Eye,
  Sparkles
} from "lucide-react";

export default function TalentCVCreatePage() {
  const [searchParams] = useSearchParams();
  const talentId = searchParams.get('talentId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TalentCVCreate>({
    talentId: talentId ? Number(talentId) : 0,
    jobRoleId: 0,
    version: 1,
    cvFileUrl: "",
    isActive: true,
    summary: "",
    isGeneratedFromTemplate: false,
    sourceTemplateId: undefined,
  });

  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  const [existingCVs, setExistingCVs] = useState<any[]>([]);
  const [versionError, setVersionError] = useState<string>("");
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadedFromFirebase, setIsUploadedFromFirebase] = useState(false);
  
  // CV Extract states
  const [extractingCV, setExtractingCV] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  
  interface ExtractedCVData {
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    skills?: string[];
    workExperiences?: Array<{
      position: string;
      company: string;
      startDate: string;
      endDate: string;
      description?: string;
    }>;
    locationName?: string;
  }
  
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRoles = await jobRoleService.getAll({ excludeDeleted: true });
        setAllJobRoles(jobRoles);
      } catch (error) {
        console.error("❌ Error loading job roles", error);
      }
    };
    fetchData();
  }, []);

  // Fetch CV cùng jobRoleId khi jobRoleId thay đổi
  useEffect(() => {
    const fetchCVsByJobRole = async () => {
      if (talentId && form.jobRoleId && form.jobRoleId > 0) {
        try {
          const cvs = await talentCVService.getAll({ 
            talentId: Number(talentId), 
            jobRoleId: form.jobRoleId,
            excludeDeleted: true 
          });
          setExistingCVs(cvs || []);
        } catch (error) {
          console.error("❌ Error loading CVs by job role", error);
          setExistingCVs([]);
        }
      } else {
        setExistingCVs([]);
        setVersionError("");
      }
    };
    fetchCVsByJobRole();
  }, [talentId, form.jobRoleId]);

  // Validate lại version khi existingCVs thay đổi
  useEffect(() => {
    if (form.version > 0 && form.jobRoleId > 0 && existingCVs.length > 0) {
      const error = validateVersion(form.version, form.jobRoleId, existingCVs);
      setVersionError(error);
    } else if (existingCVs.length === 0) {
      setVersionError("");
    }
  }, [existingCVs, form.version, form.jobRoleId]);

  // Cảnh báo khi user cố gắng rời khỏi trang sau khi đã upload CV lên Firebase nhưng chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploadedFromFirebase && !success) {
        e.preventDefault();
        e.returnValue = "Bạn đã upload CV lên Firebase nhưng chưa lưu. Bạn có chắc chắn muốn rời khỏi trang không?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUploadedFromFirebase, success]);

  // Validate version không trùng với CV cùng jobRoleId
  const validateVersion = (version: number, jobRoleId: number, existingCVsList: any[]): string => {
    if (version <= 0) {
      return "Version phải lớn hơn 0";
    }
    
    if (jobRoleId === 0 || existingCVsList.length === 0) {
      return "";
    }
    
    // Kiểm tra trùng với các CV cùng jobRoleId
    const duplicateCV = existingCVsList.find((cv: any) => cv.version === version);
    
    if (duplicateCV) {
      // Tìm version cao nhất và gợi ý version tiếp theo
      const maxVersion = Math.max(...existingCVsList.map((cv: any) => cv.version || 0));
      const suggestedVersion = maxVersion + 1;
      
      return `Version ${version} đã tồn tại cho vị trí công việc này. Vui lòng chọn version khác (ví dụ: ${suggestedVersion}).`;
    }
    
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Validate version khi user nhập
    if (name === "version") {
      const versionNum = Number(value);
      const error = validateVersion(versionNum, form.jobRoleId, existingCVs);
      setVersionError(error);
    }
    
    // Clear error khi jobRoleId thay đổi (sẽ validate lại khi user nhập version)
    if (name === "jobRoleId") {
      setVersionError("");
    }
    
    // Nếu user nhập URL thủ công, reset flag Firebase upload
    if (name === "cvFileUrl") {
      setIsUploadedFromFirebase(false);
    }
    
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' || name === "jobRoleId" || name === "sourceTemplateId" || name === "version" ? Number(value) : value
    }));
  };

  // Clean phone number to digits only
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Tạo tóm tắt CV từ dữ liệu trích xuất
  const generateSummaryFromExtractedData = (data: any): string => {
    const parts: string[] = [];
    
    // Thông tin cơ bản
    if (data.fullName) {
      parts.push(`Tên: ${data.fullName}`);
    }
    
    // Vị trí công việc (jobRoleLevels)
    if (data.jobRoleLevels && Array.isArray(data.jobRoleLevels) && data.jobRoleLevels.length > 0) {
      const positions = data.jobRoleLevels
        .map((jrl: any) => jrl.position || jrl.jobRole)
        .filter((p: string) => p)
        .slice(0, 3);
      if (positions.length > 0) {
        parts.push(`Vị trí: ${positions.join(', ')}`);
      }
    }
    
    // Kinh nghiệm làm việc
    if (data.workExperiences && Array.isArray(data.workExperiences) && data.workExperiences.length > 0) {
      const totalExp = data.workExperiences.length;
      const companies = data.workExperiences
        .map((we: any) => we.company)
        .filter((c: string) => c)
        .slice(0, 3);
      if (companies.length > 0) {
        parts.push(`Kinh nghiệm: ${totalExp} vị trí tại ${companies.join(', ')}`);
      }
    }
    
    // Kỹ năng chính
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      const skillNames = data.skills
        .map((skill: any) => typeof skill === 'string' ? skill : skill.skillName || skill.name)
        .filter((s: string) => s)
        .slice(0, 7);
      if (skillNames.length > 0) {
        parts.push(`Kỹ năng: ${skillNames.join(', ')}`);
      }
    }
    
    // Dự án nổi bật
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      const projectNames = data.projects
        .map((proj: any) => proj.projectName || proj.name)
        .filter((p: string) => p)
        .slice(0, 2);
      if (projectNames.length > 0) {
        parts.push(`Dự án: ${projectNames.join(', ')}`);
      }
    }
    
    // Chứng chỉ
    if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
      const certNames = data.certificates
        .map((cert: any) => cert.certificateName || cert.name)
        .filter((c: string) => c)
        .slice(0, 3);
      if (certNames.length > 0) {
        parts.push(`Chứng chỉ: ${certNames.join(', ')}`);
      }
    }
    
    // Nếu không có dữ liệu, tạo tóm tắt mặc định
    if (parts.length === 0) {
      return "CV đã được trích xuất. Vui lòng xem chi tiết trong phần dữ liệu đã trích xuất.";
    }
    
    return parts.join('. ') + '.';
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      // Create preview URL
      const url = URL.createObjectURL(file);
      setCvPreviewUrl(url);
    }
  };

  // Handle CV extraction
  const handleExtractCV = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file CV trước!");
      return;
    }

    try {
      setExtractingCV(true);
      const result = await talentCVService.extractFromPDFWithOllama(selectedFile);
      
      if (result.isSuccess && result.generateText) {
        try {
          let cleanText = result.generateText.trim();
          
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsedData = JSON.parse(cleanText);
          
          // Clean phone number
          if (parsedData.phone) {
            parsedData.phone = cleanPhoneNumber(parsedData.phone);
          }
          
          setExtractedData(parsedData);
          
          // Tự động tạo và điền tóm tắt CV
          const summary = generateSummaryFromExtractedData(parsedData);
          setForm(prev => ({ ...prev, summary }));
          
          // Save to localStorage for use in other pages
          if (talentId) {
            localStorage.setItem(`talentCV_extracted_${talentId}`, JSON.stringify({
              data: parsedData,
              cvFileUrl: cvPreviewUrl,
              fileName: selectedFile.name,
              timestamp: Date.now()
            }));
          }
          
          alert("✅ Trích xuất thông tin CV thành công! Tóm tắt CV đã được tự động điền.");
        } catch (parseError) {
          console.error("Lỗi parse JSON:", parseError);
          alert("❌ Lỗi khi phân tích dữ liệu CV!");
        }
      } else {
        alert("❌ Không thể trích xuất thông tin từ CV!");
      }
    } catch (error) {
      console.error("Lỗi extract CV:", error);
      alert("❌ Lỗi khi trích xuất CV!");
    } finally {
      setExtractingCV(false);
    }
  };

  // Handle file upload to Firebase
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("⚠️ Vui lòng chọn file trước khi upload.");
      return;
    }

    if (!form.version || form.version <= 0) {
      setError("⚠️ Vui lòng nhập version CV trước khi upload.");
      return;
    }

    if (!talentId) {
      setError("⚠️ Không tìm thấy ID nhân sự.");
      return;
    }

    // Xác nhận trước khi upload
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn upload file "${selectedFile.name}" lên Firebase không?\n\n` +
      `Version: ${form.version}\n` +
      `Kích thước file: ${(selectedFile.size / 1024).toFixed(2)} KB`
    );
    
    if (!confirmed) {
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const downloadURL = await uploadTalentCV(
        selectedFile,
        Number(talentId),
        `v${form.version}`,
        (progress) => setUploadProgress(progress)
      );

      // Update form with the download URL
      setForm(prev => ({ ...prev, cvFileUrl: downloadURL }));
      setIsUploadedFromFirebase(true); // Đánh dấu URL từ Firebase upload
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("❌ Error uploading file:", err);
      setError(err.message || "Không thể upload file. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handler cho link "Quay lại" và "Hủy" - cảnh báo nếu đã upload CV nhưng chưa lưu
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isUploadedFromFirebase && !success) {
      const confirmed = window.confirm(
        "⚠️ Bạn đã upload CV lên Firebase nhưng chưa lưu.\n\n" +
        "Nếu bạn rời khỏi trang này, file đã upload sẽ không được lưu vào hệ thống.\n\n" +
        "Bạn có chắc chắn muốn rời khỏi trang không?"
      );
      if (!confirmed) {
        e.preventDefault();
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.jobRoleId || form.jobRoleId === 0) {
      setError("⚠️ Vui lòng chọn vị trí công việc trước khi tạo.");
      setLoading(false);
      return;
    }

    if (!form.version || form.version <= 0) {
      setError("⚠️ Vui lòng nhập version CV (phải lớn hơn 0).");
      setLoading(false);
      return;
    }

    // Validate version không trùng
    const versionErrorMsg = validateVersion(form.version, form.jobRoleId, existingCVs);
    if (versionErrorMsg) {
      setVersionError(versionErrorMsg);
      setError("⚠️ " + versionErrorMsg);
      setLoading(false);
      return;
    }

    if (!isUploadedFromFirebase || !form.cvFileUrl.trim()) {
      setError("⚠️ Vui lòng upload file CV lên Firebase trước khi tạo.");
      setLoading(false);
      return;
    }

    try {
      const url = new URL(form.cvFileUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("invalid protocol");
      }
    } catch {
      setError("⚠️ URL file CV không hợp lệ. Vui lòng nhập đường dẫn bắt đầu bằng http hoặc https.");
      setLoading(false);
      return;
    }

    try {
      // Kiểm tra CV active cùng vị trí công việc
      let finalForm = { ...form };
      // Đảm bảo CV mới luôn active khi tạo
      finalForm.isActive = true;
      
      if (talentId) {
        const existingCVs = await talentCVService.getAll({ 
          talentId: Number(talentId), 
          excludeDeleted: true 
        });
        const activeCVWithSameJobRole = existingCVs.find(
          (cv: any) => cv.isActive && cv.jobRoleId === form.jobRoleId
        );

        if (activeCVWithSameJobRole) {
          const jobRoleName = allJobRoles.find(jr => jr.id === form.jobRoleId)?.name || "vị trí này";
          const confirmed = window.confirm(
            `⚠️ Bạn đang có CV active với vị trí công việc "${jobRoleName}".\n\n` +
            `CV mới sẽ được set active và CV cũ sẽ bị set inactive.\n\n` +
            `Bạn có chắc chắn muốn upload CV này không?`
          );
          if (!confirmed) {
            setLoading(false);
            return;
          }
          // Set CV cũ inactive trước khi tạo CV mới
          // console.log("finalForm", finalForm);
          await talentCVService.deactivate(activeCVWithSameJobRole.id);
        } else {
          // Nếu không trùng, CV mới active (đã set ở trên)
          const confirmed = window.confirm("Bạn có chắc chắn muốn tạo CV mới cho nhân sự không?");
          if (!confirmed) {
            setLoading(false);
            return;
          }
        }
      }
      
      await talentCVService.create(finalForm);
      setSuccess(true);
      setTimeout(() => navigate(`/hr/developers/${talentId}`), 1500);
    } catch (err) {
      console.error("❌ Error creating Talent CV:", err);
      setError("Không thể tạo CV cho nhân sự. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
              to={`/hr/developers/${talentId}`}
              onClick={handleNavigation}
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết nhân sự</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm CV cho nhân sự</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm CV mới cho nhân sự
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Thêm CV mới
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin CV</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Vị trí công việc */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Vị trí công việc <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobRoleId"
                  value={form.jobRoleId}
                  onChange={handleChange}
                  disabled={isUploadedFromFirebase}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    isUploadedFromFirebase 
                      ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                      : 'border-neutral-200 focus:border-primary-500'
                  }`}
                  required
                >
                  <option value="0">-- Chọn vị trí công việc --</option>
                  {allJobRoles.map(jobRole => (
                    <option key={jobRole.id} value={jobRole.id}>{jobRole.name}</option>
                  ))}
                </select>
                {isUploadedFromFirebase && (
                  <p className="text-xs text-green-600 mt-2">
                    File đã được upload lên Firebase, không thể thay đổi vị trí công việc
                  </p>
                )}
                {form.jobRoleId > 0 && !isUploadedFromFirebase && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allJobRoles.find(jr => jr.id === form.jobRoleId)?.name || "Không xác định"}
                    </span>
                  </p>
                )}
              </div>

              {/* Version */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Version CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="version"
                  value={form.version}
                  onChange={handleChange}
                  placeholder="VD: 1, 2, 3..."
                  min="1"
                  step="1"
                  required
                  disabled={isUploadedFromFirebase}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    isUploadedFromFirebase
                      ? 'border-green-300 bg-green-50 cursor-not-allowed'
                      : versionError 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-neutral-200 focus:border-primary-500'
                  }`}
                />
                {isUploadedFromFirebase && (
                  <p className="text-xs text-green-600 mt-1">
                    File đã được upload lên Firebase, không thể thay đổi version CV
                  </p>
                )}
                {versionError && !isUploadedFromFirebase ? (
                  <p className="text-xs text-red-500 mt-1">{versionError}</p>
                ) : !isUploadedFromFirebase && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Version này sẽ được sử dụng để đặt tên file khi upload
                    {existingCVs.length > 0 && (
                      <span className="block mt-1">
                        Các version hiện có: {existingCVs.map((cv: any) => cv.version || 'N/A').join(', ')}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Upload File Section */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
                <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary-600" />
                  Upload File CV
                </label>
                
                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="cv-file-input"
                      disabled={uploading || isUploadedFromFirebase}
                    />
                    {isUploadedFromFirebase ? (
                      <div className="flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-green-400 bg-green-50 rounded-xl">
                        <FileCheck className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {selectedFile?.name || 'File đã upload'} ({(selectedFile?.size ? (selectedFile.size / 1024).toFixed(2) : '0')} KB) - Đã upload lên Firebase
                        </span>
                      </div>
                    ) : (
                      <label
                        htmlFor="cv-file-input"
                        className={`flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-primary-300 bg-white hover:bg-primary-50'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {selectedFile ? (
                          <>
                            <FileCheck className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-medium text-primary-700">
                              Chọn file CV (PDF, DOC, DOCX - Max 10MB)
                            </span>
                          </>
                        )}
                      </label>
                    )}
                    {isUploadedFromFirebase && (
                      <p className="text-xs text-green-600 mt-2 text-center">
                        File đã được upload lên Firebase, không thể chọn file khác
                      </p>
                    )}
                  </div>

                  {/* Extract CV and View CV Buttons */}
                  {selectedFile && !isUploadedFromFirebase && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Extract CV Button */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleExtractCV}
                          disabled={extractingCV}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {extractingCV ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang trích xuất...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Trích xuất thông tin CV
                            </>
                          )}
                        </button>
                        <p className="text-xs text-green-700 text-center">
                          💡 Nhấn trích xuất sẽ tự động điền tóm tắt CV từ dữ liệu đã trích xuất
                        </p>
                      </div>

                      {/* View CV Button */}
                      {cvPreviewUrl && (
                        <a
                          href={cvPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow"
                        >
                          <Eye className="w-4 h-4" />
                          Xem CV
                        </a>
                      )}
                    </div>
                  )}

                  {/* View CV from Firebase Button */}
                  {isUploadedFromFirebase && form.cvFileUrl && (
                    <div className="flex justify-center">
                      <a
                        href={form.cvFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow"
                      >
                        <Eye className="w-4 h-4" />
                        Xem CV từ Firebase
                      </a>
                    </div>
                  )}

                  {/* Display Extracted Data */}
                  {extractedData && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Đã trích xuất thành công! Thông tin đã được lưu.</span>
                      </div>
                      
                      {extractedData.fullName && (
                        <div className="text-sm text-green-800">
                          <span className="font-medium">Tên:</span> {extractedData.fullName}
                        </div>
                      )}
                      {extractedData.email && (
                        <div className="text-sm text-green-800">
                          <span className="font-medium">Email:</span> {extractedData.email}
                        </div>
                      )}
                      {extractedData.phone && (
                        <div className="text-sm text-green-800">
                          <span className="font-medium">Điện thoại:</span> {extractedData.phone}
                        </div>
                      )}
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="font-medium text-sm text-green-800">Kỹ năng:</span>
                          {extractedData.skills.map((skill: any, index: number) => {
                            const skillName = typeof skill === 'string' ? skill : (skill?.skillName || skill?.name || '');
                            return (
                              <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-lg text-xs font-medium">
                                {skillName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-blue-500 h-3 rounded-full transition-all duration-300 animate-pulse"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-center text-primary-700 font-medium">
                        Đang upload... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  {!isUploadedFromFirebase && (
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploading || !form.version || form.version <= 0}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload lên Firebase
                        </>
                      )}
                    </button>
                  )}
                  {isUploadedFromFirebase && (
                    <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Đã upload lên Firebase thành công
                    </div>
                  )}
                </div>
              </div>

              {/* URL file CV (Tự động hoặc thủ công) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  URL file CV <span className="text-red-500">*</span> {form.cvFileUrl && <span className="text-green-600 text-xs">(✓ Đã có)</span>}
                </label>
                <input
                  name="cvFileUrl"
                  value={form.cvFileUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cv-file.pdf hoặc tự động từ Firebase"
                  required
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    isUploadedFromFirebase 
                      ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                      : 'border-neutral-200 focus:border-primary-500'
                  }`}
                  readOnly={uploading || isUploadedFromFirebase}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {isUploadedFromFirebase 
                    ? "URL đã được upload lên Firebase, không thể chỉnh sửa" 
                    : "URL sẽ tự động điền sau khi upload, hoặc bạn có thể nhập thủ công"}
                </p>
                {form.cvFileUrl && (
                  <div className="mt-2">
                    <a
                      href={form.cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem file CV
                    </a>
                  </div>
                )}
              </div>

              {/* Tóm tắt CV */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tóm tắt CV
                </label>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về nội dung CV, bao gồm: tên ứng viên, vị trí công việc, kinh nghiệm làm việc, kỹ năng chính, dự án nổi bật, chứng chỉ (nếu có)..."
                  rows={4}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {!form.summary && (
                    <span className="block mt-1 text-neutral-500">
                      Tuỳ chọn: sẽ được tự động điền khi nhấn "Trích xuất thông tin CV", bạn có thể để trống nếu chưa cần.
                    </span>
                  )}
                  {form.summary && (
                    <span className="block mt-1 text-green-600">
                      ✓ Tóm tắt đã được điền (có thể chỉnh sửa thủ công nếu cần)
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trạng thái hoạt động */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trạng thái hoạt động
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      disabled
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-not-allowed opacity-60"
                    />
                    <span className="text-sm text-gray-700">
                      {form.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    CV mới sẽ mặc định ở trạng thái "Đang hoạt động" (không thể thay đổi khi tạo mới)
                  </p>
                </div>

                {/* Được tạo từ template */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Được tạo từ template
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      name="isGeneratedFromTemplate"
                      checked={form.isGeneratedFromTemplate}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {form.isGeneratedFromTemplate ? "Có" : "Không"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Đánh dấu nếu CV được tạo từ template
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {(error || success) && (
            <div className="animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Thêm CV thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to={`/hr/developers/${talentId}`}
              onClick={handleNavigation}
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Thêm CV
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
