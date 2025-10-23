import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Mail, Phone, Github, User, Download, Briefcase, Code, Layers } from "lucide-react";
import { Button } from "../../../components/ui/button";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";

interface TalentCV {
  id: number;
  versionName: string;
  originalCVFilePath: string;
  generatedCVFilePath: string;
  isActive: boolean;
  summary: string;
  highlights: string;
  description: string;
  talent: Talent;
  jobRole: JobRole;
  workingStyle: WorkingStyle;
}

interface Talent {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  githubUrl?: string;
  level: string;
  yearsOfExp: number;
  ratePerMonth?: number;
}

interface JobRole {
  id: number;
  name: string;
}

interface WorkingStyle {
  id: number;
  name: string;
}

export default function TalentCVDetail() {
  const { id } = useParams();
  const [cv, setCV] = useState<TalentCV | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock API fetch (demo)
  useEffect(() => {
    setTimeout(() => {
      const mockData: TalentCV = {
        id: 1,
        versionName: "CV_ReactJS_2025",
        originalCVFilePath: "/files/nguyenvana-original.pdf",
        generatedCVFilePath: "/files/nguyenvana-ai-generated.pdf",
        isActive: true,
        summary: "Lập trình viên ReactJS với hơn 3 năm kinh nghiệm phát triển front-end hiện đại.",
        highlights: "• Thành thạo React, TypeScript, TailwindCSS\n• Kinh nghiệm với RESTful API, Next.js\n• Đã tham gia nhiều dự án outsource quy mô vừa và lớn.",
        description: "Từng đảm nhận vai trò chính trong việc phát triển giao diện người dùng, tối ưu trải nghiệm và hiệu suất cho nhiều ứng dụng web. Có khả năng làm việc nhóm tốt và giao tiếp hiệu quả với khách hàng.",
        talent: {
          id: 101,
          fullName: "Nguyễn Văn A",
          email: "vana@example.com",
          phone: "0909123456",
          githubUrl: "https://github.com/nguyenvana",
          level: "Middle",
          yearsOfExp: 3,
          ratePerMonth: 2500,
        },
        jobRole: {
          id: 5,
          name: "Frontend Developer",
        },
        workingStyle: {
          id: 1,
          name: "Hybrid",
        },
      };
      setCV(mockData);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang tải thông tin CV...
      </div>
    );
  }

  if (!cv) {
    return <div className="p-8 text-red-600">Không tìm thấy CV!</div>;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết CV</h1>
            <p className="text-gray-600 mt-1">Phiên bản: {cv.versionName}</p>
          </div>

          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
              Gửi CV cho Sales
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl">
              Gắn với Job Request
            </Button>
          </div>
        </div>

        {/* Thông tin ứng viên */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{cv.talent.fullName}</h2>
              <p className="text-gray-600">{cv.jobRole.name}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p><Mail className="inline w-4 h-4 mr-2 text-gray-500" /> {cv.talent.email}</p>
            <p><Phone className="inline w-4 h-4 mr-2 text-gray-500" /> {cv.talent.phone}</p>
            {cv.talent.githubUrl && (
              <p>
                <Github className="inline w-4 h-4 mr-2 text-gray-500" />
                <a href={cv.talent.githubUrl} target="_blank" className="text-blue-600 hover:underline">
                  Github
                </a>
              </p>
            )}
            <p><Briefcase className="inline w-4 h-4 mr-2 text-gray-500" /> Cấp độ: {cv.talent.level}</p>
            <p><Layers className="inline w-4 h-4 mr-2 text-gray-500" /> Kinh nghiệm: {cv.talent.yearsOfExp} năm</p>
            <p><Code className="inline w-4 h-4 mr-2 text-gray-500" /> Working Style: {cv.workingStyle.name}</p>
          </div>
        </div>

        {/* Mô tả CV */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt</h3>
          <p className="text-gray-700 mb-4">{cv.summary}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Điểm nổi bật</h3>
          <pre className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap mb-4">
            {cv.highlights}
          </pre>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả chi tiết</h3>
          <p className="text-gray-700">{cv.description}</p>
        </div>

        {/* File CV */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">File CV</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={cv.originalCVFilePath}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
            >
              <FileText className="w-5 h-5 text-gray-600" />
              Xem CV gốc
            </a>

            <a
              href={cv.generatedCVFilePath}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-primary-700"
            >
              <Download className="w-5 h-5 text-primary-600" />
              Tải CV đã tạo
            </a>

            {cv.isActive ? (
              <span className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                Đang hoạt động
              </span>
            ) : (
              <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                Không hoạt động
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
