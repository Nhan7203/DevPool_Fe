import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type ProjectPayload } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";
import { Button } from "../../../components/ui/button";

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
                console.error("❌ Lỗi tải dữ liệu cho form:", err);
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
        setForm(prev => ({ ...prev, [name]: value }));
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
        if (!form.status) {
            setError("Vui lòng chọn trạng thái dự án!");
            setFormLoading(false);
            return;
        }
        if (!form.clientCompanyId || !form.marketId || !form.industryId) {
            setError("Vui lòng chọn công ty, thị trường và ngành!");
            setFormLoading(false);
            return;
        }
        const toUTCDateString = (dateStr?: string | null) => {
            if (!dateStr) return null;
            const d = new Date(dateStr + "T00:00:00"); // giả định giờ 00:00
            return d.toISOString(); // => chuỗi UTC
        };

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
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo dự án mới</h1>
                <p className="text-gray-600 mb-6">Nhập thông tin dự án khách hàng.</p>

                {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow space-y-6 max-w-3xl">
                    <InputField label="Tên dự án" name="name" value={form.name} onChange={handleChange} required />
                    <TextareaField label="Mô tả" name="description" value={form.description} onChange={handleChange} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Ngày bắt đầu" name="startDate" type="date" value={form.startDate} onChange={handleChange} required/>
                        <InputField label="Ngày kết thúc" name="endDate" type="date" value={form.endDate ?? ""} onChange={handleChange} required/>
                    </div>

                    <SelectField
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

                    <SelectField
                        label="Công ty khách hàng"
                        name="clientCompanyId"
                        value={form.clientCompanyId?.toString() || ""}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "-- Chọn công ty --" },
                            ...clients.map(c => ({ value: c.id.toString(), label: c.name })),
                        ]}
                        required
                    />

                    <SelectField
                        label="Thị trường"
                        name="marketId"
                        value={form.marketId?.toString() || ""}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "-- Chọn thị trường --" },
                            ...markets.map(m => ({ value: m.id.toString(), label: m.name })),
                        ]}
                        required
                    />

                    <SelectField
                        label="Ngành"
                        name="industryId"
                        value={form.industryId?.toString() || ""}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "-- Chọn ngành --" },
                            ...industries.map(i => ({ value: i.id.toString(), label: i.name })),
                        ]}
                        required
                    />

                    <div className="flex justify-end">
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl" disabled={formLoading}>
                            {formLoading ? "Đang lưu..." : "Tạo dự án"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ===== Component nhỏ với type chuẩn =====
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

function SelectField({ label, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

