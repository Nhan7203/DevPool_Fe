import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, Building2, Users, Mail, Phone, Globe2, MapPin, FileText } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface Partner {
  id: string;
  name: string;
  logo?: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  market?: string;        // Thị trường (VN/SEA/Global)
  industry?: string;      // Ngành (Fintech, E-commerce, ...)
  services: string[];     // Năng lực cung cấp: Backend/QA/UI-UX/PM
  availableDevs: number;  // Số dev sẵn sàng
  rating: number;         // 0..5
  status: 'active' | 'inactive' | 'blacklist';
  note?: string;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'blacklist';

function isStatusFilter(v: string): v is StatusFilter {
  return v === 'all' || v === 'active' || v === 'inactive' || v === 'blacklist';
}
export default function ListPartner() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [minAvailable, setMinAvailable] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Mock data — thay bằng API call
  useEffect(() => {
    const mock: Partner[] = [
      {
        id: 'p1',
        name: 'Alpha Solutions JSC',
        contactName: 'Trần Thảo',
        email: 'thaotran@alpha.vn',
        phone: '0903 123 456',
        website: 'https://alpha.vn',
        market: 'VN',
        industry: 'Fintech',
        services: ['Backend (Node.js)', 'QA', 'BA'],
        availableDevs: 12,
        rating: 4.6,
        status: 'active',
      },
      {
        id: 'p2',
        name: 'Beta Partner Co.',
        contactName: 'Nguyễn Minh',
        email: 'minh.nguyen@betaco.com',
        phone: '0977 888 222',
        website: 'https://betaco.com',
        market: 'SEA',
        industry: 'E-commerce',
        services: ['Frontend (React)', 'UI/UX'],
        availableDevs: 7,
        rating: 4.1,
        status: 'active',
      },
      {
        id: 'p3',
        name: 'Gamma Tech LTD',
        contactName: 'Lê Quốc Bảo',
        email: 'bao.le@gammatech.io',
        phone: '0912 224 668',
        website: 'https://gammatech.io',
        market: 'Global',
        industry: 'SaaS',
        services: ['DevOps', 'Cloud (AWS)', 'Security'],
        availableDevs: 3,
        rating: 4.8,
        status: 'inactive',
      },
      {
        id: 'p4',
        name: 'Delta Vendor',
        contactName: 'Phạm Hữu Tín',
        email: 'tin.pham@delta.com',
        phone: '0933 555 000',
        market: 'VN',
        industry: 'GovTech',
        services: ['Mobile (Flutter)', 'PM'],
        availableDevs: 0,
        rating: 2.9,
        status: 'blacklist',
        note: 'Không đạt SLA 2 quý liên tiếp',
      },
    ];

    const timer = setTimeout(() => {
      setPartners(mock);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const markets = useMemo(() => Array.from(new Set(partners.map(p => p.market).filter(Boolean))) as string[], [partners]);
  const industries = useMemo(() => Array.from(new Set(partners.map(p => p.industry).filter(Boolean))) as string[], [partners]);

  const filtered = useMemo(() => {
    const term = removeAccents(searchTerm.trim().toLowerCase());
    return partners.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (marketFilter !== 'all' && p.market !== marketFilter) return false;
      if (industryFilter !== 'all' && p.industry !== industryFilter) return false;
      if (p.rating < minRating) return false;
      if (p.availableDevs < minAvailable) return false;

      if (!term) return true;
      const hay = removeAccents(
        [p.name, p.contactName, p.email, p.phone, p.market, p.industry, p.services.join(' ')].join(' ').toLowerCase()
      );
      return hay.includes(term);
    });
  }, [partners, statusFilter, marketFilter, industryFilter, minRating, minAvailable, searchTerm]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh Sách Đối Tác (Partner Vendors)</h1>
          <p className="text-neutral-600 mt-1">Quản lý nguồn cung nhân sự từ các công ty đối tác</p>
        </div>

        {/* Search + Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, liên hệ, năng lực..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 text-gray-700"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>

          <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            Thêm Đối Tác
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isStatusFilter(v)) setStatusFilter(v);
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Tạm ngưng</option>
                <option value="blacklist">Blacklist</option>
              </select>

            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Thị trường</label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              >
                <option value="all">Tất cả</option>
                {markets.map(m => (
                  <option key={m} value={m!}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ngành</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              >
                <option value="all">Tất cả</option>
                {industries.map(i => (
                  <option key={i} value={i!}>{i}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Đánh giá tối thiểu</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số dev sẵn sàng ≥</label>
                <input
                  type="number"
                  min={0}
                  value={minAvailable}
                  onChange={(e) => setMinAvailable(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải danh sách đối tác...</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-600">Tìm thấy <span className="font-medium text-gray-900">{filtered.length}</span> đối tác</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {p.logo ? (
                          <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">{p.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          {p.market && (
                            <span className="inline-flex items-center gap-1"><Globe2 className="w-4 h-4" /> {p.market}</span>
                          )}
                          {p.industry && (
                            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {p.industry}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={p.status} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {p.services.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {p.availableDevs} dev sẵn sàng</span>
                      <span>⭐ {p.rating.toFixed(1)}</span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {p.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {p.phone}</div>
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                          <Globe2 className="w-4 h-4" /> Website
                        </a>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                      <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        Chi tiết
                      </button>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        Liên hệ
                      </button>
                      <button className="col-span-2 px-4 py-2 bg-white border border-gray-200 hover:border-primary-500 rounded-lg flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Hợp đồng liên quan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Partner['status'] }) {
  const map: Record<Partner['status'], { text: string; cls: string }> = {
    active: { text: 'Đang hợp tác', cls: 'bg-green-100 text-green-800' },
    inactive: { text: 'Tạm ngưng', cls: 'bg-gray-100 text-gray-800' },
    blacklist: { text: 'Blacklist', cls: 'bg-red-100 text-red-700' },
  };
  const m = map[status];
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${m.cls}`}>
      {m.text}
    </span>
  );
}

// Helper — bỏ dấu để search thân thiện tiếng Việt
function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
