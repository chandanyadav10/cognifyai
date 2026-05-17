import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { ArrowRight, BookOpen, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const navigate  = useNavigate();
  const [code, setCode]       = useState("");
  const [attempts, setAttempts] = useState([]);
  const [joining, setJoining]  = useState(false);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    api.get("/attempt/my")
      .then(({ data }) => setAttempts(data.attempts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setJoining(true);
    try {
      const { data } = await api.get(`/assessment/join/${code.trim()}`);
      navigate(`/student/attempt/${data.assessment._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or inactive assessment code");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-56 p-8">
        <h1 className="text-xl font-semibold text-white mb-1">Student Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">Join assessments and track your progress</p>

        {/* Join box */}
        <div className="card max-w-lg mb-10">
          <h2 className="text-white font-medium text-sm mb-1">Join an Assessment</h2>
          <p className="text-gray-500 text-xs mb-4">Enter the share code provided by your teacher</p>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              className="input font-mono tracking-widest text-center text-brand-400 placeholder-gray-600 flex-1"
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={9}
            />
            <button type="submit" disabled={joining || !code.trim()} className="btn-primary shrink-0">
              {joining ? "Joining..." : <>Join <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        {/* Past attempts */}
        <h2 className="text-white font-medium text-sm mb-4">My Attempts</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : attempts.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No attempts yet — join an assessment to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {attempts.map((a) => (
              <div key={a._id} className="card hover:border-dark-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-sm font-medium">{a.assessment?.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {a.assessment?.totalQuestions} questions
                    </p>
                  </div>
                  <div className={`text-lg font-semibold ${
                    a.percentage >= 60 ? "text-green-400" : "text-red-400"
                  }`}>
                    {a.percentage}%
                  </div>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full mb-4">
                  <div className={`h-full rounded-full ${a.percentage >= 60 ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${a.percentage}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                    </span>
                    <span>{new Date(a.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => navigate(`/student/result/${a._id}`)}
                    className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 transition-colors">
                    Review <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
