"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Heart, MessageSquare, X, CheckCheck } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: "like" | "comment";
  post_id: string;
  post_title: string;
  actor_username: string;
  actor_avatar_url: string | null;
  read: boolean;
  created_at: string;
};

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials = name[0]?.toUpperCase() ?? "?";
  if (url) return <img src={url} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />;
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
      {initials}
    </div>
  );
}

export function NotificationBell({ jwt }: { jwt: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) {
      const { notifications: notifs, unreadCount: count } = await res.json();
      setNotifications(notifs);
      setUnreadCount(count);
    }
    setLoading(false);
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  // Load unread count on mount
  useEffect(() => {
    fetch("/api/notifications", { headers: { Authorization: `Bearer ${jwt}` } })
      .then((r) => r.json())
      .then(({ unreadCount: count }) => setUnreadCount(count ?? 0))
      .catch(() => {});
  }, [jwt]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle() {
    if (!open) load();
    setOpen((v) => !v);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 max-h-[480px] rounded-xl border bg-popover shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <span className="font-semibold text-sm">Notificações</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Lidas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/comunidade/${n.post_id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-0 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar url={n.actor_avatar_url} name={n.actor_username} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs leading-snug">
                      <span className="font-semibold">@{n.actor_username}</span>{" "}
                      {n.type === "like" ? "curtiu" : "comentou em"}{" "}
                      <span className="font-medium">
                        {n.post_title.length > 40 ? n.post_title.slice(0, 40) + "…" : n.post_title}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {relativeDate(n.created_at)}
                    </p>
                  </div>
                  {n.type === "like" ? (
                    <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  )}
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t text-center shrink-0">
              <Link
                href="/comunidade"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver comunidade →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
