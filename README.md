# React + TypeScript + Vite

## 🚀 DevPool – Hệ thống cung cấp nhân sự CNTT theo dự án

DevPool là nền tảng quản lý và kết nối các công ty có nhu cầu thuê nhân sự CNTT (developers, testers, designers, project managers, …) với các chuyên gia sẵn có.  
Khác với những nền tảng tuyển dụng thông thường, DevPool tập trung vào **quản lý nhân sự theo dự án**, hỗ trợ xuyên suốt từ khâu đăng yêu cầu → ghép nối nhân sự → ký kết hợp đồng số → theo dõi tiến độ → thanh toán minh bạch.

---

## 👥 Các nhóm người dùng

### 1. Company (Khách hàng / Doanh nghiệp)
- Đăng ký và quản lý tài khoản công ty.  
- Đăng dự án tuyển dụng: yêu cầu kỹ năng, ngân sách, thời gian.  
- Quản lý hợp đồng và tiến độ dự án.  
- Lựa chọn nhân sự CNTT phù hợp và ký hợp đồng số.  
- Nhận gợi ý nhân sự từ hệ thống (AI-based).  

### 2. IT Professional (Nhân sự CNTT)
- Đăng ký và quản lý hồ sơ cá nhân: thông tin, kỹ năng, kinh nghiệm.  
- Cập nhật trạng thái sẵn sàng làm việc.  
- Tìm kiếm và ứng tuyển vào các dự án phù hợp.  
- Nhận lời mời từ công ty, có thể chấp nhận hoặc từ chối.  
- Ký hợp đồng số và nhận thanh toán sau khi hoàn thành.  

### 3. Admin (Quản trị hệ thống)
- Quản lý và xác minh tài khoản công ty/ứng viên.  
- Theo dõi hoạt động hệ thống: dự án, ứng tuyển, hợp đồng, thanh toán.  
- Quản lý phân quyền, báo cáo doanh thu và hiệu suất hệ thống.  

---

## 🎯 Mục tiêu
- Xây dựng hệ thống tập trung cho quản lý nhân sự CNTT theo dự án.  
- Tối ưu hóa quá trình matching giữa doanh nghiệp và nhân sự.  
- Đảm bảo minh bạch trong quản lý hợp đồng & thanh toán.  
- Hỗ trợ nhân sự CNTT tìm dự án phù hợp với kỹ năng & thời gian rảnh.  

---

## ⚙️ Công nghệ sử dụng (Frontend)
- **Framework:** React + TypeScript + Vite  
- **UI:** TailwindCSS  
- **Quản lý trạng thái:** Context API / Redux (tùy chọn)  
- **Routing:** React Router  
- **API Communication:** RESTful API / Axios  
- **Authentication:** JWT-based (tích hợp với backend)  

---

## 🚀 CI/CD Pipeline

Dự án đã được cấu hình CI/CD tự động với GitHub Actions và Vercel.

### Cách hoạt động:

1. **Khi tạo Pull Request:**
   - Tự động chạy lint check (ESLint)
   - Tự động kiểm tra build có thành công không
   - PR chỉ được merge nếu tất cả checks pass

2. **Khi push code lên branch `main`:**
   - Chạy tất cả checks như trên
   - Tự động deploy lên Vercel production

### Cấu hình Vercel Secrets (nếu chưa có):

Để workflow deploy hoạt động, cần thêm secrets vào GitHub:

1. Vào **GitHub Repository** > **Settings** > **Secrets and variables** > **Actions**
2. Thêm các secrets sau:
   - `VERCEL_TOKEN`: Lấy từ https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Team/Organization ID từ Vercel project settings
   - `VERCEL_PROJECT_ID`: Project ID từ Vercel project settings

**Cách lấy VERCEL_ORG_ID và VERCEL_PROJECT_ID:**
- Vào project trên Vercel > **Settings** > **General**
- Hoặc chạy `vercel link` và xem file `.vercel/project.json`

### Lưu ý:
- Nếu Vercel đã được kết nối với GitHub, Vercel sẽ tự động deploy. Workflow này đảm bảo code quality trước khi deploy.
- Xem chi tiết tại `.github/workflows/README.md`

---