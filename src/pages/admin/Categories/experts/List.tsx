import { useEffect, useState } from "react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { expertService, type Expert } from "../../../../services/Expert";
import { type Partner, partnerService } from "../../../../services/Partner";
import { Button } from "../../../../components/ui/button";
import {
  Search,
  Plus,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpertListPage() {
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyPartnerRepresentative, setOnlyPartnerRepresentative] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newExpert, setNewExpert] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    specialization: "",
    isPartnerRepresentative: false,
    partnerId: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expertsData, partnersData] = await Promise.all([
          expertService.getAll({ excludeDeleted: true }),
          partnerService.getAll(),
        ]);

        const expertArr = Array.isArray(expertsData) ? expertsData : [];
        setExperts(expertArr);
        setFilteredExperts(expertArr);

        const partnerArr = Array.isArray(partnersData)
          ? partnersData
          : Array.isArray((partnersData as any)?.items)
          ? (partnersData as any).items
          : Array.isArray((partnersData as any)?.data)
          ? (partnersData as any).data
          : [];
        setPartners(partnerArr);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách expert:", err);
        setExperts([]);
        setFilteredExperts([]);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter theo search + onlyPartnerRepresentative
  useEffect(() => {
    let list = [...experts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          (e.email && e.email.toLowerCase().includes(term)) ||
          (e.company && e.company.toLowerCase().includes(term)) ||
          (e.specialization && e.specialization.toLowerCase().includes(term))
      );
    }

    if (onlyPartnerRepresentative) {
      list = list.filter((e) => e.isPartnerRepresentative);
    }

    setFilteredExperts(list);
    setCurrentPage(1);
  }, [searchTerm, onlyPartnerRepresentative, experts]);

  // Stats
  const totalExperts = experts.length;
  const partnerRepresentatives = experts.filter((e) => e.isPartnerRepresentative).length;
  const withEmail = experts.filter((e) => e.email && e.email.trim()).length;
  const withSpecialization = experts.filter((e) => e.specialization && e.specialization.trim())
    .length;

  const stats = [
    {
      title: "Tổng chuyên gia",
      value: totalExperts.toString(),
      color: "blue",
    },
    {
      title: "Đại diện đối tác",
      value: partnerRepresentatives.toString(),
      color: "green",
    },
    {
      title: "Có email",
      value: withEmail.toString(),
      color: "purple",
    },
    {
      title: "Có chuyên môn",
      value: withSpecialization.toString(),
      color: "orange",
    },
  ];

  // Pagination calculation
  const totalPages = Math.ceil(filteredExperts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExperts = filteredExperts.slice(startIndex, endIndex);
  const startItem = filteredExperts.length > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, filteredExperts.length);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa chuyên gia này?")) return;
    try {
      await expertService.delete(id);
      setExperts((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("❌ Lỗi khi xóa expert:", err);
      alert("Không thể xóa chuyên gia, vui lòng thử lại.");
    }
  };

  const handleCreate = async () => {
    if (!newExpert.name.trim()) {
      alert("Vui lòng nhập tên chuyên gia.");
      return;
    }

    if (newExpert.isPartnerRepresentative && !newExpert.partnerId) {
      alert("Vui lòng chọn công ty đối tác trước khi đánh dấu là đại diện đối tác.");
      return;
    }

    try {
      setCreating(true);
      const created = await expertService.create({
        name: newExpert.name.trim(),
        email: newExpert.email || undefined,
        phone: newExpert.phone || undefined,
        company: newExpert.company || undefined,
        partnerId: newExpert.partnerId ?? undefined,
        specialization: newExpert.specialization || undefined,
        isPartnerRepresentative: newExpert.isPartnerRepresentative,
      });
      setExperts((prev) => [...prev, created]);
      setShowCreateModal(false);
      setNewExpert({
        name: "",
        email: "",
        phone: "",
        company: "",
        specialization: "",
        isPartnerRepresentative: false,
        partnerId: null,
      });
    } catch (err) {
      console.error("❌ Lỗi khi tạo expert:", err);
      alert("Không thể tạo chuyên gia, vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="Admin" />
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
      <Sidebar items={sidebarItems} title="Admin" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-8 h-8 text-primary-600" />
                Chuyên gia đánh giá (Experts)
              </h1>
              <p className="text-neutral-600 mt-1 max-w-2xl">
                Quản lý danh sách chuyên gia tham gia verify skill group cho talent.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 py-3 shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Thêm chuyên gia
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      stat.color === "blue"
                        ? "bg-primary-100 text-primary-600 group-hover:bg-primary-200"
                        : stat.color === "green"
                        ? "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                        : stat.color === "purple"
                        ? "bg-accent-100 text-accent-600 group-hover:bg-accent-200"
                        : "bg-warning-100 text-warning-600 group-hover:bg-warning-200"
                    } transition-all duration-300`}
                  >
                    <UserCog className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6 animate-fade-in">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, công ty, chuyên môn..."
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-neutral-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 bg-white"
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">{showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={onlyPartnerRepresentative}
                      onChange={(e) => setOnlyPartnerRepresentative(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    Chỉ hiển thị chuyên gia đại diện đối tác
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table + pagination giống SkillList */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white z-20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách chuyên gia</h2>
              <div className="flex items-center gap-4">
                {filteredExperts.length > 0 ? (
                  <>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm text-neutral-600">
                      {startItem}-{endItem} trong số {filteredExperts.length}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-neutral-600">Tổng: 0 chuyên gia</span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Tên chuyên gia
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Công ty / Đối tác
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Chuyên môn
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredExperts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <UserCog className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">
                          Không có chuyên gia nào
                        </p>
                        <p className="text-neutral-400 text-sm mt-1">
                          Thử thay đổi từ khóa tìm kiếm hoặc thêm chuyên gia mới
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedExperts.map((expert, index) => (
                    <tr
                      key={expert.id}
                      className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-neutral-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                            {expert.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            ID: <span className="font-mono">{expert.id}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-sm text-neutral-700">
                          {expert.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              {expert.email}
                            </span>
                          )}
                          {expert.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              {expert.phone}
                            </span>
                          )}
                          {!expert.email && !expert.phone && (
                            <span className="text-neutral-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-neutral-700">
                        {expert.partnerName || expert.company || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-neutral-700">
                        {expert.specialization || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {expert.isPartnerRepresentative ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đại diện đối tác
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200">
                            Nội bộ / Cộng tác
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/categories/experts/${expert.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-200 text-primary-700 text-xs hover:bg-primary-50"
                          >
                            Chi tiết
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(expert.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal tạo chuyên gia */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thêm chuyên gia mới</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Tên chuyên gia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newExpert.name}
                    onChange={(e) => setNewExpert((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newExpert.email}
                      onChange={(e) => setNewExpert((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="expert@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={newExpert.phone}
                      onChange={(e) => setNewExpert((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="VD: 0901234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Công ty / Đơn vị (Đối tác)
                  </label>
                  <select
                    value={newExpert.partnerId ? String(newExpert.partnerId) : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setNewExpert((p) => ({
                          ...p,
                          partnerId: null,
                          company: "",
                          isPartnerRepresentative: false,
                        }));
                        return;
                      }
                      const partnerId = Number(value);
                      const selectedPartner = partners.find((p) => p.id === partnerId);
                      setNewExpert((prev) => ({
                        ...prev,
                        partnerId,
                        company: selectedPartner?.companyName || "",
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  >
                    <option value="">Chọn công ty đối tác (nếu có)</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Chuyên môn chính
                  </label>
                  <input
                    type="text"
                    value={newExpert.specialization}
                    onChange={(e) =>
                      setNewExpert((p) => ({ ...p, specialization: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="VD: .NET, Frontend, Data, ..."
                  />
                </div>

                {newExpert.partnerId && (
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={newExpert.isPartnerRepresentative}
                      onChange={(e) =>
                        setNewExpert((p) => ({
                          ...p,
                          isPartnerRepresentative: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    Là đại diện đối tác (Partner Representative)
                  </label>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                  disabled={creating}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm disabled:opacity-60"
                >
                  {creating ? "Đang lưu..." : "Lưu chuyên gia"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


