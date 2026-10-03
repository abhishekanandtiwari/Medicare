import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Bot,
  ActivitySquare,
  FileText,
  CalendarCheck,
  BarChart3,
  Pill,
  AlertTriangle,
  Mic,
  ShieldCheck,
  Accessibility,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import MedicalDisclaimer from "../components/MedicalDisclaimer";

export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  // =====================================================
  // QUICK DEMO LOGIN
  // =====================================================
  const handleQuickDemo = async (role) => {
    try {
      await demoLogin(role);
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login failed:", err);
      alert("Demo login failed. Please check that the backend is running.");
    }
  };

  // =====================================================
  // FEATURES
  // =====================================================
  const features = [
    {
      icon: Bot,
      title: "AI Health Assistant",
      desc: "Conversational health support with multi-turn memory, follow-up guidance, and easy-to-understand medical information.",
      tag: "AI-Powered Support",
      path: "/ai-assistant",
    },
    {
      icon: ActivitySquare,
      title: "Symptom Analysis",
      desc: "Explore symptoms through intelligent search, guided questions, and connected health information.",
      tag: "Intelligent Analysis",
      path: "/symptom-analyzer",
    },
    {
      icon: FileText,
      title: "Medical Report AI",
      desc: "Upload medical reports and receive extracted health information, reference comparisons, and easy-to-understand summaries.",
      tag: "Smart Report Analysis",
      path: "/medical-reports",
    },
    {
      icon: CalendarCheck,
      title: "Doctor Appointments",
      desc: "Discover specialists, view available time slots, book appointments, and receive secure QR-based check-in passes.",
      tag: "Secure QR Check-in",
      path: "/appointments",
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      desc: "Monitor blood pressure, heart rate, blood sugar, sleep, hydration, and other important health trends.",
      tag: "Personal Health Insights",
      path: "/dashboard",
    },
    {
      icon: Pill,
      title: "Medication Reminders",
      desc: "Manage daily medication schedules, receive refill reminders, and keep track of medication adherence.",
      tag: "Medication Tracking",
      path: "/dashboard",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Support",
      desc: "Quickly access important medical information and initiate emergency assistance when urgent support is needed.",
      tag: "Rapid Emergency Access",
      path: "/dashboard",
    },
    {
      icon: Mic,
      title: "Voice AI Assistant",
      desc: "Interact hands-free using speech input and receive spoken responses in English and Hindi (हिंदी).",
      tag: "Voice Interaction",
      path: "/ai-assistant",
    },
  ];

  // =====================================================
  // WORKFLOW
  // =====================================================
  const workflow = [
    {
      step: "01",
      title: "Create Your Profile",
      desc: "Set up your basic health information, medical history, allergies, and emergency contacts.",
    },
    {
      step: "02",
      title: "Share Your Concern",
      desc: "Describe your health concern or explore symptoms using intelligent search and guided interaction.",
    },
    {
      step: "03",
      title: "Get Health Insights",
      desc: "Receive personalized health information, risk indicators, and easy-to-understand guidance.",
    },
    {
      step: "04",
      title: "Understand Your Health",
      desc: "Review medical report summaries, health trends, medication information, and helpful recommendations.",
    },
    {
      step: "05",
      title: "Connect with a Doctor",
      desc: "Find a suitable specialist, book an available appointment, and use your secure QR pass for check-in.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">

      {/* =====================================================
          TOP BANNER
      ====================================================== */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-center text-xs font-semibold text-white">
        🚀 Medicare-AI is live — Experience a smarter way to manage your
        digital healthcare journey.
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* =====================================================
            MEDICAL DISCLAIMER
        ====================================================== */}
        <MedicalDisclaimer />

        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 p-8 text-center shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-14">

          {/* Decorative Background */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-500/10" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-500/10" />

          {/* Badge */}
          <div className="relative mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Intelligent Healthcare • Secure • Personalized
          </div>

          {/* Heading */}
          <h1 className="relative mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Your Intelligent{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Healthcare
            </span>{" "}
            Companion
          </h1>

          {/* Description */}
          <p className="relative mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
            Bringing together AI health assistance, symptom insights,
            medical report analysis, doctor appointments, health analytics,
            medication tracking, and emergency support in one platform.
          </p>

          {/* =====================================================
              MAIN NAVIGATION BUTTONS
          ====================================================== */}
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">

            {/* Get Started */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => navigate("/ai-assistant")}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <Bot className="h-4 w-4 text-emerald-500" />
              <span>Explore AI Assistant</span>
            </button>

            {/* Find Doctor */}
            <button
              type="button"
              onClick={() => navigate("/doctors")}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <CalendarCheck className="h-4 w-4 text-teal-500" />
              <span>Find a Doctor</span>
            </button>
          </div>

          {/* =====================================================
              DEMO LOGIN
          ====================================================== */}
          <div className="relative mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">

            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              ⚡ Instant Demo Access
            </div>

            <p className="mb-4 text-xs text-emerald-700 dark:text-emerald-400">
              Explore Medicare-AI using a ready-to-use demonstration account.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">

              {/* Patient */}
              <button
                type="button"
                onClick={() => handleQuickDemo("patient")}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
              >
                👤 Patient Demo
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => handleQuickDemo("doctor")}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-sm transition hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700"
              >
                👨‍⚕️ Doctor Demo
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}
        <section className="mt-20">

          <div className="mx-auto max-w-3xl text-center">

            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Integrated Capabilities
            </h2>

            <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Everything You Need for Smarter Healthcare
            </p>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              A unified healthcare platform designed around accessibility,
              privacy, personalization, and intelligent assistance.
            </p>

          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => navigate(feature.path)}
                  aria-label={`Open ${feature.title}`}
                  className="group flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 dark:focus:ring-offset-slate-950"
                >

                  <div className="w-full">

                    {/* Icon + Tag */}
                    <div className="flex items-center justify-between gap-3">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {feature.tag}
                      </span>

                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {feature.desc}
                    </p>

                  </div>

                  {/* CLICKABLE AREA */}
                  <div className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-[11px] font-bold text-emerald-600 transition group-hover:text-emerald-700 dark:border-slate-800 dark:text-emerald-400 dark:group-hover:text-emerald-300">

                    <span>Explore capability</span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>

                  </div>

                </button>
              );
            })}

          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section className="relative mt-24 overflow-hidden rounded-3xl bg-slate-900 p-8 text-white sm:p-14">

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="mx-auto max-w-3xl text-center">

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Simple Healthcare Journey
            </span>

            <h2 className="mt-2 text-3xl font-black">
              How Medicare-AI Works
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              From understanding your concern to connecting with the right
              healthcare professional.
            </p>

          </div>

          <div className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-5">

            {workflow.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-800/50 p-5 backdrop-blur-sm transition hover:border-emerald-500/40 hover:bg-slate-800"
              >
                <span className="text-2xl font-black text-emerald-400">
                  {item.step}
                </span>

                <h4 className="mt-2 text-sm font-bold text-white">
                  {item.title}
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* =====================================================
            SECURITY + ACCESSIBILITY
        ====================================================== */}
        <section className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-2">

          {/* Security */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Security & Privacy
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Designed around patient confidentiality, secure authentication,
              and controlled access to sensitive healthcare information.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Secure authentication and protected user accounts
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Role-based access for Patients, Doctors, and Administrators
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Activity tracking for sensitive healthcare operations
                </span>
              </li>

            </ul>
          </div>

          {/* Accessibility */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Accessibility className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Accessible for Everyone
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Designed to make digital healthcare easier to use for elderly
              users, families, and people with different levels of technology
              familiarity.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  <strong>Elderly Mode:</strong> Larger text, clear controls,
                  and simplified navigation
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  <strong>Multilingual:</strong> English and Hindi (हिंदी)
                  support
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  <strong>Voice Assistant:</strong> Hands-free interaction
                  and spoken responses
                </span>
              </li>

            </ul>
          </div>

        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-12">

          <div className="mx-auto max-w-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Bot className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">
              Start Your Digital Healthcare Journey
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Explore AI-powered health assistance, medical insights,
              appointments, health tracking, and more through Medicare-AI.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <footer className="mt-20 border-t border-slate-200 py-8 text-center dark:border-slate-800">

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Medicare-AI is a health information and decision-support system,
            not a replacement for a qualified healthcare professional.
          </p>

          <p className="mt-2 text-xs text-slate-400">
            For medical emergencies, contact your local emergency service
            immediately.
          </p>

          <p className="mt-4 text-[11px] text-slate-400">
            © {new Date().getFullYear()} Medicare-AI. All rights reserved.
          </p>

        </footer>

      </div>
    </div>
  );
}