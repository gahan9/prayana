"use client";

import { Card } from "@/components/ui/Card";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Chat Planner</h1>
        <p className="text-gray-500 mb-8">
          Chat with our AI to build your perfect trip interactively.
        </p>
        <Card className="p-0 overflow-hidden">
          <ChatWindow />
        </Card>
      </div>
    </div>
  );
}
