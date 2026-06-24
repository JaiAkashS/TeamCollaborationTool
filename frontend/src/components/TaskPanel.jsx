import { useState } from "react";

import LoadingState from "./LoadingState.jsx";
import { useDispatch, useSelector } from "react-redux";
import { updateTask, addTaskComment } from "../features/taskSlice.js";

export default function TaskPanel({ tasks = [], loading = false, onCreateTask, creatingTask = false, error = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: "",
    description: ""
  });
  const workspaceId = useSelector((state) => state.workspace.activeWorkspace?._id);

  const handleStatusChange = (task, newStatus) => {
    if (!workspaceId) return;
    dispatch(updateTask({ workspaceId, taskId: task._id, payload: { status: newStatus } }));
  };

  const handleAddComment = async (task, text) => {
    if (!workspaceId) return;
    await dispatch(addTaskComment({ workspaceId, taskId: task._id, text })).unwrap();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onCreateTask?.({
        title: form.title,
        description: form.description
      });
      setForm({ title: "", description: "" });
    } catch {
      return;
    }
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-accent-300">Tasks</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl border border-white/10 bg-ink-900/40 p-3">
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Task title"
            className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-400"
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Task description"
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-sm text-white outline-none placeholder:text-ink-500 focus:border-accent-400"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={creatingTask || !form.title.trim()}
              className="rounded-xl bg-accent-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Task
            </button>
            {error ? <span className="text-xs text-red-200">{error}</span> : null}
          </div>
        </form>

        {loading ? (
          <LoadingState label="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-ink-300">
            No tasks in view yet.
          </div>
        ) : (
          tasks.map((task) => (
            <article key={task._id} className="rounded-2xl border border-white/10 bg-ink-900/40 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium text-white">{task.title}</h3>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase text-ink-300">
                  {task.status}
                </span>
                {/* Status actions */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleStatusChange(task, "todo")}
                    className="text-xs text-ink-400 hover:text-white"
                  >Todo</button>
                  <button
                    onClick={() => handleStatusChange(task, "in-progress")}
                    className="text-xs text-ink-400 hover:text-white"
                  >In-Progress</button>
                  <button
                    onClick={() => handleStatusChange(task, "done")}
                    className="text-xs text-ink-400 hover:text-white"
                  >Done</button>
                </div>
                {/* Comment input */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const text = e.target.elements.comment.value.trim();
                    if (text) {
                      await handleAddComment(task, text);
                      e.target.reset();
                    }
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input name="comment" placeholder="Add comment" className="flex-1 rounded-sm border border-white/10 bg-ink-900/70 px-2 py-1 text-xs text-white placeholder:text-ink-500" />
                  <button type="submit" className="rounded-sm bg-accent-500 px-2 py-1 text-xs text-white">Add</button>
                </form>
              </div>
              {task.description ? (
                <p className="mt-2 text-sm leading-6 text-ink-200">{task.description}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
