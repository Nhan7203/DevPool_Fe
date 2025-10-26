# CV Matching Troubleshooting Guide

## 🔍 Vấn đề: Matching không trả về kết quả

Nếu trang Matching CV không hiển thị kết quả, hãy kiểm tra các điều kiện sau:

### 1. **Kiểm tra Console (F12)**

Mở Browser Console để xem các log sau:
- ✅ Job Request loaded
- 🔍 Fetching matching CVs for Job Request ID
- ✅ Matching CVs received
- 📊 Total matches found

### 2. **Điều kiện Backend Matching**

Backend sử dụng các điều kiện sau để tìm CV phù hợp:

#### a. **JobRole Match** (Bắt buộc)
```csharp
.Where(cv => cv.JobRoleId == jobRoleLevel.JobRoleId)
```
- TalentCV phải có **cùng JobRoleId** với JobRoleLevel của Job Request
- Ví dụ: Job Request yêu cầu "Senior Backend Developer" thì chỉ tìm CV có JobRole = "Backend Developer"

#### b. **IsActive = true** (Bắt buộc)
```csharp
.Where(cv => cv.IsActive)
```
- TalentCV phải ở trạng thái **Active**
- CV không active sẽ không được xét

#### c. **Match Score Calculation** (0-100 điểm)

| Tiêu chí | Điểm | Cách tính |
|----------|------|-----------|
| **Skills Match** | 55 | `(55 / totalRequiredSkills) * matchedSkills` |
| **Working Mode** | 15 | Bitwise: `(talent.WorkingMode & jobRequest.WorkingMode) != 0` |
| **Location** | 10 | `!jobRequest.LocationId || talent.LocationId == jobRequest.LocationId` |
| **Level** | 20 | Luôn cho 20 điểm (vì không có level trong Talent) |

#### d. **Top N Results**
```csharp
.OrderByDescending(r => r.MatchScore)
.Take(jobRequest.Quantity)
```
- Chỉ lấy **top N** CVs (N = số lượng cần tuyển)
- Sắp xếp theo điểm cao → thấp

### 3. **Các nguyên nhân phổ biến**

#### ❌ **Không có CV nào cùng JobRole**
```
Giải pháp:
1. Kiểm tra JobRoleLevel của Job Request
2. Tạo TalentCV với cùng JobRole
3. Đảm bảo TalentCV.JobRoleId = JobRoleLevel.JobRoleId
```

#### ❌ **Tất cả CV đều IsActive = false**
```
Giải pháp:
1. Vào trang Talent CVs
2. Chỉnh IsActive = true cho ít nhất 1 CV
```

#### ❌ **Quantity = 0**
```
Giải pháp:
1. Kiểm tra Job Request quantity
2. Đảm bảo quantity > 0
```

#### ❌ **API endpoint không đúng**
```
Frontend gọi: GET /talentcv/filter-by-job-request?JobRequestId={id}
Backend method: FilterCVsByJobRequestAsync

Kiểm tra:
1. Controller route mapping
2. API có trả về 200 OK không?
3. Response format có đúng không?
```

### 4. **Cấu trúc Response mong đợi**

```typescript
interface TalentCVMatchResult {
  talentCV: {
    id: number;
    talentId: number;
    jobRoleId: number;
    versionName: string;
    cvFileUrl: string;
    isActive: boolean;
    summary: string;
  };
  matchScore: number;        // 0-100
  matchedSkills: string[];   // ["React", "TypeScript"]
  missingSkills: string[];   // ["Docker", "AWS"]
  levelMatch: boolean;       // true/false
  matchSummary: string;      // "Matched 3/5 skills. WorkingMode: Match. Location: Match"
}
```

### 5. **Test Cases**

#### Test 1: Tạo dữ liệu mẫu
```sql
-- 1. Tạo Talent
INSERT INTO Talents (FullName, Email, LocationId, WorkingMode) 
VALUES ('John Doe', 'john@example.com', 1, 3); -- WorkingMode: Hybrid (1 | 2 = 3)

-- 2. Tạo TalentCV
INSERT INTO TalentCVs (TalentId, JobRoleId, VersionName, IsActive) 
VALUES (1, 5, 'CV v1.0', 1); -- JobRoleId phải khớp với Job Request

-- 3. Thêm Skills cho Talent
INSERT INTO TalentSkills (TalentId, SkillId) 
VALUES (1, 10), (1, 11), (1, 12);

-- 4. Kiểm tra Job Request có Skills tương ứng
SELECT * FROM JobSkills WHERE JobRequestId = {yourJobRequestId};
```

#### Test 2: Debug query
```csharp
// Trong backend, thêm log:
_logger.LogInformation($"Found {talentCVs.Count} CVs with JobRoleId={jobRoleLevel.JobRoleId}");
_logger.LogInformation($"Required skills: {string.Join(", ", requiredSkills)}");
_logger.LogInformation($"Final results: {results.Count}");
```

### 6. **API Testing với Postman/cURL**

```bash
# Test API trực tiếp
curl -X GET "http://localhost:5000/api/talentcv/filter-by-job-request?JobRequestId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Kiểm tra response:
# - Status code = 200?
# - Body có data không?
# - Format đúng như TalentCVMatchResult[]?
```

### 7. **Checklist**

- [ ] Job Request đã được duyệt (status = 1)
- [ ] Job Request có quantity > 0
- [ ] Job Request có JobRoleLevelId hợp lệ
- [ ] Có ít nhất 1 TalentCV với:
  - [ ] JobRoleId khớp với JobRequest
  - [ ] IsActive = true
  - [ ] IsDeleted = false
- [ ] Talent có thông tin:
  - [ ] WorkingMode
  - [ ] LocationId (optional)
- [ ] TalentSkills đã được tạo
- [ ] API endpoint hoạt động (test với Postman)
- [ ] Browser console không có lỗi

### 8. **Contact Backend Developer**

Nếu vẫn không hoạt động, cung cấp cho backend developer:
1. Job Request ID
2. Console logs (F12)
3. Network tab response (F12 → Network)
4. Screenshot lỗi (nếu có)

---

## 📊 Expected Match Score Examples

| Scenario | Skills | Working Mode | Location | Level | Total Score |
|----------|--------|--------------|----------|-------|-------------|
| Perfect Match | 55/55 | 15/15 | 10/10 | 20/20 | **100** ✅ |
| Good Match | 44/55 (4/5 skills) | 15/15 | 10/10 | 20/20 | **89** ✅ |
| Average Match | 33/55 (3/5 skills) | 0/15 | 10/10 | 20/20 | **63** ⚠️ |
| Poor Match | 11/55 (1/5 skills) | 0/15 | 0/10 | 20/20 | **31** ❌ |

---

## 🛠️ Quick Fix Script

```sql
-- Kiểm tra nhanh
SELECT 
    jr.Id AS JobRequestId,
    jr.Title,
    jrl.JobRoleId,
    jr.Quantity,
    COUNT(tcv.Id) AS TotalCVsWithSameRole
FROM JobRequests jr
JOIN JobRoleLevels jrl ON jr.JobRoleLevelId = jrl.Id
LEFT JOIN TalentCVs tcv ON tcv.JobRoleId = jrl.JobRoleId AND tcv.IsActive = 1 AND tcv.IsDeleted = 0
WHERE jr.Id = {YourJobRequestId}
GROUP BY jr.Id, jr.Title, jrl.JobRoleId, jr.Quantity;
```

Nếu `TotalCVsWithSameRole = 0` → **Đây là nguyên nhân chính!**

