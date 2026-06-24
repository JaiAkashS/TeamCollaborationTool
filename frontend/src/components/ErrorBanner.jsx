export default function ErrorBanner({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3.5 text-sm text-red-200 backdrop-blur-md animate-slide-down shadow-lg shadow-red-950/10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5 shrink-0 text-red-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <div className="flex-1 font-medium">{message}</div>
    </div>
  );
}
