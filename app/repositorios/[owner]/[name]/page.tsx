"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Copy, Check, Loader2, ExternalLink, FileText, GitBranch, Save, Share2, Users } from "lucide-react";
import { MermaidDiagram } from "@/components/MermaidDiagram";

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
type Mode = "post" | "readme" | "diagram";

export default function RepoDetailPage() {
  const router = useRouter();
  const params = useParams<{ owner: string; name: string }>();
  const [repo, setRepo] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState<Tone>("business");
  const [mode, setMode] = useState<Mode>("post");
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [diagramSaved, setDiagramSaved] = useState(false);
  const [sharedLinkedIn, setSharedLinkedIn] = useState(false);
  const [publishingCommunity, setPublishingCommunity] = useState(false);
  const [publishedCommunity, setPublishedCommunity] = useState(false);

  const supabaseTokenRef = useRef<string | null>(null);
  const wasGeneratingRef = useRef(false);
  const wasReadmeGeneratingRef = useRef(false);

  const { completion, complete, isLoading: generating, error } = useCompletion({
    api: "/api/generate-post",
    body: { tone },
    streamProtocol: "text",
  });

  const {
    completion: readmeCompletion,
    complete: completeReadme,
    isLoading: readmeGenerating,
    error: readmeError,
  } = useCompletion({
    api: "/api/generate-readme",
    streamProtocol: "text",
  });

  const {
    completion: diagramCompletion,
    complete: completeDiagram,
    isLoading: diagramGenerating,
    error: diagramError,
  } = useCompletion({
    api: "/api/generate-diagram",
    streamProtocol: "text",
  });

  // Save post when generation finishes
  useEffect(() => {
    if (wasGeneratingRef.current && !generating && completion) {
      const jwt = supabaseTokenRef.current;
      if (jwt) {
        fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({ repo_name: params.name, tone, content: completion }),
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        });
      }
    }
    wasGeneratingRef.current = generating;
  }, [generating, completion, tone, params.name]);

  useEffect(() => {
    wasReadmeGeneratingRef.current = readmeGenerating;
  }, [readmeGenerating]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session?.provider_token) { router.push("/login"); return; }
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

  async function handleGenerateReadme() {
    if (!repo) return;
    await completeReadme("", {
      body: {
        repoName: repo.name,
        description: repo.description,
        languages: repo.languages,
        readme: repo.readme,
      },
    });
  }

  async function handleGenerateDiagram() {
    if (!repo) return;
    await completeDiagram("", {
      body: {
        repoName: repo.name,
        description: repo.description,
        languages: repo.languages,
        readme: repo.readme,
      },
    });
  }

  async function handleSaveDiagram() {
    const jwt = supabaseTokenRef.current;
    if (!jwt || !diagramCompletion) return;
    await fetch("/api/featured-repos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ full_name: `${params.owner}/${params.name}`, diagram_mermaid: diagramCompletion }),
    });
    setDiagramSaved(true);
    setTimeout(() => setDiagramSaved(false), 3000);
  }

  async function handleCopy(text: string, setter: (v: boolean) => void) {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  async function handleShareLinkedIn(text: string) {
    await navigator.clipboard.writeText(text);
    setSharedLinkedIn(true);
    setTimeout(() => setSharedLinkedIn(false), 3000);
    window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer");
  }

  async function handlePublishCommunity(text: string) {
    const jwt = supabaseTokenRef.current;
    if (!jwt) return;
    setPublishingCommunity(true);
    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ content: text, tone, repo_name: params.name }),
    });
    setPublishingCommunity(false);
    setPublishedCommunity(true);
    setTimeout(() => setPublishedCommunity(false), 4000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-3">
        <p className="text-muted-foreground text-sm">Repositório não encontrado.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/repositorios">Voltar</Link>
        </Button>
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
            <a href={repo.url} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground shrink-0">
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

        {/* Mode tabs */}
        <div className="flex gap-2 border-b pb-4">
          <button
            onClick={() => setMode("post")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "post"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Gerar Post LinkedIn
          </button>
          <button
            onClick={() => setMode("readme")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "readme"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Auto-README
          </button>
          <button
            onClick={() => setMode("diagram")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "diagram"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Diagrama
          </button>
        </div>

        {/* Post mode */}
        {mode === "post" && (
          <>
            <div className="rounded-lg border bg-card p-6 space-y-5">
              <div className="flex gap-2">
                {(["business", "technical"] as Tone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                      tone === t ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {t === "business" ? "Negócio / LinkedIn" : "Técnico / Comunidade"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t === "business" ? "Para recrutadores e gestores" : "Para devs e pares técnicos"}
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

            {(completion || generating) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Post gerado</h2>
                  {completion && !generating && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(completion, setCopiedPost)}>
                        {copiedPost ? <><Check className="h-3.5 w-3.5 mr-1.5" />Copiado!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />Copiar</>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShareLinkedIn(completion)}
                        className="bg-[#0077B5]/10 border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5]/20 dark:text-blue-400 dark:border-blue-400/30 dark:bg-blue-400/10">
                        {sharedLinkedIn
                          ? <><Check className="h-3.5 w-3.5 mr-1.5" />Copiado!</>
                          : <><Share2 className="h-3.5 w-3.5 mr-1.5" />LinkedIn</>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePublishCommunity(completion)}
                        disabled={publishingCommunity || publishedCommunity}
                        className="border-primary/30 text-primary hover:bg-primary/10">
                        {publishingCommunity
                          ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Publicando...</>
                          : publishedCommunity
                          ? <><Check className="h-3.5 w-3.5 mr-1.5" />Publicado!</>
                          : <><Users className="h-3.5 w-3.5 mr-1.5" />Comunidade</>}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border bg-card p-5 whitespace-pre-wrap text-sm leading-relaxed min-h-32">
                  {completion || <span className="text-muted-foreground animate-pulse">Escrevendo...</span>}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Erro ao gerar post. Tente novamente.
              </div>
            )}
          </>
        )}

        {/* README mode */}
        {mode === "readme" && (
          <>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="font-semibold">Auto-README</h2>
                <p className="text-sm text-muted-foreground">
                  A IA analisa o contexto do repositório e gera um README.md completo e profissional.
                </p>
              </div>
              <Button onClick={handleGenerateReadme} disabled={readmeGenerating} className="w-full" size="lg">
                {readmeGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando README...</>
                ) : (
                  <><FileText className="mr-2 h-4 w-4" /> Gerar README</>
                )}
              </Button>
            </div>

            {(readmeCompletion || readmeGenerating) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">README gerado</h2>
                  {readmeCompletion && !readmeGenerating && (
                    <Button variant="outline" size="sm" onClick={() => handleCopy(readmeCompletion, setCopiedReadme)}>
                      {copiedReadme ? <><Check className="h-3.5 w-3.5 mr-1.5" />Copiado!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />Copiar Markdown</>}
                    </Button>
                  )}
                </div>
                <div className="rounded-lg border bg-card p-5 whitespace-pre-wrap text-sm leading-relaxed font-mono min-h-32 max-h-[60vh] overflow-y-auto">
                  {readmeCompletion || <span className="text-muted-foreground animate-pulse">Escrevendo...</span>}
                </div>
              </div>
            )}

            {readmeError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Erro ao gerar README. Tente novamente.
              </div>
            )}
          </>
        )}

        {/* Diagram mode */}
        {mode === "diagram" && (
          <>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="font-semibold">Diagrama de Arquitetura</h2>
                <p className="text-sm text-muted-foreground">
                  A IA analisa o repositório e gera um diagrama Mermaid da arquitetura ou fluxo principal.
                </p>
              </div>
              <Button onClick={handleGenerateDiagram} disabled={diagramGenerating} className="w-full" size="lg">
                {diagramGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando diagrama...</>
                ) : (
                  <><GitBranch className="mr-2 h-4 w-4" /> Gerar Diagrama</>
                )}
              </Button>
            </div>

            {(diagramCompletion || diagramGenerating) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Diagrama gerado</h2>
                  {diagramCompletion && !diagramGenerating && (
                    <Button variant="outline" size="sm" onClick={handleSaveDiagram}>
                      {diagramSaved
                        ? <><Check className="h-3.5 w-3.5 mr-1.5" />Salvo!</>
                        : <><Save className="h-3.5 w-3.5 mr-1.5" />Salvar no portfólio</>}
                    </Button>
                  )}
                </div>
                {diagramGenerating && !diagramCompletion && (
                  <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground animate-pulse">
                    Gerando diagrama...
                  </div>
                )}
                {diagramCompletion && (
                  <MermaidDiagram chart={diagramCompletion} />
                )}
              </div>
            )}

            {diagramError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Erro ao gerar diagrama. Tente novamente.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
