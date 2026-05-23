"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient as makeBrowserClient } from "@/lib/supabase/client";

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

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  const initials = (name ?? "?")[0].toUpperCase();
  if (url)
    return <img src={url} alt={name ?? ""} className="h-12 w-12 rounded-full object-cover" />;
  return (
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
      {initials}
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) setJwt(data.session.access_token);
      });
  }, []);

  useEffect(() => {
    const supabase = makeBrowserClient();
    supabase
      .from("community_posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.push("/comunidade"); return; }
        setPost(data as CommunityPost);
        setLoading(false);
      });
  }, [id, router]);

  async function toggleLike() {
    if (!jwt || liking || !post) return;
    setLiking(true);
    const method = isLiked ? "DELETE" : "POST";
    const res = await fetch(`/api/community/${post.id}/like`, {
      method,
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) {
      setIsLiked((v) => !v);
      setPost((p) => p ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p);
    }
    setLiking(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) return null;

  const dateStr = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/comunidade">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Comunidade
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground truncate">
            @{post.username}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <article className="space-y-6">
          {/* Author */}
          <div className="flex items-start gap-4">
            <Link href={`/u/${post.username}`}>
              <Avatar url={post.avatar_url} name={post.full_name ?? post.username} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/u/${post.username}`} className="font-semibold hover:underline">
                  {post.full_name ?? post.username}
                </Link>
                {post.tone && post.tone !== "free" && (
                  <Badge variant="outline" className="text-[10px]">
                    {TONE_LABELS[post.tone]}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                @{post.username} · {dateStr}
              </p>
              {post.repo_name && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {post.repo_name}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h1 className="text-2xl font-bold tracking-tight leading-snug">
              {post.title}
            </h1>
          )}

          {/* Content */}
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={toggleLike}
              disabled={!jwt || liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                isLiked
                  ? "border-rose-400/60 text-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                  : "border-border hover:border-rose-400/60 hover:text-rose-500 text-muted-foreground"
              } disabled:opacity-50`}
            >
              {liking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              )}
              {post.likes_count} curtida{post.likes_count !== 1 ? "s" : ""}
            </button>

            <Link
              href={`/u/${post.username}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver portfólio
            </Link>
          </div>

          {!jwt && (
            <p className="text-xs text-muted-foreground border rounded-lg p-3 text-center">
              <Link href="/login" className="text-primary hover:underline">Faça login</Link>{" "}
              para curtir este post.
            </p>
          )}
        </article>
      </main>
    </div>
  );
}
