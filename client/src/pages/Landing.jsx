import { useNavigate } from "react-router-dom";
import { Zap, FileText, Lightbulb, AlignLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold">CognifyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white text-sm transition-colors">
            Log In
          </button>
          <button onClick={() => navigate("/register")} className="btn-primary">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-full px-4 py-1.5 text-xs text-brand-400 mb-8">
          <Zap size={12} />
          Powered by Gemini AI
        </div>
        <h1 className="text-5xl font-semibold text-white leading-tight mb-6">
          Turn Any Content Into<br />
          <span className="text-brand-500">Smart Assessments</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Upload PDFs, paste text, drop YouTube links, or just name a topic.
          CognifyAI generates ready-to-use quizzes in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate("/register")} className="btn-primary text-base px-7 py-3">
            Start as Teacher <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate("/login")} className="btn-ghost text-base px-7 py-3">
            Join as Student
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-center text-white font-semibold text-2xl mb-3">How It Works</h2>
        <p className="text-center text-gray-500 text-sm mb-12">Three steps to intelligent assessment</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "1. Input Content", desc: "Upload documents, paste URLs, or provide raw text." },
            { icon: Zap,      title: "2. AI Generates", desc: "Gemini AI analyzes and crafts targeted questions." },
            { icon: CheckCircle, title: "3. Share & Assess", desc: "Distribute to students and track real-time results." },
          ].map((step) => (
            <div key={step.title} className="card text-center">
              <div className="w-10 h-10 bg-dark-700 border border-dark-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <step.icon size={18} className="text-brand-500" />
              </div>
              <h3 className="text-white font-medium text-sm mb-2">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {[
            { icon: FileText,   title: "Versatile Input Sources",  desc: "PDF, text, YouTube links, or just a topic name." },
            { icon: AlignLeft,  title: "Dynamic Question Types",   desc: "MCQ, True/False, Short Answer, Fill in the Blanks." },
            // { icon: Youtube,    title: "Real-time Analytics",      desc: "Track performance metrics and identify knowledge gaps." },
          ].map((f) => (
            <div key={f.title} className="card">
              <f.icon size={18} className="text-brand-500 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-6 px-8 flex items-center justify-between text-xs text-gray-600">
        <span>© 2024 CognifyAI. Precision Assessment Engineering.</span>
        <div className="flex gap-6">
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Contact</span>
        </div>
      </footer>
    </div>
  );
}
