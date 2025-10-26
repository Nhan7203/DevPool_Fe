# Hướng dẫn cấu hình Firebase Storage

## 1. Cài đặt Firebase SDK

Nếu chưa cài đặt, chạy lệnh sau:

```bash
npm install firebase
```

## 2. Tạo file `.env` hoặc `.env.local`

Tạo file `.env.local` trong thư mục gốc dự án và thêm các biến môi trường Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyB3BmLb_oZiZ7rcrsPLMy9scXOkWiscn-g
VITE_FIREBASE_AUTH_DOMAIN=login-9b844.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=login-9b844
VITE_FIREBASE_STORAGE_BUCKET=login-9b844.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=744698241068
VITE_FIREBASE_APP_ID=1:744698241068:web:f167c8cf36525a48fd3189
```

**Lưu ý:** Đảm bảo file `.env` hoặc `.env.local` đã được thêm vào `.gitignore` để không commit thông tin nhạy cảm.

## 3. Cấu hình Firebase Storage Rules

Đăng nhập vào [Firebase Console](https://console.firebase.google.com/), chọn project của bạn, sau đó:

1. Vào **Storage** trong menu bên trái
2. Chọn tab **Rules**
3. Cập nhật rules để cho phép upload file (chỉ cho user đã đăng nhập):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Cho phép đọc file CV công khai
    match /talent-cvs/{talentId}/{fileName} {
      allow read: if true; // Cho phép đọc công khai
      allow write: if request.auth != null; // Chỉ user đã đăng nhập mới được upload
    }
    
    // Các rules khác (nếu có)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Nhấn **Publish** để lưu thay đổi

## 4. Cấu trúc thư mục trong Storage

Khi upload CV cho talent, file sẽ được lưu theo cấu trúc:

```
talent-cvs/
  └── {talentId}/
      ├── CV_v1_0_1234567890123.pdf
      ├── CV_Frontend_Developer_1234567890456.pdf
      └── CV_Senior_Backend_1234567890789.docx
```

**Quy tắc đặt tên file:**
- Format: `{versionName}_{timestamp}.{extension}`
- `versionName`: Tên phiên bản CV (ký tự đặc biệt sẽ được thay bằng `_`)
- `timestamp`: Thời gian upload (milliseconds)
- `extension`: Phần mở rộng file gốc (pdf, doc, docx)

**Ví dụ:**
- Nếu `versionName = "CV v1.0"` → file name: `CV_v1_0_1234567890123.pdf`
- Nếu `versionName = "CV Frontend Developer"` → file name: `CV_Frontend_Developer_1234567890123.pdf`

## 5. Sử dụng tính năng Upload CV

### Trong trang Create Talent CV (`/hr/developers/{talentId}/cvs/create`):

1. **Nhập tên phiên bản CV** (bắt buộc trước khi upload)
2. **Chọn vị trí công việc** (Job Role)
3. **Chọn file CV** từ máy tính (PDF, DOC, DOCX - Max 10MB)
4. **Nhấn nút "Upload lên Firebase"** để upload file
5. URL sẽ tự động điền vào trường "URL file CV"
6. **Nhập tóm tắt CV**
7. **Nhấn "Thêm CV"** để lưu vào database

### Giới hạn:
- **Loại file:** PDF, DOC, DOCX
- **Kích thước tối đa:** 10MB
- **Tên file:** Tự động tạo từ versionName + timestamp

## 6. Bảo mật

### Khuyến nghị:
1. **Sử dụng biến môi trường** cho Firebase config (đã được cấu hình trong `src/configs/firebase.tsx`)
2. **Không commit file `.env`** lên git
3. **Cấu hình Storage Rules** phù hợp với yêu cầu bảo mật
4. **Xác thực user** trước khi cho phép upload
5. **Validate file type và size** ở client và server

### Storage Rules Production (khuyến nghị):
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /talent-cvs/{talentId}/{fileName} {
      // Chỉ HR Staff và Admin mới được upload
      allow write: if request.auth != null 
                   && request.auth.token.role in ['hr_staff', 'admin'];
      
      // Ai cũng có thể đọc (hoặc chỉnh sửa theo nhu cầu)
      allow read: if true;
    }
  }
}
```

**Lưu ý:** Bạn cần cấu hình Custom Claims trong Firebase Authentication để sử dụng `request.auth.token.role`.

## 7. Troubleshooting

### Lỗi: "Firebase Storage is not configured"
- Kiểm tra `storageBucket` trong `firebaseConfig`
- Đảm bảo Storage đã được enable trong Firebase Console

### Lỗi: "Permission denied"
- Kiểm tra Storage Rules
- Đảm bảo user đã đăng nhập (nếu rules yêu cầu authentication)

### Lỗi: "File size too large"
- Kiểm tra file không vượt quá 10MB
- Nén hoặc tối ưu file trước khi upload

### Lỗi: "Invalid file type"
- Chỉ chấp nhận PDF, DOC, DOCX
- Kiểm tra MIME type của file

## 8. Testing

Để test tính năng upload:

1. Khởi động dev server:
```bash
npm run dev
```

2. Truy cập: `/hr/developers/{talentId}/cvs/create`

3. Thực hiện các bước upload như hướng dẫn ở mục 5

4. Kiểm tra:
   - File đã được upload lên Storage
   - URL được điền tự động
   - Có thể xem file qua link

## 9. API Reference

### `uploadTalentCV(file, talentId, versionName, onProgress)`

Upload CV file lên Firebase Storage.

**Parameters:**
- `file: File` - File object từ input
- `talentId: number` - ID của talent
- `versionName: string` - Tên phiên bản CV
- `onProgress?: (progress: number) => void` - Callback nhận % upload (0-100)

**Returns:** `Promise<string>` - Download URL của file

**Example:**
```typescript
const url = await uploadTalentCV(
  file,
  123,
  "CV v1.0",
  (progress) => console.log(`Upload: ${progress}%`)
);
```

### `deleteTalentCV(fileUrl)`

Xóa file CV từ Firebase Storage.

**Parameters:**
- `fileUrl: string` - Download URL của file cần xóa

**Returns:** `Promise<void>`

**Example:**
```typescript
await deleteTalentCV("https://firebasestorage.googleapis.com/...");
```

## 10. Liên hệ

Nếu có vấn đề về Firebase Storage, liên hệ team DevOps hoặc tạo issue trên repository.

