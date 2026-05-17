import { useState } from "react";
import { RefreshCw, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const TypeBadge = ({ type }) => {
  const map = { mcq: ["MCQ", "badge-mcq"], truefalse: ["T/F", "badge-truefalse"], short: ["Short", "badge-short"], fillblank: ["Fill", "badge-fillblank"] };
  const [label, cls] = map[type] || ["?", "badge-draft"];
  return <span className={cls}>{label}</span>;
};

export default function Step3Review({ questions, onUpdate }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState({});

  const q = questions[selected];

  const updateQuestion = (field, value) => {
    const updated = [...questions];
    updated[selected] = { ...updated[selected], [field]: value };
    onUpdate(updated);
  };

  const deleteQuestion = (idx) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    onUpdate(updated);
    setSelected(Math.min(selected, updated.length - 1));
  };

  const setCorrect = (option) => updateQuestion("correctAnswer", option);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Review Generated Questions</h2>
          <p className="text-gray-500 text-sm mt-0.5">AI generated {questions.length} questions — review and edit before publishing.</p>
        </div>
      </div>

      <div className="flex gap-5 min-h-[480px]">
        {/* Left panel — question list */}
        <div className="w-56 shrink-0 space-y-1 overflow-y-auto max-h-[480px] pr-1">
          {questions.map((q, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                selected === i ? "border-brand-600 bg-dark-500" : "border-transparent hover:border-dark-600 hover:bg-dark-700"
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500 text-xs">Q{i + 1}</span>
                <TypeBadge type={q.type} />
              </div>
              <p className="text-gray-300 text-xs leading-snug line-clamp-2">{q.questionText}</p>
            </button>
          ))}
        </div>

        {/* Right panel — editor */}
        {q && (
          <div className="flex-1 card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Q{selected + 1} of {questions.length}</span>
                <TypeBadge type={q.type} />
                <span className="text-xs text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded">AI Generated</span>
              </div>
              <button onClick={() => deleteQuestion(selected)}
                className="text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Question text */}
            <div className="mb-5">
              <label className="text-xs text-gray-500 mb-1.5 block">Question</label>
              <textarea rows={3} className="input resize-none text-sm"
                value={q.questionText}
                onChange={(e) => updateQuestion("questionText", e.target.value)} />
            </div>

            {/* Options (MCQ & T/F) */}
            {(q.type === "mcq" || q.type === "truefalse") && q.options?.length > 0 && (
              <div className="mb-5">
                <label className="text-xs text-gray-500 mb-2 block">Options — click to mark correct answer</label>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} onClick={() => setCorrect(opt)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        q.correctAnswer === opt
                          ? "border-green-600 bg-green-900/20"
                          : "border-dark-600 hover:border-dark-500"
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        q.correctAnswer === opt ? "border-green-500 bg-green-500" : "border-gray-600"
                      }`}>
                        {q.correctAnswer === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      {q.type === "mcq" ? (
                        <input className="flex-1 bg-transparent text-sm text-white outline-none"
                          value={opt}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const updated = [...q.options];
                            updated[oi] = e.target.value;
                            updateQuestion("options", updated);
                            if (q.correctAnswer === opt) updateQuestion("correctAnswer", e.target.value);
                          }} />
                      ) : (
                        <span className="text-sm text-white">{opt}</span>
                      )}
                      {q.correctAnswer === opt && (
                        <span className="text-green-400 text-xs ml-auto">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short/Fill correct answer */}
            {(q.type === "short" || q.type === "fillblank") && (
              <div className="mb-5">
                <label className="text-xs text-gray-500 mb-1.5 block">
                  {q.type === "fillblank" ? "Correct word/phrase" : "Expected answer (key points)"}
                </label>
                <input type="text" className="input text-sm"
                  value={q.correctAnswer || ""}
                  onChange={(e) => updateQuestion("correctAnswer", e.target.value)} />
              </div>
            )}

            {/* Explanation */}
            <div>
              <button onClick={() => setExpanded({ ...expanded, [selected]: !expanded[selected] })}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2">
                {expanded[selected] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                AI Explanation
              </button>
              {expanded[selected] && (
                <div className="border-l-2 border-brand-600 pl-3">
                  <textarea rows={3} className="input resize-none text-xs text-gray-400"
                    value={q.explanation || ""}
                    onChange={(e) => updateQuestion("explanation", e.target.value)} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
