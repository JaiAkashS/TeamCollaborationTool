import { useMemo, useState } from "react";

export default function Sidebar({
  workspaces = [],
  channels = [],
  activeWorkspaceId,
  activeChannelId,
  onSelectWorkspace,
  onSelectChannel,
  onCreateChannel,
  creatingChannel = false,
  channelError = null
}) {
  const groupedChannels = useMemo(() => channels, [channels]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "public"
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onCreateChannel?.(form);
      setForm({
        name: "",
        description: "",
        type: "public"
      });
      setShowCreateForm(false);
    } catch {
      return;
    }
  };

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-[#0d1320]/60 backdrop-blur-md">
      {/* Workspaces Title Header */}
      <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent-400">Workspaces</p>
        <span className="text-[10px] font-semibold text-ink-400 bg-white/5 rounded-full px-2 py-0.5">{workspaces.length}</span>
      </div>

      {/* Workspaces List */}
      <div className="border-b border-white/10 px-3 py-3 max-h-48 overflow-y-auto">
        <div className="space-y-1.5">
          {workspaces.map((workspace) => (
            <button
              key={workspace._id}
              onClick={() => onSelectWorkspace(workspace)}
              className={`w-full group relative rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 focus-ring ${
                activeWorkspaceId === workspace._id
                  ? "bg-accent-500/10 text-white border-l-2 border-accent-500"
                  : "text-ink-200 hover:bg-white/5"
              }`}
            >
              <div className="font-semibold text-xs tracking-wide">{workspace.name}</div>
              <div className="text-[10px] text-ink-400 mt-0.5 font-medium group-hover:text-ink-300">View channels</div>
            </button>
          ))}
        </div>
      </div>

      {/* Channels List Section Header */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col">
        <div className="mb-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink-300">Channels</p>
            <span className="text-[10px] font-bold text-ink-400 bg-white/5 rounded-full px-1.5">{groupedChannels.length}</span>
          </div>
          
          {/* Collapse toggle button for new channel creation */}
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className={`flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 text-ink-300 hover:bg-accent-500 hover:border-accent-500 hover:text-white transition-all duration-200 focus-ring ${
              showCreateForm ? "bg-accent-500 border-accent-500 text-white rotate-45" : "bg-white/5"
            }`}
            title="Create a Channel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Collapsible Create Channel Form */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-4 space-y-2 rounded-xl border border-accent-500/20 bg-accent-500/[0.02] p-3 animate-slide-down"
          >
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Channel name..."
              className="w-full rounded-lg border border-white/10 bg-ink-950/50 px-3 py-2 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all duration-150"
            />
            <input
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Brief description..."
              className="w-full rounded-lg border border-white/10 bg-ink-950/50 px-3 py-2 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all duration-150"
            />
            <div className="flex gap-2">
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                className="flex-1 rounded-lg border border-white/10 bg-ink-950/50 px-2 py-1 text-xs text-white outline-none focus:border-accent-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <button
                type="submit"
                disabled={creatingChannel || !form.name.trim()}
                className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create
              </button>
            </div>
            {channelError ? (
              <div className="rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] text-red-200">{channelError}</div>
            ) : null}
          </form>
        )}

        {/* Channels List */}
        <div className="space-y-1 flex-1">
          {groupedChannels.map((channel) => (
            <button
              key={channel._id}
              onClick={() => onSelectChannel(channel)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 group focus-ring ${
                activeChannelId === channel._id
                  ? "bg-accent-500 text-white shadow-md shadow-accent-500/15"
                  : "text-ink-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-base font-medium transition-colors ${
                  activeChannelId === channel._id ? "text-white" : "text-ink-400 group-hover:text-accent-400"
                }`}>
                  #
                </span>
                <span className="font-medium tracking-wide text-xs">{channel.name}</span>
              </div>
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                activeChannelId === channel._id ? "bg-white/20 text-white" : "bg-white/5 text-ink-300"
              }`}>
                {channel.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
