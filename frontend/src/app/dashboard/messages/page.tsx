"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listConversations,
  listMessages,
  sendMessage,
  type ChatMessage,
  type Conversation,
} from "@/lib/messages-api";
import { useAuthStore } from "@/store/auth-store";

function socketUrl() {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const convQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    enabled: !!user,
  });

  const conversations = useMemo(
    () => convQuery.data?.data ?? [],
    [convQuery.data?.data],
  );
  const active = useMemo(
    () => conversations.find((c) => c._id === activeId) || null,
    [conversations, activeId],
  );

  const msgQuery = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => listMessages(activeId!),
    enabled: !!activeId,
  });

  const messages = msgQuery.data?.data ?? [];

  useEffect(() => {
    if (!accessToken) return;
    const s = io(`${socketUrl()}/messaging`, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    s.on("message:new", (msg: ChatMessage) => {
      void queryClient.invalidateQueries({ queryKey: ["messages", msg.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
    s.on("typing:start", () => setTyping(true));
    s.on("typing:stop", () => setTyping(false));
    return () => {
      s.disconnect();
    };
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (socket && activeId) {
      socket.emit("conversation:join", { conversationId: activeId });
    }
  }, [socket, activeId]);

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted">Sign in to message.</p>
          <Link href="/login">
            <Button className="mt-4">Log in</Button>
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[70vh] max-w-6xl gap-4 px-4 py-8 md:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-3">
          <h1 className="mb-3 px-2 font-[family-name:var(--font-display)] text-xl font-bold">
            Messages
          </h1>
          <div className="space-y-1">
            {conversations.map((c: Conversation) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setActiveId(c._id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  activeId === c._id ? "bg-surface text-accent" : "hover:bg-surface"
                }`}
              >
                <p className="font-medium truncate">
                  {c.lastMessagePreview || "New conversation"}
                </p>
                <p className="text-xs text-muted truncate">{c._id}</p>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="px-2 text-sm text-muted">
                No conversations yet. Start one from an application.
              </p>
            )}
          </div>
        </aside>

        <section className="flex flex-col rounded-xl border border-border bg-card">
          {!active ? (
            <p className="m-auto text-sm text-muted">Select a conversation</p>
          ) : (
            <>
              <div className="border-b border-border px-4 py-3 text-sm text-muted">
                Conversation {active._id.slice(-6)}
                {typing && <span className="ml-2 text-accent">typing…</span>}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.senderId === user.id || String(m.senderId) === user.id
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-surface"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2 border-t border-border p-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!text.trim() || !activeId) return;
                  socket?.emit("typing:stop", { conversationId: activeId });
                  if (socket) {
                    socket.emit("message:send", {
                      conversationId: activeId,
                      text: text.trim(),
                    });
                  } else {
                    await sendMessage(activeId, { body: text.trim() });
                  }
                  setText("");
                  void msgQuery.refetch();
                  void convQuery.refetch();
                }}
              >
                <Input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (activeId && socket) {
                      socket.emit("typing:start", { conversationId: activeId });
                    }
                  }}
                  placeholder="Write a message…"
                />
                <Button type="submit">Send</Button>
              </form>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
