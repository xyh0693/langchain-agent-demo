import { Send } from "lucide-react";
import { type KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: Props) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder="Ask the agent anything..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 cursor-pointer"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-10 w-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-150 cursor-pointer"
      >
        <Send size={16} className="text-slate-900" />
      </button>
    </div>
  );
}
