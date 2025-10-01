import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Filter,
    Plus,
    KeyRound,
    MoreVertical,
    Trash2,
    Pencil,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/admin/SidebarItems";

// ==========================
// Types
// ==========================
export type Permission = {
    id: string;
    code: string; // e.g. "contract.read"
    name: string; // e.g. "Xem hợp đồng"
    module?: string; // e.g. "Contract"
    description?: string;
};

export type Role = {
    id: string;
    name: string; // e.g. "Staff HR"
    description?: string;
    isSystem?: boolean; // true => không cho xóa
    permissions: string[]; // permission ids
};

// ==========================
// Mock data (thay bằng API)
// ==========================
const MOCK_PERMS: Permission[] = [
    { id: "p1", code: "talent.read", name: "Xem hồ sơ Talent", module: "Talent" },
    { id: "p2", code: "talent.write", name: "Sửa hồ sơ Talent", module: "Talent" },
    { id: "p3", code: "jobrequest.read", name: "Xem yêu cầu tuyển", module: "Sales" },
    { id: "p4", code: "workreport.read", name: "Xem WorkReport", module: "Finance" },
    { id: "p5", code: "invoice.issue", name: "Phát hành hóa đơn", module: "Finance" },
    { id: "p6", code: "contract.sign", name: "Phê duyệt hợp đồng", module: "Contract" },
];

const MOCK_ROLES: Role[] = [
    {
        id: "r1",
        name: "Admin",
        description: "Toàn quyền cấu hình & bảo mật",
        isSystem: true,
        permissions: MOCK_PERMS.map((p) => p.id),
    },
    {
        id: "r2",
        name: "Manager",
        description: "Quản lý kinh doanh & duyệt",
        permissions: ["p3", "p4", "p6"],
    },
    {
        id: "r3",
        name: "Staff HR",
        description: "Quản lý hồ sơ & pipeline",
        permissions: ["p1", "p2", "p3"],
    },
];

// ==========================
// Helpers
// ==========================
function groupBy<T, K extends keyof T>(items: T[], key: K, fallback = "Khác") {
    return items.reduce<Record<string, T[]>>((acc, item) => {
        const k = String((item[key] ?? fallback) as unknown);
        (acc[k] ||= []).push(item);
        return acc;
    }, {});
}


export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [perms, setPerms] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [assignRole, setAssignRole] = useState<Role | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    // Replace with real API calls
    useEffect(() => {
        const t = setTimeout(() => {
            setPerms(MOCK_PERMS);
            setRoles(MOCK_ROLES);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        return roles.filter((r) => `${r.name} ${r.description}`.toLowerCase().includes(search.toLowerCase()));
    }, [roles, search]);

    function createRole(payload: Pick<Role, "name" | "description">) {
        // POST '/admin/users/roles'
        const newRole: Role = {
            id: Math.random().toString(36).slice(2, 9),
            name: payload.name,
            description: payload.description,
            isSystem: false,
            permissions: [],
        };
        setRoles((r) => [newRole, ...r]);
    }

    function updateRole(id: string, payload: Partial<Role>) {
        // PATCH `/admin/users/roles/${id}`
        setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
    }

    function removeRole(id: string) {
        // DELETE `/admin/users/roles/${id}`
        setRoles((prev) => prev.filter((r) => r.id !== id));
    }

    function saveRolePermissions(id: string, permissionIds: string[]) {
        // PUT `/admin/users/roles/${id}/permissions`
        updateRole(id, { permissions: permissionIds });
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Admin" />

            <div className="flex-1 p-8">
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Phân quyền – Roles</h1>
                        <p className="text-neutral-600 mt-1">Tạo/sửa vai trò và gán permissions cho từng vai trò.</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                    >
                        <Plus className="w-5 h-5" /> Thêm vai trò
                    </button>
                </header>

                {/* Search + Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[260px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                placeholder="Tìm theo tên/ghi chú"
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

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Mô tả</th>
                                    <th className="px-4 py-3">Số permission</th>
                                    <th className="px-4 py-3">Hệ thống</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-500">Đang tải...</td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-500">Không có vai trò phù hợp.</td>
                                    </tr>
                                ) : (
                                    filtered.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/70">
                                            <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                                            <td className="px-4 py-3 text-gray-700">{r.description ?? "—"}</td>
                                            <td className="px-4 py-3">{r.permissions.length}</td>
                                            <td className="px-4 py-3">
                                                {r.isSystem ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-xs font-medium">
                                                        <CheckCircle2 className="w-4 h-4" /> System
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium">
                                                        <XCircle className="w-4 h-4" /> Custom
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                                                    className="p-2 rounded-lg hover:bg-gray-100"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {menuOpen === r.id && (
                                                    <div className="absolute right-4 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-10">
                                                        <button
                                                            onClick={() => {
                                                                setEditRole(r);
                                                                setMenuOpen(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Pencil className="w-4 h-4" /> Sửa thông tin
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAssignRole(r);
                                                                setMenuOpen(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <KeyRound className="w-4 h-4" /> Gán permissions
                                                        </button>
                                                        {!r.isSystem && (
                                                            <button
                                                                onClick={() => {
                                                                    removeRole(r.id);
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Xóa vai trò
                                                            </button>
                                                        )}
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

                {/* Create/Edit Modal */}
                {showCreate && (
                    <RoleModal
                        title="Thêm vai trò"
                        onClose={() => setShowCreate(false)}
                        onSubmit={(payload) => {
                            createRole(payload);
                            setShowCreate(false);
                        }}
                    />
                )}

                {editRole && (
                    <RoleModal
                        title="Cập nhật vai trò"
                        initial={editRole}
                        onClose={() => setEditRole(null)}
                        onSubmit={(payload) => {
                            updateRole(editRole.id, payload);
                            setEditRole(null);
                        }}
                    />
                )}

                {/* Assign Permissions */}
                {assignRole && (
                    <AssignPermissionsModal
                        role={assignRole}
                        allPermissions={perms}
                        onClose={() => setAssignRole(null)}
                        onSubmit={(ids) => {
                            saveRolePermissions(assignRole.id, ids);
                            setAssignRole(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ==========================
// Modals
// ==========================
function RoleModal({
    title,
    initial,
    onSubmit,
    onClose,
}: {
    title: string;
    initial?: Partial<Role>;
    onSubmit: (payload: Pick<Role, "name" | "description">) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");

    return (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm text-gray-600">Tên vai trò</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                            placeholder="VD: Staff HR"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 min-h-[80px]"
                            placeholder="Ghi chú về phạm vi và trách nhiệm"
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">Hủy</button>
                    <button
                        onClick={() => onSubmit({ name, description })}
                        className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

function AssignPermissionsModal({
    role,
    allPermissions,
    onSubmit,
    onClose,
}: {
    role: Role;
    allPermissions: Permission[];
    onSubmit: (permissionIds: string[]) => void;
    onClose: () => void;
}) {
    const [term, setTerm] = useState("");
    const [selected, setSelected] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(allPermissions.map((p) => [p.id, role.permissions.includes(p.id)]))
    );

    const filtered = useMemo(() => {
        return allPermissions.filter((p) => `${p.code} ${p.name} ${p.module ?? ""}`.toLowerCase().includes(term.toLowerCase()));
    }, [allPermissions, term]);

    const byModule = groupBy(filtered, "module");

    function toggleAllModule(module: string, value: boolean) {
        const ids = (byModule[module] || []).map((p) => p.id);
        setSelected((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, value])) }));
    }

    return (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Gán permissions cho "{role.name}"</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">✕</button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200"
                            placeholder="Lọc theo code/tên/module"
                        />
                    </div>

                    {Object.entries(byModule).map(([module, list]) => (
                        <div key={module} className="border border-gray-100 rounded-xl">
                            <div className="px-4 py-3 bg-gray-50 rounded-t-xl flex items-center justify-between">
                                <div className="font-medium text-gray-900">{module}</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAllModule(module, true)}
                                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100"
                                    >
                                        Chọn tất cả
                                    </button>
                                    <button
                                        onClick={() => toggleAllModule(module, false)}
                                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100"
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 grid md:grid-cols-2 gap-2">
                                {list.map((p) => (
                                    <label key={p.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={!!selected[p.id]}
                                            onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.currentTarget.checked }))}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{p.name}</div>
                                            <div className="text-xs font-mono text-gray-600">{p.code}</div>
                                            {p.description && (
                                                <div className="text-xs text-gray-500">{p.description}</div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">Hủy</button>
                    <button
                        onClick={() => onSubmit(Object.keys(selected).filter((id) => selected[id]))}
                        className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}