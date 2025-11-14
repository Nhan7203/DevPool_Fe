import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  FileText,
  Building2,
  Globe2,
  Factory,
  CheckCircle,
  ArrowLeft,
  Plus,
  Save,
  AlertCircle,
  X
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

  const toggleIndustry = (id: number, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      industryIds: checked
        ? [...prev.industryIds, id]
        : prev.industryIds.filter((selectedId) => selectedId !== id),
    }));
  };

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

    if (!form.name?.trim()) {
      setError("Tên dự án không được để trống!");
      setFormLoading(false);
      return;
    }

    try {
      if (!form.industryIds || form.industryIds.length === 0) {
        setError("Vui lòng chọn ít nhất một ngành");
        setFormLoading(false);
        return;
      }

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
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/sales/projects"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại danh sách</span>
            </Link>
          </div>

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
                value={form.name}
                onChange={handleChange}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                placeholder="VD: Hệ thống quản lý nhân sự"
              />
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
                    onChange={handleChange}
                    required
                    max={form.endDate || undefined}
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
                    value={form.endDate ?? ""}
                    onChange={handleChange}
                    min={form.startDate || undefined}
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
              {/* Công ty khách hàng */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Công ty khách hàng <span className="text-red-500">*</span>
                </label>
                <select
                name="clientCompanyId"
                value={form.clientCompanyId?.toString() || ""}
                onChange={handleChange}
                required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="">-- Chọn công ty --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thị trường & Ngành */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  Thị trường <span className="text-red-500">*</span>
                </label>
                <select
                  name="marketId"
                  value={form.marketId?.toString() || ""}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="">-- Chọn thị trường --</option>
                  {markets.map((m) => (
                    <option key={m.id} value={m.id.toString()}>
                      {m.name}
                    </option>
                  ))}
                </select>
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
                          onChange={(e) => toggleIndustry(industry.id, e.target.checked)}
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
                  Trạng thái
                </label>
                <select
                name="status"
                value={form.status || ""}
                onChange={handleChange}
                required
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

