import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Building2, X, Plus, Users, Mail, Phone, MapPin } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';
import { Button } from '../../../components/ui/button';
import { partnerService, type Partner, type PartnerPayload } from '../../../services/Partner';
import EditForm from './Edit';
import { ROUTES } from '../../../router/routes'; 

export default function ListPartner() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [tab, setTab] = useState<'info' | 'edit'>('info');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTaxCode, setFilterTaxCode] = useState('');

  // Stats data
  const stats = [
    {
      title: 'Tổng Đối Tác',
      value: partners.length.toString(),
      color: 'blue',
      icon: <Building2 className="w-6 h-6" />
    },
    {
      title: 'Có Liên Hệ',
      value: partners.filter(p => p.contactPerson).length.toString(),
      color: 'green',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Có Email',
      value: partners.filter(p => p.email).length.toString(),
      color: 'orange',
      icon: <Mail className="w-6 h-6" />
    },
    {
      title: 'Có Địa Chỉ',
      value: partners.filter(p => p.address).length.toString(),
      color: 'purple',
      icon: <MapPin className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAll();
      setPartners(data);
      setFilteredPartners(data);
    } catch (err) {
      console.error("❌ Failed to fetch partners:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter partners based on search and filters
  useEffect(() => {
    let filtered = [...partners];
    if (searchTerm) filtered = filtered.filter((p) => p.companyName?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterCompany) filtered = filtered.filter((p) => p.companyName?.toLowerCase().includes(filterCompany.toLowerCase()));
    if (filterTaxCode) filtered = filtered.filter((p) => p.taxCode?.includes(filterTaxCode));
    setFilteredPartners(filtered);
  }, [searchTerm, filterCompany, filterTaxCode, partners]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCompany("");
    setFilterTaxCode("");
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


  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar items={sidebarItems} title="HR Staff" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách đối tác</h1>
              <p className="text-neutral-600 mt-1">Quản lý và theo dõi thông tin các công ty đối tác</p>
            </div>
            <Button 
              onClick={() => navigate(ROUTES.HR_STAFF.PARTNERS.CREATE)}
              className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 py-3 shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Thêm đối tác mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 transform hover:-translate-y-1 border border-neutral-100 hover:border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-700 transition-colors duration-300">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' :
                      stat.color === 'green' ? 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200' :
                        stat.color === 'purple' ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' :
                          'bg-warning-100 text-warning-600 group-hover:bg-warning-200'
                    } transition-all duration-300`}>
                    {stat.icon}
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
                  placeholder="Tìm kiếm theo tên công ty..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tên công ty"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Mã số thuế"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      value={filterTaxCode}
                      onChange={(e) => setFilterTaxCode(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="group flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 transform"
                  >
                    <span className="font-medium">Đặt lại</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách đối tác</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Tổng: {filteredPartners.length} đối tác</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tên công ty</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Mã số thuế</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Người liên hệ</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Điện thoại</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <Building2 className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">Không có đối tác nào phù hợp</p>
                        <p className="text-neutral-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc thêm đối tác mới</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((p, i) => (
                    <tr
                      key={p.id}
                      className="group hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-neutral-900">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                            {p.companyName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-neutral-700">{p.taxCode || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{p.contactPerson || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{p.email || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{p.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedPartner(p)}
                          className="group inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 transform"
                        >
                          <span className="text-sm font-medium">Xem</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
