import { useState } from "react";
import { Copy, Check, Link } from "lucide-react";
import toast from "react-hot-toast";

export default function Step4Publish({ assessment }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(assessment.shareCode);
    setCopied(true);
    toast.success("Share code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/student?code=${assessment.shareCode}`);
    toast.success("Link copied!");
  };

  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-green-900/40 border border-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={24} className="text-green-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Assessment Ready!</h2>
      <p className="text-gray-500 text-sm mb-10">Share the code below with your students to start the assessment.</p>

      <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto text-left mb-8">
        {/* Summary */}
        <div className="card">
          <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-4">Summary</h3>
          <div className="space-y-3">
            {[
              ["Title",      assessment.title],
              ["Questions",  assessment.totalQuestions],
              ["Difficulty", assessment.difficulty],
              ["Time Limit", assessment.timeLimit ? `${assessment.timeLimit} min` : "No limit"],
              ["Source",     assessment.sourceType],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500 text-xs">{k}</span>
                <span className="text-white text-xs font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share code */}
        <div className="card flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-xs mb-3">Share Code</p>
          <div className="font-mono text-3xl font-semibold text-brand-400 tracking-widest mb-4">
            {assessment.shareCode}
          </div>
          <button onClick={copyCode}
            className={`btn-primary w-full justify-center mb-2 ${copied ? "bg-green-700 hover:bg-green-700" : ""}`}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
          </button>
          <button onClick={copyLink} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <Link size={12} /> Copy Share Link
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-xs">
        Students can join at <span className="text-brand-400">cognifyai.app/student</span> using this code
      </p>
    </div>
  );
}
