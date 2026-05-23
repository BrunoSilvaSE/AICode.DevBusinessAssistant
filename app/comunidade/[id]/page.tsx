"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, Loader2, ExternalLink, MessageSquare, Send, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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

type Comment = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  content: string;
  created_at: string;
};

const TONE_LABELS: Record<string, string> = {
  business: "Negócio",
  technical: "Técnico",
  free: "Livre",
};

function Avatar({ url, name, size = 10 }: { url: string | null; name: string | null; size?: number }) {
  const initials = (name ?? "?")[0].toUpperCase();
  if (url) return <img src={url} alt={name ?? ""} className={`h-${size} w-${size} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`h-${size} w-${size} rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d atrás` : new Date(iso).toLocaleDateString("pt-BR");
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    createBrowserClient().auth.getSession().then(({ data }) => {
      if (data.session) {
        setJwt(data.session.access_token);
        setMyUsername(data.session.user.user_metadata?.user_name ?? null);
      }
    });
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();
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

  useEffect(() => {
    if (!id) return;
    setCommentsLoading(true);
    fetch(`/api/community/${id}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setCommentsLoading(false));
  }, [id]);

  async function toggleLike() {
    if (!jwt || liking || !post) return;
    setLiking(true);
    const isCurrentlyLiked = isLiked;
    const res = await fetch(`/api/community/${post.id}/like`, {
      method: isCurrentlyLiked ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) {
      setIsLiked((v) => !v);
      setPost((p) => p ? { ...p, likes_count: p.likes_count + (isCurrentlyLiked ? -1 : 1) } : p);
    }
    setLiking(false);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!jwt || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    const res = await fetch(`/api/community/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.ok) {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("community_posts").select("comments_count").eq("id", id).single();
      setPost((p) => p ? { ...p, comments_count: data?.comments_count ?? p.comments_count + 1 } : p);
      // Reload comments
      fetch(`/api/community/${id}/comments`)
        .then((r) => r.json())
        .then((d) => setComments(Array.isArray(d) ? d : []));
      setCommentText("");
    }
    setSubmittingComment(false);
  }

  async function handleDeleteComment(commentId: string) {
    if (!jwt) return;
    const res = await fetch(`/api/community/${id}/comments?commentId=${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.ok) {
      setComments((c) => c.filter((cm) => cm.id !== commentId));
      setPost((p) => p ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p);
    }
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
            <Link href="/comunidade"><ArrowLeft className="h-4 w-4 mr-1" />Comunidade</Link>
          </Button>
          <span className="text-sm text-muted-foreground truncate">@{post.username}</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Post */}
        <article className="space-y-5">
          <div className="flex items-start gap-4">
            <Link href={`/u/${post.username}`}>
              <Avatar url={post.avatar_url} name={post.full_name ?? post.username} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/u/${post.username}`} className="font-semibold hover:underline">
                  {post.full_name ?? post.username}
                </Link>
                {post.category === "showcase" && (
                  <Badge className="text-[10px] gap-0.5 bg-violet-500 hover:bg-violet-600">
                    <Layers className="h-2.5 w-2.5" />Showcase
                  </Badge>
                )}
                {post.tone && post.tone !== "free" && (
                  <Badge variant="outline" className="text-[10px]">{TONE_LABELS[post.tone]}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                @{post.username} · {dateStr}
              </p>
              {post.repo_name && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{post.repo_name}</p>
              )}
            </div>
          </div>

          {post.title && <h1 className="text-2xl font-bold tracking-tight leading-snug">{post.title}</h1>}

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              disabled={!jwt || liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                isLiked
                  ? "border-rose-400/60 text-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                  : "border-border hover:border-rose-400/60 hover:text-rose-500 text-muted-foreground"
              } disabled:opacity-50`}
            >
              {liking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />}
              {post.likes_count} curtida{post.likes_count !== 1 ? "s" : ""}
            </button>

            <button
              onClick={() => commentInputRef.current?.focus()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              {post.comments_count} comentário{post.comments_count !== 1 ? "s" : ""}
            </button>

            <Link
              href={`/u/${post.username}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Portfólio
            </Link>
          </div>
        </article>

        {/* Comments */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Comentários {post.comments_count > 0 && `(${post.comments_count})`}
          </h2>

          {/* Comment form */}
          {jwt ? (
            <form onSubmit={handleComment} className="space-y-2">
              <Textarea
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="min-h-20 resize-none text-sm"
                disabled={submittingComment}
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${commentText.length > 900 ? "text-orange-500" : "text-muted-foreground"}`}>
                  {commentText.length}/1000
                </span>
                <Button type="submit" size="sm" disabled={!commentText.trim() || submittingComment}>
                  {submittingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" />Comentar</>}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground border rounded-lg p-3 text-center">
              <Link href="/login" className="text-primary hover:underline">Faça login</Link> para comentar.
            </p>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/u/${comment.username}`}>
                    <Avatar url={comment.avatar_url} name={comment.full_name ?? comment.username} size={8} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl bg-muted/50 border px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link href={`/u/${comment.username}`} className="text-xs font-semibold hover:underline truncate">
                            {comment.full_name ?? comment.username}
                          </Link>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {relativeDate(comment.created_at)}
                          </span>
                        </div>
                        {myUsername === comment.username && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            title="Excluir comentário"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
