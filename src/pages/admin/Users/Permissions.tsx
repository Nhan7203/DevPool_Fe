import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Trash2,
    Pencil,
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


// ==========================
// Helpers
// ==========================

const groupBy = <T, K extends string | number | symbol>(items: T[], key: keyof T): Record<K, T[]> => {
    return items.reduce((result, item) => {
        const groupKey = item[key] as K;
        (result[groupKey] ||= []).push(item);
        return result;
    }, {} as Record<K, T[]>);
}

// ==========================
// Roles Page
// ==========================


// ==========================
// Permissions Page
// ==========================
export function PermissionsPage() {
    const [perms, setPerms] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [editPerm, setEditPerm] = useState<Permission | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setPerms(MOCK_PERMS);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        return perms.filter((p) => `${p.code} ${p.name} ${p.module ?? ""}`.toLowerCase().includes(search.toLowerCase()));
    }, [perms, search]);

    function upsert(payload: Omit<Permission, "id"> & { id?: string }) {
        if (payload.id) {
            // PATCH `/admin/users/permissions/${payload.id}`
            setPerms((prev) => prev.map((p) => (p.id === payload.id ? { ...(p as Permission), ...payload } : p)));
        } else {
            // POST '/admin/users/permissions'
            const newP: Permission = { id: Math.random().toString(36).slice(2, 9), ...payload };
            setPerms((prev) => [newP, ...prev]);
        }
    }

    function remove(id: string) {
        // DELETE `/admin/users/permissions/${id}`
        setPerms((prev) => prev.filter((p) => p.id !== id));
    }

    const grouped = groupBy(filtered, "module");

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar items={sidebarItems} title="Admin" />

            <div className="flex-1 p-8">
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
                        <p className="text-neutral-600 mt-1">Quản lý danh sách quyền truy cập chi tiết (CRUD theo module/hành động).</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                    >
                        <Plus className="w-5 h-5" /> Thêm permission
                    </button>
                </header>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            placeholder="Tìm theo code/tên/module"
                        />
                    </div>
                </div>

                {/* Grouped list by module */}
                <div className="space-y-6">
                    {Object.keys(grouped).length === 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
                            {loading ? "Đang tải..." : "Không có permission phù hợp."}
                        </div>
                    )}

                    {Object.entries(grouped).map(([module, list]) => (
                        <div key={module} className="bg-white rounded-2xl border border-gray-200 shadow-soft">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">{module}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                        <tr>
                                            <th className="px-4 py-3">Code</th>
                                            <th className="px-4 py-3">Tên</th>
                                            <th className="px-4 py-3">Mô tả</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {list.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/70">
                                                <td className="px-4 py-3 font-mono text-sm text-gray-900">{p.code}</td>
                                                <td className="px-4 py-3 text-gray-900">{p.name}</td>
                                                <td className="px-4 py-3 text-gray-700">{p.description ?? "—"}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEditPerm(p)}
                                                            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-2"
                                                        >
                                                            <Pencil className="w-4 h-4" /> Sửa
                                                        </button>
                                                        <button
                                                            onClick={() => remove(p.id)}
                                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create/Edit Modal */}
                {showCreate && (
                    <PermissionModal
                        title="Thêm permission"
                        onClose={() => setShowCreate(false)}
                        onSubmit={(payload) => {
                            upsert(payload);
                            setShowCreate(false);
                        }}
                    />
                )}
                {editPerm && (
                    <PermissionModal
                        title="Cập nhật permission"
                        initial={editPerm}
                        onClose={() => setEditPerm(null)}
                        onSubmit={(payload) => {
                            upsert({ ...payload, id: editPerm.id });
                            setEditPerm(null);
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


function PermissionModal({
    title,
    initial,
    onSubmit,
    onClose,
}: {
    title: string;
    initial?: Partial<Permission>;
    onSubmit: (payload: Omit<Permission, "id">) => void;
    onClose: () => void;
}) {
    const [code, setCode] = useState(initial?.code ?? "");
    const [name, setName] = useState(initial?.name ?? "");
    const [module, setModule] = useState(initial?.module ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");

    return (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">✕</button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Code</label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                            placeholder="vd: contract.read"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Tên</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                            placeholder="Xem hợp đồng"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Module</label>
                        <input
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
                            placeholder="Contract / Finance / Sales ..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 min-h-[80px]"
                            placeholder="Giải thích ngắn gọn về quyền này"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">Hủy</button>
                    <button
                        onClick={() => onSubmit({ code, name, module, description })}
                        className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
