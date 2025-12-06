import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../../components/common/Sidebar";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { sidebarItems } from "../../../components/manager/SidebarItems";
import { talentService, type Talent, type HandoverTalentRequest } from "../../../services/Talent";
import { userService, type User } from "../../../services/User";
import { talentStaffAssignmentService, type TalentStaffAssignment, AssignmentResponsibility } from "../../../services/TalentStaffAssignment";
import {
  Search,
  UserCog,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function HandoverAssignmentPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [taStaff, setTaStaff] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TalentStaffAssignment[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTaId, setFilterTaId] = useState<string>(""); // Filter by TA

  // Form state
  const [selectedTalentId, setSelectedTalentId] = useState<number | null>(null);
  const [selectedToUserId, setSelectedToUserId] = useState<string>("");
  const [note, setNote] = useState("");

  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch talents, TA staff, and assignments in parallel
        const [talentsData, usersData, assignmentsData] = await Promise.all([
          talentService.getAll({ excludeDeleted: true }),
          userService.getAll({ excludeDeleted: true, isActive: true }),
          talentStaffAssignmentService.getAll({ 
            isActive: true, 
            responsibility: AssignmentResponsibility.HrManagement,
            excludeDeleted: true 
          }),
        ]);

        // Filter TA staff (role = "TA" - HR đã chuyển sang TA)
        const taStaffList = usersData.items.filter(
          (user: User) => user.roles.includes("TA")
        );

        setTalents(talentsData);
        setTaStaff(taStaffList);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.items || []));
        setFilteredTalents(talentsData);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setErrorMessage(err.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map talentId -> TA userId (current manager)
  const talentToTaMap = useMemo(() => {
    const map = new Map<number, string>();
    assignments.forEach((assignment) => {
      if (assignment.isActive && assignment.talentId) {
        map.set(assignment.talentId, assignment.userId);
      }
    });
    return map;
  }, [assignments]);

  // Map userId -> User object for quick lookup
  const taUserMap = useMemo(() => {
    const map = new Map<string, User>();
    taStaff.forEach((ta) => {
      map.set(ta.id, ta);
    });
    return map;
  }, [taStaff]);

  // Filter talents by search term and TA filter
  useEffect(() => {
    let filtered = talents;

    // Filter by TA
    if (filterTaId) {
      filtered = filtered.filter((talent) => {
        const taUserId = talentToTaMap.get(talent.id);
        return taUserId === filterTaId;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (talent) =>
          talent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          talent.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTalents(filtered);
  }, [searchTerm, filterTaId, talents, talentToTaMap]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTalentId || !selectedToUserId) {
      setErrorMessage("Vui lòng chọn Talent và TA nhận quyền quản lý");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload: HandoverTalentRequest = {
        toUserId: selectedToUserId,
        note: note.trim() || null,
      };
console.log("payload", payload);
      await talentService.handoverAssignment(selectedTalentId, payload);

      // Lưu ý: Backend đã đổi role từ HR sang TA
      // Nếu backend có gửi notification sau khi handover, đảm bảo backend tìm user theo role "TA" (không phải "HR")
      // Notification sẽ được gửi đến TA nhận quyền quản lý (selectedToUserId)

      setSuccessMessage(`Chuyển nhượng quản lý Talent thành công!`);
      
      // Reset form
      setSelectedTalentId(null);
      setSelectedToUserId("");
      setNote("");
      
      // Refresh talents list
      const talentsData = await talentService.getAll({ excludeDeleted: true });
      setTalents(talentsData);
      setFilteredTalents(talentsData);
    } catch (err: any) {
      console.error("❌ Lỗi khi chuyển nhượng:", err);
      setErrorMessage(err.message || "Không thể chuyển nhượng quản lý Talent");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTalent = talents.find((t) => t.id === selectedTalentId);
  const selectedTa = taStaff.find((ta) => ta.id === selectedToUserId);
  const currentTaUserId = selectedTalentId ? talentToTaMap.get(selectedTalentId) : null;
  const currentTa = currentTaUserId ? taUserMap.get(currentTaUserId) : null;
  
  // Filter out current TA from available TA list
  const availableTaStaff = useMemo(() => {
    if (!selectedTalentId || !currentTaUserId) {
      return taStaff;
    }
    return taStaff.filter((ta) => ta.id !== currentTaUserId);
  }, [taStaff, selectedTalentId, currentTaUserId]);
  
  // Reset selectedToUserId if it's the current TA
  useEffect(() => {
    if (selectedTalentId && selectedToUserId === currentTaUserId) {
      setSelectedToUserId("");
    }
  }, [selectedTalentId, selectedToUserId, currentTaUserId]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={sidebarItems} title="Manager" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <Breadcrumb
            items={[
              { label: "Tổng Quan", to: "/manager/dashboard" },
              { label: "Chuyển nhượng quản lý" },
            ]}
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCog className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chuyển nhượng quản lý Talent
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Chuyển giao quyền quản lý Talent từ TA hiện tại sang TA khác
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          {successMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Filter by TA */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Lọc theo TA quản lý
                    </label>
                    <select
                      value={filterTaId}
                      onChange={(e) => setFilterTaId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Tất cả TA --</option>
                      {taStaff.map((ta) => (
                        <option key={ta.id} value={ta.id}>
                          {ta.fullName} ({ta.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Talent Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn Talent <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm Talent theo tên, email hoặc mã..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mt-2">
                      {filteredTalents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Không tìm thấy Talent nào
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredTalents.map((talent) => {
                            const currentTaUserId = talentToTaMap.get(talent.id);
                            const currentTa = currentTaUserId ? taUserMap.get(currentTaUserId) : null;
                            
                            return (
                              <button
                                key={talent.id}
                                type="button"
                                onClick={() => setSelectedTalentId(talent.id)}
                                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                  selectedTalentId === talent.id
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {talent.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {talent.email} • {talent.code}
                                    </p>
                                    {currentTa ? (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Đang quản lý bởi: {currentTa.fullName}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Chưa có TA quản lý
                                      </p>
                                    )}
                                  </div>
                                  {selectedTalentId === talent.id && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TA Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn TA nhận quyền quản lý <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedToUserId}
                      onChange={(e) => setSelectedToUserId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Chọn TA --</option>
                      {availableTaStaff.map((ta) => (
                        <option key={ta.id} value={ta.id}>
                          {ta.fullName} ({ta.email})
                        </option>
                      ))}
                    </select>
                    {selectedTalentId && currentTa && availableTaStaff.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Không có TA khác để chuyển nhượng (chỉ có TA hiện tại đang quản lý)
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      placeholder="Nhập lý do chuyển nhượng..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Preview */}
                  {selectedTalent && selectedTa && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Xem trước chuyển nhượng:
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <p className="text-gray-500">Từ TA hiện tại</p>
                          {currentTa ? (
                            <>
                              <p className="font-medium text-gray-900 mt-1">
                                {currentTa.fullName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {currentTa.email}
                              </p>
                            </>
                          ) : (
                            <p className="font-medium text-gray-400 mt-1">
                              Chưa có TA quản lý
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-gray-500">Đến TA mới</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {selectedTa.fullName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedTa.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-500 text-sm">Talent:</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {selectedTalent.fullName} ({selectedTalent.code})
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedTalentId(null);
                        setSelectedToUserId("");
                        setNote("");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting || !selectedTalentId || !selectedToUserId}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Chuyển nhượng"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

