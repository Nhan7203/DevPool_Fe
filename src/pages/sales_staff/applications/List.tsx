import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/sales_staff/SidebarItems";
import { talentApplicationService, type TalentApplication } from "../../../services/TalentApplication";
import { jobRequestService, type JobRequest } from "../../../services/JobRequest";
import { talentCVService, type TalentCV } from "../../../services/TalentCV";
import { userService, type User } from "../../../services/User";
import { talentService, type Talent } from "../../../services/Talent";
import {
  FileText,
  Search,
  Filter,
  Briefcase,
  AlertCircle,
  Calendar,
  XCircle,
  Send,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SalesTalentApplication = TalentApplication & {
  jobRequest?: {
    id: number;
    title: string;
    clientCompanyName?: string;
  };
  talentCV?: {
    id: number;
    versionName: string;
    talentId: number;
  };
  talentName?: string;
  submitterName?: string;
};

const statusLabels: Record<string, string> = {
  Rejected: "Đã từ chối",
  Interview: "Phỏng vấn",
  InterviewScheduled: "Đã lên lịch phỏng vấn",
  Submitted: "Đã nộp hồ sơ",
  Interviewing: "Đang xem xét phỏng vấn",
  Offered: "Đã đề xuất",
  Hired: "Đã tuyển",
  Withdrawn: "Đã rút",
};

const statusColors: Record<string, string> = {
  Rejected: "bg-red-100 text-red-700",
  Interview: "bg-blue-100 text-blue-700",
  InterviewScheduled: "bg-indigo-100 text-indigo-700",
  Submitted: "bg-sky-100 text-sky-700",
  Interviewing: "bg-cyan-100 text-cyan-700",
  Offered: "bg-teal-100 text-teal-700",
  Hired: "bg-purple-100 text-purple-700",
  Withdrawn: "bg-gray-100 text-gray-700",
};

interface JobRequestWithRelations extends JobRequest {
  project?: {
    clientCompany?: {
      name?: string;
    };
  };
}

const statusIcons: Record<string, ReactNode> = {
  Rejected: <XCircle className="w-4 h-4" />,
  Interview: <Calendar className="w-4 h-4" />,
  InterviewScheduled: <Calendar className="w-4 h-4" />,
  Submitted: <FileText className="w-4 h-4" />,
  Interviewing: <Eye className="w-4 h-4" />,
  Offered: <Send className="w-4 h-4" />,
  Hired: <CheckCircle className="w-4 h-4" />,
  Withdrawn: <AlertCircle className="w-4 h-4" />,
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

const formatTime = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function SalesApplicationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobRequestIdFromQuery = searchParams.get("jobRequestId");

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<SalesTalentApplication[]>([]);
  const [filtered, setFiltered] = useState<SalesTalentApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterJobRequestId, setFilterJobRequestId] = useState<string>(jobRequestIdFromQuery ?? "");
  const [jobRequestTitle, setJobRequestTitle] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const applicationsData = await talentApplicationService.getAll({ excludeDeleted: true });
        if (!Array.isArray(applicationsData)) {
          setApplications([]);
          setFiltered([]);
          return;
        }

        const jobRequestIds = [...new Set(applicationsData.map((app) => app.jobRequestId))];
        const cvIds = [...new Set(applicationsData.map((app) => app.cvId))];
        const userIds = [...new Set(applicationsData.map((app) => app.submittedBy))];

        const [jobRequestsData, cvsData, usersData] = await Promise.all([
          Promise.all(jobRequestIds.map((id) => jobRequestService.getById(id))),
          Promise.all(cvIds.map((id) => talentCVService.getById(id))),
          Promise.all(
            userIds.map((id) =>
              userService
                .getById(id)
                .then((user) => user)
                .catch(() => null),
            ),
          ),
        ]);

        const jobRequestMap = new Map<number, JobRequestWithRelations>(
          jobRequestsData.map((jr) => [jr.id, jr as JobRequestWithRelations]),
        );
        const cvMap = new Map<number, TalentCV>(cvsData.map((cv) => [cv.id, cv]));
        const userMap = new Map<string, User>(
          usersData.filter((u): u is User => u !== null).map((u) => [u.id, u]),
        );

        const talentIds = [...new Set(cvsData.map((cv) => cv.talentId))];
        const talents = await Promise.all(
          talentIds.map((id) =>
            talentService
              .getById(id)
              .then((talent) => talent)
              .catch(() => null),
          ),
        );
        const talentMap = new Map<number, Talent>(
          talents.filter((t): t is Talent => t !== null).map((t) => [t.id, t]),
        );

        const augmented = applicationsData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map<SalesTalentApplication>((app) => {
            const jobRequest = jobRequestMap.get(app.jobRequestId);
            const cv = cvMap.get(app.cvId);
            const talent = cv ? talentMap.get(cv.talentId) : undefined;
            const submitter = userMap.get(app.submittedBy);

            return {
              ...app,
              jobRequest: jobRequest
                ? {
                    id: jobRequest.id,
                    title: jobRequest.title,
                    clientCompanyName: jobRequest.project?.clientCompany?.name,
                  }
                : undefined,
              talentCV: cv
                ? {
                    id: cv.id,
                    versionName: cv.versionName,
                    talentId: cv.talentId,
                  }
                : undefined,
              submitterName: submitter?.fullName || app.submittedBy,
              talentName: talent?.fullName,
            };
          });

        setApplications(augmented);
        setFiltered(augmented);
      } catch (err) {
        console.error("❌ Lỗi tải hồ sơ:", err);
        setApplications([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchJobRequestTitle = async () => {
      if (jobRequestIdFromQuery) {
        try {
          const jobRequest = await jobRequestService.getById(Number(jobRequestIdFromQuery));
          setJobRequestTitle(jobRequest.title ?? "");
        } catch (err) {
          console.error("❌ Lỗi tải tiêu đề Job Request:", err);
          setJobRequestTitle("");
        }
      } else {
        setJobRequestTitle("");
      }
    };

    fetchJobRequestTitle();
  }, [jobRequestIdFromQuery]);

  useEffect(() => {
    if (jobRequestIdFromQuery) {
      setFilterJobRequestId(jobRequestIdFromQuery);
    } else {
      setFilterJobRequestId("");
    }
  }, [jobRequestIdFromQuery]);

  useEffect(() => {
    let next = [...applications];
    if (searchTerm) {
      const normalized = searchTerm.toLowerCase();
      next = next.filter(
        (app) =>
          app.jobRequest?.title.toLowerCase().includes(normalized) ||
          app.talentName?.toLowerCase().includes(normalized) ||
          app.submitterName?.toLowerCase().includes(normalized),
      );
    }
    if (statusFilter) {
      next = next.filter((app) => app.status === statusFilter);
    }
    if (filterJobRequestId) {
      const idNumber = Number(filterJobRequestId);
      next = next.filter((app) => app.jobRequestId === idNumber);
    }
    setFiltered(next);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, filterJobRequestId, applications]);

  const stats = useMemo(
    () => [
      {
        title: "Tổng hồ sơ",
        value: applications.length.toString(),
        icon: <FileText className="w-6 h-6 text-primary-600" />,
        accent: "bg-primary-100",
      },
      {
        title: "Đã lên lịch phỏng vấn",
        value: applications.filter((app) => app.status === "InterviewScheduled").length.toString(),
        icon: <Calendar className="w-6 h-6 text-secondary-600" />,
        accent: "bg-secondary-100",
      },
      {
        title: "Đang xử lý",
        value: applications.filter((app) => ["Interviewing", "Offered"].includes(app.status)).length.toString(),
        icon: <Briefcase className="w-6 h-6 text-accent-600" />,
        accent: "bg-accent-100",
      },
      {
        title: "Đã tuyển",
        value: applications.filter((app) => app.status === "Hired").length.toString(),
        icon: <CheckCircle className="w-6 h-6 text-warning-600" />,
        accent: "bg-warning-100",
      },
    ],
    [applications],
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filtered.slice(startIndex, endIndex);
  const startItem = filtered.length > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, filtered.length);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setFilterJobRequestId("");
    setJobRequestTitle("");
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("jobRequestId");
    setSearchParams(newParams);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="Sales Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hồ sơ ứng tuyển</h1>
              <p className="text-neutral-600 mt-1">Tổng quan các hồ sơ ứng viên Sales có thể theo dõi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-100 rounded-2xl shadow-soft p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-neutral-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.accent}`}>{stat.icon}</div>
              </div>
            ))}
          </div>

          {filterJobRequestId && (
            <div className="mb-6 bg-primary-50 border border-primary-200 rounded-xl p-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Đang lọc theo yêu cầu tuyển dụng</p>
                    <p className="text-lg font-semibold text-primary-700 mt-1">
                      {jobRequestTitle || `Job Request #${filterJobRequestId}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-300"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 mb-6">
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo vị trí, ứng viên hoặc HR phụ trách..."
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-xl text-neutral-600 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-all duration-300"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100">
          <div className="p-6 border-b border-neutral-200 sticky top-16 bg-white z-20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách hồ sơ</h2>
              <div className="flex items-center gap-4">
                {filtered.length > 0 ? (
                  <>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-neutral-600">
                      {startItem}-{endItem} trong số {filtered.length}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages || totalPages === 0
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-neutral-600">Tổng: 0 hồ sơ</span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-primary-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Ứng viên
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    HR phụ trách
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Cập nhật
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-400">
                      Không tìm thấy hồ sơ phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((app, index) => (
                    <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary-700">
                        {app.jobRequest?.title ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {app.talentName ?? app.talentCV?.versionName ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium ${
                              statusColors[app.status] ?? "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {statusIcons[app.status] ?? <AlertCircle className="w-4 h-4" />}
                            {statusLabels[app.status] ?? app.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">{app.submitterName ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-700">{formatTime(app.updatedAt ?? app.createdAt)}</span>
                          <span className="text-xs text-neutral-400">{formatDate(app.updatedAt ?? app.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/sales/applications/${app.id}`}
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
