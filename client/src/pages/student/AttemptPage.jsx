import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Zap, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function AttemptPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt]       = useState(null);
  const [answers, setAnswers]       = useState({});
  const [current, setCurrent]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef  = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: aData } = await api.get(`/assessment/${assessmentId}`);
        setAssessment(aData.assessment);
        const { data: attData } = await api.post("/attempt/start", { assessmentId });
        setAttempt(attData.attempt);
        if (aData.assessment.timeLimit > 0) {
          setTimeLeft(aData.assessment.timeLimit * 60);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to start assessment");
        navigate("/student");
      }
    };
    init();
  }, [assessmentId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    try {
      const answerArr = assessment.questions.map((q) => ({
        questionId: q._id,
        givenAnswer: answers[q._id] || "",
      }));
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      await api.post("/attempt/submit", { attemptId: attempt._id, answers: answerArr, timeTaken });
      toast.success("Assessment submitted!");
      navigate(`/student/result/${attempt._id}`);
    } catch (err) {
      toast.error("Submit failed");
      setSubmitting(false);
    }
  };

  if (!assessment) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-400 text-sm">
      Loading assessment...
    </div>
  );

  const q = assessment.questions[current];
  const answered = Object.keys(answers).length;
  const total    = assessment.questions.length;
  const progress = Math.round((current / total) * 100);
  const isLowTime = timeLeft !== null && timeLeft < 120;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium truncate max-w-xs">{assessment.title}</span>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 font-mono text-sm font-medium px-3 py-1.5 rounded-lg border ${
            isLowTime ? "text-red-400 border-red-800 bg-red-900/20 animate-pulse" : "text-white border-dark-600"
          }`}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-8 py-3 border-b border-dark-600">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Question {current + 1} of {total}</span>
          <span>{answered} answered</span>
        </div>
        <div className="h-1 bg-dark-700 rounded-full">
          <div className="h-full bg-brand-600 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main question area */}
        <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full flex-1">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`badge-${q.type}`}>
                {q.type === "mcq" ? "Multiple Choice" : q.type === "truefalse" ? "True / False" : q.type === "short" ? "Short Answer" : "Fill in the Blank"}
              </span>
            </div>

            {/* Question text */}
            <p className="text-white text-lg font-medium leading-relaxed mb-8">{q.questionText}</p>

            {/* MCQ options */}
            {(q.type === "mcq" || q.type === "truefalse") && q.options?.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(q._id, opt)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border mb-3 text-left transition-all ${
                  answers[q._id] === opt
                    ? "border-brand-600 bg-dark-500 text-white"
                    : "border-dark-600 hover:border-dark-500 text-gray-300"
                }`}>
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-semibold shrink-0 ${
                  answers[q._id] === opt ? "border-brand-600 bg-brand-600 text-white" : "border-gray-600 text-gray-500"
                }`}>
                  {q.type === "mcq" ? String.fromCharCode(65 + i) : opt[0]}
                </div>
                <span className="text-sm">{opt}</span>
              </button>
            ))}

            {/* Short answer */}
            {q.type === "short" && (
              <textarea rows={5} className="input resize-none text-sm"
                placeholder="Type your answer here..."
                value={answers[q._id] || ""}
                onChange={(e) => handleAnswer(q._id, e.target.value)} />
            )}

            {/* Fill in the blank */}
            {q.type === "fillblank" && (
              <div>
                <p className="text-gray-400 text-sm mb-3">{q.questionText.replace("_______", "[ your answer ]")}</p>
                <input type="text" className="input text-sm"
                  placeholder="Fill in the blank..."
                  value={answers[q._id] || ""}
                  onChange={(e) => handleAnswer(q._id, e.target.value)} />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between pt-8">
            <button onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0} className="btn-ghost disabled:opacity-40">
              <ChevronLeft size={16} /> Previous
            </button>
            {current < total - 1 ? (
              <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>

        {/* Question palette sidebar */}
        <div className="w-52 border-l border-dark-600 p-4 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-3 font-medium">Question Palette</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {assessment.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  i === current ? "bg-brand-600 text-white ring-2 ring-brand-600/30" :
                  answers[assessment.questions[i]._id] ? "bg-brand-600/30 text-brand-400 border border-brand-600/50" :
                  "bg-dark-700 text-gray-500 hover:bg-dark-600"
                }`}>{i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-3 h-3 rounded bg-brand-600/30 border border-brand-600/50" /> Answered
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-3 h-3 rounded bg-dark-700" /> Unanswered
            </div>
          </div>
          {answered === total && (
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-all">
              Submit All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
