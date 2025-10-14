import { useState, useEffect } from "react";
import { Send, Briefcase } from "lucide-react";
import Sidebar from "../../../components/common/Sidebar";
import { sidebarItems } from "../../../components/hr_staff/SidebarItems";
import { Button } from "../../../components/ui/button";

interface JobRequest {
  id: number;
  title: string;
  positionName: string;
  budget: number;
  requiredSkills: string[];
  level: string;
}

interface CV {
  id: number;
  name: string;
  level: string;
  skills: string[];
  yearsOfExp: number;
  matchPercent: number;
}

export default function MatchingCVPage() {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvs, setSelectedCvs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Giả lập dữ liệu Job Request
  useEffect(() => {
    setJobRequests([
      { id: 1, title: "Frontend Developer", positionName: "ReactJS Dev", budget: 3000, requiredSkills: ["React", "TypeScript", "CSS"], level: "Mid" },
      { id: 2, title: "Backend Developer", positionName: "NodeJS Dev", budget: 3500, requiredSkills: ["Node.js", "SQL", "API"], level: "Senior" },
    ]);
  }, []);

  const handleSelectJob = async (id: number) => {
    setSelectedJob(id);
    setLoading(true);

    // Giả lập API lấy danh sách CV match
    setTimeout(() => {
      setCvs([
        { id: 101, name: "Nguyễn Văn A", level: "Mid", skills: ["React", "CSS", "TypeScript"], yearsOfExp: 3, matchPercent: 92 },
        { id: 102, name: "Trần Thị B", level: "Junior", skills: ["HTML", "CSS"], yearsOfExp: 1, matchPercent: 60 },
        { id: 103, name: "Phạm C", level: "Senior", skills: ["React", "Next.js", "TypeScript"], yearsOfExp: 6, matchPercent: 88 },
      ]);
      setLoading(false);
    }, 800);
  };

  const toggleSelectCv = (cvId: number) => {
    setSelectedCvs((prev) =>
      prev.includes(cvId) ? prev.filter((id) => id !== cvId) : [...prev, cvId]
    );
  };

  const sendShortlist = () => {
    if (selectedCvs.length === 0) {
      alert("Vui lòng chọn ít nhất một CV để gửi shortlist.");
      return;
    }
    alert(`✅ Đã gửi shortlist ${selectedCvs.length} CV cho Sales!`);
  };

  const highlightSkill = (skill: string, jobSkills: string[]) => {
    const isMatch = jobSkills.some((js) => js.toLowerCase() === skill.toLowerCase());
    return (
      <span
        key={skill}
        className={`px-2 py-1 rounded-lg text-xs font-medium ${
          isMatch ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {skill}
      </span>
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar items={sidebarItems} title="HR Staff" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary-600" />
            Matching CVs
          </h1>
          <p className="text-neutral-600 mt-1">Chọn Job Request và tìm CV phù hợp để gửi shortlist cho Sales</p>
        </div>

        {/* Chọn Job Request */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Chọn Job Request</label>
          <select
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-80"
            value={selectedJob ?? ""}
            onChange={(e) => handleSelectJob(Number(e.target.value))}
          >
            <option value="">-- Chọn Job Request --</option>
            {jobRequests.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.positionName})
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm CV phù hợp...</p>
          </div>
        )}

        {/* Danh sách CV */}
        {!loading && selectedJob && (
          <>
            <h2 className="text-lg font-semibold mb-3">Danh sách CV phù hợp</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`bg-white rounded-2xl shadow-soft hover:shadow-medium border transition-all duration-300 p-6 ${
                    selectedCvs.includes(cv.id)
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cv.name}</h3>
                      <p className="text-sm text-gray-600">
                        Level: {cv.level} • {cv.yearsOfExp} năm kinh nghiệm
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        cv.matchPercent >= 85
                          ? "text-green-600"
                          : cv.matchPercent >= 70
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      Match {cv.matchPercent}%
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {cv.skills.map((s) =>
                      highlightSkill(
                        s,
                        jobRequests.find((j) => j.id === selectedJob)?.requiredSkills || []
                      )
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => toggleSelectCv(cv.id)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedCvs.includes(cv.id)
                          ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
                          : "text-primary-600 hover:bg-primary-50 border-gray-300"
                      }`}
                    >
                      {selectedCvs.includes(cv.id) ? "Bỏ chọn" : "Chọn"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gửi shortlist */}
            {cvs.length > 0 && (
              <div className="mt-8 flex justify-end">
                <Button onClick={sendShortlist} className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Gửi shortlist cho Sales
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
