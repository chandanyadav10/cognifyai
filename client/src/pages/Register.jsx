import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("teacher");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, role);
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold">CognifyAI</span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join CognifyAI today</p>

        {/* Role toggle */}
        <div className="flex bg-dark-800 border border-dark-600 rounded-lg p-1 mb-6">
          {["teacher", "student"].map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                role === r ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-gray-500" />
              <input type="text" required className="input pl-9" placeholder="Your name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-gray-500" />
              <input type="email" required className="input pl-9" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-gray-500" />
              <input type={showPwd ? "text" : "password"} required className="input pl-9 pr-10"
                placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? "Creating account..." : `Create ${role} account`}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
