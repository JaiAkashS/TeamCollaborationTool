import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaceActivity } from "../features/workspaceSlice.js";

const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

const getActivityStyles = (action) => {
  const lowercaseAction = action ? action.toLowerCase() : "";
  if (lowercaseAction.includes("message") || lowercaseAction.includes("chat")) {
    return {
      dotColor: "bg-accent-500 shadow-accent-500/35",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-2.5 w-2.5 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      )
    };
  }
  if (lowercaseAction.includes("task") || lowercaseAction.includes("kanban")) {
    return {
      dotColor: "bg-amber-500 shadow-amber-500/35",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-2.5 w-2.5 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-2.224-2.408-3.467-4.242-2.193L9 12zm0 0v.008H12V12zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  }
  return {
    dotColor: "bg-blue-500 shadow-blue-500/35",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-2.5 w-2.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  };
};

export default function ActivityPanel() {
  const dispatch = useDispatch();
  const { activityLogs, status, error } = useSelector((state) => state.workspace);
  const workspaceId = useSelector((state) => state.workspace.activeWorkspace?._id);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceActivity(workspaceId));
    }
  }, [dispatch, workspaceId]);

  return (
    <div className="flex flex-col gap-3 p-5 rounded-3xl border border-white/10 bg-[#111725]/40 backdrop-blur-md overflow-hidden max-h-80 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-300">Activity Logs</h3>
          <p className="text-[10px] text-ink-400 mt-0.5">Live workspace actions stream</p>
        </div>
        {status === "loading" && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-accent-500 animate-ping" />
        )}
      </div>

      {error && (
        <div className="text-[10px] text-red-400">{error}</div>
      )}

      {activityLogs.length === 0 && status !== "loading" ? (
        <div className="text-[11px] text-ink-400 text-center py-6">No recent actions recorded.</div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin relative pl-4 mt-2">
          {/* Vertical timeline connector */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/15" />
          
          <ul className="space-y-4">
            {activityLogs.map((log) => {
              const styles = getActivityStyles(log.action);
              return (
                <li key={log._id} className="relative flex gap-3 text-xs animate-fade-in pl-3.5">
                  {/* Dot with custom color & shadow */}
                  <span className={`absolute left-[-11px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-ink-950 shadow-sm ${styles.dotColor}`}>
                    {styles.icon}
                  </span>
                  
                  <div className="flex flex-col leading-normal">
                    <span className="font-semibold text-white tracking-wide">{log.action}</span>
                    <span className="text-[11px] text-ink-300 mt-0.5">{log.description}</span>
                    <span className="text-[9px] font-bold text-ink-500 mt-1 uppercase tracking-wider">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
