import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { projectService, type Project, type ProjectPayload } from "../../../services/Project";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { marketService, type Market } from "../../../services/Market";
import { industryService, type Industry } from "../../../services/Industry";
import {
  Briefcase,
  ArrowLeft,
  Save,
  FileText,
  CalendarDays,
  Building2,
  Globe2,
  Factory,
  CheckCircle,
  AlertCircle,
  X,
  Search
} from "lucide-react";

export default function ProjectEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [company, setCompany] = useState<ClientCompany | null>(null);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [industrySearch, setIndustrySearch] = useState("");
    const [marketSearch, setMarketSearch] = useState("");
    const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<
        Partial<Omit<ProjectPayload, "industryIds">> & { industryIds: number[] }
    >({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "",
        clientCompanyId: undefined,
        marketId: undefined,
        industryIds: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;

                // Lấy dự án
                const proj = await projectService.getById(Number(id));
                setProject(proj);
                
                // Lấy công ty
                const comp = await clientCompanyService.getById(proj.clientCompanyId);
                setCompany(comp);

                // Lấy danh sách Market và Industry
                const [mkList, indList] = await Promise.all([
                    marketService.getAll({ excludeDeleted: true }),
                    industryService.getAll({ excludeDeleted: true }),
                ]);
                setMarkets(mkList);
                setIndustries(indList);

                // Gán giá trị mặc định cho form
                setFormData({
                    name: proj.name,
                    description: proj.description ?? "",
                    startDate: formatDate(proj.startDate),
                    endDate: formatDate(proj.endDate),
                    status: proj.status,
                    clientCompanyId: proj.clientCompanyId,
                    marketId: proj.marketId,
                    industryIds: proj.industryIds ?? [],
                });
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu dự án:", err);
                alert("Không thể tải dữ liệu dự án!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === "industryIds") return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIndustryChange = (id: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            industryIds: checked
                ? [...prev.industryIds, id]
                : prev.industryIds.filter(selectedId => selectedId !== id),
        }));
    };

    const filteredIndustries = industries.filter(industry =>
        industry.name.toLowerCase().includes(industrySearch.toLowerCase())
    );

    const filteredMarkets = markets.filter(m =>
        !marketSearch || m.name.toLowerCase().includes(marketSearch.toLowerCase())
    );

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        // Xác nhận trước khi lưu
        const confirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi không?");
        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");
        setSuccess(false);

        if (!formData.name?.trim()) {
            setError("⚠️ Tên dự án không được để trống!");
            setSaving(false);
            return;
        }
        if (!formData.status) {
            setError("⚠️ Vui lòng chọn trạng thái dự án!");
            setSaving(false);
            return;
        }
        if (!formData.marketId) {
            setError("⚠️ Vui lòng chọn thị trường!");
            setSaving(false);
            return;
        }
        if (!formData.industryIds || formData.industryIds.length === 0) {
            setError("⚠️ Vui lòng chọn ít nhất một ngành!");
            setSaving(false);
            return;
        }

        const toUTCDateString = (dateStr?: string | null) => {
            if (!dateStr) return null;
            const d = new Date(dateStr + "T00:00:00"); // giả định giờ 00:00
            return d.toISOString(); // => chuỗi UTC
        };

        const payload: ProjectPayload = {
            name: formData.name,
            description: formData.description ?? "",
            startDate: toUTCDateString(formData.startDate) ?? "",
            endDate: toUTCDateString(formData.endDate),
            status: formData.status,
            clientCompanyId: formData.clientCompanyId!,
            marketId: Number(formData.marketId),
            industryIds: formData.industryIds.map(id => Number(id)),
        };

        try {
            await projectService.update(Number(id), payload);
            setSuccess(true);
            setTimeout(() => navigate(`/sales/projects/${id}`), 1500);
        } catch (err) {
            console.error("❌ Lỗi cập nhật dự án:", err);
            setError("Không thể cập nhật dự án. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const isReadOnly =
        project?.status === "Ongoing" || project?.status === "Completed";

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Sales Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar items={sidebarItems} title="Sales Staff" />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-red-500 text-lg font-medium">Không tìm thấy dự án</p>
                        <Link 
                            to="/sales/projects"
                            className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
                        >
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Sales Staff" />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <Breadcrumb
                        items={[
                            { label: "Dự án", to: "/sales/projects" },
                            { label: project ? project.name : "Chi tiết", to: `/sales/projects/${id}` },
                            { label: "Chỉnh sửa" }
                        ]}
                    />

                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa dự án</h1>
                            <p className="text-neutral-600 mb-4">
                                Cập nhật thông tin dự án khách hàng
                            </p>
                            
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-50 border border-warning-200">
                                <Briefcase className="w-4 h-4 text-warning-600" />
                                <span className="text-sm font-medium text-warning-800">
                                    Chỉnh sửa: {project.name}
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
                                    <Briefcase className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Thông tin dự án</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Tên dự án */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Tên dự án <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isReadOnly}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    placeholder="Nhập tên dự án"
                                />
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                    rows={4}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                                    placeholder="Nhập mô tả dự án..."
                                />
                            </div>

                            {/* Ngày bắt đầu & kết thúc */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        max={formData.endDate || undefined}
                                        disabled={isReadOnly}
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
                                        value={formData.endDate ?? ""}
                                        onChange={handleChange}
                                        min={formData.startDate || undefined}
                                        disabled={isReadOnly}
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client & Market Information */}
                    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary-100 rounded-lg">
                                    <Building2 className="w-5 h-5 text-secondary-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Thông tin khách hàng & thị trường</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Company Info */}
                            {company && (
                                <div className="bg-neutral-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-neutral-600" />
                                        <span className="text-sm font-medium text-neutral-600">Công ty khách hàng</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{company.name}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <Globe2 className="w-4 h-4" />
                                    Thị trường <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={isReadOnly}
                                        onClick={() => !isReadOnly && setIsMarketDropdownOpen(prev => !prev)}
                                        className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl bg-white text-left focus:border-primary-500 focus:ring-primary-500"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                                            <Globe2 className="w-4 h-4 text-neutral-400" />
                                            <span>
                                                {formData.marketId
                                                    ? markets.find(m => m.id === Number(formData.marketId))?.name || "Chọn thị trường"
                                                    : "Chọn thị trường"}
                                            </span>
                                        </div>
                                        <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                                    </button>
                                    {isMarketDropdownOpen && (
                                        <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                                            <div className="p-3 border-b border-neutral-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        value={marketSearch}
                                                        onChange={(e) => setMarketSearch(e.target.value)}
                                                        placeholder="Tìm thị trường..."
                                                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-56 overflow-y-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, marketId: undefined }));
                                                        setMarketSearch("");
                                                        setIsMarketDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm ${
                                                        !formData.marketId
                                                            ? "bg-primary-50 text-primary-700"
                                                            : "hover:bg-neutral-50 text-neutral-700"
                                                    }`}
                                                >
                                                    Tất cả thị trường
                                                </button>
                                                {filteredMarkets.length === 0 ? (
                                                    <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy thị trường phù hợp</p>
                                                ) : (
                                                    filteredMarkets.map(m => (
                                                        <button
                                                            type="button"
                                                            key={m.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, marketId: m.id }));
                                                                setIsMarketDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm ${
                                                                formData.marketId === m.id
                                                                    ? "bg-primary-50 text-primary-700"
                                                                    : "hover:bg-neutral-50 text-neutral-700"
                                                            }`}
                                                        >
                                                            {m.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <Factory className="w-4 h-4" />
                                    Ngành <span className="text-red-500">*</span>
                                </label>
                                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={industrySearch}
                                            onChange={(e) => setIndustrySearch(e.target.value)}
                                            disabled={isReadOnly}
                                            placeholder="Tìm kiếm ngành..."
                                            className="w-full pl-4 pr-10 py-2 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 bg-white"
                                        />
                                        {industrySearch && (
                                            <button
                                                type="button"
                                                onClick={() => setIndustrySearch("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                                aria-label="Xoá tìm kiếm ngành"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-neutral-600">
                                        <span>
                                            Đã chọn:{" "}
                                            <span className="font-semibold">
                                                {formData.industryIds.length}
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isReadOnly}
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    industryIds: [],
                                                }))
                                            }
                                            className="text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Bỏ chọn hết
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                                        {filteredIndustries.map((industry) => (
                                            <label
                                                key={industry.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                    formData.industryIds.includes(industry.id)
                                                        ? "bg-primary-50 border-primary-200"
                                                        : "bg-white border-neutral-200 hover:border-primary-200"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                                    checked={formData.industryIds.includes(industry.id)}
                                                    disabled={isReadOnly}
                                                    onChange={(e) =>
                                                        handleIndustryChange(
                                                            industry.id,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {industry.name}
                                                </span>
                                            </label>
                                        ))}
                                        {!filteredIndustries.length && (
                                            <div className="col-span-2 text-center text-sm text-neutral-500 py-6">
                                                Không tìm thấy ngành phù hợp
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    disabled={isReadOnly}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                                >
                                    <option value="">-- Chọn trạng thái --</option>
                                    <option value="Planned">Đã lên kế hoạch</option>
                                    <option value="Ongoing">Đang thực hiện</option>
                                    <option value="Completed">Đã hoàn thành</option>
                                </select>
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
                                        ✅ Cập nhật dự án thành công! Đang chuyển hướng...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Link
                            to={`/sales/projects/${id}`}
                            className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
                        >
                            <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            Hủy
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || isReadOnly}
                            className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
