import React, { useEffect, useState } from "react";
import { partnerPaymentPeriodService } from "../../../services/PartnerPaymentPeriod";
import type { PartnerPaymentPeriod } from "../../../services/PartnerPaymentPeriod";
import { partnerContractPaymentService } from "../../../services/PartnerContractPayment";
import type { PartnerContractPayment } from "../../../services/PartnerContractPayment";
import { partnerService, type Partner } from "../../../services/Partner";
import { partnerContractService, type PartnerContract } from "../../../services/PartnerContract";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/manager/SidebarItems";
import { Building2, Calendar, Edit, CheckCircle, XCircle, X, Check } from "lucide-react";

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
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

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

  // Hàm từ chối (Rejected) - Manager
  const handleReject = async (payment: PartnerContractPayment) => {
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
        status: 'Rejected',
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
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể từ chối thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hàm chấp nhận (Approved) - Manager
  const handleApprove = async (payment: PartnerContractPayment) => {
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
        status: 'Approved',
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
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể chấp nhận thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
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
          <h1 className="text-3xl font-bold text-gray-900">Kỳ thanh toán Đối tác</h1>
          <p className="text-neutral-600 mt-1">Chọn đối tác để xem và quản lý các kỳ thanh toán</p>
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
                    onChange={(e) => setStatusFilter(e.target.value as any)}
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
                            {p.status === 'PendingApproval' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleReject(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                  Từ chối
                                </button>
                                <button
                                  onClick={() => handleApprove(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4" />
                                  Chấp nhận
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Không thể đổi</span>
                            )}
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

      </div>
    </div>
  );
};

export default ManagerPartnerPeriods;

