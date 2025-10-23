import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  FileSignature, 
  ArrowLeft, 
  Save, 
  Building2, 
  Briefcase, 
  CalendarDays, 
  DollarSign, 
  AlertCircle,
  X
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";

export default function UploadClientContract() {
  const [form, setForm] = useState({
    contractNumber: "",
    clientCompanyId: "",
    projectId: "",
    partnerId: "",
    totalClientRatePerMonth: "",
    totalDevRatePerMonth: "",
    standardWorkingDays: 21,
    hoursPerDay: 8,
    startDate: "",
    endDate: "",
    status: "pending",
  });

  const [clientFile, setClientFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setClientFile(file);
      setError("");
    } else {
      setError("❌ File quá lớn (tối đa 10MB)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess(false);

    if (!clientFile) {
      setError("⚠️ Vui lòng chọn file hợp đồng khách hàng");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value.toString()));
      formData.append("ClientContractFile", clientFile);

      // ⚙️ Giả lập upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setClientFile(null);
      setForm({
        contractNumber: "",
        clientCompanyId: "",
        projectId: "",
        partnerId: "",
        totalClientRatePerMonth: "",
        totalDevRatePerMonth: "",
        standardWorkingDays: 21,
        hoursPerDay: 8,
        startDate: "",
        endDate: "",
        status: "pending",
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("❌ Không thể tải lên hợp đồng. Vui lòng thử lại.");
    } finally {
      setUploading(false);
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

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload hợp đồng khách hàng</h1>
              <p className="text-neutral-600 mb-4">
                Tải lên file hợp đồng đã ký giữa DevPool và công ty khách hàng
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <FileSignature className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Upload hợp đồng mới
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
                <h2 className="text-xl font-semibold text-gray-900">Thông tin hợp đồng</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Mã hợp đồng */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mã hợp đồng
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

              {/* Thông tin chọn liên quan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Công ty khách hàng
                  </label>
                  <select
                    name="clientCompanyId"
                    value={form.clientCompanyId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn công ty --</option>
                    <option value="1">Tech Solutions Inc.</option>
                    <option value="2">Digital Innovations Co.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Dự án
                  </label>
                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Chọn dự án --</option>
                    <option value="1">Website Redesign</option>
                    <option value="2">Mobile App Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Đối tác (nếu có)
                  </label>
                  <select
                    name="partnerId"
                    value={form.partnerId}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Không có --</option>
                    <option value="1">Partner A</option>
                    <option value="2">Partner B</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin tài chính</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Giá trị */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Giá trị khách hàng trả (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    name="totalClientRatePerMonth"
                    value={form.totalClientRatePerMonth}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    placeholder="Nhập số tiền..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Giá trị trả cho Dev (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    name="totalDevRatePerMonth"
                    value={form.totalDevRatePerMonth}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    placeholder="Nhập số tiền..."
                  />
                </div>
              </div>

              {/* Ngày bắt đầu / kết thúc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Upload className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload file hợp đồng</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-neutral-50 hover:bg-primary-50">
                {clientFile ? (
                  <div className="flex flex-col items-center text-primary-700">
                    <FileText className="w-8 h-8 mb-2" />
                    <p className="font-medium">{clientFile.name}</p>
                    <p className="text-sm text-neutral-600">{(clientFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center text-neutral-500 cursor-pointer">
                    <Upload className="w-12 h-12 mb-4" />
                    <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây</span>
                    <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
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
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Tải lên hợp đồng thành công!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/sales/contracts"
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Tải lên hợp đồng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

