import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { partnerPaymentPeriodService } from "../../../services/PartnerPaymentPeriod";
import type { PartnerPaymentPeriod } from "../../../services/PartnerPaymentPeriod";
import { partnerContractPaymentService } from "../../../services/PartnerContractPayment";
import type { PartnerContractPayment } from "../../../services/PartnerContractPayment";
import { partnerService, type Partner } from "../../../services/Partner";
import { partnerContractService, type PartnerContract } from "../../../services/PartnerContract";
import { partnerDocumentService, type PartnerDocument } from "../../../services/PartnerDocument";
import { documentTypeService, type DocumentType } from "../../../services/DocumentType";
import { talentService, type Talent } from "../../../services/Talent";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/manager/SidebarItems";
import { Building2, Calendar, X, Check, FileText, Eye, Download, AlertCircle } from "lucide-react";
import { notificationService, NotificationType, NotificationPriority } from "../../../services/Notification";
import { userService } from "../../../services/User";

import { formatVND } from "../../../utils/helpers";

const ManagerPartnerPeriods: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  
  const [periods, setPeriods] = useState<PartnerPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<PartnerContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  // Trạng thái cập nhật
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Modal approve
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPaymentForApprove, setSelectedPaymentForApprove] = useState<PartnerContractPayment | null>(null);
  const [approveNotes, setApproveNotes] = useState("");

  // Modal reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPaymentForReject, setSelectedPaymentForReject] = useState<PartnerContractPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Maps để lưu contracts và talents
  const [contractsMap, setContractsMap] = useState<Map<number, PartnerContract>>(new Map());
  const [talentsMap, setTalentsMap] = useState<Map<number, Talent>>(new Map());
  
  // Modal hiển thị tài liệu
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedPaymentForDocuments, setSelectedPaymentForDocuments] = useState<PartnerContractPayment | null>(null);
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());

  // Lấy danh sách đối tác có hợp đồng
  useEffect(() => {
    const loadPartners = async () => {
      setLoadingPartners(true);
      try {
        const contracts = await partnerContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        
        const partnerIds = [...new Set(contractsData.map((c: PartnerContract) => c.partnerId))];
        
        const allPartners = await partnerService.getAll();
        const allPartnersData = allPartners?.items ?? allPartners ?? [];
        
        const partnersData = allPartnersData.filter((p: Partner) => partnerIds.includes(p.id));
        
        setPartners(partnersData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPartners(false);
      }
    };
    loadPartners();
  }, []);

  // Khi chọn đối tác, load các period của đối tác đó
  useEffect(() => {
    if (!selectedPartnerId) {
      setPeriods([]);
      return;
    }

    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await partnerPaymentPeriodService.getAll({ 
          partnerId: selectedPartnerId, 
          excludeDeleted: true 
        });
        setPeriods(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, [selectedPartnerId]);

  // Kiểm tra và cập nhật Cancelled cho các payment của contract terminated (chưa Paid)
  const checkAndUpdateCancelled = async () => {
    if (!activePeriodId) return;

    try {
      // Lấy tất cả contracts để check status
      const contractsData = await partnerContractService.getAll({ excludeDeleted: true });
      const contracts = Array.isArray(contractsData) ? contractsData : (contractsData?.items || []);
      const terminatedContractIds = new Set(
        contracts
          .filter((c: PartnerContract) => c.status === 'Terminated')
          .map((c: PartnerContract) => c.id)
      );

      if (terminatedContractIds.size === 0) return; // Không có contract nào bị terminated

      const paymentsData = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.items || []);

      // Lọc các payment cần cập nhật: thuộc contract terminated VÀ chưa Paid
      const cancelledPayments = payments.filter((p: PartnerContractPayment) => {
        if (!terminatedContractIds.has(p.partnerContractId)) return false;
        // Chưa Paid và chưa Cancelled
        return p.status !== 'Paid' && p.status !== 'Cancelled';
      });

      // Cập nhật các payment thành Cancelled
      for (const payment of cancelledPayments) {
        try {
          await partnerContractPaymentService.update(payment.id, {
            partnerPeriodId: payment.partnerPeriodId,
            partnerContractId: payment.partnerContractId,
            talentId: payment.talentId,
            actualWorkHours: payment.actualWorkHours,
            otHours: payment.otHours ?? null,
            calculatedAmount: payment.calculatedAmount ?? null,
            paidAmount: payment.paidAmount ?? null,
            paymentDate: payment.paymentDate ?? null,
            status: 'Cancelled',
            notes: payment.notes ?? null
          });
        } catch (err) {
          console.error(`Error updating payment ${payment.id} to Cancelled:`, err);
        }
      }

      // Reload payments nếu có thay đổi
      if (cancelledPayments.length > 0) {
        const updatedData = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(updatedData?.items ?? updatedData ?? []);
      }
    } catch (err) {
      console.error('Error checking cancelled payments:', err);
    }
  };

  const onSelectPeriod = async (periodId: number) => {
    setActivePeriodId(periodId);
    setLoadingPayments(true);
    try {
      const [paymentsData, contractsData, talentsData] = await Promise.all([
        partnerContractPaymentService.getAll({ 
          partnerPeriodId: periodId, 
          excludeDeleted: true 
        }),
        partnerContractService.getAll({ excludeDeleted: true }),
        talentService.getAll({ excludeDeleted: true })
      ]);
      
      setPayments(paymentsData?.items ?? paymentsData ?? []);
      
      // Tạo contracts map
      const contracts = contractsData?.items ?? contractsData ?? [];
      const contractMap = new Map<number, PartnerContract>();
      contracts.forEach((c: PartnerContract) => {
        contractMap.set(c.id, c);
      });
      setContractsMap(contractMap);
      
      // Tạo talents map
      const talents = talentsData?.items ?? talentsData ?? [];
      const talentMap = new Map<number, Talent>();
      talents.forEach((t: Talent) => {
        talentMap.set(t.id, t);
      });
      setTalentsMap(talentMap);

      // Kiểm tra và cập nhật Cancelled sau khi load
      setTimeout(() => checkAndUpdateCancelled(), 500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load document types
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const data = await documentTypeService.getAll({ excludeDeleted: true });
        const types = Array.isArray(data) ? data : (data?.items || []);
        const typesMap = new Map<number, DocumentType>();
        types.forEach((type: DocumentType) => {
          typesMap.set(type.id, type);
        });
        setDocumentTypes(typesMap);
      } catch (e) {
        console.error("Error loading document types:", e);
      }
    };
    loadDocumentTypes();
  }, []);

  // Hàm mở modal hiển thị tài liệu
  const handleViewDocuments = async (payment: PartnerContractPayment) => {
    setSelectedPaymentForDocuments(payment);
    setShowDocumentsModal(true);
    setLoadingDocuments(true);
    try {
      const data = await partnerDocumentService.getAll({
        partnerContractPaymentId: payment.id,
        excludeDeleted: true
      });
      setDocuments(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      console.error("Error loading documents:", e);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Hàm đóng modal tài liệu
  const handleCloseDocumentsModal = () => {
    setShowDocumentsModal(false);
    setSelectedPaymentForDocuments(null);
    setDocuments([]);
  };

  // Hàm mở modal reject
  const handleOpenRejectModal = (payment: PartnerContractPayment) => {
    setSelectedPaymentForReject(payment);
    setShowRejectModal(true);
    setRejectionReason("");
    setUpdateError(null);
  };

  // Hàm đóng modal reject
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedPaymentForReject(null);
    setRejectionReason("");
    setUpdateError(null);
  };

  // Helper function để lấy danh sách user IDs theo role
  const getUserIdByRole = async (role: string): Promise<string[]> => {
    try {
      const usersData = await userService.getAll({ 
        role, 
        isActive: true, 
        excludeDeleted: true 
      });
      return usersData.items.map(user => user.id);
    } catch (error) {
      console.error(`Error getting users with role ${role}:`, error);
      return [];
    }
  };

  // Hàm từ chối (Reject) - Manager
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForReject || !rejectionReason.trim()) return;

    setUpdatingStatus(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await partnerContractPaymentService.reject(selectedPaymentForReject.id, {
        rejectionReason: rejectionReason.trim()
      });

      // Gửi thông báo cho accountant
      try {
        const accountantUserIds = await getUserIdByRole('AccountantStaff');
        if (accountantUserIds.length > 0) {
          const contract = contractsMap.get(selectedPaymentForReject.partnerContractId);
          const talent = talentsMap.get(selectedPaymentForReject.talentId);
          await notificationService.create({
            title: "Thanh toán hợp đồng đối tác bị từ chối",
            message: `Thanh toán hợp đồng ${contract?.contractNumber || selectedPaymentForReject.partnerContractId} - ${talent?.fullName || selectedPaymentForReject.talentId} đã bị từ chối. Lý do: ${rejectionReason.trim()}. Vui lòng chỉnh sửa và tính toán lại.`,
            type: NotificationType.PaymentOverdue,
            priority: NotificationPriority.High,
            userIds: accountantUserIds,
            entityType: "PartnerContractPayment",
            entityId: selectedPaymentForReject.id,
            actionUrl: `/accountant/payment-periods/partners`
          });
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Không throw error để không ảnh hưởng đến flow chính
      }

      setUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseRejectModal();
        setUpdateSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setUpdateError(error.response?.data?.message || error.message || 'Không thể từ chối thanh toán');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hàm mở modal approve
  const handleOpenApproveModal = (payment: PartnerContractPayment) => {
    setSelectedPaymentForApprove(payment);
    setShowApproveModal(true);
    setApproveNotes(payment.notes || "");
    setUpdateError(null);
  };

  // Hàm đóng modal approve
  const handleCloseApproveModal = () => {
    setShowApproveModal(false);
    setSelectedPaymentForApprove(null);
    setApproveNotes("");
    setUpdateError(null);
  };

  // Hàm chấp nhận (Approve) - Manager
  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForApprove) return;

    setUpdatingStatus(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await partnerContractPaymentService.approve(selectedPaymentForApprove.id, {
        notes: approveNotes || null
      });

      // Gửi thông báo cho accountant
      try {
        const accountantUserIds = await getUserIdByRole('AccountantStaff');
        if (accountantUserIds.length > 0) {
          const contract = contractsMap.get(selectedPaymentForApprove.partnerContractId);
          const talent = talentsMap.get(selectedPaymentForApprove.talentId);
          await notificationService.create({
            title: "Thanh toán hợp đồng đối tác đã được duyệt",
            message: `Thanh toán hợp đồng ${contract?.contractNumber || selectedPaymentForApprove.partnerContractId} - ${talent?.fullName || selectedPaymentForApprove.talentId} đã được duyệt.`,
            type: NotificationType.PaymentReceived,
            priority: NotificationPriority.Medium,
            userIds: accountantUserIds,
            entityType: "PartnerContractPayment",
            entityId: selectedPaymentForApprove.id,
            actionUrl: `/accountant/payment-periods/partners`
          });
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Không throw error để không ảnh hưởng đến flow chính
      }

      setUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseApproveModal();
        setUpdateSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setUpdateError(error.response?.data?.message || error.message || 'Không thể duyệt thanh toán');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mapping tiến trình theo status cho đối tác
  const stageOrder: Record<string, number> = {
    PendingCalculation: 1,
    PendingApproval: 2,
    Rejected: 0,
    Approved: 3,
    Paid: 4,
  };

  const maxStage = 4;

  const filteredPayments = (statusFilter === 'ALL')
    ? payments
    : payments.filter(p => (p.status || '').toLowerCase() === statusFilter.toString().toLowerCase());

  const statusCounts = payments.reduce<Record<string, number>>((acc, p) => {
    const s = p.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingCalculation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PendingApproval':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Paid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PendingCalculation':
        return 'Chờ tính toán';
      case 'PendingApproval':
        return 'Chờ duyệt';
      case 'Rejected':
        return 'Từ chối';
      case 'Approved':
        return 'Đã duyệt';
      case 'Paid':
        return 'Đã chi trả';
      default:
        return status;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ Thanh Toán Nhân Sự</h1>
          <p className="text-neutral-600 mt-1">Chọn nhân sự để xem và quản lý các kỳ thanh toán</p>
        </div>

        {/* Danh sách đối tác */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách nhân sự có hợp đồng</h2>
          {loadingPartners ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách nhân sự...
            </div>
          ) : partners.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Chưa có nhân sự nào có hợp đồng</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {partners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => {
                    setSelectedPartnerId(partner.id);
                    setActivePeriodId(null);
                    setPayments([]);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPartnerId === partner.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      selectedPartnerId === partner.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedPartnerId === partner.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {partner.companyName}
                      </div>
                      {partner.taxCode && (
                        <div className="text-xs text-gray-500 mt-1">Mã số thuế: {partner.taxCode}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách kỳ thanh toán */}
        {selectedPartnerId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedPartner?.companyName}
              </h2>
            </div>
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-10 text-gray-600">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
                Đang tải kỳ thanh toán...
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm">Chưa có kỳ thanh toán nào</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods
                  .sort((a, b) => {
                    if (a.periodYear !== b.periodYear) return a.periodYear - b.periodYear;
                    return a.periodMonth - b.periodMonth;
                  })
                  .map(period => (
                    <button
                      key={period.id}
                      onClick={() => onSelectPeriod(period.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        activePeriodId === period.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${
                          activePeriodId === period.id ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${
                            activePeriodId === period.id ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {monthNames[period.periodMonth - 1]} / {period.periodYear}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Trạng thái: {period.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Chi tiết thanh toán */}
        {selectedPartnerId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết thanh toán</h2>
              {payments.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string | 'ALL')}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.keys(statusCounts).map(s => (
                      <option key={s} value={s}>{getStatusLabel(s)} ({statusCounts[s]})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {!activePeriodId ? (
              <div className="text-gray-500 text-sm">Chọn một kỳ thanh toán để xem chi tiết</div>
            ) : loadingPayments ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />
                Đang tải khoản thanh toán...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-gray-500 text-sm">Chưa có dữ liệu thanh toán cho kỳ này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-3 border-b text-left">ID</th>
                      <th className="p-3 border-b text-left">Hợp đồng</th>
                      <th className="p-3 border-b text-left">Nhân sự</th>
                      <th className="p-3 border-b text-left">Giờ thực tế</th>
                      <th className="p-3 border-b text-left">OT</th>
                      <th className="p-3 border-b text-left">Tính toán</th>
                      <th className="p-3 border-b text-left">Đã chi</th>
                      <th className="p-3 border-b text-left">Trạng thái</th>
                      <th className="p-3 border-b text-left">Tiến độ</th>
                      <th className="p-3 border-b text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(p => {
                      const contract = contractsMap.get(p.partnerContractId);
                      const talent = talentsMap.get(p.talentId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3">
                            {contract ? (
                              <Link
                                to={`/manager/contracts/devs/${p.partnerContractId}`}
                                className="text-primary-600 hover:text-primary-800 hover:underline font-medium transition-colors"
                              >
                                {contract.contractNumber || p.partnerContractId}
                              </Link>
                            ) : (
                              p.partnerContractId
                            )}
                          </td>
                          <td className="p-3">{talent?.fullName || p.talentId}</td>
                          <td className="p-3">{p.actualWorkHours}</td>
                          <td className="p-3">{p.otHours ?? "-"}</td>
                          <td className="p-3">{formatVND(p.calculatedAmount)}</td>
                          <td className="p-3">{formatVND(p.paidAmount)}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            {(() => {
                              const current = stageOrder[p.status] ?? 0;
                              const percent = current > 0 ? Math.round((current / maxStage) * 100) : 0;
                              return (
                                <div className="w-40">
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500" style={{ width: `${percent}%` }} />
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1">{percent}%</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.status === 'PendingApproval' ? (
                                <>
                                  <button
                                    onClick={() => handleOpenApproveModal(p)}
                                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                  >
                                    <Check className="w-4 h-4" />
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleOpenRejectModal(p)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-all whitespace-nowrap"
                                  >
                                    <X className="w-4 h-4" />
                                    Từ chối
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs whitespace-nowrap">Không thể đổi</span>
                              )}
                              <button
                                onClick={() => handleViewDocuments(p)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 transition-all whitespace-nowrap"
                              >
                                <FileText className="w-4 h-4" />
                                Tài liệu
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal approve */}
        {showApproveModal && selectedPaymentForApprove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Duyệt thanh toán</h2>
                <button
                  onClick={handleCloseApproveModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {updateSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Duyệt thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {updateError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{updateError}</p>
                </div>
              )}

              <form onSubmit={handleApprove} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractsMap.get(selectedPaymentForApprove.partnerContractId)?.contractNumber || selectedPaymentForApprove.partnerContractId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân sự
                    </label>
                    <input
                      type="text"
                      value={talentsMap.get(selectedPaymentForApprove.talentId)?.fullName || selectedPaymentForApprove.talentId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Ghi chú về việc duyệt"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseApproveModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Duyệt
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal reject */}
        {showRejectModal && selectedPaymentForReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Từ chối thanh toán</h2>
                <button
                  onClick={handleCloseRejectModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {updateSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">✅ Từ chối thành công! Modal sẽ tự động đóng sau 2 giây.</p>
                </div>
              )}

              {updateError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{updateError}</p>
                </div>
              )}

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    required
                    placeholder="Nhập lý do từ chối thanh toán..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseRejectModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus || !rejectionReason.trim()}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Từ chối
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal hiển thị tài liệu */}
        {showDocumentsModal && selectedPaymentForDocuments && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseDocumentsModal();
              }
            }}
          >
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-neutral-200 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tài liệu thanh toán</h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Hợp đồng: {contractsMap.get(selectedPaymentForDocuments.partnerContractId)?.contractNumber || selectedPaymentForDocuments.partnerContractId} | 
                    Nhân sự: {talentsMap.get(selectedPaymentForDocuments.talentId)?.fullName || selectedPaymentForDocuments.talentId}
                  </p>
                </div>
                <button
                  onClick={handleCloseDocumentsModal}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-lg"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                    <span className="text-gray-600">Đang tải tài liệu...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-500">Chưa có tài liệu nào cho thanh toán này</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 truncate">{doc.fileName}</h4>
                            </div>
                            {documentTypes.get(doc.documentTypeId) && (
                              <p className="text-sm text-neutral-600 mb-1">
                                Loại: {documentTypes.get(doc.documentTypeId)?.typeName}
                              </p>
                            )}
                            {doc.description && (
                              <p className="text-sm text-neutral-500 mb-2">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              {doc.source && (
                                <span>Nguồn: {doc.source}</span>
                              )}
                              {doc.uploadTimestamp && (
                                <span>
                                  {new Date(doc.uploadTimestamp).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-4 h-4" />
                              Xem
                            </a>
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Download className="w-4 h-4" />
                              Tải xuống
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPartnerPeriods;

