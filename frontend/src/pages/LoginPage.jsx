import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm.jsx";
import { loginUser, signupUser } from "../features/authSlice.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const action =
      mode === "login"
        ? loginUser({ email: form.email, password: form.password })
        : signupUser(form);

    const result = await dispatch(action);

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 lg:px-8">
      {/* Decorative blurred blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-accent-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-12 lg:grid lg:grid-cols-2">
        {/* Left column (Branding & visual) - Hidden on mobile/tablet */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 text-left animate-fade-in">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-600 to-accent-400 text-white shadow-lg shadow-accent-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
              Collaborate and deliver <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">effortlessly</span>.
            </h2>
            <p className="mt-4 text-base text-ink-300 leading-relaxed max-w-md">
              Bring your teams together with real-time conversations, channels, and Kanban-style workflows. Simple, elegant, and blazing fast.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5 max-w-md">
            <div>
              <h4 className="text-lg font-bold text-white">100%</h4>
              <p className="text-xs text-ink-400 mt-1">Real-time sync speeds</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">All-in-One</h4>
              <p className="text-xs text-ink-400 mt-1">Chat & tasks combined</p>
            </div>
          </div>
        </div>

        {/* Right column (Auth form container) */}
        <div className="flex w-full items-center justify-center lg:justify-end">
          <AuthForm
            mode={mode}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            loading={status === "loading"}
            error={error}
            onToggleMode={() => setMode((current) => (current === "login" ? "signup" : "login"))}
          />
        </div>
      </div>
    </main>
  );
}
