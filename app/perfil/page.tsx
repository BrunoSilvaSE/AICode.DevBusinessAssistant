"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { calculateSkills } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

type Post = { id: string; repo_name: string; tone: string; content: string; created_at: string };
type Skill = { name: string; count: number };

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsSource, setSkillsSource] = useState<"db" | "github" | "empty">("empty");

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      setUser(session.user as User);
      const jwt = session.access_token;

      // Fetch posts and DB profile in parallel
      const [postsRes, profileRes] = await Promise.all([
        fetch("/api/posts", { headers: { Authorization: `Bearer ${jwt}` } }),
        supabase
          .from("profiles")
          .select("skills")
          .eq("user_id", session.user.id)
          .single(),
      ]);

      if (postsRes.ok) setPosts(await postsRes.json());

      const dbSkills: Skill[] = profileRes.data?.skills ?? [];

      if (dbSkills.length > 0) {
        // Skills already synced from GitHub via sync-profile
        setSkills(dbSkills);
        setSkillsSource("db");
        setLoading(false);
        return;
      }

      // Fallback: calculate live from GitHub if DB is empty
      if (session.provider_token) {
        const reposRes = await fetch("/api/repos", {
          headers: { "X-GitHub-Token": session.provider_token },
        });
        if (reposRes.ok) {
          const repos = await reposRes.json();
          const computed = calculateSkills(repos);
          if (computed.length > 0) {
            setSkills(computed);
            setSkillsSource("github");
          }
        }
      }

      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || "Usuário";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const username = user?.user_metadata?.user_name;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Seu Perfil Profissional</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {avatarUrl && (
            <img src={avatarUrl} alt={name} className="h-24 w-24 rounded-full border-4 border-muted" />
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-muted-foreground">
              {username && (
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <GitHubIcon className="h-4 w-4" />
                  @{username}
                </a>
              )}
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {posts.length} posts gerados
              </div>
            </div>
            {username && (
              <Link
                href={`/u/${username}`}
                className="inline-block text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Ver portfólio público →
              </Link>
            )}
          </div>
        </div>

        {/* Skill Tree */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Skill Tree (GitHub Verified)</h2>
            {skillsSource === "db" && (
              <span className="text-xs text-muted-foreground">Sincronizado do GitHub</span>
            )}
          </div>

          {skills.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhuma skill encontrada</p>
                <p className="text-xs text-muted-foreground">
                  Acesse o Dashboard para sincronizar seus repositórios com o banco de dados.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">Ir para o Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <div key={skill.name} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{skill.count} repos</p>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, (skill.count / skills[0].count) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Badge variant="secondary" className="text-[9px] h-4 uppercase tracking-tighter">
                      Verified
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Post History */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Histórico de Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={post.tone === "business" ? "default" : "secondary"}>
                      {post.tone === "business" ? "Negócio" : "Técnico"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {post.repo_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-10 border rounded-lg border-dashed">
                <p className="text-sm text-muted-foreground">Você ainda não gerou nenhum post.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/repositorios">Começar a gerar</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
