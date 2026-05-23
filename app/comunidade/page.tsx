"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, MessageSquare, PenSquare, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CommunityPost = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  content: string;
  repo_name: string | null;
  tone: "business" | "technical" | "free" | null;
  likes_count: number;
  created_at: string;
};

const TONE_LABELS: Record<string, string> = {
  business: "Negócio",
  technical: "Técnico",
  free: "Livre",
};

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}m`;
}

function Avatar({ url, name, size = 9 }: { url: string | null; name: string | null; size?: number }) {
  const initials = (name ?? "?")[0].toUpperCase();
  const s = `h-${size} w-${size}`;
  if (url) return <img src={url} alt={name ?? ""} className={`${s} rounded-full object-cover`} />;
  return (
    <div className={`${s} rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}

export default function ComunidadePage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [liking, setLiking] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          setJwt(data.session.access_token);
          setMyUserId(data.session.user.id);
        }
      });
  }, []);

  async function loadPosts(cursor?: string) {
    const url = cursor ? `/api/community?cursor=${encodeURIComponent(cursor)}` : "/api/community";
    const res = await fetch(url);
    if (!res.ok) return;
    const { posts: newPosts, nextCursor: nc } = await res.json();
    setPosts((prev) => cursor ? [...prev, ...newPosts] : newPosts);
    setNextCursor(nc);
  }

  useEffect(() => {
    setLoading(true);
    loadPosts().finally(() => setLoading(false));
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true);
          loadPosts(nextCursor).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore]);

  async function toggleLike(postId: string) {
    if (!jwt || liking.has(postId)) return;
    setLiking((s) => new Set([...s, postId]));

    const isLiked = liked.has(postId);
    const method = isLiked ? "DELETE" : "POST";

    const res = await fetch(`/api/community/${postId}/like`, {
      method,
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (res.ok) {
      setLiked((s) => {
        const next = new Set(s);
        isLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
            : p
        )
      );
    }
    setLiking((s) => {
      const next = new Set(s);
      next.delete(postId);
      return next;
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Comunidade</span>
            </div>
          </div>
          {jwt && (
            <Button asChild size="sm">
              <Link href="/comunidade/novo">
                <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                Publicar
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Nenhum post ainda. Seja o primeiro!</p>
            {jwt && (
              <Button asChild size="sm">
                <Link href="/comunidade/novo">Publicar algo</Link>
              </Button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={liked.has(post.id)}
              isLiking={liking.has(post.id)}
              canLike={!!jwt}
              onLike={() => toggleLike(post.id)}
            />
          ))
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!jwt && !loading && (
          <div className="rounded-xl border bg-card/50 p-5 text-center space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">
              Faça login para curtir e publicar posts.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Entrar com GitHub</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function PostCard({
  post,
  isLiked,
  isLiking,
  canLike,
  onLike,
}: {
  post: CommunityPost;
  isLiked: boolean;
  isLiking: boolean;
  canLike: boolean;
  onLike: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.content.length > 280;
  const displayContent = isLong && !expanded ? post.content.slice(0, 280) + "…" : post.content;

  return (
    <article className="rounded-xl border bg-card p-5 space-y-3 hover:border-foreground/20 transition-colors">
      {/* Author row */}
      <div className="flex items-center gap-2.5">
        <Link href={`/u/${post.username}`}>
          <Avatar url={post.avatar_url} name={post.full_name ?? post.username} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/u/${post.username}`} className="text-sm font-semibold hover:underline truncate">
              {post.full_name ?? post.username}
            </Link>
            <span className="text-xs text-muted-foreground">@{post.username}</span>
            {post.tone && post.tone !== "free" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {TONE_LABELS[post.tone]}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{relativeDate(post.created_at)}</span>
            {post.repo_name && (
              <>
                <span>·</span>
                <span className="font-mono">{post.repo_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.title && (
        <h3 className="font-semibold text-sm leading-snug">{post.title}</h3>
      )}
      <Link href={`/comunidade/${post.id}`} className="block">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground hover:text-foreground transition-colors">
          {displayContent}
        </p>
      </Link>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={onLike}
          disabled={!canLike || isLiking}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            isLiked
              ? "text-rose-500 dark:text-rose-400"
              : "text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400"
          } disabled:opacity-50`}
        >
          <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
          <span>{post.likes_count}</span>
        </button>

        <Link
          href={`/comunidade/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ver post
        </Link>
      </div>
    </article>
  );
}
