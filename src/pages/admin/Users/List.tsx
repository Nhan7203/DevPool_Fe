import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, Shield, ShieldCheck, ShieldX, MoreVertical, UserRound, RefreshCw, Lock, Unlock, Trash2, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import { sidebarItems } from "../../../components/admin/SidebarItems";
import Sidebar from "../../../components/common/Sidebar";

// ------ Types ------
export type SystemRole =
  | "Admin"
  | "Manager"
  | "Staff HR"
  | "Staff Sales"
  | "Staff Accountant"
  | "Developer";

type StatusFilter = "All" | "Active" | "Inactive";

// Options
const ROLE_OPTIONS = [
  "Admin",
  "Manager",
  "Staff HR",
  "Staff Sales",
  "Staff Accountant",
  "Developer",
] as const satisfies readonly SystemRole[];


type UserRow = {
  id: string;
  fullName: string;
  avatar?: string;
  email: string;
  phone?: string;
  roles: SystemRole[];
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string; // ISO string
};

// ------ Mock API (replace with real endpoints) ------
const mockUsers: UserRow[] = [
  {
    id: "u-001",
    fullName: "Trần Minh Quân",
    email: "quan.tran@devpool.com",
    phone: "0901 222 333",
    roles: ["Admin"],
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "u-002",
    fullName: "Nguyễn Thu Hà",
    email: "ha.nguyen@devpool.com",
    phone: "0909 111 888",
    roles: ["Manager"],
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "u-003",
    fullName: "Lê Hải Nam",
    email: "nam.le@devpool.com",
    phone: "0934 567 890",
    roles: ["Staff HR"],
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "u-004",
    fullName: "Phạm Bảo Anh",
    email: "anh.pham@devpool.com",
    phone: "0978 555 666",
    roles: ["Staff Sales"],
    isActive: false,
    mfaEnabled: false,
    lastLoginAt: undefined,
  },
  {
    id: "u-005",
    fullName: "Đỗ Kiều My",
    email: "my.do@devpool.com",
    phone: "0967 101 202",
    roles: ["Staff Accountant"],
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "u-006",
    fullName: "Vũ Đức Long",
    email: "long.vu@devpool.com",
    phone: "0912 000 777",
    roles: ["Developer"],
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Helper
const roleColors: Record<SystemRole, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Manager: "bg-amber-100 text-amber-700",
  "Staff HR": "bg-blue-100 text-blue-700",
  "Staff Sales": "bg-sky-100 text-sky-700",
  "Staff Accountant": "bg-teal-100 text-teal-700",
  Developer: "bg-green-100 text-green-700",
};

function formatRelative(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// ------ Page Component ------
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | SystemRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<null | UserRow>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Simulate API load
  useEffect(() => {
    const t = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQ = `${u.fullName} ${u.email} ${u.phone ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesRole = roleFilter === "All" ? true : u.roles.includes(roleFilter);
      const matchesStatus =
        statusFilter === "All" ? true : statusFilter === "Active" ? u.isActive : !u.isActive;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  function toggleAll(v: boolean) {
    const map: Record<string, boolean> = {};
    filtered.forEach((u) => (map[u.id] = v));
    setSelected(map);
  }

  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function resetMFA(ids: string[]) {
    // TODO: call POST /users/:id/reset-mfa
    alert(`Đã gửi yêu cầu reset MFA cho: ${ids.join(", ")}`);
  }

  function setActive(ids: string[], active: boolean) {
    // TODO: PATCH /users/bulk-status
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, isActive: active } : u)));
  }

  function removeUsers(ids: string[]) {
    // TODO: DELETE /users/bulk
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    setSelected({});
  }
  // Guards
  function isSystemRole(v: string): v is SystemRole {
    return (ROLE_OPTIONS as readonly string[]).includes(v);
  }

  // Handlers
  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "All") setRoleFilter("All");
    else if (isSystemRole(v)) setRoleFilter(v);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as StatusFilter;
    setStatusFilter(v);
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />

      <div className="flex-1 p-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
            <p className="text-neutral-600 mt-1">
              Tạo/sửa tài khoản, phân quyền vai trò, reset MFA/SSO và vô hiệu hóa khi cần.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" /> Thêm người dùng
          </button>
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Vai trò</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                value={roleFilter}
                onChange={handleRoleChange}
              >
                <option value="All">Tất cả</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Trạng thái</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Tác vụ hàng loạt</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActive(Object.keys(selected).filter((k) => selected[k]), true)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Unlock className="w-4 h-4 inline mr-1" /> Mở khóa
                </button>
                <button
                  onClick={() => setActive(Object.keys(selected).filter((k) => selected[k]), false)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Lock className="w-4 h-4 inline mr-1" /> Vô hiệu hóa
                </button>
                <button
                  onClick={() => resetMFA(Object.keys(selected).filter((k) => selected[k]))}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" /> Reset MFA
                </button>
                <button
                  onClick={() => removeUsers(Object.keys(selected).filter((k) => selected[k]))}
                  className="px-3 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" /> Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAll(e.currentTarget.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">MFA</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Đăng nhập gần nhất</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      Đang tải người dùng...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      Không có người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[u.id]}
                          onChange={() => toggleOne(u.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                            <UserRound className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.fullName}</div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" />{u.email}</span>
                              {u.phone && (
                                <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" />{u.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {u.roles.map((r) => (
                            <span key={r} className={`px-2 py-1 rounded-lg text-xs font-medium ${roleColors[r]}`}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.mfaEnabled ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-lg text-xs font-medium">
                            <ShieldCheck className="w-4 h-4" /> Bật
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium">
                            <ShieldX className="w-4 h-4" /> Tắt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-lg text-xs font-medium">
                            <XCircle className="w-4 h-4" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatRelative(u.lastLoginAt)}</td>
                      <td className="px-4 py-3 text-right relative">
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100"
                          onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                          aria-label="More"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {menuOpen === u.id && (
                          <div className="absolute right-4 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-10">
                            <button
                              onClick={() => {
                                setShowEdit(u);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" /> Sửa vai trò / thông tin
                            </button>
                            <button
                              onClick={() => {
                                setActive([u.id], !u.isActive);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {u.isActive ? (
                                <>
                                  <Lock className="w-4 h-4" /> Vô hiệu hóa
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-4 h-4" /> Mở khóa
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                resetMFA([u.id]);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" /> Reset MFA/SSO
                            </button>
                            <button
                              onClick={() => {
                                removeUsers([u.id]);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Xóa người dùng
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <UserModal
            title="Thêm người dùng"
            onClose={() => setShowCreate(false)}
            onSubmit={(payload) => {
              const newUser: UserRow = {
                id: `u-${Math.random().toString(36).slice(2, 8)}`,
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                roles: payload.roles,
                isActive: true,
                mfaEnabled: false,
                lastLoginAt: undefined,
              };
              setUsers((u) => [newUser, ...u]);
              setShowCreate(false);
            }}
          />
        )}

        {/* Edit Modal */}
        {showEdit && (
          <UserModal
            title="Cập nhật người dùng"
            initial={showEdit}
            onClose={() => setShowEdit(null)}
            onSubmit={(payload) => {
              setUsers((prev) =>
                prev.map((u) => (u.id === showEdit.id ? { ...u, ...payload } : u))
              );
              setShowEdit(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ------ Modal Component ------
function UserModal({
  title,
  initial,
  onSubmit,
  onClose,
}: {
  title: string;
  initial?: Partial<UserRow>;
  onSubmit: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    roles: SystemRole[];
  }) => void;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [roles, setRoles] = useState<SystemRole[]>(
    (initial?.roles as SystemRole[]) ?? []
  );

  function toggleRole(r: SystemRole) {
    setRoles((cur) =>
      cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]
    );
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Họ và tên</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                placeholder="VD: Nguyễn Văn B"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                placeholder="email@devpool.com"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                placeholder="09xx xxx xxx"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Vai trò & quyền</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  "Admin",
                  "Manager",
                  "Staff HR",
                  "Staff Sales",
                  "Staff Accountant",
                  "Developer",
                ] as SystemRole[]
              ).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${roles.includes(r)
                    ? "border-transparent bg-primary-600 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {roles.includes(r) ? <ShieldCheck className="w-4 h-4 inline mr-1" /> : <Shield className="w-4 h-4 inline mr-1" />}
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gợi ý: 1 người dùng có thể có nhiều vai trò. Quyền chi tiết nên kiểm soát ở BE (RBAC) theo mô tả nghiệp vụ.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={() => onSubmit({ fullName, email, phone, roles })}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
