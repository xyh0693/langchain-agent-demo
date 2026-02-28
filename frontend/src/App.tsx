import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = `${Date.now()}-assistant`;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = JSON.parse(line.slice(5).trim()) as { type: string; content?: string };
          if (data.type === "token" && data.content) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + data.content } : m
              )
            );
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h1 className="font-semibold text-slate-100">LangChain Agent</h1>
        <span className="text-xs text-slate-500 ml-auto">Search + Calculator</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <p className="text-center text-slate-600 text-sm mt-20">
            Start a conversation. Try: "Search for LangChain news" or "Calculate 123 * 456"
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-slate-800 px-4 py-4 max-w-3xl w-full mx-auto">
        <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={streaming} />
      </footer>
    </div>
  );
}
