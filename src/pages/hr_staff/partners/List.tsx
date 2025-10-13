import { useState, useEffect } from 'react';
import { Search, Filter, Building2, X } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { partnerService, type Partner, type PartnerPayload } from '../../../services/partnerService';
import EditForm from './Edit'; 

export default function ListPartner() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [tab, setTab] = useState<'info' | 'edit'>('info');

  const [minTax, setMinTax] = useState('');
  const [maxTax, setMaxTax] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAll();
      setPartners(data);
    } catch (err) {
      console.error("❌ Failed to fetch partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload: PartnerPayload) => {
    try {
      if (!selectedPartner) return;
      await partnerService.update(selectedPartner.id, payload);
      alert("✅ Cập nhật thành công!");
      fetchPartners();
      setSelectedPartner(null);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật!");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc muốn xoá đối tác ${name}?`)) {
      try {
        await partnerService.deleteById(id);
        alert("Đã xoá đối tác thành công!");
        setSelectedPartner(null);
        fetchPartners();
      } catch (error) {
        console.error(error);
        alert("Xoá thất bại!");
      }
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchName = p.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTax =
      (!minTax || Number(p.taxCode) >= Number(minTax)) &&
      (!maxTax || Number(p.taxCode) <= Number(maxTax));
    return matchName && matchTax;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh Sách Đối Tác</h1>
          <p className="text-neutral-600 mt-1">Theo dõi thông tin các công ty đối tác trong hệ thống DevPool</p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên công ty..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>

          {showFilters && (
            <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {/* TaxCode filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minTax}
                    onChange={(e) => setMinTax(e.target.value)}
                    className="w-full border rounded-lg px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxTax}
                    onChange={(e) => setMaxTax(e.target.value)}
                    className="w-full border rounded-lg px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setMinTax('');
                    setMaxTax('');
                  }}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Partner Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đối tác...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <p className="text-center text-gray-500">Không tìm thấy đối tác nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.companyName}</h3>
                      <p className="text-sm text-gray-600">{p.taxCode || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p>👤 Người liên hệ: <span className="text-gray-600">{p.contactPerson || '—'}</span></p>
                  <p>📧 Email: <span className="text-gray-600">{p.email || '—'}</span></p>
                  <p>📞 SĐT: <span className="text-gray-600">{p.phone || '—'}</span></p>
                  <p>🏢 Địa chỉ: <span className="text-gray-600">{p.address || '—'}</span></p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedPartner(p)}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-2xl p-6 relative">
            <button
              onClick={() => setSelectedPartner(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b pb-2">
              <button
                className={`pb-2 font-medium text-lg ${tab === 'info'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500'
                  }`}
                onClick={() => setTab('info')}
              >
                Thông tin
              </button>
              <button
                className={`pb-2 font-medium text-lg ${tab === 'edit'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500'
                  }`}
                onClick={() => setTab('edit')}
              >
                Chỉnh sửa
              </button>
            </div>

            {/* Tab content */}
            {tab === 'info' ? (
              <div className="space-y-2 text-gray-700">
                <p><strong>Tên công ty:</strong> {selectedPartner.companyName}</p>
                <p><strong>Mã số thuế:</strong> {selectedPartner.taxCode || '—'}</p>
                <p><strong>Người liên hệ:</strong> {selectedPartner.contactPerson || '—'}</p>
                <p><strong>Email:</strong> {selectedPartner.email || '—'}</p>
                <p><strong>Điện thoại:</strong> {selectedPartner.phone || '—'}</p>
                <p><strong>Địa chỉ:</strong> {selectedPartner.address || '—'}</p>
              </div>
            ) : (
              <EditForm partner={selectedPartner} onSave={handleUpdate} />
            )}

            <div className="mt-6 flex justify-between">
              <button
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                onClick={() => handleDelete(selectedPartner.id, selectedPartner.companyName)}
              >
                Xoá
              </button>
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
