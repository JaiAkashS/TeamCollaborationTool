import React from "react";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const stringToColor = (name) => {
  if (!name) return "hsl(164, 65%, 45%)";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Keep colors rich and balanced for text readability
  return `hsl(${hue}, 60%, 42%)`;
};

export default function Avatar({ name, size = "md", isOnline = false, showStatus = false, className = "" }) {
  const initials = getInitials(name);
  const backgroundColor = stringToColor(name);

  const sizeClasses = {
    sm: "h-7 w-7 text-xs font-semibold",
    md: "h-9 w-9 text-sm font-semibold",
    lg: "h-12 w-12 text-base font-bold",
    xl: "h-16 w-16 text-xl font-bold"
  };

  const statusSizeClasses = {
    sm: "h-2 w-2 ring-1",
    md: "h-2.5 w-2.5 ring-2",
    lg: "h-3.5 w-3.5 ring-2",
    xl: "h-4 w-4 ring-2"
  };

  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-full text-white ${sizeClasses[size] || sizeClasses.md} ${className}`} style={{ backgroundColor }}>
      <span>{initials}</span>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-ink-950 ${statusSizeClasses[size] || statusSizeClasses.md} ${
            isOnline ? "bg-accent-400" : "bg-ink-500"
          }`}
        />
      )}
    </div>
  );
}
