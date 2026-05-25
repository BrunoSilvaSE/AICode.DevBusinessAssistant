"use client";

import { useState, useEffect, useCallback } from "react";
import { Inbox, Mail, MailOpen, Trash2, X, ArrowLeft, AtSign } from "lucide-react";

type Message = {
  id: string;
  sender_name: string;
  sender_contact: string;
  message: string;
  read: boolean;
  created_at: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function DashboardInbox({ jwt }: { jwt: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) setMessages(await res.json());
  }, [jwt]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const unreadCount = messages.filter((m) => !m.read).length;

  async function openMessage(msg: Message) {
    setSelected(msg);
    if (!msg.read) {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ id: msg.id }),
      });
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    }
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/messages?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function handleToggle() {
    if (open) {
      setOpen(false);
      setSelected(null);
      return;
    }
    setOpen(true);
    setLoading(true);
    await fetchMessages();
    setLoading(false);
  }

  return (
    <>
      {/* Inbox button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Abrir caixa de mensagens"
      >
        <Inbox className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
          onClick={() => { setOpen(false); setSelected(null); }}
        >
          <div
            className="w-full max-w-4xl bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "min(85vh, 700px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Mensagens recebidas</h2>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setOpen(false); setSelected(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors border"
              >
                <X className="h-3.5 w-3.5" />
                Fechar
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Message list */}
              <div className={`border-r overflow-y-auto ${selected ? "hidden sm:flex sm:flex-col w-72 shrink-0" : "flex flex-col w-full sm:w-72 shrink-0"}`}>
                {loading ? (
                  <div className="flex items-center justify-center flex-1 py-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 px-6 text-center gap-3">
                    <Mail className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`flex items-start gap-3 px-4 py-3.5 text-left border-b hover:bg-accent/40 transition-colors w-full ${
                        selected?.id === msg.id ? "bg-accent/60" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {msg.read
                          ? <MailOpen className="h-4 w-4 text-muted-foreground" />
                          : <Mail className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${msg.read ? "font-normal text-muted-foreground" : "font-semibold"}`}>
                            {msg.sender_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(msg.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Detail view */}
              {selected ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Back (mobile) */}
                  <div className="sm:hidden px-4 py-2 border-b">
                    <button
                      onClick={() => setSelected(null)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </button>
                  </div>

                  {/* Sender info */}
                  <div className="px-6 py-4 border-b bg-muted/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {selected.sender_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{selected.sender_name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(selected.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-11">
                          <AtSign className="h-3 w-3" />
                          {selected.sender_contact}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMessage(selected.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {selected.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex flex-1 items-center justify-center text-center px-6">
                  <div className="space-y-2">
                    <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">Selecione uma mensagem para ler</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
