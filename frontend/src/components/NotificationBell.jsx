import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationRead } from "../features/notificationSlice.js";

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

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { items: notifications = [], status } = useSelector((state) => state.notification);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAsRead = (event, id) => {
    event.stopPropagation();
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-xl p-2 text-ink-300 transition-all duration-200 hover:bg-white/5 hover:text-white focus-ring"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[8px] font-bold text-white ring-2 ring-[#111725] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#111725]/95 shadow-2xl shadow-black/60 backdrop-blur-md z-50 animate-scale-in origin-top-right overflow-hidden">
          {/* Dropdown Header */}
          <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between bg-black/10">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">Notifications</h3>
            </div>
            <span className="text-[10px] text-accent-400 font-bold bg-accent-500/10 rounded-full px-2 py-0.5 border border-accent-500/10">
              {unreadCount} new
            </span>
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-ink-400 font-medium">
                No notifications to display.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative px-4 py-3 text-left transition hover:bg-white/[0.02] flex items-start gap-3 group ${
                    !notification.readAt ? "bg-accent-500/[0.02]" : ""
                  }`}
                >
                  {/* Left accent strip for unread messages */}
                  {!notification.readAt && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-snug">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-300 leading-normal font-medium">
                      {notification.body}
                    </p>
                    <span className="mt-2 block text-[9px] font-bold text-ink-500 uppercase tracking-wider">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* Mark single as read */}
                  {!notification.readAt && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, notification._id)}
                      className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[9px] font-bold text-accent-400 border border-white/5 hover:bg-accent-500 hover:text-white transition-all duration-150"
                    >
                      Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
