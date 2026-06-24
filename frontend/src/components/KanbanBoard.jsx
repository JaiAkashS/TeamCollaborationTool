import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingState from "./LoadingState.jsx";
import Avatar from "./Avatar.jsx";
import { createTask, updateTask, addTaskComment } from "../features/taskSlice.js";

export default function KanbanBoard({ tasks = [], loading = false, onCreateTask, creatingTask = false, error = null, members = [] }) {
  const [form, setForm] = useState({ title: "", description: "", assigneeId: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  
  const dispatch = useDispatch();
  const workspaceId = useSelector((state) => state.workspace.activeWorkspace?._id);

  const handleStatusChange = (task, newStatus) => {
    if (!workspaceId) return;
    dispatch(updateTask({ workspaceId, taskId: task._id, payload: { status: newStatus } }));
  };

  const handleAssigneeChange = (task, newAssigneeId) => {
    if (!workspaceId) return;
    dispatch(updateTask({ workspaceId, taskId: task._id, payload: { assigneeId: newAssigneeId || null } }));
  };

  const handleAddComment = async (task, text) => {
    if (!workspaceId) return;
    await dispatch(addTaskComment({ workspaceId, taskId: task._id, text })).unwrap();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onCreateTask?.({ 
      title: form.title, 
      description: form.description, 
      assigneeId: form.assigneeId || null 
    });
    setForm({ title: "", description: "", assigneeId: "" });
    setShowCreateForm(false);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTaskId(task._id);
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.setData("sourceStatus", task.status);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    if (sourceStatus === targetStatus || !taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      handleStatusChange(task, targetStatus);
    }
  };

  const statuses = ["todo", "in-progress", "done"];
  const columns = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  const statusConfig = {
    "todo": {
      label: "To Do",
      colorClass: "text-status-todo bg-status-todo-bg border-status-todo/20",
      borderTopClass: "status-bar-todo",
      dotClass: "bg-status-todo"
    },
    "in-progress": {
      label: "In Progress",
      colorClass: "text-status-progress bg-status-progress-bg border-status-progress/20",
      borderTopClass: "status-bar-progress",
      dotClass: "bg-status-progress"
    },
    "done": {
      label: "Completed",
      colorClass: "text-status-done bg-status-done-bg border-status-done/20",
      borderTopClass: "status-bar-done",
      dotClass: "bg-status-done"
    }
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#111725]/40 backdrop-blur-md overflow-hidden shadow-2xl animate-fade-in">
      {/* Header Panel */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/10 shrink-0">
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
            Tasks & Workflows
            <span className="text-[10px] lowercase font-normal text-ink-400 bg-white/5 px-2 py-0.5 rounded-full">
              drag tasks to update status
            </span>
          </h2>
          <p className="mt-1 text-xs text-ink-300 font-medium">Track your team assignments and statuses on the Kanban board.</p>
        </div>

        {/* Toggle create task form */}
        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-ring ${
            showCreateForm
              ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
              : "bg-accent-500/10 border-accent-500/20 text-accent-400 hover:bg-accent-500/20"
          }`}
        >
          {showCreateForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Task
            </>
          )}
        </button>
      </div>

      {/* Collapsible Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-accent-500/20 bg-accent-500/[0.02] p-4 m-5 animate-slide-down">
          <div>
            <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              placeholder="e.g. Design Landing Page mockups"
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950/50 px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
              placeholder="Write a short summary of the tasks to be completed..."
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950/50 px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Assignee</label>
            <select
              value={form.assigneeId}
              onChange={(e) => setForm((c) => ({ ...c, assigneeId: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-accent-500 transition-all"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId?._id || m.userId} value={m.userId?._id || m.userId}>
                  {m.userId?.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creatingTask || !form.title.trim()}
            className="rounded-xl bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-accent-500/10"
          >
            Create Task
          </button>
          {error && <div className="text-xs text-red-200 mt-1">{error}</div>}
        </form>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <LoadingState label="Fetching workspace cards..." />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto flex gap-4 p-5 scrollbar-thin">
          {statuses.map((status) => {
            const config = statusConfig[status];
            const currentTasks = columns[status];
            const isTarget = draggedOverColumn === status;
            
            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex flex-col flex-1 min-w-[260px] max-w-[360px] gap-3 bg-black/15 rounded-2xl p-3 border shadow-inner transition-all duration-200 ${
                  isTarget 
                    ? "bg-accent-500/[0.04] border-accent-500/30 scale-[1.01] shadow-glow" 
                    : "border-white/5"
                } ${config.borderTopClass}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider">{config.label}</h3>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-ink-300">
                    {currentTasks.length}
                  </span>
                </div>

                {/* Column items list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {currentTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 py-8 text-center bg-white/[0.01] h-32">
                      <span className="text-[10px] text-ink-400 font-medium">Drop tasks here</span>
                    </div>
                  ) : (
                    currentTasks.map((task) => {
                      const isDragged = draggedTaskId === task._id;
                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className={`group bg-[#111725]/60 rounded-2xl border border-white/5 p-4 shadow-sm transition-all duration-300 hover:border-accent-500/20 active:cursor-grabbing ${
                            isDragged 
                              ? "opacity-40 border-dashed border-accent-500/40" 
                              : "cursor-grab hover:shadow-md hover:shadow-black/20 hover:-translate-y-0.5"
                          }`}
                        >
                          {/* Title & Drag Handle indicator */}
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-xs font-bold text-white leading-normal tracking-wide group-hover:text-accent-400 transition-colors flex-1">
                              {task.title}
                            </h4>
                            {/* Drag handle icon */}
                            <div className="text-ink-500 group-hover:text-ink-300 transition-colors flex gap-0.5 select-none mt-0.5 shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                              </svg>
                            </div>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="mt-2 text-[11px] text-ink-300 leading-relaxed font-medium">
                              {task.description}
                            </p>
                          )}

                          {/* Assignee Selection & Avatar layout */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-ink-400 uppercase tracking-wider">Assignee:</span>
                              <select
                                value={task.assigneeId?._id || task.assigneeId || ""}
                                onChange={(e) => handleAssigneeChange(task, e.target.value)}
                                className="rounded-lg border border-white/5 bg-ink-950/40 px-2 py-0.5 text-[9px] font-semibold text-ink-200 outline-none focus:border-accent-500 transition-all cursor-pointer"
                              >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                  <option key={m.userId?._id || m.userId} value={m.userId?._id || m.userId}>
                                    {m.userId?.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {task.assigneeId && (
                              <Avatar
                                name={task.assigneeId.name}
                                size="sm"
                                className="shadow-sm border border-white/10"
                                title={`Assigned to ${task.assigneeId.name}`}
                              />
                            )}
                          </div>

                          {/* Comments history display */}
                          {task.comments && task.comments.length > 0 && (
                            <div className="mt-3 space-y-2 rounded-xl bg-black/20 p-2.5 max-h-24 overflow-y-auto border border-white/5 scrollbar-thin">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-ink-400 block mb-1">Comments ({task.comments.length})</span>
                              {task.comments.map((c, idx) => (
                                <div key={idx} className="text-[10px] text-ink-200 leading-normal pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                                  <span className="font-bold text-accent-400">{c.userId?.name || "User"}:</span>{" "}
                                  {c.text}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment post form inside card */}
                          <div className="mt-3 pt-2.5 border-t border-white/5">
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const text = e.target.elements.comment.value.trim();
                                if (text) {
                                  await handleAddComment(task, text);
                                  e.target.reset();
                                }
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                name="comment"
                                placeholder="Write a comment..."
                                className="flex-1 rounded-xl border border-white/15 bg-ink-950/60 px-3 py-1.5 text-[10px] text-white outline-none placeholder:text-ink-500 focus:border-accent-500 transition-all"
                              />
                              <button
                                type="submit"
                                className="rounded-xl bg-accent-500 hover:bg-accent-400 px-3 py-1.5 text-[9px] font-bold text-white transition-all shrink-0"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
