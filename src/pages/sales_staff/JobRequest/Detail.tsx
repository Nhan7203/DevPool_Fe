import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/sales_staff/SidebarItems';

interface JobRequest {
  id: number;
  title: string;
  project: string;
  jobPosition: string;
  level: string;
  quantity: number;
  budgetPerMonth: number | null;
  status: string;
  description: string;
  requirements: string;
  clientCompanyCVTemplate: string;
}

export default function JobRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobRequest = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      // Giả lập dữ liệu
      setJobRequest({
        id: Number(id),
        title: 'Senior Frontend Developer (React)',
        project: 'E-Commerce Website',
        jobPosition: 'Frontend Developer',
        level: 'Senior',
        quantity: 2,
        budgetPerMonth: 55000000,
        status: 'Open',
        description:
          'Phát triển giao diện người dùng cho hệ thống thương mại điện tử.',
        requirements:
          '- Thành thạo ReactJS, TypeScript.\n- Có kinh nghiệm với REST API, Redux.\n- Ưu tiên biết Next.js và TailwindCSS.',
        clientCompanyCVTemplate: 'CV Template ABC',
      });

      setLoading(false);
    };

    fetchJobRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải dữ liệu yêu cầu tuyển dụng...
      </div>
    );
  }

  if (!jobRequest) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy yêu cầu tuyển dụng
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
            Job Request #{jobRequest.id} – {jobRequest.title}
          </h1>
          <p className="text-neutral-600 mt-1">
            Thông tin chi tiết yêu cầu tuyển dụng của khách hàng
          </p>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">
            Thông tin chung
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <InfoItem label="Dự án" value={jobRequest.project} />
            <InfoItem label="Vị trí" value={jobRequest.jobPosition} />
            <InfoItem label="Cấp độ" value={jobRequest.level} />
            <InfoItem label="Số lượng cần tuyển" value={String(jobRequest.quantity)} />
            <InfoItem
              label="Ngân sách (VNĐ/tháng)"
              value={
                jobRequest.budgetPerMonth
                  ? jobRequest.budgetPerMonth.toLocaleString('vi-VN')
                  : '-'
              }
            />
            <InfoItem label="Trạng thái" value={jobRequest.status} />
            <InfoItem
              label="CV Template của khách hàng"
              value={jobRequest.clientCompanyCVTemplate}
            />
          </div>
        </div>

        {/* Mô tả & Yêu cầu */}
        <div className="bg-white rounded-2xl shadow-soft p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Mô tả công việc
            </h3>
            <p className="whitespace-pre-line text-gray-800">
              {jobRequest.description || 'Chưa có mô tả'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Yêu cầu ứng viên
            </h3>
            <p className="whitespace-pre-line text-gray-800">
              {jobRequest.requirements || 'Chưa có yêu cầu cụ thể'}
            </p>
          </div>
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
