import { useState } from 'react';
import { Upload, FileText, Save } from 'lucide-react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

export default function CreateTalentCV() {
  const [formData, setFormData] = useState({
    talentName: '',
    position: '',
    level: 'Junior',
    skills: '',
    summary: '',
    highlights: '',
    description: '',
    workingStyle: '',
    versionName: '',
    originalCVFile: null as File | null,
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, originalCVFile: e.target.files?.[0] || null });
  };

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      console.log('📄 Submitted CV Data:', formData);
      setUploading(false);
      alert('Tạo CV thành công!');
    }, 1500);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo / Upload CV</h1>
          <p className="text-neutral-600 mt-1">Tải lên hoặc nhập thông tin thủ công cho CV của developer</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-200 max-w-4xl mx-auto">
          {/* Upload file */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Tải lên file CV (PDF, DOCX)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="cvFile"
              />
              <label htmlFor="cvFile" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-primary-600 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.originalCVFile
                    ? formData.originalCVFile.name
                    : 'Kéo thả hoặc chọn tệp CV từ máy của bạn'}
                </span>
              </label>
            </div>
          </div>

          {/* Manual fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Họ tên</label>
              <input
                type="text"
                name="talentName"
                value={formData.talentName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Vị trí ứng tuyển</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Cấp độ</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              >
                <option>Junior</option>
                <option>Middle</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Hình thức làm việc</label>
              <select
                name="workingStyle"
                value={formData.workingStyle}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              >
                <option>Onsite</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Kỹ năng</label>
              <input
                type="text"
                name="skills"
                placeholder="VD: React, Node.js, PostgreSQL"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Tên phiên bản CV</label>
              <input
                type="text"
                name="versionName"
                value={formData.versionName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Text Areas */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tóm tắt (Summary)</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Điểm nổi bật (Highlights)</label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Mô tả chi tiết (Description)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              disabled={uploading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              {uploading ? 'Đang lưu...' : 'Lưu & Tiếp tục'}
            </button>

            <button
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 border border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Lưu & Gắn vào Job Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
