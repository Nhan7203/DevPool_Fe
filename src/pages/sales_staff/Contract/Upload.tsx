import { useState } from "react";
import { Upload, FileText, CheckCircle2, XCircle, FileSignature } from "lucide-react";
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setClientFile(file);
      setMessage(null);
    } else {
      setMessage({ type: "error", text: "❌ File quá lớn (tối đa 10MB)" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFile) {
      setMessage({ type: "error", text: "⚠️ Vui lòng chọn file hợp đồng khách hàng" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value.toString()));
      formData.append("ClientContractFile", clientFile);

      // ⚙️ Giả lập upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({ type: "success", text: "✅ Tải lên hợp đồng thành công!" });
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
    } catch {
      setMessage({ type: "error", text: "❌ Không thể tải lên hợp đồng. Vui lòng thử lại." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/40 to-secondary-50/30">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <FileSignature className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Upload Hợp Đồng Khách Hàng
            </h1>
            <p className="text-neutral-600 mt-2">
              Tải lên file hợp đồng đã ký giữa DevPool và công ty khách hàng
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mã hợp đồng */}
              <FormGroup
                label="Mã hợp đồng"
                name="contractNumber"
                placeholder="VD: CTR-2025-010"
                value={form.contractNumber}
                onChange={handleChange}
                required
              />

              {/* Thông tin chọn liên quan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectGroup
                  label="Công ty khách hàng"
                  name="clientCompanyId"
                  value={form.clientCompanyId}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "-- Chọn công ty --" },
                    { value: "1", label: "Tech Solutions Inc." },
                    { value: "2", label: "Digital Innovations Co." },
                  ]}
                />
                <SelectGroup
                  label="Dự án"
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "-- Chọn dự án --" },
                    { value: "1", label: "Website Redesign" },
                    { value: "2", label: "Mobile App Development" },
                  ]}
                />
                <SelectGroup
                  label="Đối tác (nếu có)"
                  name="partnerId"
                  value={form.partnerId}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "-- Không có --" },
                    { value: "1", label: "Partner A" },
                    { value: "2", label: "Partner B" },
                  ]}
                />
              </div>

              {/* Giá trị */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup
                  label="Giá trị khách hàng trả (VNĐ/tháng)"
                  type="number"
                  name="totalClientRatePerMonth"
                  value={form.totalClientRatePerMonth}
                  onChange={handleChange}
                />
                <FormGroup
                  label="Giá trị trả cho Dev (VNĐ/tháng)"
                  type="number"
                  name="totalDevRatePerMonth"
                  value={form.totalDevRatePerMonth}
                  onChange={handleChange}
                />
              </div>

              {/* Ngày bắt đầu / kết thúc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup
                  label="Ngày bắt đầu"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
                <FormGroup
                  label="Ngày kết thúc"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Upload file */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  File hợp đồng khách hàng
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-white/40">
                  {clientFile ? (
                    <div className="flex flex-col items-center text-primary-700">
                      <FileText className="w-6 h-6 mb-2" />
                      <p>{clientFile.name}</p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center text-gray-500 cursor-pointer">
                      <Upload className="w-8 h-8 mb-2" />
                      <span>Chọn hoặc kéo thả file vào đây</span>
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

              {/* Thông báo */}
              {message && (
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    message.type === "success"
                      ? "text-green-700 bg-green-50 border border-green-200"
                      : "text-red-700 bg-red-50 border border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {message.text}
                </div>
              )}

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full md:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-primary-700 hover:to-secondary-700 shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Đang tải lên..." : "Tải lên hợp đồng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTS =====
interface FormGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function FormGroup({ label, ...props }: FormGroupProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-neutral-300 rounded-xl bg-white/50 px-4 py-3.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all"
      />
    </div>
  );
}

interface SelectGroupProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}
function SelectGroup({ label, options, ...props }: SelectGroupProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <select
        {...props}
        className="w-full border border-neutral-300 rounded-xl bg-white/50 px-4 py-3.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
