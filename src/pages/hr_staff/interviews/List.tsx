import Sidebar from "../../../components/common/Sidebar";
import { useEffect, useState } from "react";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";

interface InterviewSchedule {
  id: string;
  candidateName: string;
  interviewDate: string;
  interviewer: string;
  status: "scheduled" | "completed";
}

export default function InterviewList() {
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);

  useEffect(() => {
    const mockData: InterviewSchedule[] = [
      {
        id: "1",
        candidateName: "Nguyễn Văn A",
        interviewer: "Nguyễn Minh D",
        interviewDate: "2023-09-25 14:00",
        status: "scheduled",
      },
      {
        id: "2",
        candidateName: "Trần Thị B",
        interviewer: "Trần Thị E",
        interviewDate: "2023-09-26 10:00",
        status: "completed",
      },
    ];
    setInterviews(mockData);
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="TA Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh Sách Phỏng Vấn</h1>
          <p className="text-neutral-600 mt-1">Danh sách các cuộc phỏng vấn đã sắp xếp</p>
        </div>

        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 border border-gray-200 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{interview.candidateName}</p>
                  <p className="text-sm text-gray-600">{interview.interviewer}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    interview.status === "scheduled"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {interview.status === "scheduled" ? "Chưa diễn ra" : "Hoàn thành"}
                </span>
              </div>
              <p className="text-sm text-gray-600">Ngày phỏng vấn: {interview.interviewDate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
