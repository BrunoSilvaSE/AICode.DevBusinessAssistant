"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github";
import { DashboardInbox } from "@/components/DashboardInbox";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileAnalysisCard } from "@/components/ProfileAnalysisCard";
import {
  Copy, Check, ExternalLink, Loader2,
  FolderGit2, GitBranch, Calendar, Star, UserCog, Wand2, Users,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user as User);
      setJwt(session.access_token);

      if (session.provider_token && session.access_token) {
        fetch("/api/sync-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "X-GitHub-Token": session.provider_token,
          },
          body: JSON.stringify({
            userId: session.user.id,
            username: session.user.user_metadata?.user_name ?? session.user.email,
            fullName: session.user.user_metadata?.full_name ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
          }),
        }).catch(() => {});
      }
    });
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const username = user.user_metadata?.user_name as string | undefined;
  const initials = (name as string)?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">Dev Business Assistant</span>
          <div className="flex items-center gap-2">
            {jwt && <NotificationBell jwt={jwt} />}
            {jwt && <DashboardInbox jwt={jwt} />}
            {avatarUrl ? (
              <img src={avatarUrl} alt={name as string} className="h-8 w-8 rounded-full ring-2 ring-border" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-border">
                {initials}
              </div>
            )}
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/perfil">Ver Perfil</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const supabase = createBrowserClient();
                supabase.auth.signOut().then(() => router.push("/"));
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="space-y-8">
          {/* Greeting */}
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name as string} className="h-14 w-14 rounded-full ring-2 ring-border hidden sm:block" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary ring-2 ring-border hidden sm:block">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Olá, {(name as string)?.split(" ")[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Bem-vindo ao seu painel. Vamos construir sua marca pessoal.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard
              icon={<FolderGit2 className="h-5 w-5" />}
              title="Repositórios"
              description="Liste e explore seus repos públicos do GitHub."
              href="/repositorios"
            />
            <DashCard
              icon={<Wand2 className="h-5 w-5" />}
              title="Gerar Post LinkedIn"
              description="Transforme qualquer texto em post de impacto com IA."
              href="/gerador"
            />
            <DashCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Skill Tree"
              description="Visualize suas skills verificadas pelo código real."
              href="/perfil"
            />
            <DashCard
              icon={<Calendar className="h-5 w-5" />}
              title="Linha do Tempo"
              description="Adicione formação, experiências e certificações."
              href="/timeline"
            />
            <DashCard
              icon={<Star className="h-5 w-5" />}
              title="Repos em Destaque"
              description="Escolha repositórios para exibir no portfólio público."
              href="/repos-destaque"
            />
            <DashCard
              icon={<UserCog className="h-5 w-5" />}
              title="Editar Perfil"
              description="Bio, título profissional, localização e redes sociais."
              href="/editar-perfil"
            />
            <DashCard
              icon={<Users className="h-5 w-5" />}
              title="Comunidade"
              description="Veja e publique posts para a comunidade de devs."
              href="/comunidade"
            />
          </div>

          {jwt && <ProfileAnalysisCard jwt={jwt} />}

          {/* Account info */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <GitHubIcon className="h-5 w-5" />
              <h2 className="font-semibold">Conta conectada</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span>
              {user.email && <> · {user.email}</>}
            </p>
            {username && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
                <Link
                  href={`/u/${username}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  /u/{username}
                </Link>
                <CopyPortfolioButton username={username} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type DashCardProps = { icon: React.ReactNode; title: string; description: string; href: string };

function DashCard({ icon, title, description, href }: DashCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </a>
  );
}

function CopyPortfolioButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const url = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-all ${
        copied
          ? "border-green-500/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
          : "hover:border-foreground/40 hover:bg-accent/50"
      }`}
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5" />Copiado!</>
      ) : (
        <><Copy className="h-3.5 w-3.5" />Compartilhar portfólio</>
      )}
    </button>
  );
}
