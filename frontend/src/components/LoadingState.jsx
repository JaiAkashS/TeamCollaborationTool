export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-ink-300 backdrop-blur-sm animate-fade-in">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse-dot" style={{ animationDelay: "0s" }} />
        <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
        <span className="h-2 w-2 rounded-full bg-accent-300 animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
      </div>
      {label && <p className="font-medium tracking-wide text-ink-200">{label}</p>}
    </div>
  );
}
