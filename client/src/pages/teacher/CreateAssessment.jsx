import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Step1Source    from "../../components/wizard/Step1Source";
import Step2Configure from "../../components/wizard/Step2Configure";
import Step3Review    from "../../components/wizard/Step3Review";
import Step4Publish   from "../../components/wizard/Step4Publish";
import { ArrowLeft, ArrowRight, Zap, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Source", "Configure", "Review", "Publish"];

export default function CreateAssessment() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [savedAssessment, setSaved]   = useState(null);
  const [questions, setQuestions]     = useState([]);

  const [formData, setFormData] = useState({
    sourceType: "", file: null, textContent: "", youtubeUrl: "", topicName: "",
    title: "", totalQuestions: 10, difficulty: "medium",
    questionTypes: { mcq: true, truefalse: true, short: false, fillblank: false },
    timeLimit: 30,
  });

  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const canProceed = () => {
    if (step === 0) {
      if (!formData.sourceType) return false;
      if (formData.sourceType === "pdf"     && !formData.file)          return false;
      if (formData.sourceType === "text"    && !formData.textContent)   return false;
      if (formData.sourceType === "youtube" && !formData.youtubeUrl)    return false;
      if (formData.sourceType === "topic"   && !formData.topicName)     return false;
      return true;
    }
    if (step === 1) return !!formData.title?.trim();
    if (step === 2) return questions.length > 0;
    return true;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("sourceType",    formData.sourceType);
      fd.append("totalQuestions", formData.totalQuestions);
      fd.append("difficulty",    formData.difficulty);
      fd.append("questionTypes", JSON.stringify(formData.questionTypes));
      if (formData.sourceType === "pdf")     fd.append("pdf",         formData.file);
      if (formData.sourceType === "text")    fd.append("textContent", formData.textContent);
      if (formData.sourceType === "youtube") fd.append("youtubeUrl",  formData.youtubeUrl);
      if (formData.sourceType === "topic")   fd.append("topicName",   formData.topicName);

      const { data } = await api.post("/assessment/generate", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQuestions(data.questions);
      update({ sourceContent: data.sourceContent });
      setStep(2);
      toast.success(`${data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/assessment", {
        title:         formData.title,
        sourceType:    formData.sourceType,
        sourceContent: formData.sourceContent,
        difficulty:    formData.difficulty,
        questionTypes: formData.questionTypes,
        totalQuestions: questions.length,
        questions,
        timeLimit:     formData.timeLimit,
      });
      // Auto publish
      await api.patch(`/assessment/${data.assessment._id}/publish`, { status: "active" });
      setSaved({ ...data.assessment, status: "active" });
      setStep(3);
      toast.success("Assessment published!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) { await handleGenerate(); return; }
    if (step === 2) { await handleSave(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/teacher")} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-white text-sm font-medium">New Assessment Wizard</span>
          </div>
        </div>
        <button onClick={() => navigate("/teacher")} className="btn-ghost text-xs py-1.5 px-3">
          Save Draft & Exit
        </button>
      </div>

      {/* Step progress */}
      <div className="flex items-center justify-center gap-0 px-8 py-5 border-b border-dark-600">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i < step  ? "bg-brand-600 text-white" :
                i === step ? "bg-brand-600 text-white ring-2 ring-brand-600/30" :
                "bg-dark-800 border border-dark-600 text-gray-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 ${i === step ? "text-white" : "text-gray-500"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-24 h-px mx-3 mb-5 transition-all ${i < step ? "bg-brand-600" : "bg-dark-600"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {step === 0 && <Step1Source data={formData} onChange={update} />}
        {step === 1 && <Step2Configure data={formData} onChange={update} />}
        {step === 2 && <Step3Review questions={questions} onUpdate={setQuestions} />}
        {step === 3 && savedAssessment && <Step4Publish assessment={savedAssessment} />}
      </div>

      {/* Bottom nav */}
      {step < 3 && (
        <div className="flex items-center justify-between px-8 py-4 border-t border-dark-600">
          <button onClick={() => step === 0 ? navigate("/teacher") : setStep((s) => s - 1)}
            className="btn-ghost">
            <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          <button onClick={handleNext} disabled={!canProceed() || loading} className="btn-primary">
            {loading ? (
              <><Loader size={14} className="animate-spin" />
              {step === 1 ? "Generating..." : "Saving..."}</>
            ) : step === 1 ? (
              <><Zap size={14} /> Generate Questions</>
            ) : step === 2 ? (
              <>Publish Assessment <ArrowRight size={14} /></>
            ) : (
              <>Next <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-center px-8 py-4 border-t border-dark-600">
          <button onClick={() => navigate("/teacher")} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
