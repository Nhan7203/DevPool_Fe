import { useEffect, useState } from 'react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

interface JobRequest {
  id: number;
  title: string;
  clientCompany: string;
  project: string;
  jobPosition: string;
  level: string;
  quantity: number;
  budgetPerMonth?: number | null;
  status: string;
}

export default function JobRequestListPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<JobRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700)); // giả lập API

      setRequests([
        {
          id: 1,
          title: 'Tuyển Frontend ReactJS Developer',
          clientCompany: 'Công ty TNHH ABC',
          project: 'E-Commerce Platform',
          jobPosition: 'Frontend Developer',
          level: 'Middle',
          quantity: 2,
          budgetPerMonth: 45_000_000,
          status: 'Open',
        },
        {
          id: 2,
          title: 'Backend .NET Engineer',
          clientCompany: 'Công ty XYZ Solutions',
          project: 'CRM System',
          jobPosition: 'Backend Developer',
          level: 'Senior',
          quantity: 1,
          budgetPerMonth: 55_000_000,
          status: 'In Progress',
        },
        {
          id: 3,
          title: 'QA Manual Tester',
          clientCompany: 'Tập đoàn Zeta',
          project: 'Mobile App QA',
          jobPosition: 'Tester',
          level: 'Junior',
          quantity: 3,
          budgetPerMonth: 30_000_000,
          status: 'Closed',
        },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải danh sách yêu cầu tuyển dụng...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách Yêu cầu Tuyển dụng
            </h1>
            <p className="text-neutral-600 mt-1">
              Tổng hợp các yêu cầu tuyển dụng từ các công ty khách hàng.
            </p>
          </div>

          <Link to="/sales/job-requests/create">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">
              + Tạo yêu cầu mới
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Tiêu đề</th>
                <th className="text-left py-2 px-4">Công ty KH</th>
                <th className="text-left py-2 px-4">Dự án</th>
                <th className="text-left py-2 px-4">Vị trí</th>
                <th className="text-left py-2 px-4">Cấp độ</th>
                <th className="text-left py-2 px-4">Số lượng</th>
                <th className="text-left py-2 px-4">Ngân sách (VNĐ/tháng)</th>
                <th className="text-left py-2 px-4">Trạng thái</th>
                <th className="text-left py-2 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-primary-700">
                    {r.title}
                  </td>
                  <td className="py-2 px-4">{r.clientCompany}</td>
                  <td className="py-2 px-4">{r.project}</td>
                  <td className="py-2 px-4">{r.jobPosition}</td>
                  <td className="py-2 px-4">{r.level}</td>
                  <td className="py-2 px-4 text-center">{r.quantity}</td>
                  <td className="py-2 px-4">
                    {r.budgetPerMonth?.toLocaleString('vi-VN') || '-'}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2 px-4">
                    <Link
                      to={`/sales/job-requests/${r.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = 'bg-gray-200 text-gray-700';
  if (status === 'Open') color = 'bg-green-100 text-green-700';
  else if (status === 'In Progress') color = 'bg-yellow-100 text-yellow-700';
  else if (status === 'Closed') color = 'bg-red-100 text-red-700';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}
