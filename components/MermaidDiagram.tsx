"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

function buildMermaidUrl(chart: string): string {
  const encoded = btoa(unescape(encodeURIComponent(chart.trim())));
  return `https://mermaid.ink/svg/${encoded}`;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!chart.trim()) return null;

  if (imgError) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm text-destructive justify-center py-8 rounded-xl border bg-destructive/5">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Diagrama inválido — tente gerar novamente.</span>
        <button
          onClick={() => setImgError(false)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </button>
      </div>
    );
  }

  const url = buildMermaidUrl(chart);

  return (
    <div className="w-full overflow-auto rounded-xl border bg-white dark:bg-slate-950 p-4 flex justify-center relative min-h-[120px]">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Carregando diagrama...</span>
        </div>
      )}
      <img
        src={url}
        alt="Diagrama de arquitetura"
        className={`max-w-full h-auto transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
