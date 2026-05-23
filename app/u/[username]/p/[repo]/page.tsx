import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Star, GitBranch, Heart, MessageSquare, PenSquare } from "lucide-react";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { CopyLinkedInButton } from "@/components/CopyLinkedInButton";
import { Badge } from "@/components/ui/badge";

type Skill = { name: string; count: number };
type Post = { id: string; repo_name: string; tone: string; content: string; created_at: string };
type CommunityPost = {
  id: string;
  username: string;
  full_name: string | null;
  title: string | null;
  content: string;
  tone: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
};
type FeaturedRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  cover_url?: string | null;
  diagram_mermaid?: string | null;
};
type Profile = {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  skills: Skill[];
  custom_skills: string[] | null;
  featured_repos: FeaturedRepo[];
};

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function fetchProjectData(username: string, repoName: string) {
  const supabase = serverSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url, skills, custom_skills, featured_repos, user_id")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const repo = ((profile.featured_repos ?? []) as FeaturedRepo[]).find(
    (r) => r.name === repoName
  );
  if (!repo) return null;

  const [postsResult, communityResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, repo_name, tone, content, created_at")
      .eq("user_id", (profile as Profile & { user_id: string }).user_id)
      .eq("repo_name", repoName)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("community_posts")
      .select("id, username, full_name, title, content, tone, tags, likes_count, comments_count, created_at")
      .eq("repo_name", repoName)
      .order("likes_count", { ascending: false })
      .limit(6),
  ]);

  return {
    profile: profile as Profile & { user_id: string },
    repo,
    posts: (postsResult.data ?? []) as Post[],
    communityPosts: (communityResult.data ?? []) as CommunityPost[],
  };
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500", JavaScript: "bg-yellow-400", Python: "bg-green-500",
  Java: "bg-orange-500", "C#": "bg-purple-500", Go: "bg-cyan-500",
  Rust: "bg-orange-700", Ruby: "bg-red-500", PHP: "bg-indigo-500",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; repo: string }>;
}): Promise<Metadata> {
  const { username, repo: repoName } = await params;
  const data = await fetchProjectData(username, repoName);
  if (!data) return { title: "Projeto não encontrado" };

  const { profile, repo } = data;
  const displayName = profile.full_name ?? profile.username;
  const title = `${repo.name} — ${displayName}`;
  const description = repo.description ?? `Projeto de ${displayName} no Dev Business Assistant.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: repo.cover_url ? [{ url: repo.cover_url }] : [],
      type: "article",
    },
    twitter: {
      card: repo.cover_url ? "summary_large_image" : "summary",
      title,
      description,
      images: repo.cover_url ? [repo.cover_url] : [],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ username: string; repo: string }>;
}) {
  const { username, repo: repoName } = await params;
  const data = await fetchProjectData(username, repoName);
  if (!data) notFound();

  const { profile, repo, posts, communityPosts } = data;
  const displayName = profile.full_name ?? profile.username;
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "bg-slate-400";

  // Detect skills used in this repo's language
  const repoSkills = (profile.skills ?? []).filter(
    (s) => s.name === repo.language
  );
  const customSkills = profile.custom_skills ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/u/${username}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {displayName}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-sm truncate">{repo.name}</span>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="space-y-4">
          {repo.cover_url && (
            <div className="rounded-xl overflow-hidden border aspect-video w-full">
              <img
                src={repo.cover_url}
                alt={repo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {repo.language && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className={`h-3 w-3 rounded-full ${langColor}`} />
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {repo.stargazers_count}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">{repo.name}</h1>
            {repo.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {repo.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-foreground/40 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Ver no GitHub
              </a>
              <Link
                href={`/comunidade/novo?repo=${encodeURIComponent(repo.name)}&category=showcase&tone=technical`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 text-sm font-medium transition-colors"
              >
                <PenSquare className="h-4 w-4" />
                Publicar no Showcase
              </Link>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        {repo.diagram_mermaid && (
          <section className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Arquitetura
            </h2>
            <MermaidDiagram chart={repo.diagram_mermaid} />
          </section>
        )}

        {/* Community Showcase posts */}
        {communityPosts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Na Comunidade
              </h2>
              <Link
                href="/comunidade"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver feed →
              </Link>
            </div>
            <div className="space-y-3">
              {communityPosts.map((cp) => (
                <Link
                  key={cp.id}
                  href={`/comunidade/${cp.id}`}
                  className="group flex flex-col rounded-xl border bg-card p-4 space-y-2 hover:border-foreground/30 transition-colors"
                >
                  {cp.title && (
                    <p className="text-sm font-semibold group-hover:underline leading-snug">{cp.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {cp.content}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>@{cp.username}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{cp.likes_count}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{cp.comments_count}</span>
                    {cp.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted font-mono">{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {posts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-semibold">Posts gerados por IA</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Skills used */}
        {(repoSkills.length > 0 || customSkills.length > 0) && (
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Tecnologias</h2>
            <div className="flex flex-wrap gap-2">
              {repo.language && (
                <Badge variant="secondary">{repo.language}</Badge>
              )}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="pt-4 border-t">
          <Link
            href={`/u/${username}#projetos`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver todos os projetos de {displayName}
          </Link>
        </div>
      </main>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={post.tone === "business" ? "default" : "secondary"} className="text-[10px]">
          {post.tone === "business" ? "Negócio" : "Técnico"}
        </Badge>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
        {post.content}
      </p>
      <div className="flex justify-end pt-1 border-t">
        <CopyLinkedInButton text={post.content} />
      </div>
    </div>
  );
}
