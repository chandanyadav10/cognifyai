import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CheckCircle, XCircle, MinusCircle, ArrowLeft, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const TypeBadge = ({ type }) => {
  const map = { mcq: ["MCQ", "badge-mcq"], truefalse: ["T/F", "badge-truefalse"], short: ["Short", "badge-short"], fillblank: ["Fill", "badge-fillblank"] };
  const [label, cls] = map[type] || ["?", "badge-draft"];
  return <span className={cls}>{label}</span>;
};

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [review, setReview]   = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/attempt/review/${attemptId}`)
      .then(({ data }) => setReview(data))
      .catch(() => toast.error("Failed to load results"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-400 text-sm">Loading results...</div>;
  if (!review)  return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-400 text-sm">Results not found</div>;

  const correct = review.review.filter((r) => r.isCorrect).length;
  const wrong   = review.review.filter((r) => !r.isCorrect && r.givenAnswer !== "").length;
  const skipped = review.review.filter((r) => r.givenAnswer === "").length;
  const pct     = review.percentage;

  const scoreColor = pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : "text-red-400";
  const scoreMsg   = pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good performance!" : "Keep practicing!";

  // Donut chart via SVG
  const radius = 54, circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const strokeColor = pct >= 80 ? "#22C55E" : pct >= 60 ? "#EAB308" : "#EF4444";

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={() => navigate("/student")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Score hero */}
        <div className="card text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#1C2333" strokeWidth="12" />
              <circle cx="70" cy="70" r={radius} fill="none" stroke={strokeColor} strokeWidth="12"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 70 70)" />
              <text x="70" y="65" textAnchor="middle" fill="white" fontSize="24" fontWeight="600">{pct}%</text>
              <text x="70" y="83" textAnchor="middle" fill="#6B7280" fontSize="11">Score</text>
            </svg>
          </div>
          <p className={`text-lg font-semibold ${scoreColor} mb-1`}>{scoreMsg}</p>
          <p className="text-gray-500 text-sm">
            Time taken: {Math.floor(review.timeTaken / 60)}m {review.timeTaken % 60}s
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: CheckCircle, label: "Correct", value: correct, color: "text-green-400", bg: "bg-green-900/20" },
              { icon: XCircle,     label: "Wrong",   value: wrong,   color: "text-red-400",   bg: "bg-red-900/20" },
              { icon: MinusCircle, label: "Skipped", value: skipped, color: "text-gray-400",  bg: "bg-dark-700" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-dark-600`}>
                <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => navigate("/student")} className="btn-ghost">
              <ArrowLeft size={14} /> Dashboard
            </button>
          </div>
        </div>

        {/* Question review */}
        <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-brand-400" />
          Review Answers
        </h2>

        <div className="space-y-3">
          {review.review.map((r, i) => (
            <div key={i} className={`card border ${r.isCorrect ? "border-green-900/50" : r.givenAnswer === "" ? "border-dark-600" : "border-red-900/50"}`}>
              <button className="w-full text-left" onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.isCorrect ? <CheckCircle size={16} className="text-green-400 shrink-0" /> :
                     r.givenAnswer === "" ? <MinusCircle size={16} className="text-gray-500 shrink-0" /> :
                     <XCircle size={16} className="text-red-400 shrink-0" />}
                    <span className="text-gray-500 text-xs">Q{i + 1}</span>
                    <TypeBadge type={r.type} />
                    <p className="text-white text-sm">{r.questionText}</p>
                  </div>
                  {expanded[i] ? <ChevronUp size={14} className="text-gray-500 shrink-0" /> : <ChevronDown size={14} className="text-gray-500 shrink-0" />}
                </div>
                <p className={`text-xs mt-1.5 ml-7 ${r.isCorrect ? "text-green-400" : r.givenAnswer === "" ? "text-gray-500" : "text-red-400"}`}>
                  {r.isCorrect ? "Correctly answered" : r.givenAnswer === "" ? "Skipped" : "Incorrectly answered"}
                </p>
              </button>

              {expanded[i] && (
                <div className="mt-4 pt-4 border-t border-dark-600 space-y-3">
                  {r.givenAnswer && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${r.isCorrect ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"}`}>
                      <p className="text-xs opacity-70 mb-1">Your answer</p>
                      {r.givenAnswer}
                    </div>
                  )}
                  {!r.isCorrect && r.correctAnswer && (
                    <div className="bg-green-900/20 rounded-lg px-4 py-3 text-sm text-green-300">
                      <p className="text-xs opacity-70 mb-1">Correct answer</p>
                      {r.correctAnswer}
                    </div>
                  )}
                  {r.explanation && (
                    <div className="border-l-2 border-brand-600 pl-3">
                      <p className="text-xs text-brand-400 mb-1">AI Explanation</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{r.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
