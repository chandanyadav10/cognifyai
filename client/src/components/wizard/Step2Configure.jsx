import { useState } from "react";
import { Zap } from "lucide-react";

const difficulties = ["easy", "medium", "hard", "mixed"];
const qTypes = [
  { id: "mcq",       label: "MCQ",              desc: "4 options per question" },
  { id: "truefalse", label: "True / False",      desc: "Binary choice" },
  { id: "short",     label: "Short Answer",      desc: "Text response" },
  { id: "fillblank", label: "Fill in the Blanks",desc: "Complete the sentence" },
];

export default function Step2Configure({ data, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">Configure Your Assessment</h2>
      <p className="text-gray-500 text-sm mb-8">Customize how your questions will be generated.</p>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block uppercase tracking-wide">Assessment Title</label>
          <input type="text" className="input" placeholder="e.g. Advanced Physics Midterm"
            value={data.title || ""}
            onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {/* Number of questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Number of Questions</label>
            <span className="text-brand-400 text-sm font-semibold bg-brand-600/20 px-2.5 py-0.5 rounded-full">
              {data.totalQuestions || 10}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onChange({ totalQuestions: Math.max(5, (data.totalQuestions || 10) - 1) })}
              className="w-7 h-7 rounded-lg bg-dark-700 border border-dark-600 text-gray-400 hover:text-white hover:border-brand-600 flex items-center justify-center transition-all text-lg leading-none">−</button>
            <input type="range" min="5" max="50" step="1"
              value={data.totalQuestions || 10}
              onChange={(e) => onChange({ totalQuestions: parseInt(e.target.value) })}
              className="flex-1 accent-brand-600" />
            <button onClick={() => onChange({ totalQuestions: Math.min(50, (data.totalQuestions || 10) + 1) })}
              className="w-7 h-7 rounded-lg bg-dark-700 border border-dark-600 text-gray-400 hover:text-white hover:border-brand-600 flex items-center justify-center transition-all text-lg leading-none">+</button>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5</span><span>50</span>
          </div>
        </div>

        {/* Question types */}
        <div>
          <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wide">Question Types (select all that apply)</label>
          <div className="grid grid-cols-2 gap-3">
            {qTypes.map((t) => {
              const checked = data.questionTypes?.[t.id] ?? (t.id === "mcq" || t.id === "truefalse");
              return (
                <button key={t.id} onClick={() => onChange({ questionTypes: { ...data.questionTypes, [t.id]: !checked } })}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                    checked ? "border-brand-600 bg-dark-500" : "border-dark-600 hover:border-dark-500"
                  }`}>
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    checked ? "bg-brand-600" : "bg-dark-700 border border-dark-600"
                  }`}>
                    {checked && <div className="w-2 h-2 rounded-sm bg-white" />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.label}</p>
                    <p className="text-gray-500 text-xs">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wide">Difficulty Level</label>
          <div className="flex bg-dark-800 border border-dark-600 rounded-lg p-1 gap-1">
            {difficulties.map((d) => (
              <button key={d} onClick={() => onChange({ difficulty: d })}
                className={`flex-1 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                  (data.difficulty || "medium") === d
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Time limit */}
        <div>
          <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wide">Time Limit</label>
          <div className="flex items-center gap-3">
            <input type="number" min="0" max="180" className="input w-24 text-center"
              value={data.timeLimit || 30}
              onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || 0 })} />
            <span className="text-gray-400 text-sm">minutes</span>
            <span className="text-gray-600 text-xs">(0 = no limit)</span>
          </div>
        </div>

        {/* AI hint */}
        <div className="flex items-start gap-3 bg-brand-600/10 border border-brand-600/20 rounded-lg p-4">
          <Zap size={14} className="text-brand-400 mt-0.5 shrink-0" />
          <p className="text-gray-400 text-xs leading-relaxed">
            CognifyAI will generate <strong className="text-white">{data.totalQuestions || 10} questions</strong> at{" "}
            <strong className="text-white capitalize">{data.difficulty || "medium"}</strong> difficulty using Gemini AI.
          </p>
        </div>
      </div>
    </div>
  );
}
