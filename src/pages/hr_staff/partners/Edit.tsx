import { useState } from "react";
import { type Partner, type PartnerPayload } from "../../../services/partnerService";

export default function EditPartner({
  partner,
  onSave,
}: {
  partner: Partner;
  onSave: (data: PartnerPayload) => void;
}) {
  const [form, setForm] = useState(partner);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const payload: PartnerPayload = {
          companyName: form.companyName,
          taxCode: form.taxCode,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          address: form.address,
        };

        onSave(payload);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
          <input
            name="companyName"
            value={form.companyName || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mã số thuế</label>
          <input
            name="taxCode"
            value={form.taxCode || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Người liên hệ</label>
          <input
            name="contactPerson"
            value={form.contactPerson || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
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

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <textarea
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg p-2 resize-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
