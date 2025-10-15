import { useState } from "react";
import { type Developer, type TalentPayload } from '../../../services/Talent';

export default function EditForm({ dev, onSave }: { dev: Developer; onSave: (data: TalentPayload) => void }) {
  const [form, setForm] = useState(dev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const payload: TalentPayload = {
          partnerId: form.partnerId,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          level: form.level,
          yearsOfExp: Number(form.yearsOfExp),
          ratePerMonth: Number(form.ratePerMonth),
          status: form.status,
          githubUrl: form.githubUrl,
          portfolioUrl: form.portfolioUrl,
        };

        onSave(payload);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ tên</label>
          <input
            name="fullName"
            value={form.fullName || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <input
            name="level"
            value={form.level || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kinh nghiệm (năm)</label>
          <input
            name="yearsOfExp"
            type="number"
            value={form.yearsOfExp || 0}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rate / tháng</label>
          <input
            name="ratePerMonth"
            type="number"
            value={form.ratePerMonth || 0}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        Lưu thay đổi
      </button>
    </form>
  );
}
