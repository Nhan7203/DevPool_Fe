import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { jobPositionService, type JobPositionPayload } from "../../../services/JobPosition";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { positionTypeService, type PositionType } from "../../../services/PositionType";
import { Button } from "../../../components/ui/button";

export default function JobPositionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);

  const [formData, setFormData] = useState<JobPositionPayload>({
    clientCompanyId: 0,
    positionTypeId: 0,
    name: "",
    description: "",
    level: 0,
    isActive: true,
  });

  // Load danh sách client companies & position types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, types] = await Promise.all([
          clientCompanyService.getAll() as Promise<ClientCompany[]>,
          positionTypeService.getAll() as Promise<PositionType[]>
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
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : ["level", "clientCompanyId", "positionTypeId"].includes(name) ? Number(value) : value,
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
    if (!formData.clientCompanyId) {
      setError("Vui lòng chọn công ty khách hàng.");
      setLoading(false);
      return;
    }
    if (!formData.positionTypeId) {
      setError("Vui lòng chọn loại vị trí.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Tạo Job Position:", formData);
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
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Vị Trí Tuyển Dụng Mới</h1>
          <p className="text-neutral-600 mt-1">Nhập thông tin vị trí tuyển dụng cho công ty khách hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl space-y-6">
          {/* Tên vị trí */}
          <InputField label="Tên vị trí" name="name" value={formData.name} onChange={handleChange} required />

          {/* Công ty khách hàng */}
          <SelectField
            label="Công ty khách hàng"
            name="clientCompanyId"
            value={formData.clientCompanyId.toString()}
            onChange={handleChange}
            required
            options={[
              { value: "0", label: "-- Chọn công ty --" },
              ...clientCompanies.map(c => ({ value: c.id.toString(), label: c.name })),
            ]}
          />

          {/* Loại vị trí */}
          <SelectField
            label="Loại vị trí"
            name="positionTypeId"
            value={formData.positionTypeId.toString()}
            onChange={handleChange}
            required
            options={[
              { value: "0", label: "-- Chọn loại vị trí --" },
              ...positionTypes.map(t => ({ value: t.id.toString(), label: t.name })),
            ]}
          />

          {/* Cấp độ */}
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
          />

          {/* Trạng thái */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-primary-500" />
            <label>Hoạt động</label>
          </div>

          {/* Mô tả */}
          <TextareaField label="Mô tả" name="description" value={formData.description} onChange={handleChange} rows={4} />

          {/* Error / Success */}
          {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">Tạo vị trí thành công! Đang chuyển hướng...</p>}

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${loading ? "bg-primary-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}>
              {loading ? "Đang lưu..." : "Tạo vị trí"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== COMPONENTS NHỎ ======
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; }
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input {...props} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500" />
    </div>
  );
}

interface SelectFieldProps { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; required?: boolean; }
function SelectField({ label, name, value, onChange, options, required }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select name={name} value={value} onChange={onChange} required={required} className="w-full border border-gray-200 rounded-xl px-4 py-2">
        {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; }
function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <textarea {...props} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500" />
    </div>
  );
}
