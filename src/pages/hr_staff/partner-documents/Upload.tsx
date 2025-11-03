import React, { useEffect, useMemo, useState } from "react";
import { documentTypeService } from "../../../services/DocumentType";
import type { DocumentType } from "../../../services/DocumentType";
import { partnerDocumentService } from "../../../services/PartnerDocument";
import { uploadFile } from "../../../utils/firebaseStorage";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems as hrSidebarItems } from "../../../components/hr_staff/SidebarItems";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Upload, FileUp, ClipboardList, Save, AlertCircle, CheckCircle } from "lucide-react";

const HrUploadPartnerDocument: React.FC = () => {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [partnerContractPaymentId, setPartnerContractPaymentId] = useState<number | "">("");
  const [documentTypeId, setDocumentTypeId] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("HR");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      setLoadingTypes(true);
      try {
        const data = await documentTypeService.getAll({ excludeDeleted: true });
        setTypes(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);

  const canSubmit = useMemo(() => {
    return !!partnerContractPaymentId && !!documentTypeId && !!file && !submitting;
  }, [partnerContractPaymentId, documentTypeId, file, submitting]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setError("❌ File quá lớn (tối đa 10MB)");
      return;
    }
    setError(null);
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !partnerContractPaymentId || !documentTypeId) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    setSuccess(false);
    try {
      const path = `partner-documents/${partnerContractPaymentId}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadFile(file, path, setUploadProgress);

      const payload = {
        partnerContractPaymentId: Number(partnerContractPaymentId),
        documentTypeId: Number(documentTypeId),
        fileName: file.name,
        filePath: downloadURL,
        uploadedByUserId: "current-user",
        description: description || undefined,
        source: source || undefined,
      } as const;

      await partnerDocumentService.create(payload as any);
      setSuccess(true);
      setMessage("Tải lên thành công");
      setFile(null);
      setUploadProgress(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi tải lên';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={hrSidebarItems} title="Staff HR" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/hr/contracts"
              className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Quay lại hợp đồng</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Work Report / Tài liệu Đối tác</h1>
            <p className="text-neutral-600">Tài liệu gắn với kỳ thanh toán hợp đồng đối tác</p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">Tải lên thành công</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={onSubmit} className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin tài liệu</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    PartnerContractPaymentId <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={partnerContractPaymentId}
                    onChange={(e) => setPartnerContractPaymentId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    placeholder="Nhập ID kỳ thanh toán hợp đồng đối tác"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FileUp className="w-4 h-4" />
                    Loại tài liệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={documentTypeId}
                    onChange={(e) => setDocumentTypeId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="">-- Chọn loại tài liệu --</option>
                    {loadingTypes ? (
                      <option value="" disabled>Đang tải...</option>
                    ) : (
                      types.map((t) => (
                        <option key={t.id} value={t.id}>{t.typeName}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer bg-neutral-50 hover:bg-primary-50">
                  {file ? (
                    <div className="flex flex-col items-center text-primary-700">
                      <FileText className="w-8 h-8 mb-2" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-neutral-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <p className="text-sm text-neutral-600 mt-1">Đang upload: {uploadProgress}%</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center text-neutral-500 cursor-pointer">
                      <Upload className="w-12 h-12 mb-4" />
                      <span className="text-lg font-medium mb-2">Chọn hoặc kéo thả file vào đây</span>
                      <span className="text-sm">Hỗ trợ: PDF, DOCX, JPG, PNG (tối đa 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    rows={3}
                    placeholder="Mô tả ngắn"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nguồn</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-primary-500 bg-white"
                    placeholder="HR / Email / Portal ..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              to="/hr/contracts"
              className="px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 font-medium transition-all duration-300"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Tải lên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HrUploadPartnerDocument;
