import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>
        <ShieldCheck size={28} /> Admin Dashboard
      </h1>

      <p>Welcome, {user?.name || "Administrator"}!</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <div style={{ marginTop: "24px" }}>
        <h2>Administration</h2>
        <p>Welcome to the Medicare administration workspace.</p>

        <button onClick={() => navigate("/")}>
          <Users size={18} /> Home
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
