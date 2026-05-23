"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github";
import { DashboardInbox } from "@/components/DashboardInbox";
import { ProfileAnalysisCard } from "@/components/ProfileAnalysisCard";

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">
            Dev Business Assistant
          </span>
          <div className="flex items-center gap-2">
            {jwt && <DashboardInbox jwt={jwt} />}
            {avatarUrl && (
              <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full" />
            )}
            <Button asChild variant="ghost" size="sm">
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Olá, {name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao seu painel. Vamos construir sua marca pessoal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashCard
              title="Repositórios"
              description="Liste e explore seus repos públicos do GitHub."
              href="/repositorios"
              soon={false}
            />
            <DashCard
              title="Gerar Post LinkedIn"
              description="Transforme qualquer texto em post de impacto."
              href="/gerador"
              soon={false}
            />
            <DashCard
              title="Skill Tree"
              description="Visualize suas skills inferidas do código real."
              href="/perfil"
              soon={false}
            />
            <DashCard
              title="Linha do Tempo"
              description="Adicione formação, experiências e certificações ao seu portfólio."
              href="/timeline"
              soon={false}
            />
            <DashCard
              title="Repos em Destaque"
              description="Escolha até 3 repositórios para exibir no seu portfólio público."
              href="/repos-destaque"
              soon={false}
            />
            <DashCard
              title="Editar Perfil"
              description="Adicione 'Sobre Mim', título profissional, localização e LinkedIn."
              href="/editar-perfil"
              soon={false}
            />
          </div>

          {jwt && <ProfileAnalysisCard jwt={jwt} />}

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <GitHubIcon className="h-5 w-5" />
              <h2 className="font-semibold">Conta conectada</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span> ·{" "}
              {user.email}
            </p>
            {user.user_metadata?.user_name && (
              <div className="mt-3 pt-3 border-t">
                <Link
                  href={`/u/${user.user_metadata.user_name}`}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Ver portfólio público → /u/{user.user_metadata.user_name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashCard({
  title,
  description,
  href,
  soon,
}: {
  title: string;
  description: string;
  href: string;
  soon: boolean;
}) {
  return (
    <a
      href={soon ? undefined : href}
      className={`block rounded-lg border bg-card p-5 space-y-2 transition-colors ${
        soon
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-foreground/30 hover:bg-accent/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        {soon && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            Em breve
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
