import React, { useEffect, useMemo, useState } from "react";
import MonthGrid from "../../../components/common/MonthGrid";
import { clientPaymentPeriodService } from "../../../services/ClientPaymentPeriod";
import type { ClientPaymentPeriod } from "../../../services/ClientPaymentPeriod";
import { clientContractPaymentService } from "../../../services/ClientContractPayment";
import type { ClientContractPayment } from "../../../services/ClientContractPayment";

const AccountantClientPeriods: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [periods, setPeriods] = useState<ClientPaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | undefined>(undefined);
  const [payments, setPayments] = useState<ClientContractPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Kỳ thanh toán Khách hàng ({year})</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setYear(y => y - 1)}>Năm trước</button>
          <button className="px-3 py-1 border rounded" onClick={() => setYear(y => y + 1)}>Năm sau</button>
        </div>
      </div>

      {loadingPeriods ? (
        <div>Đang tải kỳ thanh toán...</div>
      ) : (
        <MonthGrid year={year} activeMonth={activeMonth} onSelect={onSelectMonth} />
      )}

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Chi tiết kỳ thanh toán</h2>
        {!activePeriodId ? (
          <div className="text-gray-500 text-sm">Chọn một tháng để xem khoản thanh toán</div>
        ) : loadingPayments ? (
          <div>Đang tải khoản thanh toán...</div>
        ) : payments.length === 0 ? (
          <div className="text-gray-500 text-sm">Chưa có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Contract</th>
                  <th className="p-2 border">Giờ bill</th>
                  <th className="p-2 border">Tính toán</th>
                  <th className="p-2 border">Invoice</th>
                  <th className="p-2 border">Received</th>
                  <th className="p-2 border">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border">{p.id}</td>
                    <td className="p-2 border">{p.clientContractId}</td>
                    <td className="p-2 border">{p.billableHours}</td>
                    <td className="p-2 border">{p.calculatedAmount ?? "-"}</td>
                    <td className="p-2 border">{p.invoicedAmount ?? "-"}</td>
                    <td className="p-2 border">{p.receivedAmount ?? "-"}</td>
                    <td className="p-2 border">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantClientPeriods;
