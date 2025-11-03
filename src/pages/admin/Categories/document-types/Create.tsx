import { useState } from "react";
import Sidebar from "../../../../components/common/Sidebar";
import { sidebarItems } from "../../../../components/admin/SidebarItems";
import { documentTypeService } from "../../../../services/DocumentType";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export default function DocumentTypeCreatePage() {
  const [typeName, setTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await documentTypeService.create({ typeName: typeName.trim(), description: description || undefined });
      navigate("/admin/categories/document-types");
    } catch (e: any) {
      setMessage(e?.message || "Không thể tạo loại tài liệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Admin" />
      <div className="flex-1 p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Tạo loại tài liệu</h1>
          <Link to="/admin/categories/document-types" className="text-sm text-blue-600">Quay lại danh sách</Link>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-soft border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên loại tài liệu</label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="VD: Work Report, Invoice, Bill"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Mô tả ngắn"
            />
          </div>

          {message && <div className="text-sm text-red-600">{message}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
            <Link to="/admin/categories/document-types" className="px-4 py-2 border rounded">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
