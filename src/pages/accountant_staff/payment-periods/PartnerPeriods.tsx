import React, { useEffect, useState } from "react";
import { partnerPaymentPeriodService } from "../../../services/PartnerPaymentPeriod";
import type { PartnerPaymentPeriod } from "../../../services/PartnerPaymentPeriod";
import { partnerContractPaymentService } from "../../../services/PartnerContractPayment";
import type { PartnerContractPayment } from "../../../services/PartnerContractPayment";
import { partnerService, type Partner } from "../../../services/Partner";
import { partnerContractService, type PartnerContract } from "../../../services/PartnerContract";
import { talentService, type Talent } from "../../../services/Talent";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/accountant_staff/SidebarItems";
import { Building2, Plus, Calendar, X, Save, Edit, CheckCircle, XCircle, Send, Wallet } from "lucide-react";

const AccountantPartnerPeriods: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  
  const [periods, setPeriods] = useState<PartnerPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [creatingPeriods, setCreatingPeriods] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<PartnerContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  // Modal tạo payment
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contracts, setContracts] = useState<PartnerContract[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingTalents, setLoadingTalents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState<string | null>(null);
  const [createPaymentSuccess, setCreatePaymentSuccess] = useState(false);

  // Trạng thái cập nhật
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    partnerPeriodId: 0,
    partnerContractId: 0,
    talentId: 0,
    actualWorkHours: 0,
    otHours: 0,
    calculatedAmount: 0,
    paidAmount: 0,
    paymentDate: "",
    status: "PendingCalculation",
    notes: ""
  });

  // Lấy danh sách đối tác có hợp đồng
  useEffect(() => {
    const loadPartners = async () => {
      setLoadingPartners(true);
      try {
        // Lấy tất cả hợp đồng
        const contracts = await partnerContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        
        // Lấy danh sách các partnerId duy nhất
        const partnerIds = [...new Set(contractsData.map((c: PartnerContract) => c.partnerId))];
        
        // Lấy thông tin các đối tác từ danh sách tất cả partners
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

  // Hàm tạo period từ hợp đồng
  const handleCreatePeriods = async () => {
    if (!selectedPartnerId) return;

    setCreatingPeriods(true);
    setCreateMessage(null); // Xóa thông báo cũ
    try {
      // Lấy tất cả hợp đồng của đối tác
      const contracts = await partnerContractService.getAll({ 
        partnerId: selectedPartnerId,
        excludeDeleted: true 
      });
      const contractsData = contracts?.items ?? contracts ?? [];

      // Lấy các period hiện có để tránh trùng lặp
      const existingPeriods = await partnerPaymentPeriodService.getAll({ 
        partnerId: selectedPartnerId, 
        excludeDeleted: true 
      });
      const existingPeriodsData = existingPeriods?.items ?? existingPeriods ?? [];
      
      // Tạo Set để kiểm tra period đã tồn tại (key: "year-month")
      const existingPeriodSet = new Set<string>();
      existingPeriodsData.forEach((p: PartnerPaymentPeriod) => {
        existingPeriodSet.add(`${p.periodYear}-${p.periodMonth}`);
      });

      // Tính toán các tháng mà hợp đồng hiệu lực
      const activeMonths = new Set<string>(); // key: "year-month"
      
      contractsData.forEach((contract: PartnerContract) => {
        if (!contract.startDate) return;
        
        const startDate = new Date(contract.startDate);
        const endDate = contract.endDate ? new Date(contract.endDate) : new Date('2099-12-31'); // Nếu không có endDate, coi như hợp đồng chưa kết thúc
        
        // Duyệt qua tất cả các tháng từ startDate đến endDate
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        
        while (currentDate <= finalDate) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1; // getMonth() trả về 0-11, cần +1
          activeMonths.add(`${year}-${month}`);
          
          // Chuyển sang tháng tiếp theo
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }
      });

      // Tạo các period mới cho những tháng chưa có period
      const periodsToCreate: Array<{ year: number; month: number }> = [];
      activeMonths.forEach((key) => {
        if (!existingPeriodSet.has(key)) {
          const [year, month] = key.split('-').map(Number);
          periodsToCreate.push({ year, month });
        }
      });

      // Hiển thị thông báo nếu không có period mới nào cần tạo
      if (periodsToCreate.length === 0) {
        setCreateMessage('Tất cả các kỳ thanh toán đã được tạo. Không có kỳ thanh toán mới nào cần tạo.');
        setTimeout(() => setCreateMessage(null), 5000);
        setCreatingPeriods(false);
        return;
      }

      // Tạo các period
      const createdPeriods = await Promise.all(
        periodsToCreate.map(async ({ year, month }) => {
          try {
            return await partnerPaymentPeriodService.create({
              partnerId: selectedPartnerId,
              periodMonth: month,
              periodYear: year,
              status: 'Pending'
            });
          } catch (e) {
            console.error(`Error creating period ${year}-${month}:`, e);
            return null;
          }
        })
      );

      const successCount = createdPeriods.filter(p => p !== null).length;
      
      // Reload periods
      const updatedPeriods = await partnerPaymentPeriodService.getAll({ 
        partnerId: selectedPartnerId, 
        excludeDeleted: true 
      });
      setPeriods(updatedPeriods?.items ?? updatedPeriods ?? []);
      
      // Hiển thị thông báo thành công
      if (successCount > 0) {
        setCreateMessage(`Đã tạo thành công ${successCount} kỳ thanh toán mới.`);
        setTimeout(() => setCreateMessage(null), 5000);
      } else {
        setCreateMessage('Không thể tạo kỳ thanh toán. Vui lòng thử lại.');
        setTimeout(() => setCreateMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingPeriods(false);
    }
  };

  const onSelectPeriod = async (periodId: number) => {
    setActivePeriodId(periodId);
    setLoadingPayments(true);
    try {
      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: periodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load contracts và talents khi mở modal
  const handleOpenCreateModal = async () => {
    if (!selectedPartnerId) return;
    setShowCreateModal(true);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);
    setFormData({
      partnerPeriodId: activePeriodId || 0,
      partnerContractId: 0,
      talentId: 0,
      actualWorkHours: 0,
      otHours: 0,
      calculatedAmount: 0,
      paidAmount: 0,
      paymentDate: "",
      status: "PendingCalculation",
      notes: ""
    });

    // Load contracts và talents của đối tác
    setLoadingContracts(true);
    setLoadingTalents(true);
    try {
      const [contractsData, talentsData] = await Promise.all([
        partnerContractService.getAll({ 
          partnerId: selectedPartnerId,
          excludeDeleted: true 
        }),
        talentService.getAll({ excludeDeleted: true })
      ]);
      setContracts(contractsData?.items ?? contractsData ?? []);
      setTalents(talentsData?.items ?? talentsData ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContracts(false);
      setLoadingTalents(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partnerPeriodId' || name === 'partnerContractId' || name === 'talentId' 
        || name === 'actualWorkHours' || name === 'otHours' 
        || name === 'calculatedAmount' || name === 'paidAmount'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriodId) return;

    setSubmitting(true);
    setCreatePaymentError(null);
    setCreatePaymentSuccess(false);

    try {
      const payload = {
        partnerPeriodId: activePeriodId,
        partnerContractId: formData.partnerContractId,
        talentId: formData.talentId,
        actualWorkHours: formData.actualWorkHours,
        otHours: formData.otHours || null,
        calculatedAmount: formData.calculatedAmount || null,
        paidAmount: formData.paidAmount || null,
        paymentDate: formData.paymentDate || null,
        status: 'PendingCalculation', // Luôn là PendingCalculation khi tạo mới
        notes: formData.notes || null
      };

      await partnerContractPaymentService.create(payload);
      setCreatePaymentSuccess(true);

      // Reload payments
      const data = await partnerContractPaymentService.getAll({ 
        partnerPeriodId: activePeriodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);

      // Close modal after 1 second
      setTimeout(() => {
        handleCloseCreateModal();
      }, 1000);
    } catch (err: any) {
      setCreatePaymentError(err.response?.data?.message || err.message || 'Không thể tạo thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm nộp (PendingApproval) - Accountant
  const handleSubmit = async (payment: PartnerContractPayment) => {
    if (payment.status !== 'PendingCalculation') return;

    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);

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
        status: 'PendingApproval',
        notes: payment.notes ?? null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err: any) {
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể nộp thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hàm đã chi trả (Paid) - Accountant
  const handleMarkAsPaid = async (payment: PartnerContractPayment) => {
    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);

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
        status: 'Paid',
        notes: payment.notes ?? null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await partnerContractPaymentService.getAll({ 
          partnerPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err: any) {
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể đánh dấu đã chi trả');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mapping tiến trình theo status
  const stageOrder: Record<string, number> = {
    PendingCalculation: 1,
    PendingApproval: 2,
    Rejected: 0,
    Approved: 3,
    Paid: 4,
  };

  const maxStage = 4;

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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ thanh toán Đối tác</h1>
          <p className="text-neutral-600 mt-1">Chọn đối tác để xem các kỳ thanh toán</p>
        </div>

        {/* Danh sách đối tác */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách đối tác có hợp đồng</h2>
          {loadingPartners ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách đối tác...
            </div>
          ) : partners.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Chưa có đối tác nào có hợp đồng</div>
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
              <button
                onClick={handleCreatePeriods}
                disabled={creatingPeriods}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {creatingPeriods ? 'Đang tạo...' : 'Tạo kỳ thanh toán từ hợp đồng'}
              </button>
            </div>
            {createMessage && (
              <div className={`mb-4 p-3 rounded-xl border ${
                createMessage.includes('thành công') 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : createMessage.includes('đã được tạo')
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {createMessage}
              </div>
            )}
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-10 text-gray-600">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
                Đang tải kỳ thanh toán...
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm mb-4">Chưa có kỳ thanh toán nào</div>
                <button
                  onClick={handleCreatePeriods}
                  disabled={creatingPeriods}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {creatingPeriods ? 'Đang tạo...' : 'Tạo kỳ thanh toán từ hợp đồng'}
                </button>
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
              <div className="flex items-center gap-2">
                {activePeriodId && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo thanh toán
                  </button>
                )}
                {payments.length > 0 && (
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.keys(statusCounts).map(s => (
                      <option key={s} value={s}>{getStatusLabel(s)} ({statusCounts[s]})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {statusUpdateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                Cập nhật trạng thái thành công!
              </div>
            )}
            {statusUpdateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {statusUpdateError}
              </div>
            )}
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
                      <th className="p-3 border-b text-left">Contract</th>
                      <th className="p-3 border-b text-left">Talent</th>
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
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3">{p.partnerContractId}</td>
                          <td className="p-3">{p.talentId}</td>
                          <td className="p-3">{p.actualWorkHours}</td>
                          <td className="p-3">{p.otHours ?? "-"}</td>
                          <td className="p-3">{p.calculatedAmount ?? "-"}</td>
                          <td className="p-3">{p.paidAmount ?? "-"}</td>
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
                            <div className="flex items-center gap-2">
                              {p.status === 'PendingCalculation' && (
                                <button
                                  onClick={() => handleSubmit(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Send className="w-4 h-4" />
                                  {updatingStatus ? 'Đang xử lý...' : 'Nộp'}
                                </button>
                              )}
                              {p.status === 'Approved' && (
                                <button
                                  onClick={() => handleMarkAsPaid(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Wallet className="w-4 h-4" />
                                  {updatingStatus ? 'Đang xử lý...' : 'Đã chi trả'}
                                </button>
                              )}
                              {p.status !== 'PendingCalculation' && p.status !== 'Approved' && (
                                <span className="text-gray-400 text-xs">Không thể đổi</span>
                              )}
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

        {/* Modal tạo payment */}
        {showCreateModal && activePeriodId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tạo thanh toán mới</h2>
                <button
                  onClick={handleCloseCreateModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {createPaymentSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                  Tạo thanh toán thành công!
                </div>
              )}

              {createPaymentError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  {createPaymentError}
                </div>
              )}

              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="partnerContractId"
                      value={formData.partnerContractId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingContracts}
                    >
                      <option value="0">-- Chọn hợp đồng --</option>
                      {contracts.map(contract => (
                        <option key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {contract.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Talent <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="talentId"
                      value={formData.talentId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      disabled={loadingTalents}
                    >
                      <option value="0">-- Chọn talent --</option>
                      {talents.map(talent => (
                        <option key={talent.id} value={talent.id}>
                          {talent.fullName} - {talent.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ thực tế <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="actualWorkHours"
                      value={formData.actualWorkHours}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ OT
                    </label>
                    <input
                      type="number"
                      name="otHours"
                      value={formData.otHours}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền tính toán
                    </label>
                    <input
                      type="number"
                      name="calculatedAmount"
                      value={formData.calculatedAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đã chi
                    </label>
                    <input
                      type="number"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày thanh toán
                    </label>
                    <input
                      type="datetime-local"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="status"
                      value={getStatusLabel(formData.status)}
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
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Tạo thanh toán
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountantPartnerPeriods;
