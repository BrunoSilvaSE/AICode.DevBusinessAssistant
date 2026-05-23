"use client";

import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileAnalysis } from "@/app/api/analyze-profile/route";

export function ProfileAnalysisCard({ jwt }: { jwt: string }) {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-profile", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error("Falha na análise");
      const data = await res.json() as ProfileAnalysis;
      setAnalysis(data);
    } catch {
      setError("Não foi possível analisar o perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    !analysis ? "" :
    analysis.score >= 75 ? "text-green-600 dark:text-green-400" :
    analysis.score >= 50 ? "text-yellow-600 dark:text-yellow-400" :
    "text-red-600 dark:text-red-400";

  const scoreRingColor =
    !analysis ? "stroke-muted" :
    analysis.score >= 75 ? "stroke-green-500" :
    analysis.score >= 50 ? "stroke-yellow-500" :
    "stroke-red-500";

  const circumference = 2 * Math.PI * 36;
  const dashOffset = analysis
    ? circumference - (analysis.score / 100) * circumference
    : circumference;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Análise de Perfil por IA
          </h2>
          <p className="text-xs text-muted-foreground">
            Avaliação inteligente da sua presença profissional.
          </p>
        </div>
        <Button
          size="sm"
          variant={analysis ? "outline" : "default"}
          disabled={loading}
          onClick={handleAnalyze}
        >
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Analisando...</>
          ) : analysis ? (
            "Reanalisar"
          ) : (
            "Analisar agora"
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {analysis && (
        <div className="space-y-5">
          {/* Score + headline */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0 w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor"
                  className="stroke-muted" strokeWidth="6" />
                <circle cx="40" cy="40" r="36" fill="none"
                  className={scoreRingColor}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold leading-none ${scoreColor}`}>
                  {analysis.score}
                </span>
                <span className="text-[9px] text-muted-foreground">/100</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm leading-snug">{analysis.headline}</p>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Pontos fortes
            </p>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" /> O que melhorar
            </p>
            <ul className="space-y-1">
              {analysis.improvements.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 flex items-start gap-2.5">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{analysis.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
