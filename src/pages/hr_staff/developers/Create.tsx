import { useEffect, useState } from "react";
import { User, Mail, Phone, Briefcase, Layers, Link, Github, DollarSign } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { type TalentPayload, talentService } from "../../../services/Talent";
import { type Partner, partnerService } from "../../../services/Partner";

export default function CreateTalent() {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [formData, setFormData] = useState<TalentPayload>({
    fullName: "",
    email: "",
    phone: "",
    level: "",
    yearsOfExp: 0,
    ratePerMonth: 0,
    status: "Available",
    githubUrl: "",
    portfolioUrl: "",
    partnerId: undefined,
  });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnerService.getAll();
        setPartners(data);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách Partner:", error);
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExp" || name === "ratePerMonth" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await talentService.create(formData);
      alert("✅ Tạo Talent (Lập trình viên) thành công!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        level: "",
        yearsOfExp: 0,
        ratePerMonth: 0,
        status: "Available",
        githubUrl: "",
        portfolioUrl: "",
        partnerId: undefined,
      });
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi tạo Talent!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-4 shadow-glow-green animate-float">
              <User className="text-white font-bold text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent">
              Tạo Talent Mới
            </h1>
            <p className="text-neutral-600 mt-2">
              Thêm lập trình viên (developer) mới vào hệ thống DevPool
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-neutral-200/50 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Họ và tên</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              {/* Email + SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@domain.com"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Số điện thoại</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0123456789"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 focus:ring-2 focus:ring-primary-500/20 hover:shadow-soft border-neutral-300 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Level + Năm KN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Cấp độ</label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      <option value="">-- Chọn level --</option>
                      <option value="Intern">Intern</option>
                      <option value="Junior">Junior</option>
                      <option value="Middle">Middle</option>
                      <option value="Senior">Senior</option>
                      <option value="Leader">Leader</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="number"
                      name="yearsOfExp"
                      value={formData.yearsOfExp}
                      onChange={handleChange}
                      required
                      placeholder="VD: 3"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Rate + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Rate (VNĐ/tháng)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="number"
                      name="ratePerMonth"
                      value={formData.ratePerMonth}
                      onChange={handleChange}
                      placeholder="VD: 30000000"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full py-3.5 px-4 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="On Project">On Project</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Github + Portfolio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Github URL</label>
                  <div className="relative group">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Portfolio URL</label>
                  <div className="relative group">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://portfolio.com"
                      className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Partner */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Đối tác (Partner)
                </label>
                <div className="relative group">
                  <select
                    name="partnerId"
                    value={formData.partnerId ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        partnerId: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="w-full py-3.5 px-4 border rounded-xl bg-white/50 border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  >
                    <option value="">-- Chọn đối tác --</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    "Tạo Talent"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
