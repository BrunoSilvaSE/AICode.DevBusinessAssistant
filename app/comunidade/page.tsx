"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, MessageSquare, PenSquare, Loader2, Users, TrendingUp, Clock, Filter, Layers, Newspaper } from "lucide-react";
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
  tags: string[];
  category: "discussion" | "showcase" | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Sort = "recent" | "popular";
type ToneFilter = "" | "business" | "technical" | "free";
type CategoryFilter = "" | "discussion" | "showcase";

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
  if (url) return <img src={url} alt={name ?? ""} className={`h-${size} w-${size} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`h-${size} w-${size} rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0`}>
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
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [liking, setLiking] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>("recent");
  const [toneFilter, setToneFilter] = useState<ToneFilter>("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createBrowserClient().auth.getSession().then(({ data }) => {
      if (data.session) setJwt(data.session.access_token);
    });
  }, []);

  const buildUrl = useCallback((cursor?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (sort !== "recent") params.set("sort", sort);
    if (toneFilter) params.set("tone", toneFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    return `/api/community?${params.toString()}`;
  }, [sort, toneFilter, categoryFilter]);

  const loadPosts = useCallback(async (cursor?: string) => {
    const res = await fetch(buildUrl(cursor));
    if (!res.ok) return;
    const { posts: newPosts, nextCursor: nc } = await res.json();
    setPosts((prev) => cursor ? [...prev, ...newPosts] : newPosts);
    setNextCursor(nc);
  }, [buildUrl]);

  // Re-fetch when filters change
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    loadPosts().finally(() => setLoading(false));
  }, [loadPosts]);

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
  }, [nextCursor, loadingMore, loadPosts]);

  async function toggleLike(postId: string) {
    if (!jwt || liking.has(postId)) return;
    setLiking((s) => new Set([...s, postId]));
    const isLiked = liked.has(postId);
    const res = await fetch(`/api/community/${postId}/like`, {
      method: isLiked ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) {
      setLiked((s) => { const n = new Set(s); isLiked ? n.delete(postId) : n.add(postId); return n; });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p));
    }
    setLiking((s) => { const n = new Set(s); n.delete(postId); return n; });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link>
            </Button>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Comunidade</span>
            </div>
          </div>
          {jwt && (
            <Button asChild size="sm">
              <Link href="/comunidade/novo"><PenSquare className="h-3.5 w-3.5 mr-1.5" />Publicar</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Filter bar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-[57px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto scrollbar-none">
          {/* Sort tabs */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSort("recent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === "recent" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Clock className="h-3 w-3" /> Recentes
            </button>
            <button
              onClick={() => setSort("popular")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === "popular" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <TrendingUp className="h-3 w-3" /> Populares
            </button>
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Category filter */}
          <div className="flex items-center gap-1 shrink-0">
            {([
              { value: "" as CategoryFilter, label: "Tudo", icon: null },
              { value: "showcase" as CategoryFilter, label: "Showcase", icon: Layers },
              { value: "discussion" as CategoryFilter, label: "Discussão", icon: Newspaper },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                  categoryFilter === value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="h-2.5 w-2.5" />}
                {label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Tone filter pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
            {(["", "business", "technical", "free"] as ToneFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setToneFilter(t)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                  toneFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "" ? "Todos" : TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              {toneFilter ? `Nenhum post do tipo "${TONE_LABELS[toneFilter]}" ainda.` : "Nenhum post ainda. Seja o primeiro!"}
            </p>
            {jwt && <Button asChild size="sm"><Link href="/comunidade/novo">Publicar algo</Link></Button>}
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

        <div ref={sentinelRef} className="h-4" />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!jwt && !loading && posts.length > 0 && (
          <div className="rounded-xl border bg-card/50 p-5 text-center space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">Faça login para curtir e publicar posts.</p>
            <Button asChild size="sm" variant="outline"><Link href="/login">Entrar com GitHub</Link></Button>
          </div>
        )}
      </main>
    </div>
  );
}

function PostCard({
  post, isLiked, isLiking, canLike, onLike,
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
            {post.category === "showcase" && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 gap-0.5 bg-violet-500 hover:bg-violet-600">
                <Layers className="h-2.5 w-2.5" />Showcase
              </Badge>
            )}
            {post.tone && post.tone !== "free" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {TONE_LABELS[post.tone]}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{relativeDate(post.created_at)}</span>
            {post.repo_name && (
              <><span>·</span><span className="font-mono truncate max-w-[120px]">{post.repo_name}</span></>
            )}
          </div>
        </div>
      </div>

      {post.title && <h3 className="font-semibold text-sm leading-snug">{post.title}</h3>}

      <Link href={`/comunidade/${post.id}`} className="block">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground hover:text-foreground transition-colors">
          {displayContent}
        </p>
      </Link>
      {isLong && (
        <button onClick={() => setExpanded((e) => !e)} className="text-xs text-primary hover:underline">
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium font-mono">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={onLike}
          disabled={!canLike || isLiking}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            isLiked ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400"
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
          <span>{post.comments_count > 0 ? post.comments_count : ""} {post.comments_count === 1 ? "comentário" : post.comments_count > 1 ? "comentários" : "Comentar"}</span>
        </Link>
      </div>
    </article>
  );
}
