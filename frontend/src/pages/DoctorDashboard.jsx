import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Stethoscope, CalendarDays, LogOut } from "lucide-react";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>
        <Stethoscope size={28} /> Doctor Dashboard
      </h1>

      <p>Welcome, Dr. {user?.name || "Doctor"}!</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <div style={{ marginTop: "24px" }}>
        <h2>Doctor Workspace</h2>
        <p>Manage your appointments and patient consultations here.</p>

        <button onClick={() => navigate("/appointments")}>
          <CalendarDays size={18} /> View Appointments
        </button>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{ marginLeft: "12px" }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
