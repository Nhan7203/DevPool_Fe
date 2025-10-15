import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  FileText,
  Building2,
  Globe2,
  Factory,
  CheckCircle,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type ProjectPayload } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<ProjectPayload>>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
    clientCompanyId: undefined,
    marketId: undefined,
    industryId: undefined,
  });

  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, marketData, industryData] = await Promise.all([
          clientCompanyService.getAll({ excludeDeleted: true }),
          marketService.getAll({ excludeDeleted: true }),
          industryService.getAll({ excludeDeleted: true }),
        ]);
        setClients(clientData);
        setMarkets(marketData);
        setIndustries(industryData);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toUTCDateString = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    if (!form.name?.trim()) {
      setError("Tên dự án không được để trống!");
      setFormLoading(false);
      return;
    }

    try {
      const payload: ProjectPayload = {
        name: form.name!,
        description: form.description ?? "",
        startDate: toUTCDateString(form.startDate) ?? "",
        endDate: toUTCDateString(form.endDate),
        status: form.status!,
        clientCompanyId: Number(form.clientCompanyId),
        marketId: Number(form.marketId),
        industryId: Number(form.industryId),
      };

      await projectService.create(payload);
      alert("✅ Tạo dự án thành công!");
      navigate("/sales/projects");
    } catch (err) {
      console.error("❌ Lỗi tạo dự án:", err);
      setError("Không thể tạo dự án. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-primary-50/40 via-neutral-50 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Briefcase className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Dự Án Mới
            </h1>
            <p className="text-neutral-600 mt-2">Thêm thông tin dự án khách hàng</p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            {error && (
              <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên dự án */}
              <InputField
                icon={<FileText />}
                label="Tên dự án"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Hệ thống quản lý nhân sự"
                required
              />

              {/* Mô tả */}
              <TextareaField
                label="Mô tả dự án"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập mô tả ngắn gọn về dự án..."
              />

              {/* Ngày bắt đầu & kết thúc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={<CalendarDays />}
                  label="Ngày bắt đầu"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
                <InputField
                  icon={<CalendarDays />}
                  label="Ngày kết thúc"
                  type="date"
                  name="endDate"
                  value={form.endDate ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Selects */}
              <SelectField
                icon={<Building2 />}
                label="Công ty khách hàng"
                name="clientCompanyId"
                value={form.clientCompanyId?.toString() || ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Chọn công ty --" },
                  ...clients.map((c) => ({ value: c.id.toString(), label: c.name })),
                ]}
                required
              />

              <SelectField
                icon={<Globe2 />}
                label="Thị trường"
                name="marketId"
                value={form.marketId?.toString() || ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Chọn thị trường --" },
                  ...markets.map((m) => ({ value: m.id.toString(), label: m.name })),
                ]}
                required
              />

              <SelectField
                icon={<Factory />}
                label="Ngành"
                name="industryId"
                value={form.industryId?.toString() || ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Chọn ngành --" },
                  ...industries.map((i) => ({ value: i.id.toString(), label: i.name })),
                ]}
                required
              />

              <SelectField
                icon={<CheckCircle />}
                label="Trạng thái"
                name="status"
                value={form.status || ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Chọn trạng thái --" },
                  { value: "Planned", label: "Đã lên kế hoạch" },
                  { value: "Ongoing", label: "Đang thực hiện" },
                  { value: "Completed", label: "Đã hoàn thành" },
                ]}
                required
              />

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {formLoading ? "Đang lưu..." : "Tạo dự án"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- COMPONENT CON ---- */
function InputField({
  label,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full border border-neutral-300 rounded-xl bg-white/50 px-4 py-3.5 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft focus:border-primary-500 transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  icon,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <select
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
