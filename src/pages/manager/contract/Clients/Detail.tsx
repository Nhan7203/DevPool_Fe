import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../../components/common/Sidebar';
import { sidebarItems } from '../../../../components/manager/SidebarItems';

// ===== TYPES =====
interface Contract {
  id: number | string;
  contractNumber: string;
  clientCompany: string;
  project: string;
  partner: string;
  totalClientRatePerMonth: number;
  totalDevRatePerMonth: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface ContractDetail {
  id: number;
  talent: string;
  applyId: number;
  allocatedClientRate: number;
  allocatedDevRate: number;
  notes: string;
}

// ===== PAGE =====
export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [details, setDetails] = useState<ContractDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      setContract({
        id: id ?? 0,
        contractNumber: 'CTR-2025-010',
        clientCompany: 'Công ty TNHH ABC',
        project: 'Website E-Commerce',
        partner: 'DevPool Co., Ltd.',
        totalClientRatePerMonth: 95_000_000,
        totalDevRatePerMonth: 80_000_000,
        status: 'Active',
        startDate: '2025-03-01',
        endDate: '2025-12-31',
      });

      setDetails([
        {
          id: 1,
          talent: 'Nguyễn Văn A',
          applyId: 21,
          allocatedClientRate: 50_000_000,
          allocatedDevRate: 40_000_000,
          notes: 'Full-time Senior Dev',
        },
        {
          id: 2,
          talent: 'Trần Thị B',
          applyId: 22,
          allocatedClientRate: 45_000_000,
          allocatedDevRate: 40_000_000,
          notes: 'Part-time QA',
        },
      ]);

      setLoading(false);
    };

    fetchContract();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu hợp đồng...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy hợp đồng.
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hợp đồng #{contract.contractNumber}
          </h1>
          <p className="text-neutral-600 mt-1">
            Thông tin chi tiết của hợp đồng giữa DevPool và khách hàng
          </p>
        </div>

        {/* Thông tin hợp đồng */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">
            Thông tin chung
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Công ty khách hàng" value={contract.clientCompany} />
            <InfoItem label="Dự án" value={contract.project} />
            <InfoItem label="Đối tác" value={contract.partner} />
            <InfoItem label="Trạng thái" value={contract.status} />
            <InfoItem label="Ngày bắt đầu" value={contract.startDate} />
            <InfoItem label="Ngày kết thúc" value={contract.endDate} />
            <InfoItem
              label="Tổng giá trị khách hàng (VNĐ/tháng)"
              value={contract.totalClientRatePerMonth.toLocaleString('vi-VN')}
            />
            <InfoItem
              label="Tổng giá trị trả Dev (VNĐ/tháng)"
              value={contract.totalDevRatePerMonth.toLocaleString('vi-VN')}
            />
          </div>
        </div>

        {/* Chi tiết nhân sự */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-primary-700 mb-4">
            Danh sách nhân sự trong hợp đồng
          </h2>

          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tên nhân sự</th>
                <th className="text-left py-2 px-4">Apply ID</th>
                <th className="text-left py-2 px-4">Rate khách hàng</th>
                <th className="text-left py-2 px-4">Rate Dev</th>
                <th className="text-left py-2 px-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4">{d.talent}</td>
                  <td className="py-2 px-4">{d.applyId}</td>
                  <td className="py-2 px-4">{d.allocatedClientRate.toLocaleString('vi-VN')}</td>
                  <td className="py-2 px-4">{d.allocatedDevRate.toLocaleString('vi-VN')}</td>
                  <td className="py-2 px-4">{d.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-medium">{value || '-'}</p>
    </div>
  );
}
