"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { calculateSkills } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Github, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  repo_name: string;
  tone: string;
  content: string;
  created_at: string;
};

type Skill = {
  name: string;
  count: number;
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchData();
      }
    });
  }, [router]);

  async function fetchData() {
    try {
      const [reposRes, postsRes] = await Promise.all([
        fetch("/api/repos"),
        fetch("/api/posts"),
      ]);

      if (reposRes.ok && postsRes.ok) {
        const repos = await reposRes.json();
        const postsData = await postsRes.json();
        setSkills(calculateSkills(repos));
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  }

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
                  <Github className="h-4 w-4" />
                  @{username}
                </a>
              )}
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {posts.length} posts gerados
              </div>
            </div>
          </div>
        </div>

        {/* Skill Tree */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Skill Tree (GitHub Verified)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {skills.map((skill) => (
              <div key={skill.name} className="rounded-lg border bg-card p-4 space-y-1">
                <p className="text-sm font-medium">{skill.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{skill.count} repos</p>
                  <Badge variant="secondary" className="text-[10px] uppercase">Verified</Badge>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                Nenhuma linguagem detectada nos seus repositórios públicos.
              </p>
            )}
          </div>
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
