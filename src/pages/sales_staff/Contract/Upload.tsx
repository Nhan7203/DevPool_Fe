import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      setError("File quá lớn (tối đa 10MB)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFile) {
      setError("Vui lòng chọn file hợp đồng khách hàng");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value.toString()));
      formData.append("ClientContractFile", clientFile);

      // TODO: Gọi API upload thật
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
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
      setClientFile(null);
    } catch {
      setError("Không thể tải lên hợp đồng. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Hợp Đồng Khách Hàng</h1>
          <p className="text-neutral-600 mt-1">
            Tải lên file hợp đồng đã ký giữa DevPool và công ty khách hàng
          </p>
        </div>

        <div className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mã hợp đồng */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mã hợp đồng</label>
              <input
                type="text"
                name="contractNumber"
                value={form.contractNumber}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
                placeholder="VD: CTR-2025-010"
                required
              />
            </div>

            {/* Thông tin chọn liên quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Công ty khách hàng</label>
                <select
                  name="clientCompanyId"
                  value={form.clientCompanyId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                >
                  <option value="">-- Chọn công ty --</option>
                  <option value="1">Tech Solutions Inc.</option>
                  <option value="2">Digital Innovations Co.</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Dự án</label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                >
                  <option value="">-- Chọn dự án --</option>
                  <option value="1">Website Redesign</option>
                  <option value="2">Mobile App Development</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Đối tác (nếu có)</label>
                <select
                  name="partnerId"
                  value={form.partnerId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                >
                  <option value="">-- Không có --</option>
                  <option value="1">Partner A</option>
                  <option value="2">Partner B</option>
                </select>
              </div>
            </div>

            {/* Giá trị */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá trị khách hàng trả (VNĐ/tháng)</label>
                <input
                  type="number"
                  name="totalClientRatePerMonth"
                  value={form.totalClientRatePerMonth}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá trị trả cho Dev (VNĐ/tháng)</label>
                <input
                  type="number"
                  name="totalDevRatePerMonth"
                  value={form.totalDevRatePerMonth}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                />
              </div>
            </div>

            {/* Ngày bắt đầu / kết thúc */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ngày kết thúc</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                />
              </div>
            </div>

            {/* File hợp đồng khách hàng */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">File hợp đồng khách hàng</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                {clientFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary-700">
                    <FileText className="w-5 h-5" /> {clientFile.name}
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer text-gray-500">
                    <Upload className="w-8 h-8 mb-2" />
                    <span>Chọn hoặc kéo thả file</span>
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

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Tải lên hợp đồng thành công!</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${
                  uploading
                    ? "bg-primary-300 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {uploading ? "Đang tải lên..." : "Tải lên hợp đồng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
