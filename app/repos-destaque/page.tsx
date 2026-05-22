"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Loader2, Check } from "lucide-react";
import Link from "next/link";

type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};

export default function ReposDestaquePage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const session = data.session;
        if (!session?.access_token) { router.push("/login"); return; }

        setJwt(session.access_token);
        setGithubToken(session.provider_token ?? null);

        const [reposRes, featuredRes] = await Promise.all([
          fetch("/api/repos", {
            headers: { "X-GitHub-Token": session.provider_token ?? "" },
          }),
          fetch("/api/featured-repos", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

        if (reposRes.ok) {
          const all: Repo[] = await reposRes.json();
          setRepos(Array.isArray(all) ? all : []);
        }
        if (featuredRes.ok) {
          setSelected(await featuredRes.json());
        }
        setLoading(false);
      });
  }, [router]);

  function toggle(repo: Repo) {
    setSelected((prev) => {
      const exists = prev.some((r) => r.full_name === repo.full_name);
      if (exists) return prev.filter((r) => r.full_name !== repo.full_name);
      if (prev.length >= 3) return prev;
      return [...prev, repo];
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!jwt) return;
    setSaving(true);
    await fetch("/api/featured-repos", {
      method: "PUT",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repos: selected }),
    });
    setSaving(false);
    setSaved(true);
  }

  const isSelected = (repo: Repo) => selected.some((r) => r.full_name === repo.full_name);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Repositórios em Destaque</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Repos em Destaque</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecione até 3 repositórios para aparecer no seu portfólio público.{" "}
              <span className="font-medium text-foreground">{selected.length}/3 selecionados</span>
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <><Check className="h-4 w-4 mr-1" /> Salvo!</>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-16">
            Nenhum repositório público encontrado.
          </p>
        ) : (
          <div className="space-y-2">
            {repos.map((repo) => {
              const active = isSelected(repo);
              const disabled = !active && selected.length >= 3;
              return (
                <button
                  key={repo.full_name}
                  onClick={() => !disabled && toggle(repo)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${
                    active
                      ? "border-foreground bg-foreground/5"
                      : disabled
                      ? "opacity-40 cursor-not-allowed border-border"
                      : "border-border hover:border-foreground/30 hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        active ? "border-foreground bg-foreground" : "border-muted-foreground"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-background" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{repo.name}</span>
                        {repo.language && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
