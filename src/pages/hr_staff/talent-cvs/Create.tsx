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
    versionName: "",
    cvFileUrl: "",
    isActive: true,
    summary: "",
    isGeneratedFromTemplate: false,
    sourceTemplateId: undefined,
  });

  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === "jobRoleId" || name === "sourceTemplateId" ? Number(value) : value 
    }));
  };

  // Clean phone number to digits only
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
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
      const result = await talentCVService.extractFromPDF(selectedFile);
      
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
          
          // Save to localStorage for use in other pages
          if (talentId) {
            localStorage.setItem(`talentCV_extracted_${talentId}`, JSON.stringify({
              data: parsedData,
              cvFileUrl: cvPreviewUrl,
              fileName: selectedFile.name,
              timestamp: Date.now()
            }));
          }
          
          alert("✅ Trích xuất thông tin CV thành công!");
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

    if (!form.versionName.trim()) {
      setError("⚠️ Vui lòng nhập tên phiên bản CV trước khi upload.");
      return;
    }

    if (!talentId) {
      setError("⚠️ Không tìm thấy ID talent.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const downloadURL = await uploadTalentCV(
        selectedFile,
        Number(talentId),
        form.versionName,
        (progress) => setUploadProgress(progress)
      );

      // Update form with the download URL
      setForm(prev => ({ ...prev, cvFileUrl: downloadURL }));
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

    if (!form.versionName.trim()) {
      setError("⚠️ Vui lòng nhập tên phiên bản CV.");
      setLoading(false);
      return;
    }

    if (!form.cvFileUrl.trim()) {
      setError("⚠️ Vui lòng upload file CV hoặc nhập URL file CV.");
      setLoading(false);
      return;
    }

    if (!form.summary.trim()) {
      setError("⚠️ Vui lòng nhập tóm tắt CV.");
      setLoading(false);
      return;
    }

    try {
      await talentCVService.create(form);
      setSuccess(true);
      setTimeout(() => navigate(`/hr/developers/${talentId}`), 1500);
    } catch (err) {
      console.error("❌ Error creating Talent CV:", err);
      setError("Không thể tạo CV cho talent. Vui lòng thử lại.");
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
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại chi tiết talent</span>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm CV cho talent</h1>
              <p className="text-neutral-600 mb-4">
                Nhập thông tin chi tiết để thêm CV mới cho talent
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
                  Vị trí công việc
                </label>
                <select
                  name="jobRoleId"
                  value={form.jobRoleId}
                  onChange={handleChange}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  required
                >
                  <option value="0">-- Chọn vị trí công việc --</option>
                  {allJobRoles.map(jobRole => (
                    <option key={jobRole.id} value={jobRole.id}>{jobRole.name}</option>
                  ))}
                </select>
                {form.jobRoleId > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Đã chọn: <span className="font-medium text-neutral-700">
                      {allJobRoles.find(jr => jr.id === form.jobRoleId)?.name || "Không xác định"}
                    </span>
                  </p>
                )}
              </div>

              {/* Tên phiên bản */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tên phiên bản CV
                </label>
                <input
                  name="versionName"
                  value={form.versionName}
                  onChange={handleChange}
                  placeholder="VD: CV v1.0, CV Frontend Developer..."
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Tên này sẽ được sử dụng để đặt tên file khi upload
                </p>
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
                      disabled={uploading}
                    />
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
                  </div>

                  {/* Extract CV and View CV Buttons */}
                  {selectedFile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Extract CV Button */}
                      <button
                        type="button"
                        onClick={handleExtractCV}
                        disabled={extractingCV}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {extractedData.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-lg text-xs font-medium">
                              {skill}
                            </span>
                          ))}
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
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploading || !form.versionName}
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
                </div>
              </div>

              {/* URL file CV (Tự động hoặc thủ công) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  URL file CV {form.cvFileUrl && <span className="text-green-600 text-xs">(✓ Đã có)</span>}
                </label>
                <input
                  name="cvFileUrl"
                  value={form.cvFileUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cv-file.pdf hoặc tự động từ Firebase"
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  readOnly={uploading}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  URL sẽ tự động điền sau khi upload, hoặc bạn có thể nhập thủ công
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
                  placeholder="Mô tả ngắn gọn về nội dung CV, kinh nghiệm chính..."
                  rows={4}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                />
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
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {form.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Đánh dấu nếu CV này đang được sử dụng
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
