"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Copy, Check, Loader2, ExternalLink } from "lucide-react";

type RepoDetail = {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  languages: string[];
  readme: string;
  url: string;
  updatedAt: string;
};

type Tone = "business" | "technical";

export default function RepoDetailPage() {
  const router = useRouter();
  const params = useParams<{ owner: string; name: string }>();
  const [repo, setRepo] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState<Tone>("business");
  const [copied, setCopied] = useState(false);

  const supabaseTokenRef = useRef<string | null>(null);
  const wasGeneratingRef = useRef(false);

  const { completion, complete, isLoading: generating, error } = useCompletion({
    api: "/api/generate-post",
    body: { tone },
    streamProtocol: "text",
  });

  // Save post when generation finishes (generating flips false→true→false).
  // Using useEffect avoids stale-closure issues with onFinish parameters.
  useEffect(() => {
    if (wasGeneratingRef.current && !generating && completion) {
      const jwt = supabaseTokenRef.current;
      if (jwt) {
        fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({ repo_name: params.name, tone, content: completion }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
      }
    }
    wasGeneratingRef.current = generating;
  }, [generating, completion, tone, params.name]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session?.provider_token) {
        router.push("/login");
        return;
      }

      supabaseTokenRef.current = session.access_token;

      fetch(`/api/repo-detail?owner=${params.owner}&name=${params.name}`, {
        headers: { "X-GitHub-Token": session.provider_token },
      })
        .then((res) => {
          if (res.status === 401) { router.push("/login"); return null; }
          return res.json();
        })
        .then((data) => { if (data) setRepo(data); })
        .finally(() => setLoading(false));
    });
  }, [params.owner, params.name, router]);

  async function handleGenerate() {
    if (!repo) return;
    const context = [
      `Repositório: ${repo.name}`,
      repo.description ? `Descrição: ${repo.description}` : "",
      repo.languages.length > 0 ? `Tecnologias: ${repo.languages.join(", ")}` : "",
      repo.readme ? `\nREADME (trecho):\n${repo.readme.slice(0, 1500)}` : "",
    ].filter(Boolean).join("\n");
    await complete(context);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando repositório...</p>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Repositório não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/repositorios">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Repositórios
            </Link>
          </Button>
          <span className="font-semibold text-sm truncate">{repo.name}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Repo info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">{repo.name}</h1>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {repo.description && (
            <p className="text-muted-foreground text-sm">{repo.description}</p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            {repo.languages.map((lang) => (
              <Badge key={lang} variant="secondary">{lang}</Badge>
            ))}
            {repo.stars > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> {repo.stars}
              </span>
            )}
          </div>
        </div>

        {/* Generate section */}
        <div className="rounded-lg border bg-card p-6 space-y-5">
          <h2 className="font-semibold">Gerar Post LinkedIn</h2>

          <div className="flex gap-2">
            {(["business", "technical"] as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                  tone === t
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <p className="text-sm font-medium">
                  {t === "business" ? "Negócio / LinkedIn" : "Técnico / Comunidade"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t === "business"
                    ? "Para recrutadores e gestores"
                    : "Para devs e pares técnicos"}
                </p>
              </button>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando post...</>
            ) : (
              `Gerar Post ${tone === "business" ? "Business" : "Técnico"}`
            )}
          </Button>
        </div>

        {/* Output */}
        {(completion || generating) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Post gerado</h2>
              {completion && !generating && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5" />Copiado!</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1.5" />Copiar</>
                  )}
                </Button>
              )}
            </div>
            <div className="rounded-lg border bg-card p-5 whitespace-pre-wrap text-sm leading-relaxed min-h-32">
              {completion || (
                <span className="text-muted-foreground animate-pulse">Escrevendo...</span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Erro ao gerar post. Tente novamente.
          </div>
        )}
      </main>
    </div>
  );
}
