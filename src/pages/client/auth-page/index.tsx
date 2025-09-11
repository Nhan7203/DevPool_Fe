import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../../components/auth/LoginForm";
import RegisterForm from "../../../components/auth/RegisterForm";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === "/register";
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {isRegister ? (
            <RegisterForm onToggleForm={() => navigate("/login")} />
          ) : (
            <LoginForm onToggleForm={() => navigate("/register")} />
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-center text-white space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Chào Mừng Đến Với DevPool</h2>
            <p className="text-xl text-blue-100">
              Nền tảng kết nối doanh nghiệp với chuyên gia IT hàng đầu Việt Nam
            </p>
          </div>

          <div className="space-y-6">
            <img
              src="https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
              alt="DevPool Team"
              className="rounded-lg shadow-2xl mx-auto max-w-md"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">1000+</div>
                <div>Dự án thành công</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div>Chuyên gia IT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
