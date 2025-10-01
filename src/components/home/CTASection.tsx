import { Building2, Users } from "lucide-react"
import type React from "react"
import { Link } from "react-router-dom"

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-50 via-violet-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200/30 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-violet-200/30 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-200/20 rounded-full blur-2xl animate-pulse-gentle"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-6xl leading-[1.3] font-bold bg-gradient-to-r from-primary-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-8 animate-fade-in-up">
          Bắt Đầu Hợp Tác Cùng DevPool
        </h2>
        <p
          className="text-xl lg:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Giải pháp nhân sự IT linh hoạt, chuyên nghiệp cho mọi quy mô doanh nghiệp
        </p>

        <div
          className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            to="/register"
            className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-glow hover:shadow-glow-lg transform hover:scale-103 transition-all duration-400 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5" />
              Doanh Nghiệp Liên Hệ
            </span>

          </Link>

          <button className="group bg-white/80 backdrop-blur-sm text-blue-600 px-10 py-5 rounded-2xl font-semibold text-lg border-2 border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:bg-white">
            <span className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Developer Gia Nhập
            </span>
          </button>
        </div>
        <div className="mt-12 text-gray-500">
          <p>📧 contact@devpool.asia | 📞 1900 xxxx</p>
        </div>
      </div>
    </section>
  )
}

export default CTASection
