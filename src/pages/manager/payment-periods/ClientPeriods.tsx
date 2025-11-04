import React, { useEffect, useState } from "react";
import { clientPaymentPeriodService } from "../../../services/ClientPaymentPeriod";
import type { ClientPaymentPeriod } from "../../../services/ClientPaymentPeriod";
import { clientContractPaymentService } from "../../../services/ClientContractPayment";
import type { ClientContractPayment } from "../../../services/ClientContractPayment";
import { clientCompanyService, type ClientCompany } from "../../../services/ClientCompany";
import { clientContractService, type ClientContract } from "../../../services/ClientContract";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/manager/SidebarItems";
import { Building2, Calendar, Edit, CheckCircle, XCircle, X, Check } from "lucide-react";

const ManagerClientPeriods: React.FC = () => {
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  
  const [periods, setPeriods] = useState<ClientPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [payments, setPayments] = useState<ClientContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  // Trạng thái cập nhật
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Lấy danh sách công ty có hợp đồng
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const contracts = await clientContractService.getAll({ excludeDeleted: true });
        const contractsData = contracts?.items ?? contracts ?? [];
        
        const companyIds = [...new Set(contractsData.map((c: ClientContract) => c.clientCompanyId))];
        
        const companiesData = await Promise.all(
          companyIds.map(async (id: number) => {
            try {
              return await clientCompanyService.getById(id);
            } catch (e) {
              console.error(`Error loading company ${id}:`, e);
              return null;
            }
          })
        );
        
        setCompanies(companiesData.filter((c): c is ClientCompany => c !== null));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Khi chọn công ty, load các period của công ty đó
  useEffect(() => {
    if (!selectedCompanyId) {
      setPeriods([]);
      return;
    }

    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await clientPaymentPeriodService.getAll({ 
          clientCompanyId: selectedCompanyId, 
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
  }, [selectedCompanyId]);

  const onSelectPeriod = async (periodId: number) => {
    setActivePeriodId(periodId);
    setLoadingPayments(true);
    try {
      const data = await clientContractPaymentService.getAll({ 
        clientPeriodId: periodId, 
        excludeDeleted: true 
      });
      setPayments(data?.items ?? data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Hàm hủy (Cancelled) - Manager
  const handleCancel = async (payment: ClientContractPayment) => {
    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);

    try {
      await clientContractPaymentService.update(payment.id, {
        clientPeriodId: payment.clientPeriodId,
        clientContractId: payment.clientContractId,
        billableHours: payment.billableHours,
        calculatedAmount: payment.calculatedAmount ?? null,
        invoicedAmount: payment.invoicedAmount ?? null,
        receivedAmount: payment.receivedAmount ?? null,
        invoiceNumber: payment.invoiceNumber ?? null,
        invoiceDate: payment.invoiceDate ?? null,
        paymentDate: payment.paymentDate ?? null,
        status: 'Cancelled',
        notes: payment.notes ?? null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err: any) {
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể hủy thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hàm đồng ý (Invoiced) - Manager
  const handleApprove = async (payment: ClientContractPayment) => {
    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);

    try {
      await clientContractPaymentService.update(payment.id, {
        clientPeriodId: payment.clientPeriodId,
        clientContractId: payment.clientContractId,
        billableHours: payment.billableHours,
        calculatedAmount: payment.calculatedAmount ?? null,
        invoicedAmount: payment.invoicedAmount ?? null,
        receivedAmount: payment.receivedAmount ?? null,
        invoiceNumber: payment.invoiceNumber ?? null,
        invoiceDate: payment.invoiceDate ?? null,
        paymentDate: payment.paymentDate ?? null,
        status: 'Invoiced',
        notes: payment.notes ?? null
      });
      
      setStatusUpdateSuccess(true);

      // Reload payments
      if (activePeriodId) {
        const data = await clientContractPaymentService.getAll({ 
          clientPeriodId: activePeriodId, 
          excludeDeleted: true 
        });
        setPayments(data?.items ?? data ?? []);
      }

      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err: any) {
      setStatusUpdateError(err.response?.data?.message || err.message || 'Không thể duyệt thanh toán');
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Lấy danh sách trạng thái có thể chuyển đổi từ trạng thái hiện tại
  // Manager chỉ được phép: ReadyForInvoice → Cancelled/Invoiced
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const status = currentStatus || '';
    if (status === 'ReadyForInvoice') {
      return ['Cancelled', 'Invoiced'];
    }
    return [];
  };

  // Mapping tiến trình theo status
  const stageOrder: Record<string, number> = {
    PendingCalculation: 1,
    ReadyForInvoice: 2,
    Cancelled: 0,
    Invoiced: 3,
    Overdue: 3,
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

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingCalculation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ReadyForInvoice':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Invoiced':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Overdue':
        return 'bg-orange-50 text-orange-700 border-orange-200';
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
      case 'ReadyForInvoice':
        return 'Sẵn sàng xuất hóa đơn';
      case 'Cancelled':
        return 'Đã hủy';
      case 'Invoiced':
        return 'Đã xuất hóa đơn';
      case 'Overdue':
        return 'Quá hạn';
      case 'Paid':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Manager" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kỳ thanh toán Khách hàng</h1>
          <p className="text-neutral-600 mt-1">Chọn công ty để xem và quản lý các kỳ thanh toán</p>
        </div>

        {/* Danh sách công ty */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách công ty có hợp đồng</h2>
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải danh sách công ty...
            </div>
          ) : companies.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Chưa có công ty nào có hợp đồng</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map(company => (
                <button
                  key={company.id}
                  onClick={() => {
                    setSelectedCompanyId(company.id);
                    setActivePeriodId(null);
                    setPayments([]);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCompanyId === company.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      selectedCompanyId === company.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedCompanyId === company.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {company.name}
                      </div>
                      {company.taxCode && (
                        <div className="text-xs text-gray-500 mt-1">Mã số thuế: {company.taxCode}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách kỳ thanh toán */}
        {selectedCompanyId && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Kỳ thanh toán - {selectedCompany?.name}
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
        {selectedCompanyId && (
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
                      <th className="p-3 border-b text-left">Giờ bill</th>
                      <th className="p-3 border-b text-left">Tính toán</th>
                      <th className="p-3 border-b text-left">Invoice</th>
                      <th className="p-3 border-b text-left">Received</th>
                      <th className="p-3 border-b text-left">Trạng thái</th>
                      <th className="p-3 border-b text-left">Tiến độ</th>
                      <th className="p-3 border-b text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(p => {
                      const availableStatuses = getAvailableStatuses(p.status);
                      const canChangeStatus = availableStatuses.length > 0;
                      
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3">{p.clientContractId}</td>
                          <td className="p-3">{p.billableHours}</td>
                          <td className="p-3">{p.calculatedAmount ?? "-"}</td>
                          <td className="p-3">{p.invoicedAmount ?? "-"}</td>
                          <td className="p-3">{p.receivedAmount ?? "-"}</td>
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
                            {p.status === 'ReadyForInvoice' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCancel(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleApprove(p)}
                                  disabled={updatingStatus}
                                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4" />
                                  Đồng ý
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

export default ManagerClientPeriods;

