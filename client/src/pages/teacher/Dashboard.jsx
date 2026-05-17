import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Plus, BarChart2, MoreVertical, Copy, Trash2, TrendingUp, Users, FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => (
  <span className={`badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/assessment").then(({ data }) => {
      setAssessments(data.assessments || []);
    }).catch(() => toast.error("Failed to load assessments"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this assessment?")) return;
    try {
      await api.delete(`/assessment/${id}`);
      setAssessments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Assessment deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handlePublish = async (id, current) => {
    const newStatus = current === "active" ? "closed" : "active";
    try {
      const { data } = await api.patch(`/assessment/${id}/publish`, { status: newStatus });
      setAssessments((prev) => prev.map((a) => a._id === id ? { ...a, status: data.assessment.status } : a));
      toast.success(`Assessment ${newStatus}`);
    } catch { toast.error("Failed to update status"); }
  };

  const stats = [
    { label: "Total Assessments", value: assessments.length, icon: FileText, color: "text-brand-400" },
    { label: "Active",            value: assessments.filter(a => a.status === "active").length, icon: TrendingUp, color: "text-green-400" },
    { label: "Draft",             value: assessments.filter(a => a.status === "draft").length,  icon: Clock,      color: "text-yellow-400" },
    { label: "Closed",            value: assessments.filter(a => a.status === "closed").length, icon: Users,      color: "text-red-400" },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-56 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">{greeting}, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your assessments</p>
          </div>
          <button onClick={() => navigate("/teacher/create")} className="btn-primary">
            <Plus size={16} /> Create Assessment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-xs">{s.label}</span>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Assessments Table */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
            <h2 className="text-white font-medium text-sm">Recent Assessments</h2>
            <span className="text-gray-500 text-xs">{assessments.length} total</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No assessments yet</p>
              <button onClick={() => navigate("/teacher/create")} className="btn-primary mt-4 mx-auto">
                <Plus size={14} /> Create your first
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  {["Title", "Questions", "Difficulty", "Status", "Share Code", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a._id} className="border-b border-dark-600/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white text-sm font-medium">{a.title}</p>
                      <p className="text-gray-500 text-xs capitalize">{a.sourceType}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm">{a.totalQuestions}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-gray-400 text-xs capitalize">{a.difficulty}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-400 bg-dark-700 px-2 py-1 rounded">
                          {a.shareCode}
                        </span>
                        <button onClick={() => { navigator.clipboard.writeText(a.shareCode); toast.success("Copied!"); }}
                          className="text-gray-500 hover:text-gray-300 transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/teacher/analytics/${a._id}`)}
                          className="text-gray-500 hover:text-brand-400 transition-colors" title="Analytics">
                          <BarChart2 size={15} />
                        </button>
                        <button onClick={() => handlePublish(a._id, a.status)}
                          className="text-xs text-gray-500 hover:text-green-400 transition-colors border border-dark-600 hover:border-green-800 px-2 py-1 rounded">
                          {a.status === "active" ? "Close" : "Publish"}
                        </button>
                        <button onClick={() => handleDelete(a._id)}
                          className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
