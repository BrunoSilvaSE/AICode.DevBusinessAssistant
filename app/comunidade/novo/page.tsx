"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Tone = "business" | "technical" | "free";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "business", label: "Negócio", description: "Para recrutadores e gestores" },
  { value: "technical", label: "Técnico", description: "Para devs e pares técnicos" },
  { value: "free", label: "Livre", description: "Post aberto, qualquer tema" },
];

export default function NovoComunidadePost() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tone, setTone] = useState<Tone>("free");
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
            <Link href="/comunidade">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Comunidade
            </Link>
          </Button>
          <span className="font-semibold text-sm">Novo Post</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Título <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Um título chamativo..."
              maxLength={120}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tom do post</label>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    tone === opt.value
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/30"
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
              placeholder="Compartilhe o que você está construindo, aprendendo ou descobrindo..."
              className={`min-h-48 resize-none ${overLimit ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={submitting}
            />
            <p className={`text-xs text-right ${overLimit ? "text-destructive" : charCount > 2700 ? "text-orange-500" : "text-muted-foreground"}`}>
              {charCount}/3000
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || content.trim().length < 10 || overLimit}
              className="flex-1 sm:flex-none"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publicando...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Publicar</>
              )}
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
