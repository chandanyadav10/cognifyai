import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/teacher/Dashboard";
import CreateAssessment from "./pages/teacher/CreateAssessment";
import Analytics from "./pages/teacher/Analytics";
import StudentDashboard from "./pages/student/Dashboard";
import AttemptPage from "./pages/student/AttemptPage";
import ResultPage from "./pages/student/ResultPage";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  const teacherHome = "/teacher";
  const studentHome = "/student";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === "teacher" ? teacherHome : studentHome} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === "teacher" ? teacherHome : studentHome} /> : <Register />} />
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/create" element={<ProtectedRoute role="teacher"><CreateAssessment /></ProtectedRoute>} />
        <Route path="/teacher/analytics/:id" element={<ProtectedRoute role="teacher"><Analytics /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attempt/:assessmentId" element={<ProtectedRoute role="student"><AttemptPage /></ProtectedRoute>} />
        <Route path="/student/result/:attemptId" element={<ProtectedRoute role="student"><ResultPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
