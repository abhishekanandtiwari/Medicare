
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AIAssistantPage from "./pages/AIAssistantPage";
import SymptomAnalyzerPage from "./pages/SymptomAnalyzerPage";
import MedicalReportAIPage from "./pages/MedicalReportAIPage";
import DoctorDiscoveryPage from "./pages/DoctorDiscoveryPage";
import AppointmentsPage from "./pages/AppointmentsPage";

import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Pages */}
         
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/symptom-analyzer" element={<SymptomAnalyzerPage />} />
          <Route path="/medical-reports" element={<MedicalReportAIPage />} />
          <Route path="/doctors" element={<DoctorDiscoveryPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />

          {/* Unknown URL */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
