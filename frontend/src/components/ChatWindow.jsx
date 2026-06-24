import { useEffect, useRef } from "react";
import LoadingState from "./LoadingState.jsx";
import Avatar from "./Avatar.jsx";

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
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function ChatWindow({
  channel,
  messages = [],
  onSendMessage,
  messageText,
  setMessageText,
  loading,
  currentUser
}) {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (messageText.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#111725]/40 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Channel Header Info */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-accent-400 font-bold text-lg">#</span>
            <h2 className="text-sm font-bold tracking-wide uppercase text-white">
              {channel ? channel.name : "Select a channel"}
            </h2>
            {channel?.type === "private" && (
              <span className="text-[10px] bg-red-500/10 text-red-300 font-semibold uppercase px-2 py-0.5 rounded-full border border-red-500/20">
                Private
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-300 font-medium">
            {channel?.description || (channel ? "Channel conversation" : "Choose a channel in the sidebar to start chatting.")}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 scrollbar-thin">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingState label="Retrieving conversation messages..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-ink-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.586 10.586 0 002.222-.488c.582-.24 1.224-.194 1.75.145A10.757 10.757 0 0012 20.25z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white">No messages here yet</p>
            <p className="text-xs text-ink-300 mt-1">Start the conversation by typing in the message box below.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = currentUser && (message.senderId?._id === currentUser._id || message.senderId === currentUser._id);
              return (
                <article
                  key={message._id}
                  className={`flex gap-3 max-w-[85%] animate-fade-in ${isOwn ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <Avatar name={message.senderId?.name} size="sm" className="mt-0.5 shadow-sm" />
                  
                  <div className="flex flex-col">
                    <div className={`flex items-center gap-2 mb-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                      <strong className="text-xs font-semibold text-white">
                        {message.senderId?.name || "Unknown user"}
                      </strong>
                      <span className="text-[10px] font-medium text-ink-400" title={new Date(message.createdAt).toLocaleString()}>
                        {formatRelativeTime(message.createdAt)}
                      </span>
                    </div>

                    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${
                      isOwn
                        ? "bg-accent-500/10 border-accent-500/20 text-white rounded-tr-none"
                        : "bg-white/[0.02] border-white/5 text-ink-100 rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap text-xs leading-5">
                        {message.text}
                      </p>
                      {message.attachments?.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.url}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-accent-300 hover:bg-white/10 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                              </svg>
                              {attachment.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input bottom form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSendMessage();
        }}
        className="border-t border-white/10 p-4 bg-black/10 shrink-0"
      >
        <div className="flex items-end gap-2.5">
          <textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={channel ? `Message #${channel.name}...` : "Choose a channel first"}
            disabled={!channel}
            rows={1}
            className="min-h-[44px] max-h-[120px] flex-1 resize-none rounded-2xl border border-white/10 bg-ink-950/60 px-4 py-3 text-xs text-white outline-none placeholder:text-ink-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!channel || !messageText.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-600 to-accent-500 text-white shadow-md shadow-accent-500/20 hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/35 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send Message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 rotate-45 -translate-x-0.5 translate-y-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
