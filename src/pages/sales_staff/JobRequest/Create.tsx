import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';

export default function JobRequestCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    jobPositionId: '',
    applyProcessTemplateId: '',
    clientCompanyCVTemplateId: '',
    title: '',
    description: '',
    requirements: '',
    level: 'Junior',
    quantity: 1,
    budgetPerMonth: '',
    status: 'Open',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Gọi API thật để tạo Job Request
      await new Promise((r) => setTimeout(r, 1200));

      setSuccess(true);
      setTimeout(() => navigate('/sales/job-requests'), 1500);
    } catch {
      setError('Không thể tạo yêu cầu tuyển dụng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tạo Yêu Cầu Tuyển Dụng Mới
          </h1>
          <p className="text-neutral-600 mt-1">
            Nhập thông tin yêu cầu tuyển dụng từ khách hàng
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-soft rounded-2xl p-8 max-w-4xl space-y-6"
        >
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Dự án"
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Chọn dự án --' },
                { value: '1', label: 'Website E-Commerce' },
                { value: '2', label: 'Mobile Banking App' },
              ]}
              required
            />

            <SelectField
              label="Vị trí tuyển dụng"
              name="jobPositionId"
              value={form.jobPositionId}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Chọn vị trí --' },
                { value: '1', label: 'Frontend Developer' },
                { value: '2', label: 'Backend Developer' },
                { value: '3', label: 'QA Engineer' },
              ]}
              required
            />

            <SelectField
              label="Cấp độ"
              name="level"
              value={form.level}
              onChange={handleChange}
              options={[
                { value: 'Junior', label: 'Junior' },
                { value: 'Middle', label: 'Middle' },
                { value: 'Senior', label: 'Senior' },
              ]}
              required
            />

            <InputField
              label="Số lượng cần tuyển"
              name="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ngân sách và CV Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Ngân sách dự kiến (VNĐ/tháng)"
              name="budgetPerMonth"
              type="number"
              value={form.budgetPerMonth}
              onChange={handleChange}
            />

            <SelectField
              label="Mẫu CV của khách hàng"
              name="clientCompanyCVTemplateId"
              value={form.clientCompanyCVTemplateId}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Chọn mẫu CV --' },
                { value: '1', label: 'CV Template A' },
                { value: '2', label: 'CV Template B' },
              ]}
              required
            />
          </div>

          {/* Tiêu đề */}
          <InputField
            label="Tiêu đề yêu cầu"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VD: Senior Backend Developer cho dự án Fintech"
            required
          />

          {/* Mô tả công việc */}
          <TextareaField
            label="Mô tả công việc"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          {/* Yêu cầu ứng viên */}
          <TextareaField
            label="Yêu cầu ứng viên"
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
          />

          {/* Trạng thái */}
          <SelectField
            label="Trạng thái"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: 'Open', label: 'Open' },
              { value: 'Closed', label: 'Closed' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />

          {error && (
            <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              Tạo yêu cầu thành công! Đang chuyển hướng...
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white font-medium transition-colors ${
                loading
                  ? 'bg-primary-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Đang lưu...' : 'Tạo yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== COMPONENTS NHỎ ======

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-4 py-2"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function TextareaField({ label, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
