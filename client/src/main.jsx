import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#0D1117", color: "#fff", border: "1px solid #1C2333", fontSize: "14px" },
          success: { iconTheme: { primary: "#2563EB", secondary: "#fff" } },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
