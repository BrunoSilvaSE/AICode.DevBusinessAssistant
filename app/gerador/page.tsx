"use client";

import { useEffect, useRef, useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react";

type Tone = "business" | "technical";

export default function GeradorPage() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("business");
  const [copied, setCopied] = useState(false);
  const supabaseTokenRef = useRef<string | null>(null);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    createBrowserClient().auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        supabaseTokenRef.current = data.session.access_token;
      }
    });
  }, []);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/generate-post",
    body: { tone },
    streamProtocol: "text",
  });

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && completion) {
      const jwt = supabaseTokenRef.current;
      if (jwt) {
        fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({ tone, content: completion, repo_name: "Standalone" }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, completion, tone]);

  async function handleGenerate() {
    if (!input.trim() || input.trim().length < 10) return;
    await complete(input);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Gerador de Post LinkedIn</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Tradutor Técnico → LinkedIn
          </h1>
          <p className="text-muted-foreground text-sm">
            Descreva o que você fez em linguagem técnica. A IA transforma em post pronto.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tone selector */}
          <div className="flex gap-2">
            <ToneButton
              active={tone === "business"}
              onClick={() => setTone("business")}
              label="Negócio / LinkedIn"
              description="Para recrutadores e gestores"
            />
            <ToneButton
              active={tone === "technical"}
              onClick={() => setTone("technical")}
              label="Técnico / Comunidade"
              description="Para devs e pares técnicos"
            />
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">O que você fez?</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Refatorei o loop principal do sistema de processamento de pedidos e mudei a estrutura de dados de array para hashmap, reduzindo o tempo de resposta de 800ms para 120ms..."
              className="min-h-32 resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {input.length} caracteres
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || input.trim().length < 10}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando post...
              </>
            ) : (
              "Gerar Post"
            )}
          </Button>
        </div>

        {/* Output */}
        {(completion || isLoading) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Post gerado</h2>
              {completion && !isLoading && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5" /> Copiado!</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar</>
                  )}
                </Button>
              )}
            </div>
            <div className="rounded-lg border bg-card p-5 whitespace-pre-wrap text-sm leading-relaxed min-h-32">
              {completion || (
                <span className="text-muted-foreground animate-pulse">
                  Escrevendo...
                </span>
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

function ToneButton({
  active,
  onClick,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-foreground bg-foreground/5"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
