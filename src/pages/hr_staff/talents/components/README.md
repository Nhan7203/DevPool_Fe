# Talent Detail Components

Kế hoạch tách file Detail.tsx (7713 dòng) thành các component nhỏ hơn:

## 1. Modal Components
- `VerifySkillGroupModal.tsx` - Modal verify skill group (~230 dòng)
- `HistoryModal.tsx` - Modal lịch sử đánh giá (~200 dòng)
- `CVAnalysisModal.tsx` - Modal phân tích CV (~300 dòng)

## 2. Tab Section Components  
- `SkillsTab.tsx` - Tab kỹ năng (~800 dòng)
- `ProjectsTab.tsx` - Tab dự án (~400 dòng)
- `CVsTab.tsx` - Tab CV (~600 dòng)
- `JobRoleLevelsTab.tsx` - Tab vị trí công việc (~400 dòng)
- `CertificatesTab.tsx` - Tab chứng chỉ (~400 dòng)
- `ExperiencesTab.tsx` - Tab kinh nghiệm (~400 dòng)
- `AvailableTimesTab.tsx` - Tab thời gian rảnh (~300 dòng)

## 3. Inline Form Components
- `ProjectInlineForm.tsx` - Form thêm/sửa dự án
- `SkillInlineForm.tsx` - Form thêm/sửa kỹ năng
- `CertificateInlineForm.tsx` - Form thêm/sửa chứng chỉ
- `ExperienceInlineForm.tsx` - Form thêm/sửa kinh nghiệm
- `JobRoleLevelInlineForm.tsx` - Form thêm/sửa vị trí
- `AvailableTimeInlineForm.tsx` - Form thêm/sửa thời gian
- `CVInlineForm.tsx` - Form thêm/sửa CV

## 4. Other Components
- `BasicInfo.tsx` - Phần thông tin cơ bản (~200 dòng)
- `SectionPagination.tsx` - Phân trang cho sections (đã có sẵn)

## Ưu tiên tách theo thứ tự:
1. ✅ VerifySkillGroupModal (modal lớn nhất)
2. ✅ HistoryModal
3. ✅ BasicInfo
4. ✅ SkillsTab (tab lớn nhất)
5. Các tab còn lại
6. Các inline forms

## Lợi ích:
- Giảm kích thước file Detail.tsx từ 7713 → ~2000-3000 dòng
- Cải thiện performance (lazy loading, code splitting)
- Dễ bảo trì và test từng component riêng
- Tái sử dụng components ở nơi khác

