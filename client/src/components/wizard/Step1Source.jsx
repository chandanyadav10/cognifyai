import { useState } from "react";
import { FileText, AlignLeft, Lightbulb, Upload } from "lucide-react";

const sources = [
  { id: "pdf",     icon: FileText,   title: "Upload PDF",    desc: "Drag & drop or click to upload", tag: "PDF up to 10MB" },
  { id: "text",    icon: AlignLeft,  title: "Paste Text",    desc: "Paste your learning content",    tag: "Up to 10,000 chars" },
  // { id: "youtube", icon: Youtube,    title: "YouTube Link",  desc: "Auto-extracts transcript",        tag: "Captions required" },
  { id: "topic",   icon: Lightbulb,  title: "Topic Name",    desc: "AI generates from topic",        tag: "AI powered" },
];

export default function Step1Source({ data, onChange }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (file?.type === "application/pdf") onChange({ file, sourceType: "pdf" });
    else alert("Only PDF files allowed");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">Choose Your Input Source</h2>
      <p className="text-gray-500 text-sm mb-8">How would you like to provide content for this assessment?</p>

      {/* Source cards grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {sources.map((s) => (
          <button key={s.id} onClick={() => onChange({ sourceType: s.id })}
            className={`card text-left transition-all duration-200 ${
              data.sourceType === s.id
                ? "border-brand-600 bg-dark-500"
                : "hover:border-dark-500"
            }`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                data.sourceType === s.id ? "bg-brand-600" : "bg-dark-700"
              }`}>
                <s.icon size={16} className={data.sourceType === s.id ? "text-white" : "text-gray-400"} />
              </div>
              {data.sourceType === s.id && (
                <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>
            <h3 className="text-white text-sm font-medium mb-1">{s.title}</h3>
            <p className="text-gray-500 text-xs mb-2">{s.desc}</p>
            <span className={`text-xs uppercase tracking-wide font-medium ${
              data.sourceType === s.id ? "text-brand-400" : "text-gray-600"
            }`}>{s.tag}</span>
          </button>
        ))}
      </div>

      {/* Dynamic input based on source */}
      {data.sourceType === "pdf" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver ? "border-brand-600 bg-dark-500" : "border-dark-600 hover:border-dark-500"
          }`}>
          <Upload size={24} className="text-gray-500 mx-auto mb-3" />
          {data.file ? (
            <p className="text-brand-400 text-sm font-medium">{data.file.name}</p>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-1">Drag & drop your PDF here</p>
              <p className="text-gray-600 text-xs mb-3">or</p>
              <label className="btn-primary cursor-pointer mx-auto">
                <FileText size={14} /> Browse File
                <input type="file" accept=".pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])} />
              </label>
            </>
          )}
        </div>
      )}

      {data.sourceType === "text" && (
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Paste your content</label>
          <textarea rows={6} className="input resize-none"
            placeholder="Paste your learning material here..."
            value={data.textContent || ""}
            onChange={(e) => onChange({ textContent: e.target.value })} />
          <p className="text-gray-600 text-xs mt-1 text-right">
            {(data.textContent || "").length} / 10,000
          </p>
        </div>
      )}

      {data.sourceType === "youtube" && (
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">YouTube Video URL</label>
          <input type="url" className="input"
            placeholder="https://youtube.com/watch?v=..."
            value={data.youtubeUrl || ""}
            onChange={(e) => onChange({ youtubeUrl: e.target.value })} />
          <p className="text-gray-600 text-xs mt-1">Video must have captions/transcript enabled</p>
        </div>
      )}

      {data.sourceType === "topic" && (
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Topic Name</label>
          <input type="text" className="input"
            placeholder="e.g. Quantum Mechanics, World War 2, Photosynthesis..."
            value={data.topicName || ""}
            onChange={(e) => onChange({ topicName: e.target.value })} />
          <p className="text-gray-600 text-xs mt-1">AI will generate content and questions about this topic</p>
        </div>
      )}
    </div>
  );
}
