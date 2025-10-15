import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Layers,
  ClipboardList,
  FileText,
  CheckCircle,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobPositionService, type JobPositionPayload } from "../../../services/JobPosition";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { positionTypeService, type PositionType } from "../../../services/PositionType";

export default function JobPositionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobPositionPayload>({
    clientCompanyId: 0,
    positionTypeId: 0,
    name: "",
    description: "",
    level: 0,
    isActive: true,
  });

  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, types] = await Promise.all([
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          positionTypeService.getAll() as Promise<PositionType[]>,
        ]);
        setClientCompanies(companies);
        setPositionTypes(types);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["level", "clientCompanyId", "positionTypeId"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên vị trí.");
      setLoading(false);
      return;
    }

    try {
      await jobPositionService.create(formData);
      setSuccess(true);
      setTimeout(() => navigate("/sales/job-positions"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo vị trí:", err);
      setError("Không thể tạo vị trí. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <Briefcase className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Vị Trí Tuyển Dụng Mới
            </h1>
            <p className="text-neutral-600 mt-2">
              Nhập thông tin vị trí tuyển dụng cho công ty khách hàng
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên vị trí */}
              <InputField
                label="Tên vị trí"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Frontend Developer"
                icon={<ClipboardList />}
                required
              />

              {/* Grid 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Công ty khách hàng"
                  name="clientCompanyId"
                  value={formData.clientCompanyId.toString()}
                  onChange={handleChange}
                  options={[
                    { value: "0", label: "-- Chọn công ty --" },
                    ...clientCompanies.map((c) => ({
                      value: c.id.toString(),
                      label: c.name,
                    })),
                  ]}
                  icon={<Building2 />}
                  required
                />

                <SelectField
                  label="Loại vị trí"
                  name="positionTypeId"
                  value={formData.positionTypeId.toString()}
                  onChange={handleChange}
                  options={[
                    { value: "0", label: "-- Chọn loại vị trí --" },
                    ...positionTypes.map((t) => ({
                      value: t.id.toString(),
                      label: t.name,
                    })),
                  ]}
                  icon={<Layers />}
                  required
                />
              </div>

              {/* Level + Trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Cấp độ"
                  name="level"
                  value={formData.level.toString()}
                  onChange={handleChange}
                  options={[
                    { value: "0", label: "Junior" },
                    { value: "1", label: "Middle" },
                    { value: "2", label: "Senior" },
                    { value: "3", label: "Lead" },
                  ]}
                  icon={<CheckCircle />}
                />

                <div className="flex items-center pt-7 space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="accent-primary-500 w-5 h-5"
                  />
                  <label className="text-neutral-700 font-medium">
                    Vị trí đang hoạt động
                  </label>
                </div>
              </div>

              {/* Mô tả */}
              <TextareaField
                label="Mô tả công việc"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về công việc, yêu cầu, quyền lợi..."
                icon={<FileText />}
              />

              {/* Thông báo */}
              {error && (
                <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  ✅ Tạo vị trí thành công! Đang chuyển hướng...
                </p>
              )}

              {/* Nút Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </div>
                  ) : (
                    "Tạo vị trí"
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

/* --- COMPONENT CON --- */
function InputField({
  label,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <input
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft focus:border-primary-500 transition-all"
        />
      </div>
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <select
          {...props}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft focus:border-primary-500 transition-all"
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

function TextareaField({
  label,
  icon,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-4 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500">
            {icon}
          </span>
        )}
        <textarea
          {...props}
          rows={4}
          className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft focus:border-primary-500 transition-all"
        />
      </div>
    </div>
  );
}
