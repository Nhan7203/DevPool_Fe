import { useEffect, useState } from "react";
import { Search, Filter, UserPlus, Mail, Phone, Code, CheckCircle2, XCircle, Clock, UserCircle } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/admin/SidebarItems";
import { talentService, type Talent, type TalentFilter, type CreateDeveloperAccountModel } from "../../../services/Talent";

type StatusFilter = "All" | "Working" | "Available" | "OnProject" | "Inactive";

export default function TalentListPage() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState<Talent | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Fetch talents from API
  const fetchTalents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filter: TalentFilter = {
        fullName: query || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
        excludeDeleted: true,
      };

      const result = await talentService.getAll(filter);
      // Đảm bảo result là array
      const talentsArray = Array.isArray(result) ? result : (result?.items || []);
      setTalents(talentsArray);
    } catch (err: any) {
      console.error("❌ Lỗi khi tải danh sách talent:", err);
      setError(err.message || "Không thể tải danh sách talent");
    } finally {
      setLoading(false);
    }
  };

  // Load talents on component mount and when filters change
  useEffect(() => {
    fetchTalents();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTalents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleCreateAccount = async (talent: Talent) => {
    if (!talent.email) {
      alert("Talent không có email, không thể cấp tài khoản");
      return;
    }

    setIsCreatingAccount(true);
    try {
      // Gọi API tạo developer account (Workflow 4.3)
      // API sẽ tự động validate: Talent.Status == Working AND Talent.UserId == null
      // Tạo user account với role=Dev, link đến talent, và gửi email credentials
      const payload: CreateDeveloperAccountModel = {
        email: talent.email,
      };

      const result = await talentService.createDeveloperAccount(talent.id, payload);
      
      if (result.success) {
        alert(`Đã cấp tài khoản thành công cho ${talent.fullName}.\nEmail: ${talent.email}\nMật khẩu đã được gửi qua email.`);
        setShowCreateAccountModal(null);
        await fetchTalents(); // Refresh danh sách
      } else {
        alert(result.message || "Không thể cấp tài khoản. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi cấp tài khoản:", err);
      let errorMessage = "Không thể cấp tài khoản. Vui lòng thử lại.";
      if (err && typeof err === 'object') {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Working":
        return {
          label: "Đang làm việc",
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case "Available":
        return {
          label: "Sẵn sàng",
          color: "bg-blue-100 text-blue-700",
          icon: <Clock className="w-4 h-4" />,
        };
      case "OnProject":
        return {
          label: "Đang trong dự án",
          color: "bg-purple-100 text-purple-700",
          icon: <Code className="w-4 h-4" />,
        };
      case "Inactive":
        return {
          label: "Không hoạt động",
          color: "bg-gray-100 text-gray-700",
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-700",
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

  const filteredTalents = talents.filter((talent) => {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return (
      talent.fullName.toLowerCase().includes(searchLower) ||
      talent.email.toLowerCase().includes(searchLower) ||
      (talent.phone && talent.phone.includes(searchLower))
    );
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />

      <div className="flex-1 p-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Talent (Developer)</h1>
            <p className="text-neutral-600 mt-1">
              Xem danh sách talent và cấp tài khoản cho talent đang làm việc.
            </p>
          </div>
        </header>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Tìm theo tên, email, số điện thoại"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
          >
            <Filter className="w-4 h-4" /> {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Trạng thái</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="All">Tất cả</option>
                <option value="Working">Đang làm việc</option>
                <option value="Available">Sẵn sàng</option>
                <option value="OnProject">Đang trong dự án</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => fetchTalents()}
              className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-4 py-3">Talent</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tài khoản</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        Đang tải danh sách talent...
                      </div>
                    </td>
                  </tr>
                ) : filteredTalents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      Không có talent phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredTalents.map((talent) => {
                    const statusBadge = getStatusBadge(talent.status);
                    const hasAccount = !!talent.userId;
                    const canCreateAccount = talent.status === "Working" && !hasAccount;

                    return (
                      <tr key={talent.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                              <UserCircle className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{talent.fullName}</div>
                              <div className="text-sm text-gray-600">ID: {talent.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {talent.email && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {talent.email}
                              </div>
                            )}
                            {talent.phone && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {talent.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-xs font-medium">
                              <CheckCircle2 className="w-4 h-4" /> Đã có tài khoản
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium">
                              <XCircle className="w-4 h-4" /> Chưa có tài khoản
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {canCreateAccount ? (
                            <button
                              onClick={() => setShowCreateAccountModal(talent)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              Cấp tài khoản
                            </button>
                          ) : hasAccount ? (
                            <span className="text-sm text-gray-400">Đã có tài khoản</span>
                          ) : (
                            <span className="text-sm text-gray-400">Chưa đủ điều kiện</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Cấp tài khoản cho Talent</h3>
              <button
                onClick={() => setShowCreateAccountModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
                disabled={isCreatingAccount}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Tên:</span>
                  <p className="font-medium text-gray-900">{showCreateAccountModal.fullName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{showCreateAccountModal.email}</p>
                </div>
                {showCreateAccountModal.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <p className="font-medium text-gray-900">{showCreateAccountModal.phone}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Vai trò:</span>
                  <p className="font-medium text-gray-900">Developer</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Mật khẩu sẽ được tự động tạo và gửi qua email <strong>{showCreateAccountModal.email}</strong>
              </p>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateAccountModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                disabled={isCreatingAccount}
              >
                Hủy
              </button>
              <button
                onClick={() => handleCreateAccount(showCreateAccountModal)}
                disabled={isCreatingAccount}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAccount ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Xác nhận cấp tài khoản"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

