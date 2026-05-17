import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, Users, TrendingUp, Award, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/assessment/${id}/analytics`)
      .then(({ data }) => setData(data.analytics))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [id]);

  const chartData = data ? [
    { range: "0-20%",   count: data.distribution[0] },
    { range: "21-40%",  count: data.distribution[1] },
    { range: "41-60%",  count: data.distribution[2] },
    { range: "61-80%",  count: data.distribution[3] },
    { range: "81-100%", count: data.distribution[4] },
  ] : [];

  const stats = data ? [
    { label: "Total Attempts",   value: data.totalAttempts,   icon: Users,     color: "text-brand-400" },
    { label: "Average Score",    value: `${data.avgScore}%`,  icon: TrendingUp, color: "text-green-400" },
    { label: "Top Score",        value: `${data.topScore}%`,  icon: Award,     color: "text-yellow-400" },
    { label: "Completion Rate",  value: data.totalAttempts,   icon: Clock,     color: "text-purple-400" },
  ] : [];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-56 p-8">
        <button onClick={() => navigate("/teacher")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-xl font-semibold text-white mb-6">Assessment Analytics</h1>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading analytics...</div>
        ) : !data ? (
          <div className="text-gray-500 text-sm">No data available</div>
        ) : (
          <>
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

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Score distribution chart */}
              <div className="card">
                <h3 className="text-white font-medium text-sm mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="range" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333", borderRadius: 8, color: "#fff", fontSize: 12 }} cursor={{ fill: "rgba(37,99,235,0.1)" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill="#2563EB" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick stats */}
              <div className="card">
                <h3 className="text-white font-medium text-sm mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  {[
                    { label: "Students scoring above 60%", value: data.attempts.filter(a => a.percentage >= 60).length, total: data.totalAttempts, color: "bg-green-500" },
                    { label: "Students scoring above 80%", value: data.attempts.filter(a => a.percentage >= 80).length, total: data.totalAttempts, color: "bg-brand-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white">{item.value} / {item.total}</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: item.total ? `${(item.value / item.total) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student table */}
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-600">
                <h3 className="text-white font-medium text-sm">Student Results</h3>
              </div>
              {data.attempts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">No attempts yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-600">
                      {["#", "Student", "Score", "Percentage", "Time Taken", "Submitted"].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.attempts.sort((a, b) => b.percentage - a.percentage).map((a, i) => (
                      <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-700/30 transition-colors">
                        <td className="px-5 py-3.5 text-gray-500 text-sm">#{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-white text-sm">{a.student?.name}</p>
                          <p className="text-gray-500 text-xs">{a.student?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-white text-sm">{a.score}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm font-medium ${a.percentage >= 60 ? "text-green-400" : "text-red-400"}`}>
                            {a.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">
                          {Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {new Date(a.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
