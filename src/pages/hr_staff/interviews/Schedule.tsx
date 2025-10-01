import { useState } from 'react';
import Sidebar from '../../../components/common/Sidebar';
import { sidebarItems } from '../../../components/hr_staff/SidebarItems';

type InterviewStatus = 'scheduled' | 'pending';

interface InterviewSchedule {
  candidateName: string;
  interviewDate: string;
  interviewer: string;
  status: InterviewStatus;
}

export default function ScheduleInterview() {
  const [candidates] = useState<string[]>(['Nguyễn Văn A', 'Trần Thị B', 'Lê Quốc C']);
  const [interviewers] = useState<string[]>(['Nguyễn Minh D', 'Trần Thị E']);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);

  const canSubmit = selectedCandidate && selectedInterviewer && interviewDate;

  const handleScheduleInterview = () => {
    const newInterview: InterviewSchedule = {
      candidateName: selectedCandidate,
      interviewer: selectedInterviewer,
      interviewDate,
      status: 'scheduled',
    };
    setInterviews(prev => [...prev, newInterview]);

    // reset nhẹ
    setSelectedCandidate('');
    setSelectedInterviewer('');
    setInterviewDate('');
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sắp Xếp Lịch Phỏng Vấn</h1>
          <p className="text-neutral-600 mt-1">Chọn ứng viên, người phỏng vấn và thời gian phỏng vấn</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Ứng viên</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              <option value="">Chọn ứng viên</option>
              {candidates.map((candidate, index) => (
                <option key={index} value={candidate}>{candidate}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Người phỏng vấn</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
              value={selectedInterviewer}
              onChange={(e) => setSelectedInterviewer(e.target.value)}
            >
              <option value="">Chọn người phỏng vấn</option>
              {interviewers.map((interviewer, index) => (
                <option key={index} value={interviewer}>{interviewer}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Ngày giờ phỏng vấn</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleScheduleInterview}
          disabled={!canSubmit}
          className={`px-6 py-2 rounded-xl text-white transition-colors ${
            canSubmit ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Sắp xếp phỏng vấn
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Lịch phỏng vấn đã sắp xếp</h2>
          <div className="space-y-4 mt-4">
            {interviews.map((interview, index) => (
              <div key={index} className="flex justify-between border-b py-2">
                <div>
                  <p className="font-medium">{interview.candidateName}</p>
                  <p className="text-sm text-gray-600">{interview.interviewer}</p>
                </div>
                <p className="text-sm text-gray-600">{interview.interviewDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
