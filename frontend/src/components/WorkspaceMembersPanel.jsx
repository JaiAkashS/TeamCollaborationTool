import { useState } from "react";
import Avatar from "./Avatar.jsx";

export default function WorkspaceMembersPanel({ workspace, onInvite, loading, error }) {
  const [form, setForm] = useState({
    email: "",
    role: "member"
  });
  const [copied, setCopied] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await onInvite(form);
      setForm({ email: "", role: "member" });
      setShowInviteForm(false);
    } catch {
      return;
    }
  };

  const handleCopyInviteCode = async () => {
    if (!workspace?.inviteCode || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111725]/40 p-5 backdrop-blur-md shadow-lg shrink-0">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent-400">Workspace Directory</p>
          <h2 className="mt-1 text-sm font-bold text-white tracking-wide">{workspace?.name || "Workspace"}</h2>
        </div>
        
        {/* Toggle Invite Form */}
        <button
          type="button"
          onClick={() => setShowInviteForm((prev) => !prev)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-ink-300 hover:bg-accent-500 hover:border-accent-500 hover:text-white transition-all duration-200 focus-ring ${
            showInviteForm ? "bg-accent-500 border-accent-500 text-white" : "bg-white/5"
          }`}
          title="Invite Member"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6 6 0 0110.957-2.984M4 19.235A2.25 2.25 0 006.25 21.5h7.5a2.25 2.25 0 002.25-2.265m-12 0V17" />
          </svg>
        </button>
      </div>

      {/* Invite Code display */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-ink-950/40 px-4 py-3 text-xs shadow-inner">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Invite Code</span>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-mono text-accent-300 font-semibold border border-white/5">
              {workspace?.inviteCode || "unavailable"}
            </code>
            {workspace?.inviteCode && (
              <button
                type="button"
                onClick={handleCopyInviteCode}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-ink-300 hover:bg-accent-500 hover:border-accent-500 hover:text-white transition-all duration-150 focus-ring"
                title="Copy Invite Code"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0113.5 4.5h-3a2.25 2.25 0 01-2.166-2.612m5.159 5.159l-1.5-1.5M8.25 7.5h7.5M11.25 15.75H18M11.25 12H18m-12 5.25h3m-3-3.75h3M6.25 21a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016.25 4.5h1.25m11.25 0h1.25a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-1.25" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Invite form */}
      {showInviteForm && (
        <form className="mt-4 space-y-3 p-3 rounded-2xl border border-accent-500/20 bg-accent-500/[0.02] animate-slide-down" onSubmit={handleSubmit}>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="colleague@domain.com"
            className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-3.5 py-2 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all duration-150"
          />
          <div className="flex gap-3">
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="flex-1 rounded-xl border border-white/10 bg-ink-950/60 px-3.5 py-2 text-xs text-white outline-none focus:border-accent-500 transition-all duration-150"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={loading || !form.email.trim()}
              className="rounded-xl bg-accent-500 hover:bg-accent-400 px-4 py-2 text-xs font-semibold text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        </form>
      )}

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-2 text-xs text-red-200 animate-slide-down">
          {error}
        </div>
      ) : null}

      {/* Workspace Members list */}
      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Current Members</p>
        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {workspace?.members?.length ? (
            workspace.members.map((member) => {
              const isOwner = member.role === "admin";
              return (
                <div
                  key={member.userId?._id || member.userId}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111725]/60 px-3.5 py-2.5 text-xs transition hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.userId?.name || "Member"} size="sm" />
                    <div>
                      <div className="font-semibold text-white leading-normal">{member.userId?.name || "Member"}</div>
                      <div className="text-[10px] text-ink-400 mt-0.5 leading-none">{member.userId?.email || ""}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${
                    isOwner
                      ? "bg-accent-500/10 text-accent-400 border-accent-500/20"
                      : "bg-white/5 text-ink-300 border-white/5"
                  }`}>
                    {member.role}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-ink-400 bg-white/[0.01]">
              No members loaded.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
