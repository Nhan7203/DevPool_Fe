import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

interface ContractMetadata {
  contractNumber: string;
  developerName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  type: string;
  value: string;
  notes: string;
}

export default function UploadContract() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [metadata, setMetadata] = useState<ContractMetadata>({
    contractNumber: '',
    developerName: '',
    companyName: '',
    startDate: '',
    endDate: '',
    type: '',
    value: '',
    notes: ''
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement actual file upload and metadata submission
    // Example:
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // formData.append('metadata', JSON.stringify(metadata));
    // await uploadContract(formData);

    // Simulating upload
    setTimeout(() => {
      setLoading(false);
      setUploadSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
        setMetadata({
          contractNumber: '',
          developerName: '',
          companyName: '',
          startDate: '',
          endDate: '',
          type: '',
          value: '',
          notes: ''
        });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Hợp Đồng</h1>
          <p className="text-neutral-600 mt-1">Upload file scan/PDF hợp đồng và nhập thông tin metadata</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* File Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Hợp Đồng (PDF)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              } ${selectedFile ? 'bg-green-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <File className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="text-green-600 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 hover:bg-red-50 rounded-full text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary-600 font-medium hover:text-primary-700"
                    >
                      Click để chọn file
                    </button>
                    <span className="text-gray-500"> hoặc kéo thả file vào đây</span>
                  </div>
                  <p className="text-sm text-gray-500">Chỉ chấp nhận file PDF</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Hợp Đồng</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số hợp đồng
                </label>
                <input
                  type="text"
                  name="contractNumber"
                  required
                  value={metadata.contractNumber}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Developer
                </label>
                <input
                  type="text"
                  name="developerName"
                  required
                  value={metadata.developerName}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Công Ty
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={metadata.companyName}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Hợp Đồng
                </label>
                <select
                  name="type"
                  required
                  value={metadata.type}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">Chọn loại hợp đồng</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Project-based">Project-based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={metadata.startDate}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={metadata.endDate}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị hợp đồng (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  name="value"
                  required
                  value={metadata.value}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                rows={3}
                value={metadata.notes}
                onChange={handleMetadataChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang upload...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload thành công!</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload hợp đồng</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}