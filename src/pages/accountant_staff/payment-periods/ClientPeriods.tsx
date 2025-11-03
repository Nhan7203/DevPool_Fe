import React, { useEffect, useMemo, useState } from "react";
import MonthGrid from "../../../components/common/MonthGrid";
import { clientPaymentPeriodService } from "../../../services/ClientPaymentPeriod";
import type { ClientPaymentPeriod } from "../../../services/ClientPaymentPeriod";
import { clientContractPaymentService } from "../../../services/ClientContractPayment";
import type { ClientContractPayment } from "../../../services/ClientContractPayment";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/accountant_staff/SidebarItems";

const AccountantClientPeriods: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [periods, setPeriods] = useState<ClientPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | undefined>(undefined);
  const [payments, setPayments] = useState<ClientContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const data = await clientPaymentPeriodService.getAll({ periodYear: year, excludeDeleted: true });
        setPeriods(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, [year]);

  const monthToPeriodId = useMemo(() => {
    const map: Record<number, number> = {};
    periods.forEach(p => {
      map[p.periodMonth] = p.id;
    });
    return map;
  }, [periods]);

  const onSelectMonth = async (month: number) => {
    setActiveMonth(month);
    const pid = monthToPeriodId[month] || null;
    setActivePeriodId(pid);
    if (!pid) {
      setPayments([]);
      return;
    }
    setLoadingPayments(true);
    try {
      const data = await clientContractPaymentService.getAll({ clientPeriodId: pid, excludeDeleted: true });
      setPayments(data?.items ?? data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Mapping tiến trình theo status (tham chiếu luồng nghiệp vụ)
  const stageOrder: Record<string, number> = {
    WorkReportUploaded: 1,
    WorkReportApproved: 2,
    CostCalculated: 3,
    InvoiceDraft: 4,
    InvoiceApproved: 5,
    InvoiceIssued: 6,
    Paid: 7,
    Overdue: 6,
  };

  const maxStage = 7;

  const filteredPayments = (statusFilter === 'ALL')
    ? payments
    : payments.filter(p => (p.status || '').toLowerCase() === statusFilter.toString().toLowerCase());

  const statusCounts = payments.reduce<Record<string, number>>((acc, p) => {
    const s = p.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Staff Accountant" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kỳ thanh toán Khách hàng</h1>
              <p className="text-neutral-600 mt-1">Chọn tháng để xem chi tiết các khoản thanh toán</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm" onClick={() => setYear(y => y - 1)}>Năm trước</button>
              <span className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-semibold border border-primary-100">{year}</span>
              <button className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-soft" onClick={() => setYear(y => y + 1)}>Năm sau</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn tháng</h2>
          {loadingPeriods ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3" />
              Đang tải kỳ thanh toán...
            </div>
          ) : (
            <MonthGrid year={year} activeMonth={activeMonth} onSelect={onSelectMonth} />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chi tiết kỳ thanh toán</h2>
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                {Object.keys(statusCounts).map(s => (
                  <option key={s} value={s}>{s} ({statusCounts[s]})</option>
                ))}
              </select>
            </div>
          </div>
          {!activePeriodId ? (
            <div className="text-gray-500 text-sm">Chọn một tháng để xem khoản thanh toán</div>
          ) : loadingPayments ? (
            <div className="flex items-center text-gray-600"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />Đang tải khoản thanh toán...</div>
          ) : payments.length === 0 ? (
            <div className="text-gray-500 text-sm">Chưa có dữ liệu</div>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3">{p.id}</td>
                      <td className="p-3">{p.clientContractId}</td>
                      <td className="p-3">{p.billableHours}</td>
                      <td className="p-3">{p.calculatedAmount ?? "-"}</td>
                      <td className="p-3">{p.invoicedAmount ?? "-"}</td>
                      <td className="p-3">{p.receivedAmount ?? "-"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{p.status}</span>
                      </td>
                      <td className="p-3">
                        {(() => {
                          const current = stageOrder[p.status] ?? 0;
                          const percent = Math.round((current / maxStage) * 100);
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantClientPeriods;
