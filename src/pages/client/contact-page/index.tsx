"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement form submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold leading-normal bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn
            cần được giúp đỡ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50 hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-2xl">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">
                  Điện thoại
                </h3>
                <p className="text-neutral-600">Hỗ trợ 24/7</p>
              </div>
            </div>
            <a
              href="tel:+84123456789"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              +84 123 456 789
            </a>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50 hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary-100 rounded-2xl">
                <Mail className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">Email</h3>
                <p className="text-neutral-600">Phản hồi trong 24h</p>
              </div>
            </div>
            <a
              href="mailto:support@devpool.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              support@devpool.com
            </a>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-6 border border-neutral-200/50 hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-100 rounded-2xl">
                <MapPin className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">
                  Địa chỉ
                </h3>
                <p className="text-neutral-600">Trụ sở chính</p>
              </div>
            </div>
            <p className="text-neutral-600">
              123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-8 border border-neutral-200/50">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Gửi Tin Nhắn
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  placeholder="Nhập tiêu đề tin nhắn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  placeholder="Nhập nội dung tin nhắn"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Gửi tin nhắn</span>
                  </>
                )}
              </button>

              {success && (
                <div className="flex items-center gap-2 text-success-600 bg-success-50 p-4 rounded-xl animate-fade-in">
                  <CheckCircle className="w-5 h-5" />
                  <span>Tin nhắn đã được gửi thành công!</span>
                </div>
              )}
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-8 border border-neutral-200/50">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Giờ làm việc
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      Thứ 2 - Thứ 6
                    </p>
                    <p className="text-neutral-600">8:00 - 17:30</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      Thứ 7
                    </p>
                    <p className="text-neutral-600">8:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft p-8 border border-neutral-200/50">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Hỗ trợ nhanh
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Live Chat</p>
                    <p className="text-neutral-600">
                      Trò chuyện trực tiếp với nhân viên hỗ trợ
                    </p>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-3 rounded-xl hover:from-secondary-700 hover:to-secondary-800 font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                  Bắt đầu trò chuyện
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}