export default function AuthForm({
  mode,
  form,
  setForm,
  onSubmit,
  loading,
  error,
  onToggleMode
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-[#111725]/60 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl animate-slide-up"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-accent-400 font-semibold">TeamSpace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-xs text-ink-300">
          {mode === "login"
            ? "Enter your details to sign in to your workspace."
            : "Sign up to begin collaborating with your team."}
        </p>
      </div>

      <div className="space-y-4">
        {mode === "signup" ? (
          <div className="relative flex items-center">
            <span className="absolute left-4 text-ink-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full Name"
              className="w-full rounded-2xl border border-white/10 bg-ink-950/50 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
            />
          </div>
        ) : null}

        <div className="relative flex items-center">
          <span className="absolute left-4 text-ink-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            className="w-full rounded-2xl border border-white/10 bg-ink-950/50 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
          />
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-4 text-ink-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-ink-950/50 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-xs text-red-200 animate-slide-down">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/35 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs font-medium text-ink-300 hover:text-accent-400 transition-colors duration-150"
        >
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}
