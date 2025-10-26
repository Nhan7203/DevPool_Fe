import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Briefcase, Link, Github, Upload, FileText, Calendar, Globe } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { type TalentCreate, talentService } from "../../../services/Talent";
import { type Partner, partnerService } from "../../../services/Partner";
import { type User as UserType, userService } from "../../../services/User";
import { talentCVService, type TalentCVExtractResponse } from "../../../services/TalentCV";
import { WorkingMode } from "../../../types/WorkingMode";

export default function CreateTalent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [extractingCV, setExtractingCV] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const [formData, setFormData] = useState<TalentCreate>({
    currentPartnerId: 1,
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    locationId: undefined,
    workingMode: WorkingMode.None,
    githubUrl: "",
    portfolioUrl: "",
    status: "Available",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partnersData, usersData] = await Promise.all([
          partnerService.getAll(),
          userService.getAll({ excludeDeleted: true })
        ]);
        setPartners(partnersData);
        setUsers(usersData.items);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "workingMode" || name === "locationId" || name === "currentPartnerId"
        ? Number(value) || undefined
        : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleExtractCV = async () => {
    if (!cvFile) {
      alert("Vui lòng chọn file CV trước!");
      return;
    }

    try {
      setExtractingCV(true);
      const result: TalentCVExtractResponse = await talentCVService.extractFromPDF(cvFile);
      
      if (result.isSuccess && result.generateText) {
        try {
          // Clean the response text by removing markdown code blocks
          let cleanText = result.generateText.trim();
          
          // Remove markdown code block markers if present
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsedData = JSON.parse(cleanText);
          setExtractedData(parsedData);
          
          // Auto-fill form with extracted data (with safety checks)
          setFormData(prev => ({
            ...prev,
            fullName: parsedData.fullName || prev.fullName,
            email: parsedData.email || prev.email,
            phone: parsedData.phone || prev.phone,
            dateOfBirth: parsedData.dateOfBirth || prev.dateOfBirth,
          }));
          
          // Log extracted data for debugging
          console.log("✅ Extracted CV data:", parsedData);
          
          alert("✅ Trích xuất thông tin CV thành công!");
        } catch (parseError) {
          console.error("Lỗi parse JSON:", parseError);
          console.error("Raw response:", result.generateText);
          alert("❌ Lỗi khi phân tích dữ liệu CV!");
        }
      } else {
        console.error("CV extraction failed:", result);
        alert("❌ Không thể trích xuất thông tin từ CV!");
      }
    } catch (error) {
      console.error("Lỗi extract CV:", error);
      alert("❌ Lỗi khi trích xuất CV!");
    } finally {
      setExtractingCV(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert dateOfBirth to UTC ISO string if provided
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth 
          ? new Date(formData.dateOfBirth + 'T00:00:00').toISOString()
          : undefined
      };
      
      await talentService.create(payload);
      alert("✅ Tạo Talent thành công!");
      navigate('/hr/developers');
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi tạo Talent!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <User className="text-white font-bold text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Talent Mới
            </h1>
            <p className="text-neutral-600 mt-2">
              Thêm lập trình viên (developer) mới vào hệ thống DevPool
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CV Extraction Section */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">Trích xuất thông tin từ CV</h3>
                    <p className="text-sm text-primary-600">Tải lên file PDF để tự động điền thông tin</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractCV}
                    disabled={!cvFile || extractingCV}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {extractingCV ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang trích xuất...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Trích xuất CV
                      </>
                    )}
                  </button>
                </div>
                
                {extractedData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-3">
                      ✅ Đã trích xuất thành công! Thông tin đã được điền tự động vào form.
                    </p>
                    
                    {/* Display extracted information in a more readable format */}
                    <div className="space-y-3 text-sm">
                      {extractedData.fullName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="text-green-700"><strong>Tên:</strong> {extractedData.fullName}</span>
                        </div>
                      )}
                      {extractedData.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <span className="text-green-700"><strong>Email:</strong> {extractedData.email}</span>
                        </div>
                      )}
                      {extractedData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-green-700"><strong>Điện thoại:</strong> {extractedData.phone}</span>
                        </div>
                      )}
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            <span className="text-green-700"><strong>Kỹ năng:</strong></span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-6">
                            {extractedData.skills.map((skill: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extractedData.workExperiences && extractedData.workExperiences.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            <span className="text-green-700"><strong>Kinh nghiệm:</strong></span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {extractedData.workExperiences.slice(0, 2).map((exp: any, index: number) => (
                              <div key={index} className="text-xs text-green-700">
                                <strong>{exp.position}</strong> tại {exp.company} ({exp.startDate} - {exp.endDate})
                              </div>
                            ))}
                            {extractedData.workExperiences.length > 2 && (
                              <div className="text-xs text-green-600">... và {extractedData.workExperiences.length - 2} kinh nghiệm khác</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Raw JSON for debugging */}
                    <details className="mt-3">
                      <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
                        Xem dữ liệu JSON đầy đủ
                      </summary>
                      <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Họ và tên</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              {/* Email + SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@domain.com"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Số điện thoại</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0123456789"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ngày sinh + Chế độ làm việc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Ngày sinh</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Chế độ làm việc</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <select
                      name="workingMode"
                      value={formData.workingMode}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      <option value={WorkingMode.None}>Không xác định</option>
                      <option value={WorkingMode.Onsite}>Tại văn phòng</option>
                      <option value={WorkingMode.Remote}>Làm việc từ xa</option>
                      <option value={WorkingMode.Hybrid}>Kết hợp</option>
                      <option value={WorkingMode.Flexible}>Linh hoạt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* User + Partner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Người dùng</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Đối tác</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <select
                      name="currentPartnerId"
                      value={formData.currentPartnerId}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      <option value="">-- Chọn đối tác --</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full py-3.5 px-4 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="Available">Available</option>
                  <option value="On Project">On Project</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Github + Portfolio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Github URL</label>
                  <div className="relative group">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Portfolio URL</label>
                  <div className="relative group">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://portfolio.com"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    "Tạo Talent"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
