import { useEffect, useState } from "react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { documentTypeService, type DocumentType } from "../../../../services/DocumentType";
import { Search, Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentTypeListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DocumentType[]>([]);
  const [filtered, setFiltered] = useState<DocumentType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await documentTypeService.getAll({ excludeDeleted: true });
        const list = data?.items ?? data ?? [];
        setItems(list);
        setFiltered(list);
      } catch (err) {
        console.error("Lỗi khi tải DocumentType:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(items);
      setCurrentPage(1);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFiltered(items.filter(x => x.typeName.toLowerCase().includes(term)));
    setCurrentPage(1); // Reset về trang đầu khi filter thay đổi
  }, [searchTerm, items]);
  
  // Tính toán pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);
  const startItem = filtered.length > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, filtered.length);

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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loại tài liệu (Document Types)</h1>
              <p className="text-neutral-600 mt-1">Quản lý các loại tài liệu: Work Report, Invoice, Bill...</p>
            </div>
            <Link to="/admin/categories/document-types/create">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3">
                <Plus className="w-5 h-5 mr-2" /> Tạo loại tài liệu
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6">
          <div className="p-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo tên loại tài liệu..."
                className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 animate-fade-in">
          <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white z-20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách loại tài liệu</h2>
              <div className="flex items-center gap-4">
                {filtered.length > 0 ? (
                  <>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <span className="text-sm text-neutral-600">
                      {startItem}-{endItem} trong số {filtered.length}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-neutral-600">Tổng: 0</span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">#</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tên</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 text-lg font-medium">Chưa có loại tài liệu</p>
                        <p className="text-neutral-400 text-sm mt-1">Hãy tạo loại tài liệu mới</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((x, idx) => (
                    <tr key={x.id}>
                      <td className="py-4 px-6 text-sm">{startIndex + idx + 1}</td>
                      <td className="py-4 px-6 font-semibold">{x.typeName}</td>
                      <td className="py-4 px-6 text-sm text-neutral-700">{x.description || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
