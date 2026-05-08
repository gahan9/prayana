"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  budget?: { amount: number; currency: string };
}

export function ChatWindow({ budget }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          budget,
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m,
          ),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: current } : m,
          ),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Connection error. Check your network and try again." }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">Start planning your trip</p>
            <p className="text-sm">
              Try: &quot;Plan a 3-day trip to Goa for 2 people with a budget of 20000 INR&quot;
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content || "..."}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your ideal trip..."
          disabled={streaming}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
