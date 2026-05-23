"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Send, X, Plus, Newspaper, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Tone = "business" | "technical" | "free";
type Category = "discussion" | "showcase";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "business", label: "Negócio", description: "Para recrutadores e gestores" },
  { value: "technical", label: "Técnico", description: "Para devs e pares técnicos" },
  { value: "free", label: "Livre", description: "Post aberto, qualquer tema" },
];

const SUGGESTED_TAGS = [
  "TypeScript", "JavaScript", "Python", "React", "Next.js", "Node.js",
  "Go", "Rust", "Docker", "AWS", "PostgreSQL", "MongoDB",
  "carreira", "arquitetura", "performance", "open-source",
];

export default function NovoComunidadePost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jwt, setJwt] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(searchParams.get("content") ?? "");
  const [tone, setTone] = useState<Tone>((searchParams.get("tone") as Tone) ?? "free");
  const [category, setCategory] = useState<Category>(
    (searchParams.get("category") as Category) ?? "discussion"
  );
  const [repoName, setRepoName] = useState(searchParams.get("repo") ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) { router.push("/login"); return; }
        setJwt(data.session.access_token);
        setLoadingAuth(false);
      });
  }, [router]);

  // Pre-fill repo tag if coming from a repo context
  useEffect(() => {
    const repo = searchParams.get("repo");
    if (repo && !tags.includes(repo)) setTags([repo]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || tags.includes(clean) || tags.length >= 5) return;
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jwt || content.trim().length < 10) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({
        content: content.trim(),
        title: title.trim() || undefined,
        tone,
        category,
        tags,
        repo_name: repoName.trim() || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao publicar.");
      setSubmitting(false);
      return;
    }
    router.push(`/comunidade/${data.id}`);
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const charCount = content.length;
  const overLimit = charCount > 3000;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/comunidade"><ArrowLeft className="h-4 w-4 mr-1" />Comunidade</Link>
          </Button>
          <span className="font-semibold text-sm">Novo Post</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de post</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory("discussion")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  category === "discussion"
                    ? "border-foreground bg-foreground/5 ring-1 ring-foreground/10"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <Newspaper className={`h-5 w-5 shrink-0 ${category === "discussion" ? "text-foreground" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold">Discussão</p>
                  <p className="text-xs text-muted-foreground">Carreira, ideias, opiniões</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCategory("showcase")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  category === "showcase"
                    ? "border-foreground bg-foreground/5 ring-1 ring-foreground/10"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <Layers className={`h-5 w-5 shrink-0 ${category === "showcase" ? "text-foreground" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold">Showcase</p>
                  <p className="text-xs text-muted-foreground">Apresentar um projeto</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Título <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === "showcase" ? "Nome ou tagline do projeto..." : "Um título chamativo..."}
              maxLength={120}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Repo name (auto-filled when coming from repo page) */}
          {category === "showcase" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Repositório <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="nome-do-repo"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tom</label>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    tone === opt.value ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Conteúdo</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                category === "showcase"
                  ? "Apresente seu projeto: o problema que resolve, as decisões técnicas, o que aprendeu..."
                  : "Compartilhe o que você está construindo, aprendendo ou descobrindo..."
              }
              className={`min-h-48 resize-none ${overLimit ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={submitting}
            />
            <p className={`text-xs text-right ${overLimit ? "text-destructive" : charCount > 2700 ? "text-orange-500" : "text-muted-foreground"}`}>
              {charCount}/3000
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags <span className="text-muted-foreground font-normal">(máx. 5)</span>
            </label>

            {/* Current tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Digite e pressione Enter..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={tags.length >= 5}
                  className="px-2.5 py-1 rounded-full border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-40"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting || content.trim().length < 10 || overLimit}
              className="flex-1 sm:flex-none"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publicando...</>
                : <><Send className="h-4 w-4 mr-2" />Publicar</>
              }
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/comunidade">Cancelar</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
