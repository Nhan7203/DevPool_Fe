import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  Building2,
  Globe2,
  Factory,
  CheckCircle,
  Plus,
  Save,
  AlertCircle,
  X,
  Search,
  Layers
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
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
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<
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

  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industrySearch, setIndustrySearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [marketSearch, setMarketSearch] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    if (name === "industryIds") return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const filteredClients = clients.filter((c) =>
    !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredMarkets = markets.filter((m) =>
    !marketSearch || m.name.toLowerCase().includes(marketSearch.toLowerCase())
  );

  const toUTCDateString = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xác nhận trước khi tạo
    const confirmed = window.confirm("Bạn có chắc chắn muốn tạo dự án mới không?");
    if (!confirmed) {
      return;
    }
    
    setFormLoading(true);
    setError("");
    setSuccess(false);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    // Validation: Tên dự án (bắt buộc)
    if (!form.name?.trim()) {
      errors.name = "Tên dự án không được để trống!";
    }

    // Validation: Ngày bắt đầu (bắt buộc)
    if (!form.startDate?.trim()) {
      errors.startDate = "Ngày bắt đầu không được để trống!";
    }

    // Validation: Công ty khách hàng (bắt buộc)
    if (!form.clientCompanyId) {
      errors.clientCompanyId = "Vui lòng chọn công ty khách hàng!";
    }

    // Validation: Thị trường (bắt buộc)
    if (!form.marketId) {
      errors.marketId = "Vui lòng chọn thị trường!";
    }

    // Validation: Ngành (bắt buộc - ít nhất 1 ngành)
    if (!form.industryIds || form.industryIds.length === 0) {
      errors.industryIds = "Vui lòng chọn ít nhất một ngành!";
    }

    // Validation: Trạng thái (bắt buộc)
    if (!form.status?.trim()) {
      errors.status = "Vui lòng chọn trạng thái dự án!";
    }

    // Validation: Ngày kết thúc phải sau ngày bắt đầu (nếu có)
    if (form.endDate && form.startDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      if (endDate < startDate) {
        errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu!";
      }
    }

    // Nếu có lỗi validation, hiển thị lỗi đầu tiên và dừng
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setError(firstError);
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
        industryIds: form.industryIds.map((id) => Number(id)),
      };

      await projectService.create(payload);
      setSuccess(true);
      setTimeout(() => navigate("/sales/projects"), 1500);
    } catch (err) {
      console.error("❌ Lỗi tạo dự án:", err);
      setError("Không thể tạo dự án. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
    }
  };

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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
          {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Breadcrumb
            items={[
              { label: "Dự án", to: "/sales/projects" },
              { label: "Tạo dự án mới" }
            ]}
          />

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo dự án mới</h1>
              <p className="text-neutral-600 mb-4">
                Thêm thông tin dự án khách hàng vào hệ thống DevPool
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">
                  Tạo dự án mới
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
                  <Layers className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin dự án</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Tên dự án */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Tên dự án <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                name="name"
                value={form.name}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.name;
                      return newErrors;
                    });
                  }
                }}
                  required
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    fieldErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-200 focus:border-primary-500"
                  }`}
                placeholder="VD: Hệ thống quản lý nhân sự"
              />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả dự án
                </label>
                <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                  rows={3}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white resize-none"
                placeholder="Nhập mô tả ngắn gọn về dự án..."
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
                    value={form.startDate}
                    onChange={(e) => {
                      handleChange(e);
                      if (fieldErrors.startDate) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.startDate;
                          return newErrors;
                        });
                      }
                    }}
                    required
                    max={form.endDate || undefined}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      fieldErrors.startDate
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate ?? ""}
                    onChange={(e) => {
                      handleChange(e);
                      if (fieldErrors.endDate) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.endDate;
                          return newErrors;
                        });
                      }
                    }}
                    min={form.startDate || undefined}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                      fieldErrors.endDate
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.endDate}
                    </p>
                  )}
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
              {/* Công ty khách hàng - popover có ô tìm kiếm */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Công ty khách hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCompanyDropdownOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white text-left focus:ring-primary-500 ${
                      fieldErrors.clientCompanyId
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                      <span>
                        {form.clientCompanyId
                          ? clients.find((c) => c.id === Number(form.clientCompanyId))?.name || "Chọn công ty"
                          : "Chọn công ty"}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs uppercase">Chọn</span>
                  </button>
                  {isCompanyDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      <div className="p-3 border-b border-neutral-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            value={companySearch}
                            onChange={(e) => setCompanySearch(e.target.value)}
                            placeholder="Tìm công ty..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, clientCompanyId: undefined }));
                            setCompanySearch("");
                            setIsCompanyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm ${
                            !form.clientCompanyId
                              ? "bg-primary-50 text-primary-700"
                              : "hover:bg-neutral-50 text-neutral-700"
                          }`}
                        >
                          Tất cả công ty
                        </button>
                        {filteredClients.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy công ty phù hợp</p>
                        ) : (
                          filteredClients.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, clientCompanyId: c.id }));
                                setIsCompanyDropdownOpen(false);
                                if (fieldErrors.clientCompanyId) {
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.clientCompanyId;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm ${
                                form.clientCompanyId === c.id
                                  ? "bg-primary-50 text-primary-700"
                                  : "hover:bg-neutral-50 text-neutral-700"
                              }`}
                            >
                              {c.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {fieldErrors.clientCompanyId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.clientCompanyId}
                  </p>
                )}
              </div>

              {/* Thị trường - popover có ô tìm kiếm */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  Thị trường <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMarketDropdownOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white text-left focus:ring-primary-500 ${
                      fieldErrors.marketId
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-primary-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Globe2 className="w-4 h-4 text-neutral-400" />
                      <span>
                        {form.marketId
                          ? markets.find((m) => m.id === Number(form.marketId))?.name || "Chọn thị trường"
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
                            setForm((prev) => ({ ...prev, marketId: undefined }));
                            setMarketSearch("");
                            setIsMarketDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm ${
                            !form.marketId
                              ? "bg-primary-50 text-primary-700"
                              : "hover:bg-neutral-50 text-neutral-700"
                          }`}
                        >
                          Tất cả thị trường
                        </button>
                        {filteredMarkets.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy thị trường phù hợp</p>
                        ) : (
                          filteredMarkets.map((m) => (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, marketId: m.id }));
                                setIsMarketDropdownOpen(false);
                                if (fieldErrors.marketId) {
                                  setFieldErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.marketId;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm ${
                                form.marketId === m.id
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
                {fieldErrors.marketId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.marketId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Factory className="w-4 h-4" />
                  Ngành <span className="text-red-500">*</span>
                </label>
                <div className={`bg-neutral-50 border rounded-2xl p-4 space-y-4 ${
                  fieldErrors.industryIds
                    ? "border-red-500"
                    : "border-neutral-200"
                }`}>
                  <div className="relative">
                    <input
                      type="text"
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
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
                      Đã chọn: <span className="font-semibold">{form.industryIds.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, industryIds: [] }))}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {filteredIndustries.map((industry) => (
                      <label
                        key={industry.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                          form.industryIds.includes(industry.id)
                            ? "bg-primary-50 border-primary-200"
                            : "bg-white border-neutral-200 hover:border-primary-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          checked={form.industryIds.includes(industry.id)}
                          onChange={(e) => {
                            const newIndustryIds = e.target.checked
                              ? [...form.industryIds, industry.id]
                              : form.industryIds.filter((id) => id !== industry.id);
                            setForm((prev) => ({ ...prev, industryIds: newIndustryIds }));
                            if (fieldErrors.industryIds && newIndustryIds.length > 0) {
                              setFieldErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.industryIds;
                                return newErrors;
                              });
                            }
                          }}
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
                {fieldErrors.industryIds && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.industryIds}
                  </p>
                )}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                name="status"
                value={form.status || ""}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.status) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.status;
                      return newErrors;
                    });
                  }
                }}
                required
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-primary-500 bg-white ${
                    fieldErrors.status
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-200 focus:border-primary-500"
                  }`}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Planned">Đã lên kế hoạch</option>
                  <option value="Ongoing">Đang thực hiện</option>
                  <option value="Completed">Đã hoàn thành</option>
                </select>
                {fieldErrors.status && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.status}
                  </p>
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
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    ✅ Tạo dự án thành công! Đang chuyển hướng...
                  </p>
      </div>
              )}
    </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/sales/projects"
              className="group flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 hover:scale-105 transform"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Hủy
            </Link>
            <button
              type="submit"
              disabled={formLoading}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Tạo dự án
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

