interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: Props) {
  return (
    <div className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}>
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          role === "user"
            ? "bg-slate-700 text-slate-100 rounded-tr-sm"
            : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm backdrop-blur"
        }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-cyan-400 animate-pulse ml-1 align-middle" />
        )}
      </div>
      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
          You
        </div>
      )}
    </div>
  );
}
