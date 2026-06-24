import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import LoadingState from "../components/LoadingState.jsx";
import Avatar from "../components/Avatar.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { fetchCurrentUser, logoutUser } from "../features/authSlice.js";
import { createWorkspace, fetchWorkspaces, setActiveWorkspace } from "../features/workspaceSlice.js";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status: authStatus } = useSelector((state) => state.auth);
  const { items: workspaces, status: workspaceStatus, error: workspaceError } = useSelector(
    (state) => state.workspace
  );
  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
    dispatch(fetchWorkspaces());
  }, [dispatch, user]);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    }
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      createWorkspace({
        name: form.name.trim(),
        description: form.description.trim()
      })
    );

    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/workspaces/${result.payload._id}`);
      setForm({ name: "", description: "" });
    }
  };

  const hasWorkspaces = workspaces.length > 0;

  return (
    <main className="min-h-screen px-4 py-8 text-white relative">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-accent-500/5 blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
        {/* Header section */}
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#111725]/40 px-6 py-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 text-white shadow-md shadow-accent-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Dashboard</p>
              <h1 className="text-xl font-bold tracking-tight">TeamSpace Hub</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <Avatar name={user?.name} size="sm" isOnline={true} showStatus={true} />
              <span className="hidden sm:inline text-sm font-medium text-ink-100">{user?.name || "Loading..."}</span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-ink-200 transition hover:bg-white/5 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Workspaces List */}
          <div className="rounded-3xl border border-white/10 bg-[#111725]/30 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold">Your Workspaces</h2>
                <p className="text-xs text-ink-300 mt-1">
                  Select a workspace to view chat channels and task boards.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400 bg-accent-500/10">
                {workspaces.length} workspaces
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {workspaceStatus === "loading" || authStatus === "loading" ? (
                <LoadingState label="Fetching your workspaces..." />
              ) : hasWorkspaces ? (
                workspaces.map((workspace) => (
                  <Link
                    key={workspace._id}
                    to={`/workspaces/${workspace._id}`}
                    onClick={() => dispatch(setActiveWorkspace(workspace))}
                    className="group relative block rounded-2xl border border-white/10 bg-ink-900/40 p-5 transition-all duration-300 hover:border-accent-500/30 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20"
                  >
                    {/* Left accent vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-accent-600 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-accent-400 transition-colors duration-200">
                          {workspace.name}
                        </h3>
                        <p className="mt-2 text-sm text-ink-300 leading-relaxed">
                          {workspace.description || "No workspace description available."}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 bg-ink-950/40 rounded-full px-3 py-1">
                          {workspace.members?.length || 0} {workspace.members?.length === 1 ? "member" : "members"}
                        </span>
                        {/* Member initials avatar stack overlap */}
                        <div className="flex -space-x-2 overflow-hidden mt-1">
                          {workspace.members?.slice(0, 4).map((member, idx) => (
                            <Avatar
                              key={member.userId?._id || idx}
                              name={member.userId?.name || "Member"}
                              size="sm"
                              className="ring-2 ring-ink-900/90"
                            />
                          ))}
                          {workspace.members?.length > 4 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-[10px] font-semibold text-ink-300 ring-2 ring-ink-900/90">
                              +{workspace.members.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-ink-900/10 px-6 py-12 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] text-ink-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-white">No Workspaces Found</h3>
                  <p className="mt-2 max-w-sm text-sm text-ink-300">
                    Get started by creating your first team workspace using the panel on the right.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Create Workspace Aside */}
          <aside className="rounded-3xl border border-white/10 bg-[#111725]/30 p-6 backdrop-blur-md flex flex-col">
            <h2 className="text-lg font-bold">Create Workspace</h2>
            <p className="text-xs text-ink-300 mt-1">Setup a workspace for your team channels and Kanban board.</p>
            
            <form className="mt-6 space-y-4" onSubmit={handleCreateWorkspace}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Design & Dev Team"
                  className="w-full rounded-2xl border border-white/10 bg-ink-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Brief summary of what this team works on..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-ink-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
                />
              </div>

              {workspaceError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-xs text-red-200">
                  {workspaceError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!form.name.trim() || workspaceStatus === "loading"}
                className="w-full rounded-2xl bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-accent-500/20 hover:from-accent-500 hover:to-accent-400 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Workspace
              </button>
            </form>

            <div className="mt-6 p-4 rounded-2xl border border-white/5 bg-white/[0.01] text-xs text-ink-400 space-y-2 leading-relaxed">
              <p>💡 <strong>Tip:</strong> Once created, you can copy the unique workspace invite code inside the members panel to add colleagues.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
